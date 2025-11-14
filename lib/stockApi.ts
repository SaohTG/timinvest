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
  try {
    // Appel à l'API Finnhub pour la recherche
    const response = await axios.get(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    );
    
    if (response.data && response.data.result) {
      return response.data.result
        .slice(0, 10)
        .map((item: any) => ({
          symbol: item.symbol,
          name: item.description || item.symbol,
        }));
    }
  } catch (error) {
    console.error('Error searching stocks:', error);
  }
  
  // Fallback : Base de données locale d'actions populaires
  const stockDatabase = [
    // US Stocks
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    
    // French Stocks (Euronext Paris)
    { symbol: 'MC.PA', name: 'LVMH Moët Hennessy' },
    { symbol: 'OR.PA', name: "L'Oréal" },
    { symbol: 'SAN.PA', name: 'Sanofi' },
    { symbol: 'TTE.PA', name: 'TotalEnergies' },
    { symbol: 'BNP.PA', name: 'BNP Paribas' },
    { symbol: 'AIR.PA', name: 'Airbus' },
    { symbol: 'SU.PA', name: 'Schneider Electric' },
    { symbol: 'ACA.PA', name: 'Crédit Agricole' },
    { symbol: 'CS.PA', name: 'AXA' },
    { symbol: 'CAP.PA', name: 'Capgemini' },
  ];
  
  const lowerQuery = query.toLowerCase();
  return stockDatabase.filter(
    stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}

