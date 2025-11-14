export interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  currency: string;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  currency: string;
}

export interface Dividend {
  id: string;
  stockSymbol: string;
  stockName: string;
  amount: number;
  exDate: string;
  paymentDate: string;
  frequency: string;
  currency: string;
}

export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  totalDividends: number;
  todayChange: number;
  todayChangePercent: number;
}

export interface PortfolioPosition {
  stock: Stock;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
}

