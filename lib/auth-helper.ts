import type { NextApiRequest } from 'next';
import { getSessionByToken } from './auth';

// Helper pour récupérer l'utilisateur depuis la requête
export function getUserFromRequest(req: NextApiRequest): { userId: string; email: string; name: string } | null {
  const token = req.cookies.session_token;
  
  if (!token) {
    return null;
  }
  
  const session = getSessionByToken(token);
  
  if (!session) {
    return null;
  }
  
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
  };
}

