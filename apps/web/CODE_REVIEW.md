# 📋 Code Review - Conformité aux règles `.cursorrules`

Date: $(date)

## 🔴 Points critiques à corriger

### 1. **TypeScript: Utiliser `interface` au lieu de `type`**

**Règle violée:** "Use TypeScript for all code; prefer interfaces over types."

**Fichiers concernés:**

- `apps/web/src/app/types.ts` - Tous les types doivent devenir des interfaces
- `apps/web/src/lib/fffa-api.ts` - Tous les types doivent devenir des interfaces
- `apps/web/src/app/recherche/page.tsx` - `type SearchPageProps`
- `apps/web/src/app/equipe/[teamId]/page.tsx` - `type TeamPageProps`

**Action:** Convertir tous les `type` en `interface`

---

### 2. **Exports: Préférer les exports nommés**

**Règle violée:** "Favor named exports for components."

**Fichiers concernés:**

- `apps/web/src/components/Header.tsx` - `export default function Header()`
- `apps/web/src/components/Footer.tsx` - `export default function Footer()`
- `apps/web/src/components/RechercheContent.tsx` - `export default function RechercheContent()`

**Action:** Convertir en exports nommés et mettre à jour les imports

---

### 3. **URL Search Params: Utiliser `nuqs` au lieu de `useSearchParams`**

**Règle violée:** "Use 'nuqs' for URL search parameter state management."

**Fichiers concernés:**

- `apps/web/src/components/RechercheContent.tsx` - Utilise `useSearchParams` de Next.js
- `apps/web/src/components/SearchTeams.tsx` - Gère probablement des params d'URL

**Action:**

1. Installer `nuqs`: `pnpm add nuqs`
2. Remplacer tous les `useSearchParams` par `useQueryStates` de `nuqs`
3. Migrer la gestion d'état URL vers `nuqs`

---

### 4. **Server Components: Trop de `'use client'`**

**Règle violée:** "Minimize 'use client'... favor React Server Components (RSC)"

**Fichiers problématiques:**

- `apps/web/src/app/classements/page.tsx` - Toute la page est client-side
- `apps/web/src/components/PoolsSelector.tsx` - Composant principal en client
- Plusieurs composants qui pourraient être servis

**Recommandations:**

- `classements/page.tsx`: Extraire la partie serveur pour le chargement initial des données
- Créer des Server Components pour les parties statiques
- Réduire l'usage de `useEffect` et `useState` au minimum

---

## ⚠️ Points d'amélioration

### 5. **Structure des fichiers**

**Règle:** "Structure files: exported component, subcomponents, helpers, static content, types."

**Observations:**

- Certains fichiers mélangent les définitions de types et les composants
- Types définis dans plusieurs endroits (duplication)

**Recommandation:** Centraliser les types dans des fichiers dédiés en haut de la hiérarchie

---

### 6. **Optimisation des images**

**Règle:** "Optimize images: use WebP format, include size data, implement lazy loading."

**Fichiers vérifiés:**

- `apps/web/src/components/Header.tsx` - ✅ Utilise `priority` correctement
- `apps/web/src/components/atoms/OptimizedImage.tsx` - ✅ Composant dédié existe

**Action recommandée:** Vérifier que toutes les images utilisent WebP quand possible et lazy loading

---

### 7. **Mobile-first Design**

**Règle:** "Implement responsive design with Tailwind CSS; use a mobile-first approach."

**Observations:**

- Code utilise `md:`, `sm:` (bonne pratique)
- À vérifier: tous les composants partent-ils de mobile-first ?

---

### 8. **Suspense pour composants clients**

**Règle:** "Wrap client components in Suspense with fallback."

**État actuel:**

- ✅ `page.tsx` utilise `ClientOnly` avec Suspense
- ⚠️ D'autres pages client pourraient bénéficier de Suspense

---

## ✅ Points conformes

### Points positifs

1. **Pas d'enums** - ✅ Aucun enum trouvé, utilisation de maps/objets
2. **Pas de classes** - ✅ Code fonctionnel uniquement
3. **Utilisation de Tailwind** - ✅ Cohérent dans tout le projet
4. **Types descriptifs** - ✅ Variables avec verbes auxiliaires (`isLoading`, etc.)
5. **Structure des composants** - ✅ Bien organisée avec dossiers `atoms`, `molecules`, `organisms`

---

## 📊 Résumé des actions prioritaires

### Priorité Haute 🔴

1. Convertir tous les `type` en `interface` (6 fichiers)
2. Convertir exports `default` en exports nommés (3 fichiers)
3. Migrer vers `nuqs` pour la gestion des URL params (2 fichiers)

### Priorité Moyenne ⚠️

4. Réduire l'usage de `'use client'` et favoriser les Server Components
5. Centraliser la gestion des types
6. Vérifier l'optimisation images (WebP, lazy loading)

### Priorité Basse ℹ️

7. Améliorer la structure des fichiers selon la convention
8. Ajouter Suspense là où manquant

---

## 🔧 Commandes utiles pour les corrections

```bash
# Installer nuqs
pnpm add nuqs

# Rechercher tous les "export default" dans components
grep -r "export default" apps/web/src/components

# Rechercher tous les "type" dans src
grep -r "export type" apps/web/src
```

---

## 📝 Notes supplémentaires

- Le projet utilise déjà de bonnes pratiques (Zustand, React Query, Supabase)
- L'architecture avec Server/Client Components est partiellement en place
- Les tests sont présents (bon signe)
- Le code est globalement propre et maintenable

Les corrections proposées sont principalement des ajustements de style et de convention pour mieux
respecter les règles établies dans `.cursorrules`.
