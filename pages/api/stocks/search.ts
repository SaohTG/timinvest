import type { NextApiRequest, NextApiResponse } from 'next';
import { searchStocks } from '@/lib/stockApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const results = await searchStocks(q);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ error: 'Failed to search stocks' });
  }
}

