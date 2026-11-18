# Déploiement

Flagscore tient en trois apps Next.js dans le même monorepo (pnpm + Turbo).
Chacune est un projet Vercel distinct, sur son sous-domaine.

| App | Dossier | Package | Domaine | Port en dev |
|---|---|---|---|---|
| Site public | `apps/web` | `@flagscore/web` | flagscore.fr | 3000 |
| Admin | `apps/admin` | `@flagscore/admin` | admin.flagscore.fr | 3001 |
| Délégués de match | `apps/matchs` | `@flagscore/matchs` | matchs.flagscore.fr | 3002 |

Code partagé :

- `packages/core` (`@flagscore/core`) : scores Instagram (`social/`), feuilles de match (`sheets/`), session Supabase (`auth/`), client service_role.
- `packages/ui` (`@flagscore/ui`) : thème « Score final », bandeau, formulaires.

Les deux packages sont publiés en TypeScript source. Chaque app les compile avec `transpilePackages`.

## Ordre de déploiement

Exécutez la migration `004_delegates.sql` **avant** de déployer `apps/web`.

Le site public lit les colonnes `source` et `forfeit` de `social_matches`, que la migration 004 ajoute. Sans elles, la requête des résultats échoue et le site n'affiche plus aucun score.

1. Exécutez la migration 004 (voir [Supabase](#supabase)).
2. Déployez `apps/web`, `apps/admin` et `apps/matchs`, dans n'importe quel ordre.

## Projets Vercel

Créez un projet Vercel par app, tous reliés au même dépôt.

1. Dans **Root Directory**, indiquez le dossier de l'app (`apps/web`, `apps/admin` ou `apps/matchs`).
2. Gardez l'option **Include files outside the root directory** activée : les apps importent `packages/*`.
3. Ne changez pas les commandes. Le `vercel.json` de chaque app installe depuis la racine et construit seulement son package (`pnpm build --filter=@flagscore/<app>`).
4. Dans **Domains**, ajoutez le domaine de l'app.
5. Dans **Environment Variables**, renseignez les variables de son `.env.example`.

Les crons de l'import Instagram (`social-*`) sont dans `apps/admin/vercel.json` et appellent `/api/cron/social` sur admin.flagscore.fr. Le site public garde `/api/cron/sync`.

| Variable | web | admin | matchs |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON` | oui | oui | oui |
| `SUPABASE_SERVICE_ROLE_KEY` | | oui | oui |
| `RESEND_API_KEY` | oui (contact) | oui (invitations) | |
| `RESEND_FROM` | | oui | |
| `MATCHS_URL` | | oui | |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `APIFY_TOKEN` | | oui | |
| `CRON_SECRET` | oui (`/api/cron/sync`) | oui (`/api/cron/social`) | |

## Supabase

1. Dans le SQL Editor, exécutez `apps/web/supabase-migrations/004_delegates.sql` après les migrations 001 à 003, et avant tout déploiement de `apps/web`. Le fichier est idempotent.
2. Dans **Authentication → URL Configuration**, ajoutez ces adresses aux **Redirect URLs** :
   - `https://admin.flagscore.fr/auth/callback`
   - `https://matchs.flagscore.fr/auth/callback`
   - `http://localhost:3001/auth/callback` et `http://localhost:3002/auth/callback` pour le dev
3. Dans **Authentication → Providers → Email**, laissez la connexion par email activée. Les inscriptions libres ne sont pas utilisées : les comptes sont créés par l'admin.

### Créer le premier admin

1. Dans **Authentication → Users → Add user**, créez le compte avec votre email et cochez **Auto Confirm User**.
2. Dans le SQL Editor, exécutez :

   ```sql
   INSERT INTO profiles (user_id, role, full_name)
   SELECT id, 'admin', 'Prénom Nom' FROM auth.users WHERE email = 'vous@exemple.fr'
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```

3. Ouvrez admin.flagscore.fr/login et demandez un lien de connexion.

## Connexion et invitations

Les deux apps privées se connectent par lien magique. Chaque sous-domaine a ses propres cookies.

- Depuis `/login`, Supabase envoie son email standard. Le lien ne marche que dans le navigateur qui l'a demandé.
- L'admin invite un délégué depuis la page d'un plateau. Le serveur crée le compte s'il manque, lui donne le rôle `delegate`, l'affecte au plateau, puis envoie l'invitation en français par Resend. Le lien pointe vers `MATCHS_URL/auth/callback` et marche depuis n'importe quel appareil.
- Le lien d'invitation expire selon le réglage **Email OTP Expiration** de Supabase (1 heure par défaut). Le délégué peut ensuite demander un nouveau lien sur matchs.flagscore.fr/login, et l'admin peut renvoyer l'invitation.

## Développement

```bash
pnpm install
pnpm --filter @flagscore/web dev      # http://localhost:3000
pnpm --filter @flagscore/admin dev    # http://localhost:3001
pnpm --filter @flagscore/matchs dev   # http://localhost:3002
pnpm --filter @flagscore/core test    # tests du domaine
```
