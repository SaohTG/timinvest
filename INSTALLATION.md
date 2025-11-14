# 🚀 Guide d'Installation - TimInvest

## Installation Rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement (Optionnel)

Créez un fichier `.env.local` à la racine du projet :

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

Le fichier `.env.local` devrait contenir :

```
FINNHUB_API_KEY=d4b96lhr01qrv4ataf3gd4b96lhr01qrv4ataf40
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note** : La clé API est déjà configurée dans le code par défaut, donc cette étape est optionnelle.

### 3. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📦 Dépendances Installées

Lors de `npm install`, les packages suivants seront installés :

**Production :**
- `next` - Framework React
- `react` & `react-dom` - Bibliothèque React
- `typescript` - Support TypeScript
- `tailwindcss` - Framework CSS
- `recharts` - Graphiques
- `lucide-react` - Icônes
- `date-fns` - Gestion des dates
- `axios` - Client HTTP

**Développement :**
- `@types/*` - Définitions TypeScript
- `autoprefixer` - PostCSS
- `postcss` - Processeur CSS

## 🔧 Commandes Disponibles

```bash
# Développement
npm run dev          # Démarre le serveur de développement

# Production
npm run build        # Compile l'application pour la production
npm start            # Démarre le serveur de production

# Linting
npm run lint         # Vérifie le code avec ESLint
```

## 📂 Structure des Fichiers Créés

Après l'installation, votre projet aura cette structure :

```
timinvest/
├── node_modules/        # Dépendances (créé par npm install)
├── data/               # Données JSON (créé automatiquement)
│   ├── stocks.json     # Vos actions
│   └── dividends.json  # Vos dividendes
├── .next/              # Build Next.js (créé par npm run dev)
└── ... (autres fichiers)
```

## ✅ Vérification de l'Installation

Après avoir lancé `npm run dev`, vérifiez que :

1. ✅ Le serveur démarre sans erreur
2. ✅ Vous pouvez accéder à http://localhost:7293
3. ✅ La page d'accueil s'affiche correctement
4. ✅ Vous pouvez ajouter une action dans le Portfolio

## 🐛 Résolution de Problèmes

### Erreur : Port 7293 déjà utilisé

```bash
# Windows
netstat -ano | findstr :7293
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:7293 | xargs kill
```

Ou lancez sur un autre port :

```bash
npm run dev -- -p 3001
```

### Erreur : Module non trouvé

```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules package-lock.json
npm install
```

### Erreur : TypeScript

```bash
# Régénérez les types
rm -rf .next
npm run dev
```

### Problèmes avec l'API Finnhub

Si vous voyez des erreurs "401 Unauthorized" :
1. Vérifiez que votre clé API est correcte dans `.env.local`
2. Assurez-vous d'avoir redémarré le serveur après modification du `.env.local`
3. Vérifiez que vous n'avez pas dépassé la limite de 60 appels/minute

## 🌐 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Ajoutez la variable d'environnement `FINNHUB_API_KEY`
3. Déployez !

### Autre Hébergeur

```bash
# Compiler l'application
npm run build

# Lancer en production
npm start
```

N'oubliez pas de configurer les variables d'environnement sur votre plateforme d'hébergement.

## 💡 Premiers Pas

1. **Ajoutez votre première action** :
   - Allez dans "Portfolio"
   - Cliquez sur "Ajouter une action"
   - Recherchez "AAPL" (Apple)
   - Entrez la quantité et le prix d'achat
   - Cliquez sur "Ajouter"

2. **Ajoutez un dividende** :
   - Allez dans "Dividendes"
   - Cliquez sur "Ajouter un dividende"
   - Remplissez les informations
   - Voyez-le apparaître dans le calendrier

3. **Consultez votre dashboard** :
   - Retournez à l'accueil
   - Admirez vos statistiques et graphiques !

## 🎉 C'est Prêt !

Votre application TimInvest est maintenant opérationnelle avec des données boursières en temps réel via l'API Finnhub !

