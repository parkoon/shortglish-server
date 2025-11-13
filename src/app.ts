import express, { Express } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import routes from './routes';
import { config } from './config/config';

export function createApp(): Express {
  const app = express();

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use(cors());

  // Pino HTTP logger
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/health',
      },
    }),
  );

  // Routes
  app.use('/', routes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

