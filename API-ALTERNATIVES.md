# 📊 API Alternatives pour Prix Boursiers - Guide Complet

## 🎯 Comparaison des meilleures API

| API | Gratuit | Limite/min | Temps réel | Actions FR | Qualité | Recommandation |
|-----|---------|-----------|-----------|-----------|---------|----------------|
| **Alpha Vantage** | ✅ | 5 | ❌ (15-20min) | ✅ | ⭐⭐⭐⭐ | Excellent |
| **Twelve Data** | ✅ | 8 | ✅ | ✅ | ⭐⭐⭐⭐⭐ | **MEILLEUR** |
| **Yahoo Finance** | ✅ | ∞ | ✅ | ✅ | ⭐⭐⭐⭐ | Très bien |
| **Polygon.io** | ✅ | 5 | ❌ (15min) | ❌ (US only) | ⭐⭐⭐⭐ | US uniquement |
| **IEX Cloud** | ✅ | 50k/mois | ✅ | ❌ (US only) | ⭐⭐⭐⭐⭐ | US uniquement |
| **Finnhub** (actuel) | ✅ | 60 | ❌ (15min) | ✅ | ⭐⭐⭐ | Correct |
| **Marketstack** | ✅ | 100/mois | ❌ (EOD) | ✅ | ⭐⭐⭐ | Limité |

---

## 🥇 API Recommandées

### 1. **Twelve Data** - LE MEILLEUR CHOIX ⭐⭐⭐⭐⭐

**Pourquoi c'est le meilleur :**
- ✅ **Vraiment temps réel** (pas de délai)
- ✅ Actions du monde entier (US, FR, ES, DE, UK, etc.)
- ✅ 8 requêtes/minute gratuit (largement suffisant)
- ✅ API très simple et bien documentée
- ✅ Support ISIN et symboles internationaux

**Limites gratuites :**
- 8 requêtes/minute
- 800 requêtes/jour
- Parfait pour un portfolio personnel !

**Inscription :**
🔗 [https://twelvedata.com/](https://twelvedata.com/)

**Exemple d'API call :**
```javascript
// Prix en temps réel
fetch(`https://api.twelvedata.com/price?symbol=AAPL&apikey=YOUR_KEY`)

// Quote complète
fetch(`https://api.twelvedata.com/quote?symbol=MC.PA&apikey=YOUR_KEY`)

// Plusieurs actions en une fois
fetch(`https://api.twelvedata.com/quote?symbol=AAPL,MSFT,GOOGL&apikey=YOUR_KEY`)
```

**Prix :**
- 💰 Gratuit : 8 req/min
- 💰 Basic ($8/mois) : 120 req/min
- 💰 Pro ($29/mois) : 600 req/min

---

### 2. **Alpha Vantage** - Excellent alternatif ⭐⭐⭐⭐

**Avantages :**
- ✅ Très fiable et stable
- ✅ Actions mondiales (US, FR, ES, DE, etc.)
- ✅ Données historiques complètes
- ✅ Gratuit et généreux

**Inconvénients :**
- ⚠️ Seulement 5 requêtes/minute
- ⚠️ Délai de 15-20 minutes sur le gratuit
- ⚠️ Pas de vrais temps réel gratuit

**Limites gratuites :**
- 5 requêtes/minute
- 500 requêtes/jour
- Bon pour usage léger

**Inscription :**
🔗 [https://www.alphavantage.co/](https://www.alphavantage.co/)

**Exemple d'API call :**
```javascript
// Quote global
fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY`)

// Quote Euronext
fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MC.PA&apikey=YOUR_KEY`)
```

**Prix :**
- 💰 Gratuit : 5 req/min
- 💰 Premium ($49.99/mois) : 75 req/min + temps réel

---

### 3. **Yahoo Finance (yfinance)** - Non officiel mais excellent ⭐⭐⭐⭐

**Avantages :**
- ✅ **Totalement gratuit et illimité**
- ✅ Temps réel (délai ~15-20 sec)
- ✅ Toutes les actions mondiales
- ✅ Très simple à utiliser
- ✅ Pas de clé API nécessaire

**Inconvénients :**
- ⚠️ API non officielle (peut changer)
- ⚠️ Pas de garantie de disponibilité
- ⚠️ Rate limiting possible si abus

**Utilisation :**

Option A - Via bibliothèque Node.js :
```bash
npm install yahoo-finance2
```

```javascript
import yahooFinance from 'yahoo-finance2';

const quote = await yahooFinance.quote('AAPL');
const quotes = await yahooFinance.quote(['AAPL', 'MC.PA', 'SAN.MC']);
```

Option B - API REST directe :
```javascript
// Prix simple
fetch(`https://query1.finance.yahoo.com/v8/finance/chart/AAPL`)

// Quote complet
fetch(`https://query2.finance.yahoo.com/v7/finance/quote?symbols=AAPL,MC.PA`)
```

**Prix :**
- 💰 **100% GRATUIT**
- ⚠️ Utiliser avec modération

---

### 4. **IEX Cloud** - Excellent pour actions US ⭐⭐⭐⭐⭐

**Avantages :**
- ✅ Vraiment temps réel
- ✅ 50,000 requêtes/mois gratuit
- ✅ API très professionnelle
- ✅ Données de qualité institutionnelle

**Inconvénients :**
- ❌ **Uniquement actions US** (pas de FR, ES, etc.)
- ⚠️ Système de "crédits" complexe

**Limites gratuites :**
- 50,000 messages/mois
- Temps réel inclus
- Parfait pour portfolio US

**Inscription :**
🔗 [https://iexcloud.io/](https://iexcloud.io/)

**Exemple d'API call :**
```javascript
// Quote temps réel
fetch(`https://cloud.iexapis.com/stable/stock/AAPL/quote?token=YOUR_TOKEN`)

// Plusieurs actions
fetch(`https://cloud.iexapis.com/stable/stock/market/batch?symbols=AAPL,MSFT&types=quote&token=YOUR_TOKEN`)
```

**Prix :**
- 💰 Gratuit : 50k msg/mois
- 💰 Launch ($9/mois) : 500k msg/mois
- 💰 Grow ($99/mois) : 5M msg/mois

---

### 5. **Polygon.io** - Très complet pour US ⭐⭐⭐⭐

**Avantages :**
- ✅ API très moderne et rapide
- ✅ WebSocket pour temps réel
- ✅ Données historiques complètes
- ✅ Cryptos incluses

**Inconvénients :**
- ❌ **Uniquement US** sur le gratuit
- ⚠️ Délai de 15 minutes sur gratuit
- ⚠️ 5 requêtes/minute seulement

**Limites gratuites :**
- 5 requêtes/minute
- Délai 15 minutes
- Actions US uniquement

**Inscription :**
🔗 [https://polygon.io/](https://polygon.io/)

**Exemple d'API call :**
```javascript
// Prix actuel
fetch(`https://api.polygon.io/v2/last/trade/AAPL?apiKey=YOUR_KEY`)

// Quote
fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/AAPL?apiKey=YOUR_KEY`)
```

**Prix :**
- 💰 Gratuit : 5 req/min, délai 15min
- 💰 Starter ($29/mois) : temps réel
- 💰 Developer ($99/mois) : illimité

---

## 🎯 Quelle API choisir ?

### Pour un portfolio INTERNATIONAL (US + Europe) :

#### 🥇 Choix #1 : **Twelve Data**
- Meilleur compromis qualité/prix
- 8 req/min largement suffisant
- Vraiment temps réel
- **RECOMMANDÉ pour TimInvest**

#### 🥈 Choix #2 : **Yahoo Finance**
- Gratuit et illimité
- Fonctionne partout
- Moins "professionnel"

#### 🥉 Choix #3 : **Alpha Vantage**
- Très fiable
- 5 req/min peut être limitant
- Délai 15-20 minutes

---

### Pour un portfolio UNIQUEMENT US :

#### 🥇 Choix #1 : **IEX Cloud**
- Meilleure qualité
- Vraiment temps réel
- 50k requêtes/mois généreux

#### 🥈 Choix #2 : **Polygon.io**
- Très moderne
- WebSocket disponible
- Bon pour développeurs

---

## 💡 Recommandation pour TimInvest

### Configuration optimale :

**1. API Principale : Twelve Data**
- Pour les quotes en temps réel
- 8 req/min = parfait pour votre usage
- Support international

**2. API Fallback : Yahoo Finance**
- Si Twelve Data rate limit atteint
- Gratuit et illimité
- Backup solide

**3. Cache intelligent :**
- Cache de 60 secondes (actuel)
- Batching des requêtes (actuel)
- Ainsi 8 req/min = 480 req/heure = largement suffisant !

---

## 🔄 Comment intégrer Twelve Data dans TimInvest

### Étape 1 : Inscription
1. Allez sur [twelvedata.com](https://twelvedata.com/)
2. Créez un compte gratuit
3. Copiez votre API Key

### Étape 2 : Modification du code

```typescript
// Dans lib/stockApi.ts

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || 'votre_clé';

export async function getStockQuote(symbol: string): Promise<StockData | null> {
  try {
    // Appel Twelve Data
    const response = await axios.get(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
    );
    
    const data = response.data;
    
    return {
      symbol: data.symbol,
      name: data.name,
      price: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change),
      volume: parseInt(data.volume),
      marketCap: 0,
      currency: data.currency,
    };
  } catch (error) {
    console.error(`Error fetching from Twelve Data:`, error);
    return null;
  }
}
```

### Étape 3 : Variables d'environnement

Ajoutez dans votre fichier `.env` ou docker-compose :
```bash
TWELVE_DATA_API_KEY=votre_clé_ici
```

---

## 📊 Comparaison des coûts

### Pour 100 requêtes/jour (usage typique) :

| API | Coût/mois | Temps réel | International |
|-----|-----------|-----------|---------------|
| Twelve Data | **GRATUIT** ✅ | ✅ | ✅ |
| Yahoo Finance | **GRATUIT** ✅ | ~✅ | ✅ |
| Alpha Vantage | **GRATUIT** ✅ | ❌ | ✅ |
| IEX Cloud | **GRATUIT** ✅ | ✅ | ❌ |
| Finnhub | **GRATUIT** ✅ | ❌ | ✅ |

### Pour 1000 requêtes/jour (usage intensif) :

| API | Coût/mois | Temps réel |
|-----|-----------|-----------|
| Twelve Data | $8 | ✅ |
| Yahoo Finance | **GRATUIT** ✅ | ~✅ |
| Alpha Vantage | $49.99 | ✅ |
| IEX Cloud | $9 | ✅ |

---

## 🎯 Ma recommandation finale

### Pour TimInvest, je recommande :

**🥇 Option 1 : Twelve Data (gratuit)**
- Parfait pour votre usage
- 8 req/min = 11,520 req/jour théorique
- Avec cache 60s + batching = largement suffisant
- Vraiment temps réel
- International

**🥈 Option 2 : Yahoo Finance (gratuit)**
- Si vous voulez 100% gratuit illimité
- Moins "officiel" mais très fiable
- Utilisé par des millions d'apps

**🥉 Option 3 : Garder Finnhub + ajouter fallback**
- API actuelle fonctionne
- Ajouter Yahoo Finance en fallback
- Pas de changement majeur nécessaire

---

## ⚡ Exemple d'implémentation multi-API

```typescript
// Système avec fallback automatique
async function getStockQuote(symbol: string): Promise<StockData | null> {
  // Essayer Twelve Data
  try {
    return await fetchFromTwelveData(symbol);
  } catch (error) {
    console.warn('Twelve Data failed, trying Yahoo Finance...');
  }
  
  // Fallback Yahoo Finance
  try {
    return await fetchFromYahooFinance(symbol);
  } catch (error) {
    console.warn('Yahoo Finance failed, trying Finnhub...');
  }
  
  // Fallback Finnhub (actuel)
  try {
    return await fetchFromFinnhub(symbol);
  } catch (error) {
    console.error('All APIs failed');
    return null;
  }
}
```

---

## 📚 Ressources

| API | Documentation | Prix |
|-----|---------------|------|
| Twelve Data | [docs.twelvedata.com](https://twelvedata.com/docs) | [Pricing](https://twelvedata.com/pricing) |
| Alpha Vantage | [alphavantage.co/documentation](https://www.alphavantage.co/documentation/) | [Pricing](https://www.alphavantage.co/premium/) |
| Yahoo Finance | [github.com/gadicc/node-yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2) | Gratuit |
| IEX Cloud | [iexcloud.io/docs](https://iexcloud.io/docs/api/) | [Pricing](https://iexcloud.io/pricing/) |
| Polygon.io | [polygon.io/docs](https://polygon.io/docs/stocks) | [Pricing](https://polygon.io/pricing) |
| Finnhub | [finnhub.io/docs/api](https://finnhub.io/docs/api) | [Pricing](https://finnhub.io/pricing) |

---

## ✅ Conclusion

**Pour TimInvest avec actions internationales :**

👉 **Je recommande Twelve Data** :
- Gratuit jusqu'à 8 req/min
- Vraiment temps réel
- Actions mondiales
- API simple et moderne
- Parfait pour votre usage

**Avec fallback Yahoo Finance :**
- Gratuit illimité
- Backup solide
- Zéro coût

**= Solution 100% gratuite et temps réel ! 🎉**

Voulez-vous que je modifie le code pour intégrer Twelve Data ?

