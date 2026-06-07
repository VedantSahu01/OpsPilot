import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import incidentRoutes from './routes/incident.routes.js';
import healthRoutes from './routes/health.routes.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import '../cron.js';

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Parse requests
// Custom body parser for POST /api/v1/incidents to capture raw body text, bypassing default express.json()
app.use((req, res, next) => {
  const path = req.originalUrl.split('?')[0];
  if (req.method === 'POST' && (path === '/api/v1/incidents' || path === '/api/v1/incidents/')) {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.body = data;
      next();
    });
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Request logging via Morgan
app.use(morgan(':method :url :status :response-time ms'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes
app.use('/health', healthRoutes);
app.use('/api/v1/incidents', incidentRoutes);

// Handle Not Found Routes
app.use(notFoundHandler);

// Handle Global Exceptions
app.use(errorHandler);

export default app;
