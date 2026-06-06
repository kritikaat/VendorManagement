import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS, AUTH_MESSAGES } from '../constants/json/status.js';
import { UserRole } from '../constants/json/types.js';
import { config } from '../config/environment.js';

export class AuthMiddleware {
  /**
   * Validates the Bearer JWT and attaches the decoded payload to req.user
   */
  public static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(AUTH_MESSAGES.TOKEN_MISSING, HTTP_STATUS.UNAUTHORIZED));
      }

      const token = authHeader.split(' ')[1];

      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      req.token = token;
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

      next();
    } catch (error) {
      next(new AppError(AUTH_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED));
    }
  }

  /**
   * Restricts access to the specified roles
   */
  public static restrictTo(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        return next(new AppError(AUTH_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
      }
      if (!allowedRoles.includes(req.user.role as UserRole)) {
        return next(new AppError(AUTH_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
      }
      next();
    };
  }
}
