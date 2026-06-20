const express = require('express');
const { corsMiddleware, helmetMiddleware, xssSanitizer } = require('./middleware/security.middleware');
const { rateLimiter } = require('./middleware/rateLimiter.middleware');
const errorHandler = require('./middleware/error.middleware');
const routes = require('./routes');
const { swaggerUi, swaggerSpec } = require('./swagger/swagger');

const app = express();

// Express JSON Parsing
app.use(express.json());

// Security Middlewares
app.use(corsMiddleware);
app.use(helmetMiddleware);

// Input Sanitization
app.use(xssSanitizer);

// Rate Limiting
app.use('/api', rateLimiter);

// API Documentation Endpoint
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount REST Routes
app.use('/api', routes);

// Base route for server health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini Lead Management System API is running successfully.'
  });
});

// Fallback for unhandled routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
    errors: []
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
