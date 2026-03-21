import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: 'ADMIN' | 'USER';
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }
    req.user = decoded as { id: number; role: 'ADMIN' | 'USER' };
    console.log(req.user);
    console.log('Decoded JWT:', token, decoded.id, decoded.role);
    next();
  });
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      console.log(req.user);
      res.status(403).json({ message: req.user.role +'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const authorizeOwnerOrAdmin = (paramName: string = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const resourceId = parseInt(req.params[paramName] as string);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'ADMIN' || userId === resourceId) {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};
