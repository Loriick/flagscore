/**
 * Poules de qualification du Championnat de France de Flag 2026-2027.
 * Source : visuels officiels publiés par @fffa_flag le 14 octobre 2026
 * (Conférence Nord et Conférence Sud).
 *
 * Le nom de référence d'une équipe est « Nom (Ville) », car plusieurs équipes
 * portent le même nom (Phenix, Hurricanes, Wildcats).
 *
 * Lectures à vérifier sur le visuel :
 * - « REAPRDS » → Reapers (coquille probable).
 * - « Guardiens (Le Cannet) » → Guardians, comme sur le visuel de la Coupe.
 * - « Météores (Fontenay) » → Fontenay-sous-Bois, comme sur le visuel de la Coupe.
 *
 * Les poules de la Coupe de France sont dans cdf-2026-2027.ts.
 */

export type Conference = "Nord" | "Sud";

export interface PoolDefinition {
  /** Compétition (défaut : CM, Championnat de France mixte). */
  competition?: "CM" | "CDF";
  /** Catégorie (défaut : Mixte). */
  category?: "Mixte" | "Masculin" | "Féminin";
  conference: Conference;
  pool: string;
  /** [nom, ville] */
  teams: Array<[string, string]>;
}

export const POOLS_2026_2027: PoolDefinition[] = [
  // --- Conférence Nord -------------------------------------------------------
  {
    conference: "Nord",
    pool: "BRE",
    teams: [
      ["Ankou", "Rennes"],
      ["Mariners", "Vannes"],
      ["Korrigans", "Ploërmel"],
      ["Licornes", "Saint-Brieuc"],
    ],
  },
  {
    conference: "Nord",
    pool: "PDL",
    teams: [
      ["Esox", "Basse-Goulaine"],
      ["Dockers A", "Nantes"],
      ["Yankees", "Angers"],
      ["The Bridge", "Saint-Nazaire"],
      ["Dockers B", "Nantes"],
    ],
  },
  {
    conference: "Nord",
    pool: "CVL/NAQ",
    teams: [
      ["Stade Poitevin", "Poitiers"],
      ["Pionniers", "Tours"],
      ["Lions Flag", "Châteauroux"],
      ["Sabres", "Châteauroux"],
    ],
  },
  {
    conference: "Nord",
    pool: "PDL/CVL/NOR",
    teams: [
      ["Caimans", "Le Mans"],
      ["Stallions", "Laval"],
      ["Chevaliers", "Orléans"],
      ["Eagles", "L'Aigle"],
    ],
  },
  {
    conference: "Nord",
    pool: "NOR",
    teams: [
      ["Conquérants", "Caen"],
      ["Léopards", "Rouen"],
      ["Crazy Bees", "Barentin"],
      ["Salamandres", "Le Havre"],
    ],
  },
  {
    conference: "Nord",
    pool: "IDF Nord Ouest",
    teams: [
      ["Lycans", "Les Mureaux"],
      ["Molosses B", "Asnières"],
      ["Asgards", "Evreux"],
      ["Nighthawks", "Sartrouville"],
    ],
  },
  {
    conference: "Nord",
    pool: "IDF Centre",
    teams: [
      ["Molosses A", "Asnières"],
      ["Juggernautes C", "Paris"],
      ["Diables Rouges B", "Villepinte"],
      ["Cougars B", "Saint-Ouen-l'Aumône"],
    ],
  },
  {
    conference: "Nord",
    pool: "IDF Est",
    teams: [
      ["Météores", "Fontenay-sous-Bois"],
      ["Monarques", "Saint-Denis"],
      ["Homies B", "Rosny-sous-Bois"],
      ["Juggernautes B", "Paris"],
    ],
  },
  {
    conference: "Nord",
    pool: "IDF Ouest",
    teams: [
      ["Leviathan", "Rueil-Malmaison"],
      ["Juggernautes A", "Paris"],
      ["Cougars A", "Saint-Ouen-l'Aumône"],
      ["Citizens", "Alfortville"],
    ],
  },
  {
    conference: "Nord",
    pool: "IDF Sud",
    teams: [
      ["Corsaires", "Evry"],
      ["Gladiateurs", "La Queue-en-Brie"],
      ["Quarks", "Longjumeau"],
      ["Ogres", "Créteil"],
    ],
  },
  {
    conference: "Nord",
    pool: "IDF Nord Est",
    teams: [
      ["Flash B", "La Courneuve"],
      ["Homies A", "Rosny-sous-Bois"],
      ["Diables Rouges A", "Villepinte"],
      ["Marne Soldiers", "Meaux"],
    ],
  },
  {
    conference: "Nord",
    pool: "IDF Nord",
    teams: [
      ["Cougars C", "Saint-Ouen-l'Aumône"],
      ["Gavroches", "Paris"],
      ["Flash A", "La Courneuve"],
      ["Molosses C", "Asnières"],
    ],
  },
  {
    conference: "Nord",
    pool: "HDF Sud",
    teams: [
      ["Spartiates", "Amiens"],
      ["Mustangs", "Izel-lès-Equerchin"],
      ["Fox", "Chantilly"],
      ["Loups", "Haumont"],
    ],
  },
  {
    conference: "Nord",
    pool: "HDF Nord",
    teams: [
      ["Phenix", "Béthune"],
      ["Vikings", "Villeneuve-d'Ascq"],
      ["Seagulls", "Calais"],
      ["Capricornes", "Templeuve"],
    ],
  },
  {
    conference: "Nord",
    pool: "GRE",
    teams: [
      ["Wildcats", "Reims"],
      ["Tigres", "Nancy"],
      ["Libérateurs", "Colmar"],
      ["Artilleurs", "Metz"],
      ["Gorilla", "Strasbourg"],
    ],
  },
  {
    conference: "Nord",
    pool: "BFC Est",
    teams: [
      ["Bisons", "Besançon"],
      ["Hawks", "Lons-le-Saunier"],
      ["Fenris", "Dijon"],
      ["Princes", "Montbéliard"],
    ],
  },
  {
    conference: "Nord",
    pool: "BFC Ouest",
    teams: [
      ["Spectres", "Sens"],
      ["Lynx", "Auxerre"],
      ["Pygargues", "Troyes"],
      ["Arciers", "Nevers"],
      ["Badgers", "Léré"],
    ],
  },

  // --- Conférence Sud --------------------------------------------------------
  {
    conference: "Sud",
    pool: "NAQ Centre",
    teams: [
      ["Kangourous", "Pessac"],
      ["Lions A", "Bordeaux"],
      ["Sangliers", "Saint-Magne"],
      ["Anges", "Mont-de-Marsan"],
      ["Lions B", "Bordeaux"],
    ],
  },
  {
    conference: "Sud",
    pool: "NAQ Nord",
    teams: [
      ["Sea Devils", "La Rochelle"],
      ["Phenix", "Limoges"],
      ["Reapers", "Marsac-sur-l'Isle"],
      ["FFCC", "Voeuil-et-Giget"],
    ],
  },
  {
    conference: "Sud",
    pool: "NAQ Sud",
    teams: [
      ["Sphinx", "Pau"],
      ["Atlantes", "Biarritz"],
      ["Blue Ravens", "Saint-Paul-lès-Dax"],
      ["Hornets", "Came"],
    ],
  },
  {
    conference: "Sud",
    pool: "OCC Ouest 1",
    teams: [
      ["Grizzlys Catalans", "Perpignan"],
      ["Scorpions", "Muret"],
      ["Flagmingos A", "Balma"],
      ["Ours B", "Toulouse"],
    ],
  },
  {
    conference: "Sud",
    pool: "OCC Ouest 2",
    teams: [
      ["Ours A", "Toulouse"],
      ["Hurricanes", "Albi"],
      ["Flagmingos B", "Balma"],
      ["Flagmingos C", "Balma"],
    ],
  },
  {
    conference: "Sud",
    pool: "OCC Est",
    teams: [
      ["War Eagles", "Teyran"],
      ["Hurricanes", "Montpellier"],
      ["Centurions", "Nîmes"],
      ["Warriors", "Narbonne"],
      ["Wildcats", "Saint-Jean-de-Védas"],
    ],
  },
  {
    conference: "Sud",
    pool: "Sud Ouest",
    teams: [
      ["Golden Eagles", "Fos-sur-Mer"],
      ["Argonautes", "Aix-en-Provence"],
      ["Jaguars", "Châteauneuf-les-Martigues"],
      ["Blue Stars", "Marseille"],
    ],
  },
  {
    conference: "Sud",
    pool: "Sud Est",
    teams: [
      ["Canonniers", "Toulon"],
      ["Iron Mask", "Cannes"],
      ["Dauphins", "Nice"],
      ["Guardians", "Le Cannet"],
    ],
  },
  {
    conference: "Sud",
    pool: "ARA Est",
    teams: [
      ["Black Panthers", "Thonon-les-Bains"],
      ["Centaures", "Grenoble"],
      ["Aigles", "Chambéry"],
      ["Avalanches", "Annecy"],
    ],
  },
  {
    conference: "Sud",
    pool: "ARA Ouest",
    teams: [
      ["Sailors", "Décines"],
      ["Servals", "Clermont-Ferrand"],
      ["Falcons", "Villeurbanne"],
      ["Gones", "Lyon"],
    ],
  },
];

export const teamRef = (name: string, city: string) => `${name} (${city})`;

/** Nom du club sans la lettre d'équipe : "Molosses B" → "Molosses". */
export const clubName = (teamName: string) => teamName.replace(/\s+[A-C]$/, "");

/**
 * Comptes Instagram connus, par club ("Nom (Ville)" sans la lettre d'équipe).
 * À compléter : seuls les comptes vérifiés sur des posts réels sont renseignés.
 */
export const CLUB_INSTAGRAM: Record<string, string[]> = {
  "Flash (La Courneuve)": ["flashdelacourneuve"],
  "Molosses (Asnières)": ["molossesasnieres", "molossesflagasnieres"],
};
