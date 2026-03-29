import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/AppError';

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip authentication for OPTIONS requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Check Authorization header
    let token: string | null = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      // Allow token in query params for mobile
      token = req.query.token as string;
    }

    if (!token) {
      return next(
        new AppError(
          'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục!',
          401
        )
      );
    }

    // Verify token
    jwt.verify(token, JWT_ACCESS_SECRET, (err: any, decoded: any) => {
      if (err) {
        return next(
          new AppError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 401)
        );
      }

      req.user = decoded;
      next();
    });

  } catch (error) {
    console.error('Authentication error:', error);
    next(new AppError('Lỗi xác thực. Vui lòng thử lại!', 401));
  }
};