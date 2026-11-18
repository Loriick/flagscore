import type { SupabaseClient } from "@supabase/supabase-js";

export type Row = Record<string, unknown>;

/**
 * Base en mémoire qui imite le sous-ensemble du client Supabase utilisé par
 * le store : filtres eq/in, insert/update/upsert/delete, select en retour.
 */
export function memoryDb(tables: Record<string, Row[]>) {
  const hooks = {
    /** Tables dont toute écriture échoue (panne réseau, contrainte). */
    failingWrites: new Set<string>(),
    /** Appelé juste avant chaque update, pour simuler une requête concurrente. */
    beforeUpdate: (_table: string, _values: Row) => {},
  };
  class Query {
    private filters: Array<(r: Row) => boolean> = [];
    private op: "select" | "insert" | "update" | "upsert" | "delete" = "select";
    private values: Row[] = [];
    private conflict: string[] = [];
    private mode: "many" | "one" | "maybe" = "many";
    constructor(private table: string) {
      tables[table] ??= [];
    }
    select() {
      return this;
    }
    order() {
      return this;
    }
    eq(column: string, value: unknown) {
      this.filters.push(r => r[column] === value);
      return this;
    }
    neq(column: string, value: unknown) {
      this.filters.push(r => r[column] !== value);
      return this;
    }
    in(column: string, values: unknown[]) {
      this.filters.push(r => values.includes(r[column]));
      return this;
    }
    single() {
      this.mode = "one";
      return this;
    }
    maybeSingle() {
      this.mode = "maybe";
      return this;
    }
    insert(row: Row | Row[]) {
      this.op = "insert";
      this.values = [row].flat();
      return this;
    }
    update(values: Row) {
      this.op = "update";
      this.values = [values];
      return this;
    }
    upsert(row: Row, options: { onConflict: string }) {
      this.op = "upsert";
      this.values = [row];
      this.conflict = options.onConflict.split(",");
      return this;
    }
    delete() {
      this.op = "delete";
      return this;
    }
    private run(): Row[] {
      const rows = tables[this.table];
      const matching = () => rows.filter(r => this.filters.every(f => f(r)));
      switch (this.op) {
        case "select":
          return matching();
        case "insert": {
          const inserted = this.values.map(v => ({
            id: crypto.randomUUID(),
            ...v,
          }));
          rows.push(...inserted);
          return inserted;
        }
        case "update":
          return matching().map(r => Object.assign(r, this.values[0]));
        case "upsert": {
          const v = this.values[0];
          const found = rows.find(r => this.conflict.every(c => r[c] === v[c]));
          if (found) return [Object.assign(found, v)];
          rows.push({ ...v });
          return [v];
        }
        case "delete": {
          const gone = matching();
          tables[this.table] = rows.filter(r => !gone.includes(r));
          return gone;
        }
      }
    }
    then(
      resolve: (r: { data: unknown; error: { message: string } | null }) => void
    ) {
      if (this.op !== "select" && hooks.failingWrites.has(this.table)) {
        resolve({ data: null, error: { message: "network down" } });
        return;
      }
      if (this.op === "update") hooks.beforeUpdate(this.table, this.values[0]);
      const data = this.run().map(r => ({ ...r }));
      resolve({
        data: this.mode === "many" ? data : (data[0] ?? null),
        error: null,
      });
    }
  }
  return {
    db: { from: (t: string) => new Query(t) } as unknown as SupabaseClient,
    tables,
    hooks,
  };
}
