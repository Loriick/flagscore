# Surface : Résultats, Classements et cadre commun (apps/web)

Cibles : `apps/web/src/app/page.tsx`, `apps/web/src/app/classements/page.tsx`, `apps/web/src/app/a-propos/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/components/Header.tsx`, `apps/web/src/components/Footer.tsx`.

- **Mode** : Operate. Le visiteur vient retrouver un score et un classement.
- **Audience et tâche** : joueurs, coachs, proches et supporters, sur téléphone, entre le dimanche soir et le jeudi qui suivent une journée de compétition. Ils veulent savoir qui a gagné, avec quel score, et ce que ça change au classement.
- **Contraintes** :
  - nom, logo orange « FLAG SCORE.FR » et domaine conservés ;
  - jamais « officiel » ;
  - la FFFA est citée comme source ;
  - l'affichage des sources des scores (Instagram) est reporté.
- **Décisions ouvertes** : la page équipe et la recherche restent hors périmètre de ce passage.

## Direction contract

THESIS : les résultats se lisent comme les visuels « SCORE FINAL » que les clubs postent le dimanche soir. Les scores de la journée sont posés en grand, en condensé, sur de l'encre noire, sous un bandeau jaune flag. La page refuse l'appli sportive sombre avec ses cartes floutées, son dégradé bleu et une carte par match.

OWN-WORLD :
- **Fond** : encre noire chaude (#100F0D), avec des filets de 1 px (#2B2924) entre les matchs. Pas de cartes, pas de flou, pas de dégradé.
- **Couleur engagée** : jaune flag (#FFD02B). Elle porte le bandeau de tête, la barre « score final », la journée sélectionnée et le focus.
- **Texte** : blanc craie (#F4F1E8), et gris chaud (#9D998C) pour le perdant et le secondaire.
- **Typographie** : Big Shoulders (axe optique en taille display), condensée, en capitales, pour les équipes, les scores et les titres. Geist pour l'interface. Chiffres tabulaires. Angles à 4 px.

STORY : le visiteur arrive sur la dernière journée jouée. Il lit les scores sans rien toucher. Il change de compétition, de poule ou de journée avec des sélecteurs et des onglets standards. Il voit le classement de la poule à côté (desktop) ou juste en dessous (mobile).

FIRST VIEWPORT (390 px) :
- un bandeau jaune de 56 px avec le logo et le bouton menu ;
- les sélecteurs compacts : Compétition sur toute la largeur, puis Poule et Saison ;
- les onglets de journée, avec la journée active soulignée en jaune ;
- la barre « SCORE FINAL » en noir sur jaune (poule · journée · date) ;
- puis, pour chaque match, deux lignes : l'équipe en capitales condensées à gauche, le score en 40 px à droite. Le vainqueur est en blanc craie, le perdant en gris.

En desktop, on a deux colonnes : les scores (60 %) et le classement collant (40 %).

FORM : direction 2 sur 4 de la liste présentée (« Score final »), choisie par l'utilisateur. seed: none (unavailable)

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
