import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import * as chatImagesController from '../controllers/chatImages.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All chat routes require authentication
router.post('/message', authenticateToken, chatController.sendMessage);
router.get('/sessions', authenticateToken, chatController.getUserSessions);
router.get('/sessions/:id', authenticateToken, chatController.getSession);
router.delete('/sessions/:id', authenticateToken, chatController.deleteSession);
router.patch('/sessions/:id/archive', authenticateToken, chatController.archiveSession);

// Image upload routes
router.post(
  '/images/upload',
  authenticateToken,
  chatImagesController.uploadMiddleware,
  chatImagesController.uploadChatImages
);
router.delete('/images/:fileName', authenticateToken, chatImagesController.deleteChatImage);

export default router;
