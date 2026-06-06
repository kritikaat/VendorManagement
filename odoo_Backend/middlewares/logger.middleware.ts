import morgan from 'morgan';
import { Logger } from '../helpers/logger.helper.js';

// Stream to pipe morgan logs into winston
const stream = {
  write: (message: string) => Logger.http(message.trim()),
};

// Skip logger during tests
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);
