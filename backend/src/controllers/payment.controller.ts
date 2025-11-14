import { Request, Response } from 'express';
import { createCheckoutSession, handleWebhookEvent, getPaymentHistory } from '../services/stripe.service';

export async function createCheckout(req: Request, res: Response) {
  try {
    const { websiteId, successUrl, cancelUrl } = req.body;
    const userId = (req as any).userId!;

    if (!websiteId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const session = await createCheckoutSession(
      userId,
      websiteId,
      successUrl,
      cancelUrl
    );

    res.json(session);
  } catch (error: any) {
    console.error('Create checkout error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}

export async function webhook(req: Request, res: Response) {
  try {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'No signature' });
    }

    const result = await handleWebhookEvent(signature, (req as any).rawBody);
    res.json(result);
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({
      error: 'Webhook error',
      message: error.message
    });
  }
}

export async function getHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).userId!;
    const payments = await getPaymentHistory(userId);

    res.json({ payments });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch payment history',
      message: error.message
    });
  }
}
