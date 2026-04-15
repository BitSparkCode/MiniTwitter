import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

export interface AuthPayload {
  id: number;
  username: string;
  role: 'user' | 'moderator' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function createAuthMiddleware(userRepository: UserRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration' });
      return;
    }

    try {
      const decoded = jwt.verify(token, secret) as AuthPayload;
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      if (user.isLocked) {
        res.status(403).json({ error: 'Account is locked' });
        return;
      }
      req.user = { id: user.id, username: user.username, role: user.role };
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
