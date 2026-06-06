import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { CommonMiddleware } from './middlewares/common.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { rateLimiter } from './middlewares/rateLimiter.middleware.js';
import { GlobalMiddleware } from './middlewares/global.middleware.js';
import apiRouter from './routes/routes.js';
import { AppError } from './utils/appError.js';
import { HTTP_STATUS } from './constants/json/status.js';
import { swaggerSpec } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// Security headers
app.use(helmet());

// Set up Pug view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Request Logging
app.use(requestLogger);

// Global Common Middlewares (CORS, Parsers, Cookies)
CommonMiddleware.use(app);

// API Rate Limiting
app.use('/api', rateLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Swagger API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { persistAuthorization: true },
  customSiteTitle: 'PMS API Docs',
}));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Welcome root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Procurement Management System API',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

// Mount main application routes
app.use('/api/v1', apiRouter);

// Fallback for unmatched routes -> 404
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, HTTP_STATUS.NOT_FOUND));
});

// Centralized error handling middleware
app.use(GlobalMiddleware.handleError);

export default app;
export { app };
