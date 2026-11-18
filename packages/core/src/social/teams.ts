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
  return (
    normalizeName(raw)
      .split(" ")
      // Les numéros de département ("Cougars Football 95", "Diables Rouges 93")
      // ne font pas partie des noms d'équipes : on les ignore.
      .filter(t => t && !STOPWORDS.has(t) && !/^\d+$/.test(t))
  );
}

/** Mots qui désignent la catégorie d'une équipe (« DR F », « Team féminine »). */
const FEMININE = new Set([
  "f",
  "fem",
  "feminine",
  "feminines",
  "feminin",
  "feminins",
  "femme",
  "femmes",
  "fille",
  "filles",
  "women",
  "ladies",
]);
const MASCULINE = new Set([
  "masc",
  "masculine",
  "masculin",
  "masculins",
  "homme",
  "hommes",
  "men",
]);

function categoryOf(tokens: string[]): "Fém." | "Masc." | null {
  if (tokens.some(t => FEMININE.has(t))) return "Fém.";
  if (tokens.some(t => MASCULINE.has(t))) return "Masc.";
  return null;
}

/**
 * En Coupe de France, les noms de référence finissent par « · Fém. » ou
 * « · Masc. » : on ne garde que ceux de la catégorie demandée. Si le club n'a
 * pas d'équipe de cette catégorie dans les poules, aucune ne convient.
 */
function byCategory(teams: string[], category: "Fém." | "Masc." | null) {
  if (!category) return teams;
  return teams.filter(t => t.endsWith(`· ${category}`));
}

/** Catégorie d'un nom de référence (« · Fém. », « · Masc. » ou rien). */
export function categorySuffix(ref: string): string {
  return ref.match(/· (Fém|Masc)\.$/)?.[0] ?? "";
}

/** Distance d'édition limitée à 1 (une lettre ajoutée, retirée ou changée). */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * Le mot lu correspond-il à un mot du nom ? Pluriel ignoré (« Avalanche » /
 * « Avalanches ») et une faute tolérée sur les mots d'au moins 6 lettres
 * (« Flamingos » / « Flagmingos »).
 */
function hasToken(teamTokens: Set<string>, token: string): boolean {
  if (teamTokens.has(token)) return true;
  const singular = (t: string) => t.replace(/s$/, "");
  for (const t of teamTokens) {
    if (singular(t) === singular(token) && singular(token).length >= 3) {
      return true;
    }
    if (token.length >= 6 && t.length >= 6 && withinOneEdit(t, token)) {
      return true;
    }
  }
  return false;
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

    // Alias validé à la main : il l'emporte, même s'il vise l'équipe d'un
    // autre club (entente : « Orskaria » publiée par Albi = Ours · Fém.).
    const aliased = this.aliasIndex.get(key);
    if (aliased && aliased.size > 0) return [...aliased];

    const allTokens = nameTokens(raw);
    const category = categoryOf(allTokens);
    const tokens = allTokens.filter(t => !FEMININE.has(t) && !MASCULINE.has(t));
    const found = new Set<string>();

    if (tokens.length > 0) {
      for (const [team, teamTokens] of this.teamTokens) {
        if (tokens.every(t => hasToken(teamTokens, t))) found.add(team);
      }
    }

    let result = [...found];
    if (scopeHandle) {
      const club = this.clubTeams(scopeHandle);
      if (club.length > 0) {
        const inClub = result.filter(t => club.includes(t));
        result = inClub.length > 0 ? inClub : [...club];
      }
    }
    return byCategory(result, category);
  }
}
