import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

const { JWT_ACCESS_SECRET } = process.env;

// Middleware to authenticate user
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: string; role: string };
    if (!payload) {
      res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
      return;
    }

    req.user = {
      userId: payload.userId,
      role: payload.role
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// Middleware for optional authentication
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (!JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET is not defined');
      }
      const payload = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: string; role: string };
      if (payload) {
        req.user = {
          userId: payload.userId,
          role: payload.role
        };
      }
    }
  } catch (_) {
    // Ignore token errors for optional auth
  }
  next();
};

// Middleware to require admin role
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    return;
  }
  next();
};