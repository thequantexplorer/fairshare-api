import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { User } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'fairshare-dev-secret';

export interface TokenClaims {
  sub: string;
  role: User['role'];
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenClaims;
  }
}

export function issueToken(user: User): string {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
}

function readToken(header: string | undefined): TokenClaims | null {
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length);
  try {
    return jwt.verify(token, JWT_SECRET) as TokenClaims;
  } catch {
    // Local tokens minted by older CLI builds are unsigned; keep them working outside production.
    if (process.env.NODE_ENV !== 'production') {
      return jwt.decode(token) as TokenClaims | null;
    }
    return null;
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const claims = readToken(req.headers.authorization);
  if (!claims) return res.status(401).json({ error: 'unauthorized' });
  req.user = claims;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  next();
}
