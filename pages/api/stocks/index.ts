import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllStocks, addStock, updateStock, deleteStock } from '@/lib/database';
import { getUserFromRequest } from '@/lib/auth-helper';
import { Stock } from '@/types';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Récupérer l'utilisateur connecté
    const user = getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    switch (req.method) {
      case 'GET':
        const stocks = getAllStocks(user.userId);
        return res.status(200).json(stocks);
        
      case 'POST':
        // Ajouter le userId à la nouvelle action
        const newStock = addStock({
          ...req.body,
          userId: user.userId,
        });
        return res.status(201).json(newStock);
        
      case 'PUT':
        const { id, ...updates } = req.body;
        const updatedStock = updateStock(id, user.userId, updates);
        if (!updatedStock) {
          return res.status(404).json({ error: 'Stock not found' });
        }
        return res.status(200).json(updatedStock);
        
      case 'DELETE':
        const { id: deleteId } = req.query;
        const deleted = deleteStock(deleteId as string, user.userId);
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

