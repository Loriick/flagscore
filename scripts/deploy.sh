#!/bin/bash

# Script de déploiement pour Flagscore Monorepo
echo "🚀 Déploiement Flagscore Monorepo..."

# Vérifier que nous sommes à la racine du monorepo
if [ ! -f "pnpm-workspace.yaml" ]; then
  echo "❌ Erreur: Ce script doit être exécuté depuis la racine du monorepo"
  exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
pnpm install --frozen-lockfile

# Type check
echo "🔍 Vérification TypeScript..."
pnpm type-check

# Build
echo "🏗️ Build de l'application..."
pnpm build

# Test (optionnel)
echo "🧪 Tests..."
pnpm test

echo "✅ Build terminé avec succès!"
echo "🌐 Prêt pour le déploiement sur Vercel"
