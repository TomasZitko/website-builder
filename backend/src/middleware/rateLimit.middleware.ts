import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many login attempts',
    message: 'Please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // @ts-ignore
  keyGenerator: (req) => req.body.email || req.ip
});

export const registerLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 60 * 60 * 1000 : 5 * 60 * 1000, // 1 hour in prod, 5 mins in dev
  max: process.env.NODE_ENV === 'production' ? 3 : 50, // 3 in prod, 50 in dev for testing
  message: {
    error: 'Too many registration attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
