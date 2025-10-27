# 🔍 Fonctionnalité de Recherche d'Équipes

## 📋 Prérequis

1. **Table `teams` dans Supabase** - Exécuter le script SQL de migration
2. **Données dans `rankings`** - Avoir des classements synchronisés
3. **Serveur de développement** - `pnpm dev` en cours d'exécution

## 🚀 Étapes de Test

### 1. Créer la table `teams` dans Supabase

Exécuter le script SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Voir le fichier: apps/web/supabase-migrations/001_create_teams_table.sql
```

### 2. Synchroniser les équipes

**Option A: Via l'interface web**

- Aller sur `/test-teams-sync` (disponible en développement)
- Cliquer sur "Lancer la synchronisation"

**Option B: Via l'API**

```bash
curl -X POST http://localhost:3000/api/teams
```

**Option C: Via le script de test**

```bash
./apps/web/scripts/test-teams-api.sh
```

### 3. Tester la recherche

**Interface de recherche:**

- Cliquer sur l'icône 🔍 dans le header
- Taper le nom d'une équipe (minimum 2 caractères)
- Voir les suggestions en temps réel

**Page de résultats:**

- Aller sur `/recherche`
- Utiliser la barre de recherche
- Voir tous les résultats avec filtres

**Page détail équipe:**

- Cliquer sur une équipe dans les résultats
- Voir toutes les statistiques détaillées

## 🔧 API Endpoints

### GET `/api/teams`

- **Paramètres:** `search`, `poolId`, `championshipId`
- **Retourne:** Liste des équipes avec filtres

### POST `/api/teams`

- **Action:** Synchronise les équipes depuis les rankings
- **Retourne:** Nombre d'équipes synchronisées

### GET `/api/teams/[teamId]`

- **Paramètres:** `teamId` dans l'URL
- **Retourne:** Détails d'une équipe spécifique

## 📊 Données Synchronisées

Pour chaque équipe, on synchronise :

- **Statistiques générales:** matchs, victoires, défaites, nuls
- **Statistiques offensives:** buts marqués, encaissés, différence
- **Classement:** position actuelle, meilleure, pire
- **Contexte:** poule, championnat, saison

## 🐛 Dépannage

**Erreur "Table teams doesn't exist"**

- Exécuter le script SQL de migration

**Erreur "No rankings found"**

- Synchroniser d'abord les classements via `/api/sync`

**Erreur de connexion Supabase**

- Vérifier les variables d'environnement
- Redémarrer le serveur de développement

## 📱 Fonctionnalités Mobile

- **Bouton de recherche** dans le header (mobile + desktop)
- **Modal de recherche** avec suggestions
- **Interface responsive** sur tous les écrans
- **Navigation tactile** optimisée
