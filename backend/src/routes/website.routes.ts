import { Router } from 'express';
import * as websiteController from '../controllers/website.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, websiteController.getAllWebsites);
router.post('/generate', authenticateToken, websiteController.generateWebsite);
router.get('/:id', authenticateToken, websiteController.getWebsiteById);
router.put('/:id', authenticateToken, websiteController.updateWebsite);
router.delete('/:id', authenticateToken, websiteController.deleteWebsite);

export default router;
