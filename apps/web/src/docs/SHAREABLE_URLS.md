# 🔗 Design: URLs Partageables pour Classements et Résultats

## 📋 Vue d'ensemble

Ce design permet de partager des URLs directes vers :
- Un classement d'une poule : `/classements?pool=1813&view=classement`
- Les résultats d'une journée : `/classements?pool=1813&day=1234&view=resultats`

## 🎯 Structure des URLs

### Format général
```
/classements?season=2026&championship=464&pool=1813&day=1234&view=resultats
```

### Paramètres
- `season` (optionnel) : Saison (défaut: 2026)
- `championship` (optionnel) : ID du championnat
- `pool` (requis) : ID de la poule
- `day` (optionnel) : ID de la journée (pour les résultats)
- `view` (optionnel) : `classement` ou `resultats` (défaut: `classement`)

### Exemples

#### Classement d'une poule
```
https://flagscore.vercel.app/classements?pool=1813&view=classement
```

#### Résultats d'une journée
```
https://flagscore.vercel.app/classements?pool=1813&day=1234&view=resultats
```

#### Avec tous les paramètres (pour être explicite)
```
https://flagscore.vercel.app/classements?season=2026&championship=464&pool=1813&day=1234&view=resultats
```

## 🔧 Implémentation

### 1. Hook `useShareableUrl`

Synchronise l'état avec l'URL via `nuqs` :

```typescript
const {
  season,
  championship,
  pool,
  day,
  setSeason,
  setChampionship,
  setPool,
  setDay,
  getClassementUrl,
  getResultatsUrl,
} = useShareableUrl();
```

### 2. Intégration dans `PoolsSelector`

```typescript
// Dans PoolsSelector.tsx
import { useShareableUrl } from "@/hooks/useShareableUrl";
import { ShareButton } from "@/components/ShareButton";

export function PoolsSelector() {
  const urlState = useShareableUrl();
  const appData = useAppDataSupabase();

  // Synchroniser l'état depuis l'URL au montage
  useEffect(() => {
    if (urlState.pool > 0) {
      appData.setPool(urlState.pool);
    }
    if (urlState.day > 0) {
      appData.setDay(urlState.day);
    }
  }, []);

  // Mettre à jour l'URL quand l'état change
  useEffect(() => {
    urlState.updateUrl({
      pool: appData.selectedPoolId,
      day: appData.selectedDayId,
    });
  }, [appData.selectedPoolId, appData.selectedDayId]);

  // ...
  
  return (
    <div>
      {/* ... sélecteurs ... */}
      
      {/* Bouton partage */}
      {appData.selectedPoolId > 0 && (
        <div className="flex gap-2 mt-4">
          <ShareButton
            url={urlState.getClassementUrl(appData.selectedPoolId)}
            label="Partager le classement"
          />
          {appData.selectedDayId > 0 && (
            <ShareButton
              url={urlState.getResultatsUrl(
                appData.selectedPoolId,
                appData.selectedDayId
              )}
              label="Partager les résultats"
            />
          )}
        </div>
      )}
    </div>
  );
}
```

### 3. Page `/classements` avec lecture depuis l'URL

```typescript
// apps/web/src/app/classements/page.tsx
"use client";

import { useShareableUrl } from "@/hooks/useShareableUrl";
import { useAppDataSupabase } from "@/hooks/useAppDataSupabase";
import { ShareButton } from "@/components/ShareButton";

export default function ClassementsPage() {
  const urlState = useShareableUrl();
  const appData = useAppDataSupabase();

  // Synchroniser depuis l'URL
  useEffect(() => {
    if (urlState.pool > 0) {
      appData.setPool(urlState.pool);
    }
    if (urlState.day > 0) {
      appData.setDay(urlState.day);
    }
  }, [urlState.pool, urlState.day]);

  const view = urlState.view || "classement";

  return (
    <div>
      <PoolsSelector />
      
      {view === "classement" && <RankingsDisplay rankings={appData.rankings} />}
      {view === "resultats" && <MatchesList matches={appData.matches} />}
      
      {/* Boutons de partage */}
      <ShareButton url={urlState.getClassementUrl(appData.selectedPoolId)} />
    </div>
  );
}
```

## 🎨 Avantages

1. **URLs propres** : Format lisible et partageable
2. **Bookmarkable** : Les utilisateurs peuvent bookmarker une vue
3. **Deep linking** : Les liens directs fonctionnent
4. **SEO friendly** : Les URLs sont descriptives
5. **Navigation navigateur** : Back/forward fonctionne
6. **Partage natif** : Utilise l'API Web Share sur mobile

## 🔄 Flux de données

```
Utilisateur change sélection
    ↓
useAppDataSupabase met à jour l'état
    ↓
useShareableUrl synchronise avec l'URL
    ↓
URL mise à jour automatiquement
    ↓
Partage possible via ShareButton
```

## 📱 Responsive

Le `ShareButton` utilise l'API Web Share sur mobile pour une expérience native, avec fallback clipboard sur desktop.

## 🚀 Prochaines étapes

1. ✅ Intégrer `useShareableUrl` dans `PoolsSelector`
2. ✅ Ajouter les boutons de partage
3. ✅ Modifier la page `/classements` pour lire depuis l'URL
4. ✅ Ajouter des métadonnées Open Graph pour le partage
5. ✅ Tester le flux complet de partage

