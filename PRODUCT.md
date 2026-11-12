# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Toute la communauté du flag football français, d'abord sur téléphone :

- **Joueurs et joueuses** : retrouvent les scores de leur équipe et le classement de leur poule, surtout entre le dimanche soir et le milieu de semaine qui suivent une journée de compétition.
- **Coachs et dirigeants** : suivent les résultats des adversaires, l'état des poules et la course à la qualification.
- **Proches et supporters** (parents, amis, fans) : suivent une équipe précise sans connaître la structure des compétitions.
- **La communauté flag dans son ensemble** : suit le Championnat et la Coupe de France d'un bout à l'autre de la saison.

## Product Purpose

Flagscore rassemble au même endroit les résultats et les classements des compétitions nationales seniors de flag football en France :

- le **Championnat de France (mixte)** ;
- la **Coupe de France**, en masculin et en féminin.

Le site existe parce que les résultats publiés par la fédération arrivent tard, alors que les clubs annoncent leurs scores sur Instagram dès la fin du week-end.

Réussir, c'est qu'un joueur ou un supporter trouve en quelques secondes, sur son téléphone, le score du match qu'il cherche et ce qu'il change au classement, dès le lendemain de la journée.

## Positioning

Flagscore est **plus à jour que la source fédérale**. Il complète les données de la FFFA par les scores que les clubs publient eux-mêmes sur Instagram. Ces scores sont lus automatiquement, rapprochés des bonnes équipes grâce aux poules officielles, puis recoupés entre clubs. Un score qu'un seul club annonce, ou que deux clubs donnent différemment, est signalé comme tel, jamais présenté comme certain.

## Operating Context

- **Saison 2026-2027**, rythmée par le calendrier des compétitions : qualifications en octobre, novembre et décembre, journées de championnat de février à mars, puis demi-finales et finales d'avril à juin. Il n'y a pas de compétition nationale tous les week-ends.
- **Structure** : compétition, puis conférence (Nord / Sud), puis poule, puis journée, puis match.
  - En qualification, les matchs se jouent en **plateaux** : 4 ou 5 équipes de la même poule réunies le même jour.
  - Un club peut aligner plusieurs équipes. Elles sont désignées par une lettre (A/B/C) ou, dans la communication des clubs, par une couleur (Red/White/Black).
- **Sources de données** :
  - l'API de la FFFA, via un proxy ;
  - Supabase ;
  - les posts Instagram des clubs, collectés avec Apify et lus par Claude.
- **Moment d'usage principal** : du dimanche soir au jeudi après une journée de compétition, sur mobile.

## Capabilities and Constraints

- Les résultats sont présentés par compétition, poule et journée, avec les classements par poule et une recherche d'équipe.
- **Pages actuelles** : résultats (accueil), classements, recherche, page d'équipe (`/equipe/[teamId]`), à propos, mentions légales, politique de confidentialité, contact.
- **Stack existante** : Next.js 16 (App Router), React 19, Tailwind CSS 4, composants shadcn/Radix, TanStack Query, `nuqs` pour l'état dans l'URL (liens partageables), Supabase, déploiement sur Vercel.
- **Les états incertains font partie du produit** : un score peut être confirmé par plusieurs clubs, annoncé par un seul club, ou contesté. Un match peut aussi être à venir.
- **Terminologie** :
  - « journée » (Q - J1, J1, 1/2 finale…), « poule », « plateau », « conférence » ;
  - « Championnat de France mixte », « Coupe de France » (masculins / féminines).
  - Le nom de référence d'une équipe est « Nom (Ville) », parce que plusieurs équipes portent le même nom (Phenix, Hurricanes, Wildcats).
- **Décision ouverte** : l'affichage des scores issus d'Instagram (table `social_matches`) n'est pas encore branché sur l'interface.

## Brand Commitments

- **Nom** : Flagscore, à conserver.
- **Logo** : le logo actuel « FLAG SCORE.FR » orange (`apps/web/public/flagscore-logo-removebg-preview.png`), à conserver tel quel.
- **Domaine** : flagscore.fr, à conserver.
- **Statut vis-à-vis de la FFFA** : un partenariat est **en discussion**, il n'existe pas encore. Il ne faut donc **jamais** présenter Flagscore comme « officiel », ni ses résultats comme « résultats officiels ». On cite la FFFA comme source de données.

## Evidence on Hand

- Composition officielle des poules 2026-2027 (Championnat mixte, Coupe de France masculine et féminine) : `apps/web/src/lib/social/data/`.
- Calendrier prévisionnel 2026-2027 : `apps/web/src/lib/social/calendar.ts`.
- Scores réels du week-end du 7-8 novembre 2026 (posts de Flash de La Courneuve et des Molosses d'Asnières), utilisés dans les tests.
- **Absences à ne pas inventer** : aucun témoignage, aucune statistique d'audience, aucun partenaire, aucune photo de match sous licence.

## Product Principles

1. **Le score d'abord.** Chaque écran répond d'abord à « qui a gagné, combien, et qu'est-ce que ça change ».
2. **Honnête sur la source.** On montre d'où vient un score et à quel point il est sûr. Ne jamais faire passer une donnée non confirmée pour officielle.
3. **Pensé pour le lendemain de match, sur téléphone.** La dernière journée jouée est le point d'entrée par défaut.
4. **Lisible sans connaître le règlement.** Un proche doit comprendre la structure (compétition, poule, journée) sans explication.

## Accessibility & Inclusion

Cible : WCAG 2.2 AA. Focus visible au clavier, contrastes suffisants y compris sur fond sombre, cibles tactiles confortables sur mobile, et une langue française claire.
