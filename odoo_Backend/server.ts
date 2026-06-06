import http from 'http';
import { config } from './config/environment.js';
import { app } from './app.js';
import { Database, CronScheduler, EventListenerInit } from './init/index.js';
import { Logger } from './helpers/logger.helper.js';

// Setup uncaught exception handler
process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  Logger.error(`${err.name}: ${err.message}`);
  Logger.error(err.stack || '');
  process.exit(1);
});

async function bootstrap() {
  // 1. Connect to Database
  await Database.connect();

  // 2. Initialize App Event Listeners
  EventListenerInit.init();

  // 3. Initialize Cron Scheduler
  CronScheduler.init();

  // 4. Create server
  const server = http.createServer(app);
  const port = config.PORT || 3000;

  server.listen(port, () => {
    Logger.info(`Server running in ${config.NODE_ENV} mode on port ${port}`);
  });

  // Handle unhandled rejections gracefully
  process.on('unhandledRejection', (reason: any) => {
    Logger.error('UNHANDLED REJECTION! Shutting down gracefully...');
    Logger.error(reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason));
    
    server.close(() => {
      CronScheduler.destroy();
      Database.disconnect().then(() => {
        process.exit(1);
      });
    });
  });

  // Graceful shutdown signals
  const shutdown = () => {
    Logger.info('Received shutdown signal. Stopping server gracefully...');
    server.close(() => {
      CronScheduler.destroy();
      Database.disconnect().then(() => {
        Logger.info('App successfully shut down.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  Logger.error(`Bootstrap process failed: ${err.message}`);
  process.exit(1);
});
