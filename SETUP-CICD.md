# 🚀 Instructions de Configuration CI/CD

## 📋 **Étapes de Configuration**

### **1. Créer le Repository GitHub**

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Créer le repository sur GitHub
# Puis lier le repository local
git remote add origin https://github.com/votre-username/flagscore.git
git branch -M main
git push -u origin main
```

### **2. Configurer Vercel**

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Lier le projet
vercel link

# Obtenir les IDs nécessaires
vercel env ls
```

### **3. Configurer les Secrets GitHub**

Aller dans `GitHub Repository > Settings > Secrets and variables > Actions`

Ajouter ces secrets :

```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

### **4. Obtenir les IDs Vercel**

```bash
# Dans le dossier du projet
vercel env ls

# Ou depuis le dashboard Vercel
# Settings > General > Project ID
```

### **5. Tester le Pipeline**

```bash
# Créer une branche de test
git checkout -b test-ci-cd

# Faire un changement
echo "# Test CI/CD" >> README.md

# Commit et push
git add .
git commit -m "test: CI/CD pipeline"
git push origin test-ci-cd

# Créer une Pull Request sur GitHub
# Le pipeline se déclenchera automatiquement
```

## 🔧 **Configuration Avancée**

### **Variables d'Environnement**

Ajouter dans Vercel Dashboard :

```bash
NEXT_PUBLIC_FLAGSCORE_ORIGIN=https://flagscore.vercel.app
NODE_ENV=production
```

### **Domaines Personnalisés**

Dans Vercel Dashboard :

1. Aller dans `Settings > Domains`
2. Ajouter `flagscore.fr`
3. Configurer les DNS

### **Monitoring**

- **Vercel Analytics** : Activé automatiquement
- **Speed Insights** : Configuré dans `layout.tsx`
- **Error Tracking** : Logs dans Vercel Dashboard

## 🚨 **Dépannage**

### **Erreurs Courantes**

1. **"VERCEL_TOKEN not found"**
   - Vérifier les secrets GitHub
   - Régénérer le token Vercel

2. **"Build failed"**
   - Vérifier `pnpm build` localement
   - Consulter les logs GitHub Actions

3. **"Deployment failed"**
   - Vérifier les IDs Vercel
   - Consulter les logs Vercel

### **Commandes Utiles**

```bash
# Vérifier la configuration locale
pnpm type-check
pnpm lint
pnpm build

# Tester le déploiement
vercel --prod

# Voir les logs
vercel logs
```

## 📊 **Monitoring du Pipeline**

### **GitHub Actions**

- Aller dans `Actions` tab du repository
- Voir le statut des workflows
- Consulter les logs détaillés

### **Vercel Dashboard**

- Voir les déploiements
- Consulter les métriques
- Gérer les domaines

---

**🎉 Votre CI/CD est maintenant configuré !**

Le pipeline se déclenchera automatiquement à chaque push/PR.
