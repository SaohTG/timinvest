import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionByToken } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const token = req.cookies.session_token;

    if (!token) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const session = getSessionByToken(token);

    if (!session) {
      return res.status(401).json({ error: 'Session expirée ou invalide' });
    }

    return res.status(200).json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
}

