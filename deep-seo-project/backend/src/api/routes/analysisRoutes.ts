// backend/src/api/routes/analysisRoutes.ts

import { Router } from 'express';
import { startAnalysisController } from '../controllers/analysisController';

const router = Router();

// Define the endpoint: POST /api/analysis/run
router.post('/run', startAnalysisController);

export default router;
