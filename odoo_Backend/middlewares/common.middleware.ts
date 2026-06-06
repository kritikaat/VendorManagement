import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from '../config/corsOptions.js';

export class CommonMiddleware {
  /**
   * Registers parsers, CORS and cookie-parser to the Express application
   */
  public static use(app: Express): void {
    app.use(cors(corsOptions));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());
  }
}
