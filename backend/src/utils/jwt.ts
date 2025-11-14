import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string | number,
    issuer: 'webchat.cz',
    audience: 'webchat-users'
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'webchat.cz',
      audience: 'webchat-users'
    }) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function generateVerificationToken(): string {
  return jwt.sign(
    { type: 'email-verification' },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function generateResetToken(): string {
  return jwt.sign(
    { type: 'password-reset' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '30d', // Long-lived refresh token
    issuer: 'webchat.cz',
    audience: 'webchat-refresh'
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'webchat.cz',
      audience: 'webchat-refresh'
    }) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
