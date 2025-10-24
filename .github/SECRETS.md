## 🔐 Secrets GitHub Requis

Pour que les workflows GitHub Actions fonctionnent correctement, vous devez configurer les secrets
suivants dans votre repository GitHub :

### Secrets Vercel (pour le déploiement manuel)

Ces secrets sont nécessaires pour le déploiement manuel vers Vercel :

#### `VERCEL_TOKEN`

- **Description** : Token d'authentification Vercel
- **Comment l'obtenir** :
  1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
  2. Cliquez sur votre profil → Settings
  3. Onglet "Tokens"
  4. Créez un nouveau token avec les permissions appropriées
- **Permissions requises** : Lecture/Écriture des projets

#### `VERCEL_ORG_ID`

- **Description** : ID de votre organisation Vercel
- **Comment l'obtenir** :
  1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
  2. Sélectionnez votre équipe/organisation
  3. Allez dans Settings → General
  4. Copiez l'ID de l'équipe
- **Format** : `team_xxxxxxxxxxxxxxxx`

#### `VERCEL_PROJECT_ID`

- **Description** : ID de votre projet Vercel
- **Comment l'obtenir** :
  1. Allez sur votre projet dans [Vercel Dashboard](https://vercel.com/dashboard)
  2. Allez dans Settings → General
  3. Copiez l'ID du projet
- **Format** : `prj_xxxxxxxxxxxxxxxx`

### Secret GitHub (pour les releases)

#### `GITHUB_TOKEN`

- **Description** : Token GitHub pour créer des releases
- **Comment l'obtenir** : Automatiquement fourni par GitHub Actions
- **Permissions** : Automatiquement configurées
- **Note** : Ce secret est automatiquement disponible dans tous les workflows

## 🚀 Configuration des Workflows

### Workflow CI (`ci.yml`)

- ✅ **Aucun secret requis**
- ✅ Fonctionne immédiatement après activation
- ✅ Se déclenche sur push vers `main` et pull requests

### Workflow Manual Deploy (`manual-deploy.yml`)

- ✅ **Secrets Vercel requis** : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- ✅ **Déclenchement manuel uniquement** via GitHub Actions UI
- ✅ Choix de l'environnement (production/staging)
- ✅ Tests et Lighthouse CI inclus

### Workflow Release (`release.yml`)

- ✅ **Secrets GitHub requis** : `GITHUB_TOKEN` (automatique)
- ✅ Se déclenche sur push de tags `v*`
- ✅ Création automatique de releases GitHub
- ✅ **Pas de déploiement automatique**

## 📋 Checklist de Configuration

### 1. Secrets Vercel (optionnel pour l'instant)

- [ ] `VERCEL_TOKEN` configuré (quand vous serez prêt pour le déploiement)
- [ ] `VERCEL_ORG_ID` configuré (quand vous serez prêt pour le déploiement)
- [ ] `VERCEL_PROJECT_ID` configuré (quand vous serez prêt pour le déploiement)

### 2. Vérification des Workflows

- [x] Workflow CI activé et fonctionnel
- [x] Workflow Manual Deploy configuré (déploiement manuel uniquement)
- [x] Workflow Release activé et fonctionnel (sans déploiement automatique)

### 3. Test de Déploiement (quand vous serez prêt)

- [ ] Déploiement manuel via GitHub Actions UI
- [ ] Création de tag `v1.0.0` déclenche la release
- [ ] Vérification que l'application est accessible

## 🔧 Dépannage

### Erreur : "Secret not found"

- Vérifiez que tous les secrets sont configurés dans Settings → Secrets and variables → Actions
- Vérifiez l'orthographe exacte des noms de secrets

### Erreur : "Invalid Vercel credentials"

- Vérifiez que le `VERCEL_TOKEN` a les bonnes permissions
- Vérifiez que les IDs d'organisation et de projet sont corrects

### Erreur : "Deployment failed"

- Vérifiez les logs du workflow dans l'onglet Actions
- Vérifiez que le projet Vercel existe et est configuré correctement

## 📚 Ressources Utiles

- [Documentation GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Documentation Vercel CLI](https://vercel.com/docs/cli)
- [Documentation GitHub Actions](https://docs.github.com/en/actions)
