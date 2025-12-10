// backend/src/api/routes/aiRoutes.ts
import { Router } from 'express';
import { getAiSuggestionsController } from '../controllers/aiController';

const router = Router();
router.post('/suggestions', getAiSuggestionsController);

export default router;
