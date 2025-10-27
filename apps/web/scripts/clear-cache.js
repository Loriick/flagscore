#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🧹 Nettoyage du cache...");

// Supprimer le dossier .next
const nextDir = path.join(__dirname, ".next");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("✅ Dossier .next supprimé");
}

// Supprimer le dossier node_modules/.cache
const cacheDir = path.join(__dirname, "node_modules", ".cache");
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log("✅ Cache node_modules supprimé");
}

// Supprimer le dossier .turbo
const turboDir = path.join(__dirname, "..", ".turbo");
if (fs.existsSync(turboDir)) {
  fs.rmSync(turboDir, { recursive: true, force: true });
  console.log("✅ Cache Turborepo supprimé");
}

console.log("🎉 Cache nettoyé ! Redémarrez le serveur de développement.");
