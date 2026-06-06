import { ValidationError } from 'express-validation';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/json/status.js';

export class ErrorParser {
  /**
   * Translates common errors (Mongoose, validation errors) into clean AppError structure
   */
  public static parse(err: any): AppError {
    // If it's already a custom AppError, return it
    if (err instanceof AppError) {
      return err;
    }

    // Express-validation errors (Joi validation)
    if (err instanceof ValidationError) {
      const details = err.details;
      return new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, details);
    }

    // Mongoose CastError (e.g. invalid object id)
    if (err.name === 'CastError') {
      return new AppError(`Invalid value for path ${err.path}: ${err.value}`, HTTP_STATUS.BAD_REQUEST);
    }

    // Mongoose duplicate key error (11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return new AppError(`Duplicate field value entered: ${field}`, HTTP_STATUS.CONFLICT);
    }

    // Mongoose ValidationError
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((el: any) => el.message);
      return new AppError(`Validation failed: ${messages.join(', ')}`, HTTP_STATUS.BAD_REQUEST, err.errors);
    }

    // Fallback: Internal Server Error
    const message = err.message || 'An unexpected error occurred';
    return new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
