import type { NextApiRequest, NextApiResponse } from 'next';
import { getStockQuote, getMultipleStockQuotes } from '@/lib/stockApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { symbol, symbols } = req.query;
    
    if (symbols) {
      // Multiple symbols
      const symbolArray = (symbols as string).split(',');
      const quotes = await getMultipleStockQuotes(symbolArray);
      return res.status(200).json(quotes);
    } else if (symbol) {
      // Single symbol
      const quote = await getStockQuote(symbol as string);
      return res.status(200).json(quote);
    } else {
      return res.status(400).json({ error: 'Symbol or symbols parameter required' });
    }
  } catch (error) {
    console.error('Quote API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
}

