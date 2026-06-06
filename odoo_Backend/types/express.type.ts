import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
      token?: string;
    }
  }
}

declare module 'express-validation';

export { };
