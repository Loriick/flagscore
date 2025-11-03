# 🔄 Flux des Valeurs par Défaut

## 📋 Scénario: Utilisateur arrive sur `/` (URL vide)

### 1. `useShareableUrl` retourne les `defaultValue`

```typescript
// useShareableUrl.ts
const [season] = useQueryState("season", {
  defaultValue: "2026", // ← Valeur par défaut
  parse: v => v || "2026",
});

const [pool] = useQueryState("pool", {
  defaultValue: null, // ← Pas de poule par défaut
  parse: v => (v ? parseInt(v, 10) : null),
});

// Résultat quand URL est vide:
// season = "2026"
// pool = null
// championship = null
// day = null
```

### 2. `useAppDataSupabase` lit depuis l'URL

```typescript
// useAppDataSupabase.ts
export function useAppDataSupabase() {
  const urlState = useShareableUrl();

  // État initial depuis l'URL (ou valeurs par défaut)
  const [currentSeason, setCurrentSeason] = useState(urlState.season); // 2026
  const [selectedPoolId, setSelectedPoolId] = useState(urlState.pool); // 0 (car null)

  // Si URL vide, useAppDataSupabase utilise sa logique d'auto-sélection
  useEffect(() => {
    // Si aucune poule dans l'URL, auto-sélectionner la première disponible
    if (urlState.pool === 0 && pools.length > 0) {
      // Pas de mise à jour d'URL ici - on garde l'URL propre
      setSelectedPoolId(pools[0].id);
    }
  }, [pools.length, urlState.pool]);

  // Mettre à jour l'URL UNIQUEMENT si l'utilisateur fait une sélection explicite
  useEffect(() => {
    // Ne pas mettre à jour l'URL si c'est juste l'auto-sélection initiale
    if (selectedPoolId > 0 && urlState.pool !== selectedPoolId) {
      urlState.updateUrl({ pool: selectedPoolId });
    }
  }, [selectedPoolId]);
}
```

## 🎯 Stratégie Recommandée

### Option 1: URL propre (recommandé)

**Principe:** Ne pas mettre les valeurs par défaut dans l'URL, seulement quand l'utilisateur fait
une sélection.

```typescript
// useAppDataSupabase.ts
export function useAppDataSupabase() {
  const urlState = useShareableUrl();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialiser depuis l'URL au premier rendu
  useEffect(() => {
    if (!hasInitialized) {
      // Si des valeurs sont dans l'URL, les utiliser
      if (urlState.pool > 0) {
        setSelectedPoolId(urlState.pool);
      }
      if (urlState.day > 0) {
        setSelectedDayId(urlState.day);
      }
      // Sinon, utiliser les valeurs par défaut (sans mettre à jour l'URL)
      setHasInitialized(true);
    }
  }, [hasInitialized, urlState]);

  // Mettre à jour l'URL seulement après une action utilisateur
  useEffect(() => {
    if (hasInitialized) {
      urlState.updateUrl({
        pool: effectivePoolId || null,
        day: effectiveDayId || null,
      });
    }
  }, [effectivePoolId, effectiveDayId, hasInitialized]);
}
```

**Résultat:**

- URL vide (`/`) → Pas de paramètres, comportement par défaut
- URL avec params (`/?pool=1813`) → Restaure exactement la sélection
- Sélection utilisateur → Met à jour l'URL

### Option 2: URL toujours complète

**Principe:** Toujours mettre toutes les valeurs dans l'URL, même les valeurs par défaut.

```typescript
// Toujours mettre l'URL à jour avec les valeurs actuelles
useEffect(() => {
  urlState.updateUrl({
    season: currentSeason,
    championship: effectiveChampionshipId || null,
    pool: effectivePoolId || null,
    day: effectiveDayId || null,
  });
}, [currentSeason, effectiveChampionshipId, effectivePoolId, effectiveDayId]);
```

**Résultat:**

- URL vide (`/`) → Redirige vers `/?season=2026&pool=1813` (auto-sélection)
- URL avec params → Restaure la sélection
- Sélection utilisateur → Met à jour l'URL

## ✅ Recommandation: Option 1 (URL propre)

**Avantages:**

- URLs plus courtes et lisibles
- Pas de pollution de l'historique avec auto-sélections
- Partage seulement quand l'utilisateur veut vraiment partager

**Implémentation:**

```typescript
// useAppDataSupabase.ts
export function useAppDataSupabase() {
  const urlState = useShareableUrl();
  const [isInitialMount, setIsInitialMount] = useState(true);

  // 1. Lire depuis l'URL au premier montage
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
    setIsInitialMount(false);
  }, []); // Une seule fois au montage

  // 2. Mettre à jour l'URL seulement après le montage initial
  useEffect(() => {
    if (!isInitialMount) {
      urlState.updateUrl({
        season: currentSeason,
        championship: effectiveChampionshipId || null,
        pool: effectivePoolId || null,
        day: effectiveDayId || null,
      });
    }
  }, [
    isInitialMount,
    currentSeason,
    effectiveChampionshipId,
    effectivePoolId,
    effectiveDayId,
    urlState,
  ]);
}
```

## 🔍 Exemples Concrets

### Cas 1: Arrivée sur `/`

```
1. useShareableUrl retourne: season="2026", pool=null
2. useAppDataSupabase initialise: season=2026, pool=0
3. Auto-sélection: pool = première poule disponible (ex: 1813)
4. URL reste: / (pas de mise à jour car auto-sélection)
5. Utilisateur change de pool → URL mise à jour: /?pool=1814
```

### Cas 2: Arrivée sur `/?pool=1813`

```
1. useShareableUrl retourne: season="2026", pool=1813
2. useAppDataSupabase initialise: season=2026, pool=1813
3. Pas d'auto-sélection car pool déjà défini
4. URL reste: /?pool=1813
5. Données chargées pour pool=1813
```

### Cas 3: Arrivée sur `/?pool=1813&day=12345`

```
1. useShareableUrl retourne: pool=1813, day=12345
2. useAppDataSupabase initialise: pool=1813, day=12345
3. Pas d'auto-sélection
4. URL reste: /?pool=1813&day=12345
5. Résultats de la journée 12345 affichés
```
