import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All chat routes require authentication
router.post('/message', authenticateToken, chatController.sendMessage);
router.get('/sessions', authenticateToken, chatController.getUserSessions);
router.get('/sessions/:id', authenticateToken, chatController.getSession);
router.delete('/sessions/:id', authenticateToken, chatController.deleteSession);
router.patch('/sessions/:id/archive', authenticateToken, chatController.archiveSession);

export default router;
