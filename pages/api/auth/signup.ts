import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, createSession } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { email, name, password } = req.body;

    // Validation
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Créer l'utilisateur
    const user = createUser(email, name, password);
    
    // Créer une session
    const session = createSession(user);

    // Définir le cookie de session
    res.setHeader('Set-Cookie', `session_token=${session.token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    if (error.message === 'Cet email est déjà utilisé') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
}

