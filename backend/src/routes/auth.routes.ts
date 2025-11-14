import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as oauthController from '../controllers/oauth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refreshToken);

// Protected routes (require authentication)
router.post('/logout', authenticateToken, authController.logout);
router.post('/change-password', authenticateToken, authController.changePassword);
router.delete('/account', authenticateToken, authController.deleteAccount);

// OAuth routes
router.get('/google', oauthController.googleAuth);
router.get('/google/callback', oauthController.googleCallback);
router.get('/github', oauthController.githubAuth);
router.get('/github/callback', oauthController.githubCallback);

export default router;
