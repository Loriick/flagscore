# Guide de configuration Supabase pour Flagscore

## 1. Créer un projet Supabase

- Aller sur https://supabase.com
- Créer un nouveau projet
- Choisir la région West EU (Ireland)
- Utiliser le plan Free

## 2. Récupérer les clés API

Dans Settings → API :

- Project URL : https://xxxxx.supabase.co
- anon public key : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## 3. Créer les tables

Dans SQL Editor, exécuter le contenu de `supabase-schema.sql`

## 4. Configurer les variables d'environnement

Créer un fichier `.env.local` dans `apps/web/` avec :

```env
# FFFA API Configuration
FFFA_BASE=https://api.fffa.fr
FFFA_ACTION=flag

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON=votre-cle-anonyme

# Application Configuration
NEXT_PUBLIC_FLAGSCORE_ORIGIN=https://flagscore.vercel.app
```

## 5. Redémarrer le serveur de développement

```bash
pnpm dev
```

## 6. Tester

- Aller sur http://localhost:3000/supabase-test
- Cliquer sur "Synchroniser les championnats"
- Vérifier que les données apparaissent
