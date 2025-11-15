import { Router } from 'express';
import * as websitesController from '../controllers/websites.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.get('/', authenticateToken, websitesController.getAllWebsites);
router.post('/', authenticateToken, websitesController.createWebsite);
router.get('/:id', authenticateToken, websitesController.getWebsite);
router.put('/:id', authenticateToken, websitesController.updateWebsite);
router.delete('/:id', authenticateToken, websitesController.deleteWebsite);

// Deployment routes
router.post('/:id/deploy', authenticateToken, websitesController.deployWebsite);
router.get('/:id/deployments', authenticateToken, websitesController.getDeployments);

// Custom domain routes
router.post('/:id/domain', authenticateToken, websitesController.setupDomain);
router.post('/:id/verify-domain', authenticateToken, websitesController.verifyDomain);

// Version history routes
router.get('/:id/versions', authenticateToken, websitesController.getVersions);
router.post('/:id/versions', authenticateToken, websitesController.createVersion);
router.post('/:id/versions/:versionId/restore', authenticateToken, websitesController.restoreVersion);

export default router;
