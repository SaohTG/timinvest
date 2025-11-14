import fs from 'fs';
import path from 'path';
import { Stock, Dividend } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STOCKS_FILE = path.join(DATA_DIR, 'stocks.json');
const DIVIDENDS_FILE = path.join(DATA_DIR, 'dividends.json');

// Initialiser les fichiers de données
function initializeDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(STOCKS_FILE)) {
    fs.writeFileSync(STOCKS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(DIVIDENDS_FILE)) {
    fs.writeFileSync(DIVIDENDS_FILE, JSON.stringify([], null, 2));
  }
}

// Stocks CRUD operations
export function getAllStocks(): Stock[] {
  initializeDataFiles();
  const data = fs.readFileSync(STOCKS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getStockById(id: string): Stock | undefined {
  const stocks = getAllStocks();
  return stocks.find(stock => stock.id === id);
}

export function addStock(stock: Omit<Stock, 'id'>): Stock {
  const stocks = getAllStocks();
  const newStock: Stock = {
    ...stock,
    id: Date.now().toString(),
  };
  stocks.push(newStock);
  fs.writeFileSync(STOCKS_FILE, JSON.stringify(stocks, null, 2));
  return newStock;
}

export function updateStock(id: string, updates: Partial<Stock>): Stock | null {
  const stocks = getAllStocks();
  const index = stocks.findIndex(stock => stock.id === id);
  
  if (index === -1) return null;
  
  stocks[index] = { ...stocks[index], ...updates };
  fs.writeFileSync(STOCKS_FILE, JSON.stringify(stocks, null, 2));
  return stocks[index];
}

export function deleteStock(id: string): boolean {
  const stocks = getAllStocks();
  const filteredStocks = stocks.filter(stock => stock.id !== id);
  
  if (filteredStocks.length === stocks.length) return false;
  
  fs.writeFileSync(STOCKS_FILE, JSON.stringify(filteredStocks, null, 2));
  return true;
}

// Dividends CRUD operations
export function getAllDividends(): Dividend[] {
  initializeDataFiles();
  const data = fs.readFileSync(DIVIDENDS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function addDividend(dividend: Omit<Dividend, 'id'>): Dividend {
  const dividends = getAllDividends();
  const newDividend: Dividend = {
    ...dividend,
    id: Date.now().toString(),
  };
  dividends.push(newDividend);
  fs.writeFileSync(DIVIDENDS_FILE, JSON.stringify(dividends, null, 2));
  return newDividend;
}

export function deleteDividend(id: string): boolean {
  const dividends = getAllDividends();
  const filteredDividends = dividends.filter(div => div.id !== id);
  
  if (filteredDividends.length === dividends.length) return false;
  
  fs.writeFileSync(DIVIDENDS_FILE, JSON.stringify(filteredDividends, null, 2));
  return true;
}

export function getDividendsByDateRange(startDate: string, endDate: string): Dividend[] {
  const dividends = getAllDividends();
  return dividends.filter(div => {
    const paymentDate = new Date(div.paymentDate);
    return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
  });
}

