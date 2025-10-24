# GitHub Secrets Configuration

Pour que les workflows GitHub Actions fonctionnent correctement, vous devez configurer les secrets
suivants dans votre repository GitHub :

## 🔐 Secrets Requis

### Vercel Secrets

- `VERCEL_TOKEN` : Token d'authentification Vercel
- `VERCEL_ORG_ID` : ID de l'organisation Vercel
- `VERCEL_PROJECT_ID` : ID du projet Vercel

### Comment obtenir ces secrets :

1. **VERCEL_TOKEN** :
   - Allez sur [Vercel Dashboard](https://vercel.com/account/tokens)
   - Créez un nouveau token avec les permissions appropriées
   - Copiez le token

2. **VERCEL_ORG_ID** et **VERCEL_PROJECT_ID** :
   - Allez sur votre projet Vercel
   - Dans les paramètres du projet, vous trouverez ces IDs
   - Ou utilisez la CLI Vercel : `vercel link` puis `vercel env pull .env.local`

## 📝 Configuration dans GitHub

1. Allez dans votre repository GitHub
2. Cliquez sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez chaque secret avec son nom et sa valeur

## 🚀 Workflows Disponibles

### CI Pipeline (`.github/workflows/ci.yml`)

- **Déclenchement** : Push sur `main`/`develop` ou Pull Request
- **Jobs** :
  - Code Quality (ESLint, TypeScript, Prettier)
  - Tests (Vitest avec coverage)
  - Build (Next.js build)
  - Security Audit (pnpm audit)
  - Deploy (seulement sur `main`)

### Deploy Pipeline (`.github/workflows/deploy.yml`)

- **Déclenchement** : Push sur `main` ou workflow_dispatch
- **Jobs** :
  - Deploy to Vercel
  - Lighthouse CI (tests de performance)
  - Post-deploy tests (smoke tests)
  - Notifications

### Release Pipeline (`.github/workflows/release.yml`)

- **Déclenchement** : Push de tag `v*`
- **Jobs** :
  - Create GitHub Release
  - Deploy Release
  - Notifications

## 🔧 Scripts Disponibles

```bash
# Développement
pnpm dev              # Serveur de développement
pnpm build            # Build de production
pnpm start            # Serveur de production

# Qualité du code
pnpm lint             # ESLint
pnpm lint:fix         # ESLint avec correction automatique
pnpm type-check       # Vérification TypeScript
pnpm format           # Prettier
pnpm format:check     # Vérification Prettier

# Tests
pnpm test             # Tests en mode watch
pnpm test:run         # Tests une seule fois
pnpm test:coverage    # Tests avec coverage
pnpm test:ui          # Interface graphique des tests

# Sécurité
pnpm audit            # Audit de sécurité
pnpm audit:fix        # Correction automatique

# Maintenance
pnpm clean            # Nettoyage des caches
```

## 📊 Monitoring

- **Lighthouse CI** : Tests de performance automatiques
- **Codecov** : Couverture de code (optionnel)
- **Vercel Analytics** : Analytics de production
- **GitHub Actions** : Logs et métriques des workflows

## 🎯 Prochaines Étapes

1. Configurez les secrets GitHub
2. Poussez le code sur GitHub
3. Vérifiez que les workflows s'exécutent correctement
4. Configurez les environnements Vercel si nécessaire
5. Testez le déploiement automatique
