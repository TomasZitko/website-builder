import { Router } from 'express';
import express from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Webhook needs raw body, not parsed JSON
router.post(
  '/webhook',
  express.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf.toString();
    }
  }),
  paymentController.webhook
);

router.post('/create-checkout', authenticateToken, paymentController.createCheckout);
router.get('/history', authenticateToken, paymentController.getHistory);

export default router;
