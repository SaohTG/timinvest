import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllStocks } from '@/lib/database';
import { getMultipleStockQuotes } from '@/lib/stockApi';
import { PortfolioStats, PortfolioPosition } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const stocks = getAllStocks();
    
    if (stocks.length === 0) {
      const emptyStats: PortfolioStats = {
        totalValue: 0,
        totalInvested: 0,
        totalGain: 0,
        totalGainPercent: 0,
        totalDividends: 0,
        todayChange: 0,
        todayChangePercent: 0,
      };
      return res.status(200).json({ stats: emptyStats, positions: [] });
    }
    
    // Récupérer les prix actuels
    const symbols = stocks.map(s => s.symbol);
    const quotes = await getMultipleStockQuotes(symbols);
    
    // Calculer les statistiques
    let totalValue = 0;
    let totalInvested = 0;
    let todayChange = 0;
    
    const positions: PortfolioPosition[] = stocks.map(stock => {
      const quote = quotes[stock.symbol];
      const currentPrice = quote?.price || stock.purchasePrice;
      const currentValue = currentPrice * stock.quantity;
      const invested = stock.purchasePrice * stock.quantity;
      const gainLoss = currentValue - invested;
      const gainLossPercent = (gainLoss / invested) * 100;
      
      totalValue += currentValue;
      totalInvested += invested;
      
      if (quote) {
        todayChange += quote.change * stock.quantity;
      }
      
      return {
        stock: { ...stock, currentPrice },
        currentValue,
        gainLoss,
        gainLossPercent,
        weight: 0, // Will be calculated after
      };
    });
    
    // Calculer les poids
    positions.forEach(pos => {
      pos.weight = (pos.currentValue / totalValue) * 100;
    });
    
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    const todayChangePercent = totalValue > 0 ? (todayChange / totalValue) * 100 : 0;
    
    const stats: PortfolioStats = {
      totalValue,
      totalInvested,
      totalGain,
      totalGainPercent,
      totalDividends: 0, // À calculer depuis les dividendes
      todayChange,
      todayChangePercent,
    };
    
    return res.status(200).json({ stats, positions });
  } catch (error) {
    console.error('Portfolio Stats API Error:', error);
    return res.status(500).json({ error: 'Failed to calculate portfolio stats' });
  }
}

