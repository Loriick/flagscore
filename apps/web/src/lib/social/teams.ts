/**
 * Annuaire des équipes : transforme un nom lu sur un post ("Flash A", "Red",
 * "Molosses", "LYCANS") en une liste d'équipes candidates, avec les noms FFFA
 * (ceux de `matches.team_home` / `matches.team_away`).
 *
 * Un nom peut renvoyer PLUSIEURS candidates : c'est normal. Le calendrier et le
 * recoupement entre posts (voir resolve.ts) tranchent ensuite.
 */

const STOPWORDS = new Set([
  "le",
  "la",
  "les",
  "de",
  "du",
  "des",
  "d",
  "l",
  "et",
  "the",
  "flag",
  "football",
  "ff",
  "club",
  "team",
  "equipe",
]);

/** Minuscules, sans accents ni ponctuation, espaces normalisés. */
export function normalizeName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function nameTokens(raw: string): string[] {
  return normalizeName(raw)
    .split(" ")
    .filter(t => t && !STOPWORDS.has(t));
}

export function normalizeHandle(handle: string): string {
  return handle.replace(/^@/, "").trim().toLowerCase();
}

export interface TeamDirectoryInput {
  /** Noms de référence (FFFA) de toutes les équipes de la saison. */
  teams: string[];
  /** alias (texte libre) → noms de référence. Un alias peut viser plusieurs équipes. */
  aliases?: Array<{ alias: string; team: string }>;
  /** compte Instagram → noms de référence des équipes du club. */
  clubAccounts?: Array<{ handle: string; teams: string[] }>;
  /**
   * Composition des poules. Une équipe ne joue que contre les équipes de sa
   * poule : c'est la contrainte la plus forte pour lever les ambiguïtés.
   */
  pools?: Array<{ pool: string; teams: string[] }>;
}

export class TeamDirectory {
  readonly teams: string[];
  private readonly teamTokens = new Map<string, Set<string>>();
  private readonly aliasIndex = new Map<string, Set<string>>();
  private readonly clubIndex = new Map<string, string[]>();
  private readonly poolIndex = new Map<string, string>();
  private readonly poolTeams = new Map<string, string[]>();

  constructor({
    teams,
    aliases = [],
    clubAccounts = [],
    pools = [],
  }: TeamDirectoryInput) {
    for (const { pool, teams: members } of pools) {
      this.poolTeams.set(pool, members);
      for (const t of members) this.poolIndex.set(t, pool);
    }
    this.teams = [...new Set([...teams, ...this.poolIndex.keys()])];
    for (const team of this.teams) {
      this.teamTokens.set(team, new Set(nameTokens(team)));
    }
    for (const { alias, team } of aliases) {
      const key = normalizeName(alias);
      if (!key) continue;
      if (!this.aliasIndex.has(key)) this.aliasIndex.set(key, new Set());
      this.aliasIndex.get(key)!.add(team);
    }
    for (const { handle, teams: clubTeams } of clubAccounts) {
      this.clubIndex.set(normalizeHandle(handle), clubTeams);
    }
  }

  clubTeams(handle: string): string[] {
    return this.clubIndex.get(normalizeHandle(handle)) ?? [];
  }

  poolOf(team: string): string | undefined {
    return this.poolIndex.get(team);
  }

  /** Autres équipes de la poule de `team` (vide si la poule est inconnue). */
  poolMates(team: string): string[] {
    const pool = this.poolIndex.get(team);
    if (!pool) return [];
    return (this.poolTeams.get(pool) ?? []).filter(t => t !== team);
  }

  /** Faux seulement si les deux poules sont connues et différentes. */
  canPlay(a: string, b: string): boolean {
    const pa = this.poolIndex.get(a);
    const pb = this.poolIndex.get(b);
    return !pa || !pb || pa === pb;
  }

  /**
   * Équipes candidates pour un nom brut.
   *
   * @param scopeHandle Si fourni, le nom désigne une équipe du club qui publie
   *   (côté "notre équipe" d'un post) : on restreint aux équipes de ce club. Si
   *   aucun nom ne colle ("Flash A" alors que la FFFA écrit "Flash 1"), on
   *   renvoie toutes les équipes du club et le calendrier tranchera.
   */
  candidates(raw: string, scopeHandle?: string): string[] {
    const key = normalizeName(raw);
    const tokens = nameTokens(raw);
    const found = new Set<string>(this.aliasIndex.get(key) ?? []);

    if (tokens.length > 0) {
      for (const [team, teamTokens] of this.teamTokens) {
        if (tokens.every(t => teamTokens.has(t))) found.add(team);
      }
    }

    if (scopeHandle) {
      const club = this.clubTeams(scopeHandle);
      if (club.length > 0) {
        const inClub = [...found].filter(t => club.includes(t));
        return inClub.length > 0 ? inClub : [...club];
      }
    }

    return [...found];
  }
}
