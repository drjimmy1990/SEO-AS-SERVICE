// backend/src/api/routes/projectRoutes.ts

import { Router } from 'express';
import { startCrawlController, getProjectPagesController } from '../controllers/projectController';

const router = Router();

// Define the endpoint: POST /api/projects/crawl
// When a request hits this path, it will be handled by our controller.
router.post('/crawl', startCrawlController);
router.get('/:projectId/pages', getProjectPagesController);

export default router;
