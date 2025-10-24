# 🚀 Flagscore Monorepo - Déploiement Vercel

## 📋 Configuration Vercel

### Paramètres requis dans Vercel Dashboard :

1. **Root Directory** : `apps/web`
2. **Build Command** : `pnpm vercel:build`
3. **Install Command** : `pnpm install --frozen-lockfile`
4. **Output Directory** : `.next`

### Variables d'environnement :

```
FFFA_BASE=https://www.fffa.org/wp-admin/admin-ajax.php
FFFA_ACTION=fffa_calendar_api_proxy
```

## 🏗️ Structure du monorepo

```
flagscore-monorepo/
├── apps/
│   ├── web/              # 🌐 Site public (Vercel)
│   └── admin/            # 🔧 Interface admin (futur)
├── packages/
│   ├── shared/           # 📦 Types et utils partagés
│   └── ui/              # 🎨 Design system (futur)
├── scripts/
│   └── deploy.sh         # 🚀 Script de déploiement
└── vercel.json          # ⚙️ Configuration Vercel
```

## 🚀 Commandes utiles

```bash
# Développement
pnpm dev                 # Toutes les apps
pnpm web:dev            # Seulement l'app web

# Build
pnpm build              # Tout le monorepo
pnpm web:build          # Seulement l'app web

# Déploiement
pnpm deploy             # Script complet
pnpm vercel:build       # Build pour Vercel

# Qualité
pnpm type-check         # Vérification TypeScript
pnpm lint              # Linting
pnpm test              # Tests
```

## 🔧 Configuration automatique

Le fichier `vercel.json` configure automatiquement :

- ✅ Build depuis la racine du monorepo
- ✅ Installation des dépendances avec pnpm
- ✅ Routage vers `apps/web`
- ✅ Variables d'environnement

## 📝 Notes importantes

- **Backend** : Supabase (PostgreSQL + API auto)
- **Frontend** : Next.js dans `apps/web/`
- **Admin** : Futur dans `apps/admin/`
- **Partage** : Types et utils dans `packages/shared/`

## 🎯 Prochaines étapes

1. ✅ Monorepo configuré
2. 🔄 Intégration Supabase
3. 🔄 Interface admin
4. 🔄 App mobile (futur)
