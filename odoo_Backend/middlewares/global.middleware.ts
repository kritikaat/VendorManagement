import { Request, Response, NextFunction } from 'express';
import { ErrorParser } from '../functions/errorHandler.js';
import { Logger } from '../helpers/logger.helper.js';

export class GlobalMiddleware {
  /**
   * Global catch-all error handling middleware
   */
  public static handleError(err: any, req: Request, res: Response, next: NextFunction): void {
    const appError = ErrorParser.parse(err);

    // Log the error
    Logger.error(`${appError.statusCode} - ${appError.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (appError.statusCode === 500) {
      Logger.error(err.stack || '');
    }

    // Response structure
    const responsePayload: any = {
      success: false,
      message: appError.message,
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.stack = err.stack;
      if (appError.errors) {
        responsePayload.errors = appError.errors;
      }
    }

    res.status(appError.statusCode).json(responsePayload);
  }
}
