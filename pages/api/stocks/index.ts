import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllStocks, addStock, updateStock, deleteStock } from '@/lib/database';
import { Stock } from '@/types';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const stocks = getAllStocks();
        return res.status(200).json(stocks);
        
      case 'POST':
        const newStock = addStock(req.body);
        return res.status(201).json(newStock);
        
      case 'PUT':
        const { id, ...updates } = req.body;
        const updatedStock = updateStock(id, updates);
        if (!updatedStock) {
          return res.status(404).json({ error: 'Stock not found' });
        }
        return res.status(200).json(updatedStock);
        
      case 'DELETE':
        const { id: deleteId } = req.query;
        const deleted = deleteStock(deleteId as string);
        if (!deleted) {
          return res.status(404).json({ error: 'Stock not found' });
        }
        return res.status(200).json({ success: true });
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

