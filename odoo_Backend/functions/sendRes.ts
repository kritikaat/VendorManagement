import { Response } from 'express';
import { HTTP_STATUS, HttpStatus } from '../constants/json/status.js';

interface SuccessResponse<T> {
  success: true;
  message?: string;
  data?: T;
  meta?: any;
}

export class ResponseFormatter {
  /**
   * Sends a standardized success response
   */
  public static send<T>(
    res: Response,
    statusCode: HttpStatus = HTTP_STATUS.OK,
    message: string = 'Success',
    data?: T,
    meta?: any
  ): Response {
    const payload: SuccessResponse<T> = {
      success: true,
      message,
      data,
      meta,
    };
    return res.status(statusCode).json(payload);
  }
}
