import { Router } from 'express';
import * as websiteController from '../controllers/website.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, websiteController.getAllWebsites);
router.post('/generate', authenticateToken, websiteController.generateWebsite);
router.get('/:id', authenticateToken, websiteController.getWebsiteById);
router.put('/:id', authenticateToken, websiteController.updateWebsite);
router.delete('/:id', authenticateToken, websiteController.deleteWebsite);

// Version history routes
router.get('/:id/versions', authenticateToken, websiteController.getWebsiteVersions);
router.post('/:id/versions/:versionId/restore', authenticateToken, websiteController.restoreVersion);

export default router;
