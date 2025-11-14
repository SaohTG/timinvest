import axios from 'axios';
import { StockData } from '@/types';
import { isValidISIN, isinToSymbol, getCountryFromISIN } from './isinMapping';

// API Keys
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || 'c5faa07f2c8e4acab081b77d52492dde';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd4b96lhr01qrv4ataf3gd4b96lhr01qrv4ataf40';

// Cache configuration
const CACHE_DURATION = 60000; // 1 minute
const cache = new Map<string, { data: StockData; timestamp: number }>();

// API provider tracking
let apiStats = {
  twelveData: { success: 0, errors: 0 },
  finnhub: { success: 0, errors: 0 },
};

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubProfile {
  name: string;
  ticker: string;
  marketCapitalization: number;
  currency: string;
}

async function getStockProfile(symbol: string): Promise<{ name: string; currency: string; marketCap: number }> {
  try {
    const response = await axios.get<FinnhubProfile>(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (response.data && response.data.name) {
      return {
        name: response.data.name,
        currency: response.data.currency || 'USD',
        marketCap: response.data.marketCapitalization * 1000000 || 0,
      };
    }
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
  }
  
  // Fallback pour les actions européennes
  const europeanStocks: Record<string, { name: string; currency: string }> = {
    // French stocks
    'MC.PA': { name: 'LVMH Moët Hennessy', currency: 'EUR' },
    'OR.PA': { name: "L'Oréal", currency: 'EUR' },
    'SAN.PA': { name: 'Sanofi', currency: 'EUR' },
    'TTE.PA': { name: 'TotalEnergies', currency: 'EUR' },
    'BNP.PA': { name: 'BNP Paribas', currency: 'EUR' },
    'AIR.PA': { name: 'Airbus', currency: 'EUR' },
    'SU.PA': { name: 'Schneider Electric', currency: 'EUR' },
    // Spanish stocks
    'SAN.MC': { name: 'Banco Santander', currency: 'EUR' },
    'BBVA.MC': { name: 'BBVA', currency: 'EUR' },
    'TEF.MC': { name: 'Telefónica', currency: 'EUR' },
    'ITX.MC': { name: 'Inditex', currency: 'EUR' },
    'IBE.MC': { name: 'Iberdrola', currency: 'EUR' },
  };
  
  return europeanStocks[symbol] || { name: symbol, currency: 'USD', marketCap: 0 };
}

// Fonction pour récupérer le prix depuis Twelve Data (API principale)
async function fetchFromTwelveData(symbol: string): Promise<StockData | null> {
  try {
    console.log(`[Twelve Data] Fetching ${symbol}...`);
    
    const response = await axios.get(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      { timeout: 5000 }
    );
    
    const data = response.data;
    
    // Vérifier s'il y a une erreur
    if (data.status === 'error' || !data.close) {
      console.warn(`[Twelve Data] No data for ${symbol}:`, data.message || 'No close price');
      return null;
    }
    
    const stockData: StockData = {
      symbol: data.symbol || symbol.toUpperCase(),
      name: data.name || symbol,
      price: parseFloat(data.close),
      change: parseFloat(data.change) || 0,
      changePercent: parseFloat(data.percent_change) || 0,
      volume: parseInt(data.volume) || 0,
      marketCap: 0,
      currency: data.currency || 'USD',
    };
    
    console.log(`[Twelve Data] ✓ ${symbol}: ${stockData.price} ${stockData.currency}`);
    apiStats.twelveData.success++;
    
    return stockData;
  } catch (error: any) {
    console.error(`[Twelve Data] ✗ Error for ${symbol}:`, error.message);
    apiStats.twelveData.errors++;
    return null;
  }
}

// Fonction pour récupérer le prix depuis Finnhub (API de fallback)
async function fetchFromFinnhub(symbol: string): Promise<StockData | null> {
  try {
    console.log(`[Finnhub] Fetching ${symbol}...`);
    
    const quoteResponse = await axios.get<FinnhubQuote>(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { timeout: 5000 }
    );
    
    const quote = quoteResponse.data;
    
    if (!quote || quote.c === 0 || quote.c === null) {
      console.warn(`[Finnhub] No valid price data for ${symbol}`);
      return null;
    }
    
    const profile = await getStockProfile(symbol);
    
    const stockData: StockData = {
      symbol: symbol.toUpperCase(),
      name: profile.name,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      volume: 0,
      marketCap: profile.marketCap,
      currency: profile.currency,
    };
    
    console.log(`[Finnhub] ✓ ${symbol}: ${stockData.price} ${stockData.currency}`);
    apiStats.finnhub.success++;
    
    return stockData;
  } catch (error: any) {
    console.error(`[Finnhub] ✗ Error for ${symbol}:`, error.message);
    apiStats.finnhub.errors++;
    return null;
  }
}

// Fonction principale avec système de fallback intelligent
export async function getStockQuote(symbol: string): Promise<StockData | null> {
  // Vérifier le cache
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Cache] Hit for ${symbol}: ${cached.data.price}`);
    return cached.data;
  }

  // Essayer Twelve Data en priorité (temps réel)
  let data = await fetchFromTwelveData(symbol);
  
  // Si échec, essayer Finnhub en fallback
  if (!data) {
    console.log(`[Fallback] Trying Finnhub for ${symbol}...`);
    data = await fetchFromFinnhub(symbol);
  }
  
  // Si on a des données, les mettre en cache
  if (data) {
    cache.set(symbol, { data, timestamp: Date.now() });
    return data;
  }
  
  // Afficher les stats si échec
  console.error(`[API] Failed to fetch ${symbol} from all providers`);
  console.log('[API Stats]', apiStats);
  
  return null;
}

export async function getMultipleStockQuotes(symbols: string[]): Promise<Record<string, StockData>> {
  const results: Record<string, StockData> = {};
  
  console.log(`Fetching quotes for ${symbols.length} symbols:`, symbols);
  
  // Limiter à 5 requêtes en parallèle pour éviter rate limiting
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (symbol) => {
        try {
          const data = await getStockQuote(symbol);
          return { symbol, data };
        } catch (error) {
          console.error(`Failed to fetch ${symbol}:`, error);
          return { symbol, data: null };
        }
      })
    );
    
    // Ajouter les résultats valides uniquement
    batchResults.forEach(({ symbol, data }) => {
      if (data) {
        results[symbol] = data;
      } else {
        console.warn(`Skipping ${symbol} - no valid data received`);
      }
    });
    
    // Pause de 200ms entre les batches pour respecter le rate limit
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`Successfully fetched ${Object.keys(results).length} out of ${symbols.length} quotes`);
  
  return results;
}

export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
  const trimmedQuery = query.trim();
  
  // Vérifier si la recherche est un code ISIN
  if (isValidISIN(trimmedQuery)) {
    console.log(`ISIN detected: ${trimmedQuery}`);
    const symbol = isinToSymbol(trimmedQuery);
    
    if (symbol) {
      const country = getCountryFromISIN(trimmedQuery);
      console.log(`ISIN ${trimmedQuery} → Symbol ${symbol} (${country})`);
      
      // Essayer de récupérer le nom via l'API
      try {
        const stockData = await getStockQuote(symbol);
        if (stockData) {
          return [{ symbol, name: `${stockData.name} (ISIN: ${trimmedQuery})` }];
        }
      } catch (error) {
        console.error(`Error fetching data for ISIN ${trimmedQuery}:`, error);
      }
      
      // Fallback : retourner juste le symbole
      return [{ symbol, name: `${symbol} (ISIN: ${trimmedQuery})` }];
    } else {
      console.warn(`ISIN ${trimmedQuery} not found in database`);
      return [];
    }
  }
  
  // Base de données locale étendue d'actions populaires
  const stockDatabase = [
    // US Stocks - Tech
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'GOOG', name: 'Alphabet Inc. Class C' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'ORCL', name: 'Oracle Corporation' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    
    // US Stocks - Energy & Oil
    { symbol: 'XOM', name: 'ExxonMobil Corporation (Esso)' },
    { symbol: 'CVX', name: 'Chevron Corporation' },
    { symbol: 'COP', name: 'ConocoPhillips' },
    { symbol: 'SLB', name: 'Schlumberger' },
    
    // US Stocks - Finance
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'BAC', name: 'Bank of America Corp' },
    { symbol: 'WFC', name: 'Wells Fargo & Company' },
    { symbol: 'GS', name: 'Goldman Sachs Group' },
    { symbol: 'MS', name: 'Morgan Stanley' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'AXP', name: 'American Express' },
    { symbol: 'C', name: 'Citigroup Inc.' },
    
    // US Stocks - Consumer & Retail
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'HD', name: 'Home Depot Inc.' },
    { symbol: 'NKE', name: 'Nike Inc.' },
    { symbol: 'MCD', name: "McDonald's Corporation" },
    { symbol: 'SBUX', name: 'Starbucks Corporation' },
    { symbol: 'DIS', name: 'Walt Disney Company' },
    { symbol: 'KO', name: 'Coca-Cola Company' },
    { symbol: 'PEP', name: 'PepsiCo Inc.' },
    { symbol: 'COST', name: 'Costco Wholesale' },
    { symbol: 'TGT', name: 'Target Corporation' },
    
    // US Stocks - Healthcare & Pharma
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'UNH', name: 'UnitedHealth Group' },
    { symbol: 'PFE', name: 'Pfizer Inc.' },
    { symbol: 'ABBV', name: 'AbbVie Inc.' },
    { symbol: 'MRK', name: 'Merck & Co.' },
    
    // French Stocks (Euronext Paris) - CAC 40
    { symbol: 'MC.PA', name: 'LVMH Moët Hennessy Louis Vuitton' },
    { symbol: 'OR.PA', name: "L'Oréal" },
    { symbol: 'SAN.PA', name: 'Sanofi' },
    { symbol: 'TTE.PA', name: 'TotalEnergies' },
    { symbol: 'BNP.PA', name: 'BNP Paribas' },
    { symbol: 'AIR.PA', name: 'Airbus' },
    { symbol: 'SU.PA', name: 'Schneider Electric' },
    { symbol: 'ACA.PA', name: 'Crédit Agricole' },
    { symbol: 'CS.PA', name: 'AXA' },
    { symbol: 'CAP.PA', name: 'Capgemini' },
    { symbol: 'DG.PA', name: 'Vinci' },
    { symbol: 'RI.PA', name: 'Pernod Ricard' },
    { symbol: 'SAF.PA', name: 'Safran' },
    { symbol: 'DSY.PA', name: 'Dassault Systèmes' },
    { symbol: 'EL.PA', name: 'EssilorLuxottica' },
    { symbol: 'ORA.PA', name: 'Orange' },
    { symbol: 'EN.PA', name: 'Bouygues' },
    { symbol: 'SGO.PA', name: 'Saint-Gobain' },
    { symbol: 'RMS.PA', name: 'Hermès International' },
    { symbol: 'KER.PA', name: 'Kering' },
    { symbol: 'PUB.PA', name: 'Publicis Groupe' },
    { symbol: 'STM.PA', name: 'STMicroelectronics' },
    { symbol: 'ML.PA', name: 'Michelin' },
    { symbol: 'VIE.PA', name: 'Veolia Environnement' },
    { symbol: 'DEC.PA', name: 'Legrand' },
    
    // Spanish Stocks (BME Madrid) - .MC
    { symbol: 'SAN.MC', name: 'Banco Santander' },
    { symbol: 'BBVA.MC', name: 'BBVA' },
    { symbol: 'TEF.MC', name: 'Telefónica' },
    { symbol: 'ITX.MC', name: 'Inditex' },
    { symbol: 'IBE.MC', name: 'Iberdrola' },
    { symbol: 'REP.MC', name: 'Repsol' },
  ];

  // Symboles invalides connus à exclure des résultats
  const INVALID_SYMBOLS = ['ES.PA', 'ES.MC', 'FR.PA', 'US.PA', 'DE.PA', 'IT.PA', 'GB.PA'];
  
  try {
    // Appel à l'API Twelve Data pour la recherche (meilleure que Finnhub)
    console.log(`[Twelve Data] Searching for: ${query}`);
    const response = await axios.get(
      `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${TWELVE_DATA_API_KEY}`,
      { timeout: 5000 }
    );
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log(`[Twelve Data] Found ${response.data.data.length} results`);
      
      // Mapper les résultats Twelve Data
      const apiResults = response.data.data
        .filter((item: any) => {
          // Filtrer les symboles invalides et les instruments non-actions
          return !INVALID_SYMBOLS.includes(item.symbol) && 
                 item.instrument_type === 'Common Stock';
        })
        .map((item: any) => ({
          symbol: item.symbol,
          name: `${item.instrument_name} (${item.exchange})`,
        }));
      
      // Fusionner avec la base locale sans doublons
      const allResults = [...stockDatabase]; // Base locale en premier
      const symbols = new Set(stockDatabase.map(s => s.symbol));
      
      apiResults.forEach((result: any) => {
        if (!symbols.has(result.symbol)) {
          allResults.push(result);
        }
      });
      
      return sortSearchResults(allResults, query).slice(0, 15);
    }
  } catch (error: any) {
    console.error('[Twelve Data] Search error:', error.message);
    
    // Fallback sur Finnhub si Twelve Data échoue
    try {
      console.log(`[Finnhub] Fallback search for: ${query}`);
      const response = await axios.get(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
      );
      
      if (response.data && response.data.result && response.data.result.length > 0) {
        const apiResults = response.data.result
          .filter((item: any) => !INVALID_SYMBOLS.includes(item.symbol))
          .map((item: any) => ({
            symbol: item.symbol,
            name: item.description || item.symbol,
          }));
        
        const allResults = [...stockDatabase];
        const symbols = new Set(stockDatabase.map(s => s.symbol));
        
        apiResults.forEach((result: any) => {
          if (!symbols.has(result.symbol)) {
            allResults.push(result);
          }
        });
        
        return sortSearchResults(allResults, query).slice(0, 15);
      }
    } catch (finnhubError) {
      console.error('[Finnhub] Search error:', finnhubError);
    }
  }
  
  // Fallback final : Recherche locale uniquement
  console.log('[Local] Using local database only');
  return sortSearchResults(stockDatabase, query).slice(0, 15);
}

// Fonction pour trier les résultats de recherche par pertinence
function sortSearchResults(stocks: Array<{ symbol: string; name: string }>, query: string) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Filtrer d'abord
  const filtered = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(lowerQuery) ||
    stock.name.toLowerCase().includes(lowerQuery)
  );
  
  // Puis trier par pertinence
  return filtered.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aSymbol = a.symbol.toLowerCase();
    const bSymbol = b.symbol.toLowerCase();
    
    // 1. Priorité : Nom commence par la recherche
    const aNameStarts = aName.startsWith(lowerQuery);
    const bNameStarts = bName.startsWith(lowerQuery);
    if (aNameStarts && !bNameStarts) return -1;
    if (!aNameStarts && bNameStarts) return 1;
    
    // 2. Priorité : Nom contient la recherche au début d'un mot
    const aNameWordStart = aName.split(' ').some(word => word.startsWith(lowerQuery));
    const bNameWordStart = bName.split(' ').some(word => word.startsWith(lowerQuery));
    if (aNameWordStart && !bNameWordStart) return -1;
    if (!aNameWordStart && bNameWordStart) return 1;
    
    // 3. Priorité : Symbole exact
    if (aSymbol === lowerQuery && bSymbol !== lowerQuery) return -1;
    if (aSymbol !== lowerQuery && bSymbol === lowerQuery) return 1;
    
    // 4. Priorité : Symbole commence par la recherche
    const aSymbolStarts = aSymbol.startsWith(lowerQuery);
    const bSymbolStarts = bSymbol.startsWith(lowerQuery);
    if (aSymbolStarts && !bSymbolStarts) return -1;
    if (!aSymbolStarts && bSymbolStarts) return 1;
    
    // 5. Par défaut : ordre alphabétique par nom
    return aName.localeCompare(bName);
  });
}

