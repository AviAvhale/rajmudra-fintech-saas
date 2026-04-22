const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

/**
 * sanitizeMongo — strips $ and . from request body/params/query
 * Prevents MongoDB operator injection attacks
 */
const sanitizeMongo = mongoSanitize();

/**
 * sanitizeXSS — recursively sanitizes all string values in req.body
 * Prevents stored XSS attacks
 */
const sanitizeXSS = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

function sanitizeObject(obj) {
  if (typeof obj === 'string') return xss(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj !== null && typeof obj === 'object') {
    const cleaned = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = sanitizeObject(obj[key]);
    }
    return cleaned;
  }
  return obj;
}

module.exports = { sanitizeMongo, sanitizeXSS };
