/**
 * Rate limiting middleware for the AI chat endpoint.
 * Prevents abuse by limiting requests per IP per time window.
 * @module middleware/rateLimit
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter: max 10 AI requests per minute per IP.
 * Returns 429 Too Many Requests with a JSON error body.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait before sending another message.',
    retryAfterMs: 60000,
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});
