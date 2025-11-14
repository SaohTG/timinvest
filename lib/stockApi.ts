import axios from 'axios';
import { StockData } from '@/types';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd4b96lhr01qrv4ataf3gd4b96lhr01qrv4ataf40';
const CACHE_DURATION = 60000; // 1 minute
const cache = new Map<string, { data: StockData; timestamp: number }>();

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
  
  // Fallback pour les actions françaises
  const frenchStocks: Record<string, { name: string; currency: string }> = {
    'MC.PA': { name: 'LVMH Moët Hennessy', currency: 'EUR' },
    'OR.PA': { name: "L'Oréal", currency: 'EUR' },
    'SAN.PA': { name: 'Sanofi', currency: 'EUR' },
    'TTE.PA': { name: 'TotalEnergies', currency: 'EUR' },
    'BNP.PA': { name: 'BNP Paribas', currency: 'EUR' },
    'AIR.PA': { name: 'Airbus', currency: 'EUR' },
    'SU.PA': { name: 'Schneider Electric', currency: 'EUR' },
  };
  
  return frenchStocks[symbol] || { name: symbol, currency: 'USD', marketCap: 0 };
}

export async function getStockQuote(symbol: string): Promise<StockData> {
  // Vérifier le cache
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Appel à l'API Finnhub pour le prix
    const quoteResponse = await axios.get<FinnhubQuote>(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    const quote = quoteResponse.data;
    
    // Vérifier si on a reçu des données valides
    if (!quote || quote.c === 0) {
      throw new Error(`No data available for ${symbol}`);
    }
    
    // Récupérer le profil de l'entreprise
    const profile = await getStockProfile(symbol);
    
    const data: StockData = {
      symbol: symbol.toUpperCase(),
      name: profile.name,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      volume: 0, // Finnhub ne fournit pas le volume dans l'endpoint quote gratuit
      marketCap: profile.marketCap,
      currency: profile.currency,
    };
    
    // Mettre en cache
    cache.set(symbol, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    throw new Error(`Unable to fetch data for ${symbol}`);
  }
}

export async function getMultipleStockQuotes(symbols: string[]): Promise<Record<string, StockData>> {
  const results: Record<string, StockData> = {};
  
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        results[symbol] = await getStockQuote(symbol);
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
      }
    })
  );
  
  return results;
}

export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
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
    
    // US Stocks - Finance
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'BAC', name: 'Bank of America Corp' },
    { symbol: 'WFC', name: 'Wells Fargo & Company' },
    { symbol: 'GS', name: 'Goldman Sachs Group' },
    { symbol: 'MS', name: 'Morgan Stanley' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'AXP', name: 'American Express' },
    
    // US Stocks - Consumer
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'HD', name: 'Home Depot Inc.' },
    { symbol: 'NKE', name: 'Nike Inc.' },
    { symbol: 'MCD', name: "McDonald's Corporation" },
    { symbol: 'SBUX', name: 'Starbucks Corporation' },
    { symbol: 'DIS', name: 'Walt Disney Company' },
    { symbol: 'KO', name: 'Coca-Cola Company' },
    { symbol: 'PEP', name: 'PepsiCo Inc.' },
    
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
  ];

  try {
    // Appel à l'API Finnhub pour la recherche
    const response = await axios.get(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    );
    
    if (response.data && response.data.result && response.data.result.length > 0) {
      // Combiner résultats API + base locale et dédupliquer
      const apiResults = response.data.result.map((item: any) => ({
        symbol: item.symbol,
        name: item.description || item.symbol,
      }));
      
      // Fusionner avec la base locale sans doublons
      const allResults = [...apiResults];
      const symbols = new Set(apiResults.map((r: any) => r.symbol));
      
      stockDatabase.forEach(stock => {
        if (!symbols.has(stock.symbol)) {
          allResults.push(stock);
        }
      });
      
      return sortSearchResults(allResults, query).slice(0, 15);
    }
  } catch (error) {
    console.error('Error searching stocks:', error);
  }
  
  // Fallback : Recherche locale uniquement
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

