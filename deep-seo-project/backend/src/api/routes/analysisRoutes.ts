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

        // Wrap response to match Frontend expectation (response.data.report)
        res.json({
            message: 'Analysis completed successfully',
            report: result,
            reportId: result.reportId
        });

    } catch (error: any) {
        console.error('Analysis failed:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
