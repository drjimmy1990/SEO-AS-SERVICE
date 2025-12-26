import { Request, Response } from 'express';
import supabase from '../../services/supabase';
import { AnalysisService } from '../../services/analysis/AnalysisService';

const analysisService = new AnalysisService();

export const startAnalysisController = async (req: Request, res: Response) => {
    const { page_id } = req.body;

    if (!page_id) {
        return res.status(400).json({ error: 'page_id is required.' });
    }

    try {
        // --- Step 1: Fetch the page URL from our database ---
        const { data: page, error: pageError } = await supabase
            .from('pages')
            .select('url')
            .eq('id', page_id)
            .single();

        if (pageError || !page) {
            return res.status(404).json({ error: `Page with ID ${page_id} not found.` });
        }

        // --- Step 2: Run the deep analysis using the Service ---
        const result = await analysisService.analyzeUrl(page.url);

        // Note: analysisService.analyzeUrl already saves to the DB (scans table).
        // If we want to maintain the old behavior of returning a "report" object structure
        // we can adaptation here, or return the result directly.

        // We might want to update the 'pages' table last_analyzed_at here as well.
        await supabase
            .from('pages')
            .update({ last_analyzed_at: new Date().toISOString() })
            .eq('id', page_id);

        res.status(200).json({
            message: `Successfully analyzed page ${page_id}`,
            report: result,
            reportId: result.reportId
        });

    } catch (error: any) {
        console.error('Error in analysis controller:', error);
        res.status(500).json({ error: 'An internal server error occurred during analysis.', details: error.message });
    }
};
