---
name: Flagscore
description: Les scores du flag football français, posés comme un visuel « score final » de club.
colors:
  flag-yellow: "#ffd02b"
  flag-yellow-deep: "#e6b400"
  match-ink: "#100f0d"
  ink-raised: "#1a1916"
  ink-hover: "#24221e"
  hairline: "#2b2924"
  chalk: "#f4f1e8"
  stone: "#a19d90"
  alert-coral: "#ff7a5c"
typography:
  display:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 11.5vw, 3.75rem)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "'opsz' 72"
  headline:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "'opsz' 72"
  score:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "2.875rem"
    fontWeight: 900
    lineHeight: 0.9
    fontFeature: "'tnum'"
    fontVariation: "'opsz' 72"
  team:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.05
    fontVariation: "'opsz' 72"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.025em"
rounded:
  sm: "2px"
  md: "4px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  row: "16px"
  column-gap: "56px"
components:
  score-bar:
    backgroundColor: "{colors.flag-yellow}"
    textColor: "{colors.match-ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  header-band:
    backgroundColor: "{colors.flag-yellow}"
    textColor: "{colors.match-ink}"
    height: "56px"
  button-primary:
    backgroundColor: "{colors.flag-yellow}"
    textColor: "{colors.match-ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.flag-yellow-deep}"
  select-trigger:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 12px"
  select-trigger-hover:
    backgroundColor: "{colors.ink-hover}"
  day-tab:
    textColor: "{colors.stone}"
    typography: "{typography.team}"
    height: "44px"
  day-tab-active:
    textColor: "{colors.chalk}"
---

# Design System: Flagscore

## Overview

**Creative North Star : « Score final »**

Flagscore se lit comme les visuels que les clubs publient le dimanche soir, juste après le plateau. Des scores énormes et étroits sur de l'encre noire, sous un bandeau jaune flag. C'est un outil qu'on consulte pour savoir qui a gagné et ce que ça change au classement. Le monde visuel lui prête donc seulement quatre choses : une typographie condensée, une palette encre et jaune, une densité de liste sportive, et un geste signature, la barre « Score final ».

La structure reste celle d'une appli de résultats que tout le monde sait utiliser. On trouve des sélecteurs standards, des onglets de journée, des listes et un tableau de classement. L'identité vient de la précision : les chiffres alignés, le contraste entre vainqueur et perdant, la barre jaune qui annonce la journée. Ni cartes, ni flou, ni dégradé : des filets de 1 px séparent les matchs.

**Key Characteristics:**
- encre noire chaude en fond, jaune flag réservé aux signaux ;
- capitales condensées Big Shoulders pour les équipes, les scores et les titres ; Geist pour l'interface ;
- le score du vainqueur en jaune, le perdant en gris pierre ;
- des listes séparées par des filets, jamais des cartes ;
- un seul mouvement : les scores montent en cascade quand on change de journée.

## Colors

Une encre presque noire et chaude, un blanc craie, un gris pierre, et un seul jaune qui porte tout le signal.

### Primary
- **Jaune flag** : bandeau de tête, barre « Score final » / « À venir », soulignement de la journée active, score du vainqueur, position 1 du classement, focus clavier, bouton principal et soulignement des liens. Au survol du bouton principal, il passe au **jaune flag profond**.

### Neutral
- **Encre de match** : fond de toutes les pages et texte posé sur le jaune.
- **Encre relevée** : champs de sélection, menus déroulants, squelettes de chargement, bandeau « Démo ». **Encre survolée** au survol.
- **Filet** : séparateurs de 1 px entre matchs, lignes de tableau et bordures de champs.
- **Blanc craie** : texte principal, nom du vainqueur, points au classement.
- **Gris pierre** : texte secondaire, nom et score du perdant, libellés, journées inactives, statistiques secondaires du tableau.

### Accent d'état
- **Corail d'alerte** : réservé aux états destructifs ou d'erreur. Il n'est pas utilisé dans les surfaces actuelles.

### Named Rules
**La règle du signal unique.** Le jaune n'apparaît que là où il signale quelque chose : où l'on est (bandeau, journée active, focus), qui a gagné, et quoi faire (bouton principal). Jamais en décoration ni en fond de section.

**La règle de l'encre chaude.** Le fond n'est pas un noir neutre ni un bleu nuit. On ne revient jamais au dégradé bleu de l'ancien site.

## Typography

**Police display :** Big Shoulders (taille optique 72, version condensée), repli Arial Narrow.
**Police d'interface :** Geist.

**Character :** une grotesque condensée de stade et de maillot, en capitales, face à une sans-serif d'interface neutre. La première parle de match, la seconde fait fonctionner l'outil.

### Hierarchy
- **Display** (900, de 40 à 60 px, interlignage 1) : titre de page, comme « Résultats » ou « Classements ». Il reste compact sur les écrans Operate, pour que le premier match tienne dans le premier écran.
- **Headline** (900, 28 px, interlignage 1) : barre « Score final », titres de section (« Classement »).
- **Score** (900, 46 px en mobile et 56 px en desktop, interlignage 0,9, chiffres tabulaires) : les scores des matchs.
- **Team** (700, 24 px en mobile et 28 px en desktop, interlignage 1,05) : noms d'équipes, onglets de journée (16 à 18 px), entrées du menu mobile.
- **Body** (Geist 400, 14 à 16 px, interlignage 1,6) : textes explicatifs. La mesure reste sous 65 caractères.
- **Label** (Geist 600, 12 px, interlettrage 0,025 em) : libellés de champs, en-têtes de colonnes.

### Named Rules
**La règle du condensé réel.** La voix display s'applique avec l'utilitaire `font-score`, qui appelle directement `--font-big-shoulders` et force `opsz` 72. Une police display qui retombe sur Geist ou sur une police système est un défaut à corriger, pas une variante acceptable.

**La règle des chiffres alignés.** Tout chiffre comparé, score ou statistique, est en chiffres tabulaires.

## Layout

- **Conteneur :** 1152 px de large maximum, gouttières de 16 px en mobile et 24 px dès `sm`.
- **Mobile (390 px) :** une seule colonne, dans cet ordre : sélecteurs, onglets de journée, barre « Score final », matchs, classement.
- **Grand écran (`lg`) :** deux colonnes 3fr / 2fr avec 56 px d'écart. Les scores sont à gauche ; le classement (accueil) ou la légende (Classements) est à droite, en position collante sous le bandeau.
- **Sélecteurs :** Compétition en pleine largeur, puis Poule et Saison sur une ligne en mobile ; trois colonnes 2fr / 1fr / 9rem au-delà.
- **Rythme :** 16 px de marge verticale par match ; plus d'espace au-dessus des titres qu'en dessous.

## Elevation & Depth

Le système est entièrement plat. La profondeur vient des tons (encre, encre relevée, encre survolée) et des filets de 1 px. Il n'y a aucune ombre, aucun flou d'arrière-plan, aucun dégradé.

**La règle du plat.** Si un élément semble devoir flotter, c'est qu'il doit être séparé par un filet ou par un ton d'encre, pas par une ombre.

## Shapes

- **Angles :** presque droits, 4 px (2 px pour les petites pièces).
- **Lignes :** filets de 1 px pour séparer. Seuls épaississements : le soulignement de l'onglet ou du lien actif (3 px) et le trait jaune au-dessus du formulaire de contact.
- **Interdits :** pilules, cercles et cartes arrondies.

## Components

### Barre « Score final »
Le geste signature : un bloc jaune flag, sous les onglets de journée.
- À gauche, « SCORE FINAL » (ou « À VENIR » pour une journée pas encore jouée), dans la voix headline.
- À droite, en Geist semi-gras : poule · journée · date.

### Ligne de match
Deux lignes, une par équipe : le nom à gauche, le score à droite, séparées du match suivant par un filet.
- **Vainqueur :** nom en blanc craie, score en jaune flag.
- **Perdant :** nom et score en gris pierre.
- **Nul :** tout en blanc craie.
- **Match à venir :** les noms seuls, sans score, sous la barre « À venir ».
- Chaque ligne porte un libellé accessible complet (« Cougars C 43, Flash A 0 »).

### Tableau de classement
Un tableau HTML sans fond.
- **Colonnes :** position, équipe, J, G, N, P, Diff, Pts. G, N et P sont masquées en mobile.
- **Position 1 :** en jaune.
- **Points :** en score blanc craie.
- **Lignes :** séparées par des filets.

### Navigation
- **Bandeau :** jaune, 56 à 64 px de haut, avec le logo d'origine recadré (40 à 48 px de haut).
- **Desktop :** liens en encre ; le lien actif est souligné d'un trait d'encre de 3 px.
- **Mobile :** un bouton menu de 44 px ouvre un panneau d'encre plein écran. Les entrées y sont en capitales condensées, l'entrée active en jaune.

### Onglets de journée
Boutons texte en voix team, cible tactile de 44 px.
- **Inactif :** gris pierre.
- **Actif :** blanc craie, souligné de 3 px en jaune.
- **Petits écrans :** la rangée défile horizontalement.

### Champs de sélection
- **Repos :** encre relevée, bordure filet, 44 px de haut, angles de 4 px.
- **Survol :** encre survolée.
- **Option sélectionnée :** en jaune.
- **Libellé :** au-dessus du champ, en label gris pierre.

### Bouton principal
Jaune flag, texte en encre, 44 px de haut, angles de 4 px ; jaune profond au survol.

### Focus
Contour jaune de 2 px, décalé de 2 px, uniquement au clavier (`:focus-visible`), sur tous les éléments interactifs. Sur le bandeau jaune, le contour passe en encre.

## Do's and Don'ts

### Do:
- **Do** poser chaque score dans la voix score (Big Shoulders 900, chiffres tabulaires), vainqueur en jaune flag et perdant en gris pierre.
- **Do** ouvrir chaque liste de matchs par la barre « Score final » ou « À venir », avec poule · journée · date.
- **Do** séparer les éléments par des filets de 1 px et des tons d'encre.
- **Do** garder des contrôles standards (sélecteurs, onglets, tableaux) avec des cibles d'au moins 44 px.
- **Do** citer la FFFA comme source des données.

### Don't:
- **Don't** utiliser de cartes, d'ombres, de flou d'arrière-plan ni de dégradé, en particulier le dégradé bleu de l'ancien site.
- **Don't** utiliser le jaune flag en décoration ou en grand fond de section, en dehors du bandeau et de la barre « Score final ».
- **Don't** laisser la voix display retomber sur Geist ou sur une police système.
- **Don't** présenter Flagscore ou ses résultats comme « officiels ».
- **Don't** modifier le dessin du logo (orange-brun « FLAG SCORE.FR »). Seul son recadrage et sa taille sont réglables.
