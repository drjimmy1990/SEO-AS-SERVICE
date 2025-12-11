// backend/src/api/routes/settingsRoutes.ts
import { Router } from 'express';
import { saveSettingsController, getLiveSettingsController } from '../controllers/settingsController';

const router = Router();

// Private route for saving from our app
router.post('/save', saveSettingsController);

// Public route for the injector script
router.get('/live', getLiveSettingsController);

export default router;
