import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  deleteAccountSchema
} from '../utils/validation';

export async function register(req: Request, res: Response) {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);
    res.status(201).json(result);
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      return res.status(400).json({
        error: 'Validation failed',
        message: firstError.message
      });
    }

    res.status(400).json({
      error: 'Registration failed',
      message: error.message
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({
      error: 'Login failed',
      message: error.message
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: 'Verification failed',
      message: error.message
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: 'Request failed',
      message: error.message
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: 'Reset failed',
      message: error.message
    });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = (req as any).userId; // From auth middleware
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: 'Password change failed',
      message: error.message
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const userId = (req as any).userId; // From auth middleware
    const result = await authService.logout(userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: 'Logout failed',
      message: error.message
    });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    const { password } = deleteAccountSchema.parse(req.body);
    const userId = (req as any).userId; // From auth middleware
    const result = await authService.deleteAccount(userId, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: 'Account deletion failed',
      message: error.message
    });
  }
}
