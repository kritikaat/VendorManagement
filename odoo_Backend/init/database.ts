import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import { Logger } from '../helpers/logger.helper.js';

export class Database {
  public static async connect(): Promise<void> {
    try {
      const uri = config.MONGO_URI;
      Logger.info(`Connecting to MongoDB...`);
      
      mongoose.connection.on('connected', () => {
        Logger.info('MongoDB connected successfully');
      });

      mongoose.connection.on('error', (err) => {
        Logger.error(`MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        Logger.warn('MongoDB disconnected');
      });

      await mongoose.connect(uri);
    } catch (error) {
      Logger.error(`MongoDB connection failed: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    await mongoose.disconnect();
    Logger.info('MongoDB connection closed');
  }
}
