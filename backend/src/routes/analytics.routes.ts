import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes (called from user websites)
router.post('/track', analyticsController.trackPageView);
router.post('/duration', analyticsController.trackDuration);

// Protected routes (called from dashboard)
router.get('/websites/:id', authenticateToken, analyticsController.getAnalytics);

export default router;
