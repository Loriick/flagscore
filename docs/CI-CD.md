# 🚀 CI/CD Pipeline - GitHub Actions + Vercel

## 📋 **Vue d'ensemble**

Ce projet utilise GitHub Actions pour automatiser les tests, la qualité du code et le déploiement
sur Vercel.

## 🔧 **Configuration Requise**

### **1. Secrets GitHub**

Ajoutez ces secrets dans votre repository GitHub (`Settings > Secrets and variables > Actions`) :

```bash
# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### **2. Obtenir les IDs Vercel**

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Obtenir les IDs
vercel env ls
```

## 🔄 **Workflows**

### **1. CI/CD Principal** (`.github/workflows/ci-cd.yml`)

**Déclencheurs :**

- Push sur `main` → Tests + Déploiement production
- Push sur `develop` → Tests seulement
- Pull Request → Tests + Déploiement preview

**Étapes :**

1. ✅ **Tests** : Type-check, Lint, Build
2. 🚀 **Déploiement** : Vercel (prod ou preview)
3. 📢 **Notification** : Succès/Échec

### **2. Sécurité** (`.github/workflows/security.yml`)

**Déclencheurs :**

- Push sur `main`
- Pull Requests
- Tous les lundis (audit automatique)

**Vérifications :**

- 🔒 Audit des dépendances
- 🛡️ Review des dépendances (PR)
- ⚠️ Alertes de vulnérabilités

### **3. Performance** (`.github/workflows/performance.yml`)

**Déclencheurs :**

- Push sur `main`
- Pull Requests

**Tests :**

- 📊 Lighthouse CI
- 📦 Analyse du bundle
- ⚡ Métriques de performance

## 🎯 **Branches et Stratégie**

### **Branches Principales**

- **`main`** : Production (déploiement automatique)
- **`develop`** : Développement (tests seulement)

### **Pull Requests**

- ✅ Tests automatiques
- 🚀 Déploiement preview sur Vercel
- 🔒 Review de sécurité
- 📊 Tests de performance

## 📊 **Métriques et Seuils**

### **Lighthouse**

- Performance : ≥ 80%
- Accessibilité : ≥ 90%
- Best Practices : ≥ 80%
- SEO : ≥ 80%

### **Bundle Size**

- FCP : ≤ 2s
- LCP : ≤ 2.5s
- CLS : ≤ 0.1
- TBT : ≤ 300ms

## 🚨 **Gestion des Erreurs**

### **Échec de Tests**

- ❌ Déploiement bloqué
- 📧 Notification automatique
- 🔍 Logs détaillés

### **Échec de Déploiement**

- 🔄 Rollback automatique
- 📊 Rapport d'erreur
- 🛠️ Actions de récupération

## 🔧 **Commandes Locales**

```bash
# Tests
pnpm test:run
pnpm type-check
pnpm lint

# Build
pnpm build
pnpm analyze

# Audit sécurité
pnpm audit
pnpm audit:fix

# Déploiement manuel
vercel --prod
```

## 📈 **Monitoring**

### **Vercel Dashboard**

- 📊 Métriques de performance
- 🔍 Logs de déploiement
- 📈 Analytics

### **GitHub Actions**

- ✅ Status des workflows
- 📊 Temps d'exécution
- 🔍 Logs détaillés

## 🛠️ **Troubleshooting**

### **Problèmes Courants**

1. **Échec de build**

   ```bash
   # Vérifier localement
   pnpm build
   ```

2. **Secrets manquants**

   ```bash
   # Vérifier dans GitHub Settings
   Settings > Secrets and variables > Actions
   ```

3. **Déploiement Vercel échoué**
   ```bash
   # Vérifier les IDs
   vercel env ls
   ```

### **Support**

- 📚 [GitHub Actions Docs](https://docs.github.com/en/actions)
- 🚀 [Vercel Docs](https://vercel.com/docs)
- 🔧 [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**🎉 Votre pipeline CI/CD est maintenant configuré !**
