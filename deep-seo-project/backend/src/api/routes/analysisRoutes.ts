import { Router } from 'express';
import { AnalysisService } from '../../services/analysis/AnalysisService';

const router = Router();
const analysisService = new AnalysisService();

router.post('/run', async (req, res) => {
    try {
        const { url, trackingCode } = req.body;

        if (!url) {
            res.status(400).json({ error: 'URL is required' });
            return;
        }

        const result = await analysisService.analyzeUrl(url, trackingCode);
        res.json(result);

    } catch (error: any) {
        console.error('Analysis failed:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
