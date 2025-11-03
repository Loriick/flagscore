# 🔗 Design: URLs Partageables - Vue d'ensemble

## 📋 Objectif

Permettre le partage d'URLs qui restaurent exactement:

- Le classement d'une poule spécifique
- Les résultats d'une journée spécifique

## 🎯 Structure des URLs

### Format minimal (recommandé)

```
/?pool=1813              → Classement de la poule 1813
/?pool=1813&day=12345    → Résultats de la journée 12345 de la poule 1813
```

### Format complet (optionnel, pour robustesse)

```
/?season=2026&championship=464&pool=1813&day=12345
```

### Paramètres

- `season` (optionnel) : Saison (défaut: 2026)
- `championship` (optionnel) : ID du championnat (auto-déduit si pool connu)
- `pool` (requis pour partage) : ID de la poule
- `day` (optionnel) : ID de la journée (si présent → résultats, sinon → classement)

## 🏗️ Architecture

### 1. Hook `useShareableUrl` (existant, à simplifier)

- Gère la lecture/écriture des query params via `nuqs`
- Fournit les valeurs parsées et les setters
- Met à jour l'URL automatiquement

### 2. Hook `useAppDataSupabase` (à modifier)

- **Initialisation:** Lit depuis `useShareableUrl` au montage si valeurs présentes
- **Synchronisation:** Met à jour l'URL quand les sélections changent
- **Priorité:** L'URL a priorité sur les valeurs par défaut

### 3. Composant `PoolsSelector`

- Aucun bouton de partage requis. L'URL du navigateur reflète toujours l'état sélectionné et peut
  être copiée directement.

## 🔄 Flux de Synchronisation

```
┌─────────────────────────────────────────────────────────┐
│ 1. Utilisateur ouvre une URL avec paramètres           │
│    Ex: /?pool=1813&day=12345                           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. useShareableUrl lit les paramètres                  │
│    → pool=1813, day=12345                              │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. useAppDataSupabase initialise depuis l'URL           │
│    → setSelectedPoolId(1813)                            │
│    → setSelectedDayId(12345)                            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Les hooks Supabase chargent les données             │
│    → usePoolsOptimized(1813)                           │
│    → useOptimizedMatchesByDay(12345)                   │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 5. PoolsSelector affiche les bonnes sélections          │
│    → Pool sélectionné                                   │
│    → Journée sélectionnée                               │
│    → Résultats affichés                                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Utilisateur change de sélection                      │
│    → setSelectedDayId(67890)                            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 7. useAppDataSupabase détecte le changement             │
│    → useEffect déclenché                                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 8. useShareableUrl.updateUrl() met à jour l'URL         │
│    → /?pool=1813&day=67890                             │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 9. URL partageable (utilisateur peut copier/partager)   │
└─────────────────────────────────────────────────────────┘
```

## 📝 Exemples d'URLs

### Classement d'une poule

```
https://flagscore.vercel.app/?pool=1813
```

### Résultats d'une journée

```
https://flagscore.vercel.app/?pool=1813&day=12345
```

### Avec tous les paramètres (robustesse)

```
https://flagscore.vercel.app/?season=2026&championship=464&pool=1813&day=12345
```

## ✅ Avantages de ce Design

1. **URLs propres:** Format minimal, lisible
2. **Backward compatible:** Fonctionne avec ou sans paramètres
3. **Bookmarkable:** Les utilisateurs peuvent sauvegarder une vue
4. **Deep linking:** Les liens directs fonctionnent
5. **Navigation navigateur:** Back/forward fonctionne
6. **Partage simple:** Copie directe de l'URL depuis la barre d'adresse
7. **SEO friendly:** URLs descriptives (optionnel: ajouter slug)

## 🚀 Prochaines Étapes

1. Simplifier `useShareableUrl` (retirer `view`)
2. Intégrer dans `useAppDataSupabase`
3. Tester le flux complet
