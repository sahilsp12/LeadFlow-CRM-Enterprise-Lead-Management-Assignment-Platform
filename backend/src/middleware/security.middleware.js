const cors = require('cors');
const helmet = require('helmet');

// Configuration for CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Allow HttpOnly Cookies to be sent back and forth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Custom XSS Sanitizer to scrub request body, query, and params
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove scripts
      .replace(/<\/?[^>]+(>|$)/g, ''); // Strip all HTML tags
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === 'object' && value !== null) {
    const cleanObj = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        cleanObj[key] = sanitizeValue(value[key]);
      }
    }
    return cleanObj;
  }
  return value;
}

function xssSanitizer(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
}

module.exports = {
  corsMiddleware: cors(corsOptions),
  helmetMiddleware: helmet(),
  xssSanitizer
};
