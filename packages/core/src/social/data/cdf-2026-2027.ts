/**
 * Poules de qualification de la Coupe de France de Flag 2026-2027
 * (masculins et féminines). Source : visuels publiés par @fffa_flag le
 * 29 octobre 2026.
 *
 * Lectures à vérifier sur les visuels :
 * - Masc. Sud P1 : « REPAERS » → Reapers ; « FFCV (Voeil-et-Giget) » → FFCC
 *   (Voeuil-et-Giget), comme dans le championnat.
 * - Masc. Sud P4 : « Hurricane » → Hurricanes.
 * - Masc. Sud P5 : « Canonniers (Toulous) » → Toulon.
 * - Masc. Sud P3 : « Ours » sans lettre (Ours B est en P4).
 */

import type { PoolDefinition } from "./pools-2026-2027";

const masc = (
  conference: "Nord" | "Sud",
  n: number,
  teams: Array<[string, string]>
): PoolDefinition => ({
  competition: "CDF",
  category: "Masculin",
  conference,
  pool: `Masc. ${conference} - Poule ${n}`,
  teams,
});

const fem = (
  conference: "Nord" | "Sud",
  n: number,
  teams: Array<[string, string]>
): PoolDefinition => ({
  competition: "CDF",
  category: "Féminin",
  conference,
  pool: `Fém. ${conference} - Poule ${n}`,
  teams,
});

export const CDF_POOLS_2026_2027: PoolDefinition[] = [
  // --- Masculins, Conférence Nord -------------------------------------------
  masc("Nord", 1, [
    ["Stallions", "Laval"],
    ["Yankees", "Angers"],
    ["Ankou", "Rennes"],
    ["Licornes", "Saint-Brieuc"],
  ]),
  masc("Nord", 2, [
    ["Dockers", "Nantes"],
    ["Esox", "Basse-Goulaine"],
    ["Stade Poitevin", "Poitiers"],
    ["Sea Devils", "La Rochelle"],
  ]),
  masc("Nord", 3, [
    ["Pionniers", "Tours"],
    ["Chevaliers", "Orléans"],
    ["AFC Carnutes", "Chartres"],
    ["Caimans", "Le Mans"],
  ]),
  masc("Nord", 4, [
    ["Salamandres A", "Le Havre"],
    ["Léopards", "Rouen"],
    ["Crazy Bees", "Barentin"],
    ["Conquérants", "Caen"],
    ["Eagles", "L'Aigle"],
  ]),
  masc("Nord", 5, [
    ["Molosses A", "Asnières"],
    ["Cobras", "Paris"],
    ["Templiers", "Elancourt"],
    ["Juggernautes B", "Paris"],
  ]),
  masc("Nord", 6, [
    ["Flash A", "La Courneuve"],
    ["Leviathan", "Rueil-Malmaison"],
    ["Citizens", "Alfortville"],
    ["Molosses C", "Asnières"],
  ]),
  masc("Nord", 7, [
    ["Météores A", "Fontenay-sous-Bois"],
    ["Homies", "Rosny-sous-Bois"],
    ["Monarques", "Saint-Denis"],
    ["Molosses B", "Asnières"],
  ]),
  masc("Nord", 8, [
    ["Gavroches A", "Paris"],
    ["Nighthawks", "Sartrouville"],
    ["Cougars B", "Saint-Ouen-l'Aumône"],
    ["Lycans", "Les Mureaux"],
  ]),
  masc("Nord", 9, [
    ["Myrmidons", "Savigny-le-Temple"],
    ["Gladiateurs", "La Queue-en-Brie"],
    ["Ogres", "Créteil"],
    ["Corsaires", "Evry"],
  ]),
  masc("Nord", 10, [
    ["Cougars A", "Saint-Ouen-l'Aumône"],
    ["Météores B", "Fontenay-sous-Bois"],
    ["Flash B", "La Courneuve"],
    ["Diables Rouges A", "Villepinte"],
  ]),
  masc("Nord", 11, [
    ["Fontenaython", "Fontenay-sous-Bois"],
    ["Diables Rouges B", "Villepinte"],
    ["Juggernautes A", "Paris"],
    ["Gavroches B", "Paris"],
  ]),
  masc("Nord", 12, [
    ["Spartiates", "Amiens"],
    ["Fox", "Chantilly"],
    ["Seagulls", "Calais"],
    ["Capricornes", "Templeuve"],
  ]),
  masc("Nord", 13, [
    ["Tigres", "Nancy"],
    ["Gorilla", "Strasbourg"],
    ["Artilleurs", "Metz"],
    ["Wolfpack", "Haguenau"],
    ["Wildcats", "Reims"],
  ]),
  masc("Nord", 14, [
    ["Pygargues", "Troyes"],
    ["Fenris", "Dijon"],
    ["Princes", "Montbéliard"],
    ["Lynx", "Auxerre"],
    ["Spectres", "Sens"],
  ]),

  // --- Masculins, Conférence Sud --------------------------------------------
  masc("Sud", 1, [
    ["Sangliers", "Saint-Magne"],
    ["Lions", "Bordeaux"],
    ["Reapers", "Marsac-sur-l'Isle"],
    ["FFCC", "Voeuil-et-Giget"],
  ]),
  masc("Sud", 2, [
    ["Atlantes", "Biarritz"],
    ["Anges", "Mont-de-Marsan"],
    ["Blue Ravens", "Saint-Paul-lès-Dax"],
    ["Sphinx", "Pau"],
  ]),
  masc("Sud", 3, [
    ["Wildcats", "Saint-Jean-de-Védas"],
    ["Ours", "Toulouse"],
    ["Centurions", "Nîmes"],
    ["Warriors", "Narbonne"],
  ]),
  masc("Sud", 4, [
    ["Grands Ducs", "Rodez"],
    ["Flagmingos", "Balma"],
    ["Hurricanes", "Albi"],
    ["Ours B", "Toulouse"],
  ]),
  masc("Sud", 5, [
    ["Blue Stars", "Marseille"],
    ["Iron Mask", "Cannes"],
    ["Canonniers", "Toulon"],
    ["Dauphins", "Nice"],
    ["Guardians", "Le Cannet"],
  ]),
  masc("Sud", 6, [
    ["Avalanches", "Annecy"],
    ["Centaures", "Grenoble"],
    ["Aigles", "Chambéry"],
    ["Black Panthers", "Thonon-les-Bains"],
  ]),
  masc("Sud", 7, [
    ["Servals", "Clermont-Ferrand"],
    ["Sailors", "Décines"],
    ["Gones", "Lyon"],
    ["Giants", "Saint-Etienne"],
  ]),

  // --- Féminines, Conférence Nord -------------------------------------------
  fem("Nord", 1, [
    ["Juggernautes", "Paris"],
    ["Fox", "Chantilly"],
    ["Crazy Bees", "Barentin"],
    ["Météores", "Fontenay-sous-Bois"],
  ]),
  fem("Nord", 2, [
    ["Cougars", "Saint-Ouen-l'Aumône"],
    ["Molosses B", "Asnières"],
    ["Flash", "La Courneuve"],
    ["Fenris", "Dijon"],
  ]),
  fem("Nord", 3, [
    ["Molosses A", "Asnières"],
    ["Chevaliers", "Orléans"],
    ["Libertys", "Paris"],
    ["Yankees", "Angers"],
  ]),
  fem("Nord", 4, [
    ["Vikings", "Villeneuve-d'Ascq"],
    ["Capricornes", "Templeuve"],
    ["Spartiates", "Amiens"],
    ["Mustangs", "Hénin-Beaumont"],
  ]),

  // --- Féminines, Conférence Sud --------------------------------------------
  fem("Sud", 1, [
    ["Atlantes", "Biarritz"],
    ["Lions", "Bordeaux"],
    ["Flagmingos", "Balma"],
    ["Blue Ravens", "Saint-Paul-lès-Dax"],
    ["Ours", "Toulouse"],
  ]),
  fem("Sud", 2, [
    ["Canonniers", "Toulon"],
    ["Avalanches", "Annecy"],
    ["Dauphins", "Nice"],
    ["Centaures", "Grenoble"],
    ["Centurions", "Nîmes"],
  ]),
];
