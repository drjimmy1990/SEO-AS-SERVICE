// backend/src/api/routes/projectRoutes.ts

import { Router } from 'express';
import { crawlProjectController, getProjectPagesController } from '../controllers/projectController';

const router = Router();

// Route to start a new crawl project
router.post('/crawl', crawlProjectController);

// Route to get pages for a specific project
router.get('/:projectId/pages', getProjectPagesController);

export default router;
