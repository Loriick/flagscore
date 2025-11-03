# 🔗 Implémentation: URLs Partageables - Plan d'Action

## 📋 Structure des URLs

### Format

```
/?season=2026&championship=464&pool=1813&day=12345
```

### Paramètres

- `season` (optionnel) : Saison (défaut: 2026)
- `championship` (optionnel) : ID du championnat
- `pool` (optionnel) : ID de la poule
- `day` (optionnel) : ID de la journée (pour les résultats)

**Note:** Pas de `view` nécessaire car:

- Si `day` est présent → afficher les résultats
- Sinon → afficher le classement (si pool sélectionné)

## 🎯 Design de Code

### 1. Intégration dans `useAppDataSupabase`

Modifier le hook pour:

- Lire les paramètres URL au montage via `useShareableUrl`
- Synchroniser les sélections avec l'URL
- Mettre à jour l'URL automatiquement quand les sélections changent

```typescript
// useAppDataSupabase.ts
import { useShareableUrl } from "./useShareableUrl";

export function useAppDataSupabase() {
  const urlState = useShareableUrl();

  // Initialiser depuis l'URL si disponible
  useEffect(() => {
    if (urlState.season && urlState.season !== currentSeason) {
      setCurrentSeason(urlState.season);
    }
    if (urlState.championship && urlState.championship !== selectedChampionshipId) {
      setSelectedChampionshipId(urlState.championship);
    }
    if (urlState.pool && urlState.pool !== selectedPoolId) {
      setSelectedPoolId(urlState.pool);
    }
    if (urlState.day && urlState.day !== selectedDayId) {
      setSelectedDayId(urlState.day);
    }
  }, []); // Seulement au montage

  // Mettre à jour l'URL quand les sélections changent
  useEffect(() => {
    urlState.updateUrl({
      season: currentSeason,
      championship: effectiveChampionshipId || null,
      pool: effectivePoolId || null,
      day: effectiveDayId || null,
    });
  }, [currentSeason, effectiveChampionshipId, effectivePoolId, effectiveDayId]);

  // ... reste du code
}
```

### 2. Intégration dans `PoolsSelector`

Aucun bouton spécifique n'est nécessaire. L'URL du navigateur reflète l'état courant et peut être
copiée telle quelle.

### 3. Modifications dans `useShareableUrl`

Simplifier pour ne gérer que les IDs essentiels:

```typescript
// useShareableUrl.ts - Version simplifiée
export function useShareableUrl() {
  const [season, setSeason] = useQueryState("season", {
    defaultValue: "2026",
    parse: v => v || "2026",
    serialize: v => v || "2026",
  });

  const [championship, setChampionship] = useQueryState("championship", {
    defaultValue: null,
    parse: v => (v ? parseInt(v, 10) : null),
    serialize: v => (v ? v.toString() : ""),
  });

  const [pool, setPool] = useQueryState("pool", {
    defaultValue: null,
    parse: v => (v ? parseInt(v, 10) : null),
    serialize: v => (v ? v.toString() : ""),
  });

  const [day, setDay] = useQueryState("day", {
    defaultValue: null,
    parse: v => (v ? parseInt(v, 10) : null),
    serialize: v => (v ? v.toString() : ""),
  });

  const updateUrl = useCallback(
    (updates: {
      season?: number;
      championship?: number | null;
      pool?: number | null;
      day?: number | null;
    }) => {
      if (updates.season !== undefined) {
        setSeason(updates.season.toString());
      }
      if (updates.championship !== undefined) {
        setChampionship(updates.championship);
      }
      if (updates.pool !== undefined) {
        setPool(updates.pool);
      }
      if (updates.day !== undefined) {
        setDay(updates.day);
      }
    },
    [setSeason, setChampionship, setPool, setDay]
  );

  return {
    season: parseInt(season || "2026", 10),
    championship: championship || 0,
    pool: pool || 0,
    day: day || 0,
    setSeason: (s: number) => setSeason(s.toString()),
    setChampionship: (c: number | null) => setChampionship(c),
    setPool: (p: number | null) => setPool(p),
    setDay: (d: number | null) => setDay(d),
    updateUrl,
  };
}
```

## 🔄 Flux de Synchronisation

```
1. Utilisateur ouvre une URL avec paramètres
   ↓
2. useShareableUrl lit les paramètres
   ↓
3. useAppDataSupabase initialise depuis l'URL (useEffect au montage)
   ↓
4. Les sélecteurs affichent les bonnes valeurs
   ↓
5. Quand l'utilisateur change une sélection
   ↓
6. useAppDataSupabase met à jour l'état interne
   ↓
7. useEffect détecte le changement
   ↓
8. useShareableUrl.updateUrl() met à jour l'URL
   ↓
9. URL est partageable
```

## 📝 Exemples d'URLs

- **Classement d'une poule:** `/results?pool=1813`

- **Résultats d'une journée:** `/results?pool=1813&day=12345`

- **Avec tous les paramètres:** `/results?season=2026&championship=464&pool=1813&day=12345`

## ✅ Checklist d'Implémentation

- [ ] Modifier `useShareableUrl` pour simplifier (retirer `view`)
- [ ] Intégrer `useShareableUrl` dans `useAppDataSupabase`
  - [ ] Lire depuis l'URL au montage
  - [ ] Mettre à jour l'URL quand les sélections changent
- [ ] Tester la navigation (back/forward)
- [ ] Tester le deep linking (ouvrir une URL directement)
