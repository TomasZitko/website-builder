import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import websitesRoutes from './websites.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// API v1 routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/websites', websitesRoutes);
router.use('/analytics', analyticsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
