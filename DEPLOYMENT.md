# Déploiement Automatique

Ce projet utilise **Vercel** pour le déploiement automatique.

## 🚀 Déploiement

- **Push sur `main`** → Déploiement automatique sur `https://flagscore.vercel.app`
- **Pull Request** → Preview automatique avec URL temporaire

## 🔧 Configuration

Le déploiement est configuré via :

- `vercel.json` (si présent)
- Configuration Vercel dans le dashboard
- Variables d'environnement dans Vercel

## 📊 Monitoring

- **Analytics** : Vercel Analytics (production uniquement)
- **Performance** : Speed Insights automatiques
- **Logs** : Disponibles dans le dashboard Vercel

## 🛠️ Développement Local

```bash
# Installation
pnpm install

# Développement
pnpm dev

# Tests
pnpm test:run

# Build
pnpm build
```

## ✅ Avantages

- ✅ Déploiement automatique
- ✅ Preview des PR
- ✅ Rollback facile
- ✅ Monitoring intégré
- ✅ Pas de CI/CD complexe à maintenir
