import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllStocks } from '@/lib/database';
import { getMultipleStockDividends } from '@/lib/stockApi';
import { getUserFromRequest } from '@/lib/auth-helper';
import { addMonths, format, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';

interface PortfolioDividend {
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  annualDividendPerShare: number;
  annualDividendTotal: number;
  yieldOnCost: number; // Rendement basé sur le prix d'achat
  frequency: string;
  lastDividendDate?: string;
  nextDividendDate?: string;
}

interface MonthlyDividend {
  month: string;
  monthLabel: string;
  amount: number;
}

export interface PortfolioDividendStats {
  totalAnnualDividends: number;
  totalInvested: number;
  overallYieldOnCost: number; // Rendement global basé sur l'investissement
  monthlyProjections: MonthlyDividend[];
  stockDividends: PortfolioDividend[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Récupérer l'utilisateur connecté
    const user = getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const stocks = getAllStocks(user.userId);
    
    if (stocks.length === 0) {
      const emptyStats: PortfolioDividendStats = {
        totalAnnualDividends: 0,
        totalInvested: 0,
        overallYieldOnCost: 0,
        monthlyProjections: [],
        stockDividends: [],
      };
      return res.status(200).json(emptyStats);
    }
    
    // Récupérer les dividendes pour toutes les actions
    const symbols = stocks.map(s => s.symbol);
    const dividendsData = await getMultipleStockDividends(symbols);
    
    // Calculer les dividendes du portfolio
    let totalAnnualDividends = 0;
    let totalInvested = 0;
    const stockDividends: PortfolioDividend[] = [];
    
    stocks.forEach(stock => {
      const dividendData = dividendsData[stock.symbol];
      const invested = stock.purchasePrice * stock.quantity;
      totalInvested += invested;
      
      if (dividendData && dividendData.dividend > 0) {
        const annualDividendPerShare = dividendData.dividend;
        const annualDividendTotal = annualDividendPerShare * stock.quantity;
        const yieldOnCost = (annualDividendPerShare / stock.purchasePrice) * 100;
        
        totalAnnualDividends += annualDividendTotal;
        
        stockDividends.push({
          symbol: stock.symbol,
          name: stock.name,
          quantity: stock.quantity,
          purchasePrice: stock.purchasePrice,
          annualDividendPerShare,
          annualDividendTotal,
          yieldOnCost,
          frequency: dividendData.frequency,
          lastDividendDate: dividendData.lastDividendDate,
          nextDividendDate: dividendData.nextDividendDate,
        });
      }
    });
    
    // Calculer le rendement global
    const overallYieldOnCost = totalInvested > 0 ? (totalAnnualDividends / totalInvested) * 100 : 0;
    
    // Projeter les dividendes pour les 12 prochains mois
    const monthlyProjections: MonthlyDividend[] = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
      const monthLabel = monthNames[monthDate.getMonth()];
      
      let monthTotal = 0;
      
      stockDividends.forEach(stockDiv => {
        if (!stockDiv.nextDividendDate) return;
        
        const nextDate = new Date(stockDiv.nextDividendDate);
        
        // Vérifier si le dividende tombe dans ce mois
        if (isAfter(nextDate, monthStart) && isBefore(nextDate, monthEnd)) {
          // Calculer le montant du dividende pour ce mois
          let dividendAmount = 0;
          
          if (stockDiv.frequency === 'quarterly') {
            dividendAmount = stockDiv.annualDividendTotal / 4;
          } else if (stockDiv.frequency === 'semi-annual') {
            dividendAmount = stockDiv.annualDividendTotal / 2;
          } else {
            // annual
            dividendAmount = stockDiv.annualDividendTotal;
          }
          
          monthTotal += dividendAmount;
        }
      });
      
      monthlyProjections.push({
        month: format(monthDate, 'yyyy-MM'),
        monthLabel,
        amount: monthTotal,
      });
    }
    
    const stats: PortfolioDividendStats = {
      totalAnnualDividends,
      totalInvested,
      overallYieldOnCost,
      monthlyProjections,
      stockDividends,
    };
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Portfolio Dividends API Error:', error);
    return res.status(500).json({ error: 'Failed to calculate portfolio dividends' });
  }
}

