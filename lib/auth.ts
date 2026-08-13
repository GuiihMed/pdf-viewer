import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import db from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'pdf_manager_platform_secret_key_2026';
const COOKIE_NAME = 'pdf_admin_token';

export interface UserTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch (err) {
    return null;
  }
}

export function getAuthUser(): UserTokenPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAdmin(): UserTokenPayload {
  const user = getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function getAdminUserFromDb(userId: string) {
  const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
  return stmt.get(userId);
}
