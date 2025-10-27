// Configuration Supabase pour Flagscore
// Ce fichier contient les instructions pour configurer Supabase

export const SUPABASE_CONFIG = {
  // URL de votre projet Supabase
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "your_supabase_project_url",

  // Clé anonyme de votre projet Supabase
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON || "your_supabase_anon_key",

  // Configuration des tables
  tables: {
    championships: "championships",
    pools: "pools",
    matches: "matches",
    rankings: "rankings",
  },
} as const;

// Instructions pour configurer Supabase :
// 1. Créer un projet sur https://supabase.com
// 2. Récupérer l'URL et la clé anonyme
// 3. Ajouter ces variables dans .env.local :
//    NEXT_PUBLIC_SUPABASE_URL=your_project_url
//    NEXT_PUBLIC_SUPABASE_ANON=your_anon_key  (nom changé de ANON_KEY à ANON pour éviter l'avertissement Vercel)
// 4. Créer les tables dans Supabase SQL Editor
