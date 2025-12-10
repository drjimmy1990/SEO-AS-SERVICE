// backend/src/api/routes/projectRoutes.ts

import { Router } from 'express';
import { startCrawlController } from '../controllers/projectController';

const router = Router();

// Define the endpoint: POST /api/projects/crawl
// When a request hits this path, it will be handled by our controller.
router.post('/crawl', startCrawlController);

export default router;
