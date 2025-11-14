# TimInvest - Gestion de Patrimoine Boursier

Application web moderne de gestion de patrimoine boursier, inspirée de Finary. Suivez vos investissements en temps réel, gérez vos dividendes et analysez votre performance.

## 🚀 Fonctionnalités

- **Dashboard Interactif** : Vue d'ensemble de votre portefeuille avec statistiques en temps réel
- **Gestion de Portfolio** : Ajoutez, modifiez et supprimez vos actions facilement
- **Suivi en Temps Réel** : Prix des actions mis à jour automatiquement
- **Calendrier de Dividendes** : Suivez vos revenus de dividendes avec un calendrier visuel
- **Graphiques et Visualisations** : Graphiques de performance et répartition du portfolio
- **Interface Moderne** : Design responsive et élégant avec Tailwind CSS

## 📋 Prérequis

- Node.js 18.x ou supérieur
- npm ou yarn

## 🔧 Installation

1. Clonez le repository (si applicable) ou utilisez le dossier existant

2. Installez les dépendances :

```bash
npm install
```

3. Lancez le serveur de développement :

```bash
npm run dev
```

4. Ouvrez votre navigateur à l'adresse [http://localhost:5847](http://localhost:5847)

## 📁 Structure du Projet

```
timinvest/
├── components/          # Composants React réutilisables
│   ├── Layout.tsx      # Layout principal avec navigation
│   └── StatsCard.tsx   # Carte de statistiques
├── pages/              # Pages Next.js
│   ├── api/           # API Routes
│   │   ├── stocks/    # Endpoints pour les actions
│   │   ├── dividends/ # Endpoints pour les dividendes
│   │   └── portfolio/ # Endpoints pour le portfolio
│   ├── _app.tsx       # Configuration de l'app
│   ├── index.tsx      # Page d'accueil (Dashboard)
│   ├── portfolio.tsx  # Gestion du portfolio
│   └── dividends.tsx  # Calendrier de dividendes
├── lib/               # Librairies et utilitaires
│   ├── database.ts    # Gestion de la base de données (JSON)
│   └── stockApi.ts    # API pour les données boursières
├── types/             # Définitions TypeScript
│   └── index.ts
├── styles/            # Styles globaux
│   └── globals.css
└── data/              # Données stockées (créé automatiquement)
    ├── stocks.json
    └── dividends.json
```

## 🎯 Utilisation

### 1. Dashboard

- Vue d'ensemble de votre portefeuille
- Statistiques clés : valeur totale, capital investi, plus/moins-values
- Graphique de performance sur 5 jours
- Répartition du portfolio en camembert
- Liste détaillée de vos positions

### 2. Portfolio

- **Ajouter une action** : Cliquez sur "Ajouter une action"
- Recherchez l'action par symbole (ex: AAPL, MC.PA)
- Entrez la quantité et le prix d'achat
- Spécifiez la date d'achat
- **Modifier/Supprimer** : Utilisez les icônes dans le tableau

### 3. Dividendes

- **Calendrier visuel** : Vue mensuelle de vos dividendes
- **Ajouter un dividende** : Symbole, montant, dates
- **Statistiques** : Total et revenus du mois
- Navigation entre les mois

## 🔌 API de Données Boursières

✅ **L'application est maintenant connectée à l'API Finnhub pour des données en temps réel !**

Votre clé API Finnhub est déjà configurée et fonctionnelle. L'application récupère :
- 📈 Prix en temps réel des actions
- 📊 Variations de prix (changement et pourcentage)
- 🏢 Informations sur les entreprises (nom, devise, capitalisation)
- 🔍 Recherche de symboles boursiers

**Limites de l'API Finnhub gratuite** :
- 60 appels par minute
- Données avec un léger délai (15 minutes pour le plan gratuit)
- Pas de données historiques étendues

### Pour améliorer :

**Option 1** : Passez à Finnhub Premium pour plus d'appels et données en temps réel

**Option 2** : Alpha Vantage
- API gratuite avec 5 appels/minute
- Bon pour les petits portfolios

**Option 3** : Yahoo Finance (yahoo-finance2)
- Gratuit et illimité
- Non officiel mais stable

## 💾 Stockage des Données

Les données sont actuellement stockées dans des fichiers JSON dans le dossier `data/` :
- `stocks.json` : Vos positions
- `dividends.json` : Vos dividendes

Pour une application en production, considérez :
- PostgreSQL / MySQL
- MongoDB
- Supabase
- Firebase

## 🎨 Personnalisation

### Couleurs

Modifiez les couleurs dans `tailwind.config.js` :

```javascript
colors: {
  primary: {
    500: '#0ea5e9', // Votre couleur principale
    // ...
  },
}
```

### Logo

Remplacez le logo dans `components/Layout.tsx`

## 📊 Technologies Utilisées

- **Frontend** : Next.js 14, React 18, TypeScript
- **Styling** : Tailwind CSS
- **Graphiques** : Recharts
- **Icônes** : Lucide React
- **Date Handling** : date-fns
- **API** : Next.js API Routes

## 🚀 Déploiement

### Option 1 : Portainer depuis GitHub - Recommandé ⭐

**La méthode la plus simple !** Déploiement direct depuis le repository GitHub.

Dans Portainer :
- **Stacks** → **Add stack** → Sélectionnez **"Repository"**
- Repository URL : `https://github.com/SaohTG/timinvest`
- Reference : `refs/heads/main`
- Compose path : `docker-compose.portainer.yml`
- **Deploy the stack**

**Avantages :**
- ✅ Mise à jour en 1 clic depuis GitHub
- ✅ Pas de copier-coller de configuration
- ✅ Configuration versionnée

📖 **Guide détaillé :** [`README-PORTAINER-GITHUB.md`](README-PORTAINER-GITHUB.md)

L'application sera accessible sur `http://localhost:8547`

### Option 2 : Docker Compose (Manuel)

```bash
# Lancer avec Docker Compose
docker-compose up -d --build

# Ou utiliser le Makefile
make install
```

L'application sera accessible sur `http://localhost:8547`

### Option 3 : Développement Local

```bash
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5847`

---

## 📚 Documentation Complète

| Guide | Description |
|-------|-------------|
| [`README-PORTAINER-GITHUB.md`](README-PORTAINER-GITHUB.md) | **Déploiement Portainer depuis GitHub** (recommandé) |
| [`TUTO-PORTAINER.md`](TUTO-PORTAINER.md) | Tutoriel complet Portainer |
| [`QUICKSTART-PORTAINER.md`](QUICKSTART-PORTAINER.md) | Guide rapide Portainer |
| [`PORTAINER.md`](PORTAINER.md) | Documentation Portainer détaillée |
| [`DOCKER-GUIDE.md`](DOCKER-GUIDE.md) | Guide Docker complet |
| [`START-HERE.md`](START-HERE.md) | Guide de démarrage |
| [`SYMBOLS-GUIDE.md`](SYMBOLS-GUIDE.md) | **Guide des symboles boursiers** (US, FR, ES, etc.) |
| [`API-ALTERNATIVES.md`](API-ALTERNATIVES.md) | **Comparatif API boursières** (Twelve Data, Yahoo, etc.) |

---

### Option 4 : Vercel

```bash
npm run build
# Puis déployez sur Vercel via leur interface ou CLI
```

### Option 5 : Autres Plateformes

L'application peut être déployée sur :
- Netlify
- Railway
- Render
- AWS
- Azure

## 📝 Améliorations Futures

- [ ] Authentification utilisateur
- [ ] Base de données persistante
- [ ] API boursière en temps réel
- [ ] Notifications de dividendes
- [ ] Export des données (PDF, CSV)
- [ ] Support multi-devises
- [ ] Graphiques avancés et historiques
- [ ] Application mobile (React Native)

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez que toutes les dépendances sont installées
2. Assurez-vous d'utiliser Node.js 18+
3. Consultez les logs de la console pour les erreurs

## 📄 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## 🎉 Bon Investissement !

Profitez de TimInvest pour gérer votre patrimoine boursier efficacement ! 📈

