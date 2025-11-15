import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // Hash du mot de passe
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  email: string;
  name: string;
  expiresAt: number; // Timestamp
}

// Initialiser les fichiers de données
function initializeDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2));
  }
}

// Hash un mot de passe (simple hash SHA256 avec salt)
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(password + actualSalt)
    .digest('hex');
  return { hash, salt: actualSalt };
}

// Vérifier un mot de passe
function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return computedHash === hash;
}

// Générer un token de session
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Lire tous les utilisateurs
export function getAllUsers(): User[] {
  initializeDataFiles();
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Trouver un utilisateur par email
export function getUserByEmail(email: string): User | null {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Trouver un utilisateur par ID
export function getUserById(id: string): User | null {
  const users = getAllUsers();
  return users.find(u => u.id === id) || null;
}

// Créer un nouvel utilisateur
export function createUser(email: string, name: string, password: string): User {
  // Vérifier si l'email existe déjà
  if (getUserByEmail(email)) {
    throw new Error('Cet email est déjà utilisé');
  }

  const { hash, salt } = hashPassword(password);
  const user: User = {
    id: crypto.randomBytes(16).toString('hex'),
    email: email.toLowerCase(),
    name,
    passwordHash: `${hash}:${salt}`, // Stocker hash et salt ensemble
    createdAt: new Date().toISOString(),
  };

  const users = getAllUsers();
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  return user;
}

// Vérifier les identifiants
export function verifyCredentials(email: string, password: string): User | null {
  const user = getUserByEmail(email);
  if (!user) {
    return null;
  }

  const [hash, salt] = user.passwordHash.split(':');
  if (!hash || !salt) {
    return null;
  }

  if (verifyPassword(password, hash, salt)) {
    return user;
  }

  return null;
}

// Lire toutes les sessions
function getAllSessions(): Session[] {
  initializeDataFiles();
  const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Créer une session
export function createSession(user: User): Session {
  const token = generateToken();
  const session: Session = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
  };

  const sessions = getAllSessions();
  
  // Nettoyer les sessions expirées
  const activeSessions = sessions.filter(s => s.expiresAt > Date.now());
  
  // Ajouter la nouvelle session
  activeSessions.push(session);
  
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(activeSessions, null, 2));
  
  return session;
}

// Trouver une session par token
export function getSessionByToken(token: string): Session | null {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.token === token);
  
  if (!session) {
    return null;
  }

  // Vérifier si la session est expirée
  if (session.expiresAt < Date.now()) {
    deleteSession(token);
    return null;
  }

  return session;
}

// Supprimer une session
export function deleteSession(token: string): void {
  const sessions = getAllSessions();
  const activeSessions = sessions.filter(s => s.token !== token);
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(activeSessions, null, 2));
}

// Nettoyer les sessions expirées
export function cleanExpiredSessions(): void {
  const sessions = getAllSessions();
  const activeSessions = sessions.filter(s => s.expiresAt > Date.now());
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(activeSessions, null, 2));
}

