# Configuration Resend pour l'envoi d'emails

## ⚠️ IMPORTANT : Configuration requise

Le formulaire de contact ne fonctionnera PAS tant que `RESEND_API_KEY` n'est pas configurée !

## Étapes de configuration

### 1. Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vous avez 3000 emails gratuits par mois

### 2. Obtenir votre clé API

1. Connectez-vous à votre compte Resend
2. Allez dans **API Keys**
3. Cliquez sur **Create API Key**
4. Donnez un nom à votre clé (ex: "flagscore-contact")
5. Copiez la clé générée

### 3. Configurer l'adresse d'expéditeur

**Option A - Test/Prod sans domaine (recommandé pour commencer):**

- Utilisez directement `onboarding@resend.dev` comme expéditeur
- Aucune configuration DNS requise
- Fonctionne immédiatement pour les tests et la prod

**Option B - Configuration de votre domaine (ultérieur):**

1. Allez dans **Domains**
2. Ajoutez votre domaine (ex: flagscore.fr)
3. Suivez les instructions pour configurer les enregistrements DNS
4. Une fois vérifié, changez le `from` dans le code vers votre domaine

### 4. Ajouter la variable d'environnement

#### En local (.env.local)

Créez un fichier `.env.local` dans `apps/web/` avec :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important** : Remplacez `xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` par votre vraie clé API Resend.

#### Sur Vercel

1. Allez dans votre projet Vercel
2. Ouvrez **Settings** → **Environment Variables**
3. Ajoutez la variable :
   - **Name**: `RESEND_API_KEY`
   - **Value**: votre clé API Resend
   - **Environment**: Production, Preview, Development
4. Cliquez sur **Save**
5. Redéployez votre application

### 5. Configurer l'adresse de réception

Dans `apps/web/src/app/api/contact/route.ts`, modifiez la ligne :

```typescript
to: ["contact@flagscore.fr"], // Remplacez par votre email
```

### 6. Tester l'envoi

1. Allez sur `/a-propos`
2. Remplissez le formulaire de contact
3. Cliquez sur "Envoyer"
4. Vérifiez que l'email arrive bien dans votre boîte de réception

## Limites du plan gratuit

- **3000 emails gratuits par mois**
- Si vous dépassez cette limite, vous devrez passer à un plan payant

## Dépannage

### L'email ne s'envoie pas

1. Vérifiez que `RESEND_API_KEY` est bien définie dans Vercel
2. Consultez les logs de la console Resend pour voir les erreurs
3. Vérifiez que votre domaine est bien vérifié

### Erreur "Domain not verified"

Utilisez temporairement `onboarding@resend.dev` comme adresse d'expéditeur, ou configurez votre
domaine.

## Alternative : EmailJS

Si vous préférez une solution plus simple sans backend :

1. Allez sur [https://www.emailjs.com](https://www.emailjs.com)
2. Créez un compte
3. Configurez Gmail ou un autre service
4. Remplacez le code du formulaire pour utiliser EmailJS directement côté client
