import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllDividends, addDividend, deleteDividend, getDividendsByDateRange } from '@/lib/database';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const { startDate, endDate } = req.query;
        
        if (startDate && endDate) {
          const dividends = getDividendsByDateRange(startDate as string, endDate as string);
          return res.status(200).json(dividends);
        }
        
        const allDividends = getAllDividends();
        return res.status(200).json(allDividends);
        
      case 'POST':
        const newDividend = addDividend(req.body);
        return res.status(201).json(newDividend);
        
      case 'DELETE':
        const { id } = req.query;
        const deleted = deleteDividend(id as string);
        if (!deleted) {
          return res.status(404).json({ error: 'Dividend not found' });
        }
        return res.status(200).json({ success: true });
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Dividends API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

