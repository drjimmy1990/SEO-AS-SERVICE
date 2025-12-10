// backend/src/api/controllers/analysisController.ts

import { Request, Response } from 'express';
import supabase from '../../services/supabase';
import { analyzePage } from '../../services/analysis';

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

        // --- Step 2: Run the deep analysis on the URL ---
        const reportData = await analyzePage(page.url);

        // --- Step 3: Save the new analysis report to the database ---
        const { data: newReport, error: reportError } = await supabase
            .from('analysis_reports')
            .insert({
                page_id: page_id,
                report_data: reportData // The entire JSON object is saved here
            })
            .select()
            .single();

        if (reportError) {
            throw reportError;
        }

        // --- Step 4 (Optional but good practice): Update the page's last_analyzed_at timestamp ---
        await supabase
            .from('pages')
            .update({ last_analyzed_at: new Date().toISOString() })
            .eq('id', page_id);

        // --- Step 5: Respond to the client ---
        res.status(201).json({
            message: `Successfully analyzed page ${page_id}`,
            report: newReport,
        });

    } catch (error: any) {
        console.error('Error in analysis controller:', error);
        res.status(500).json({ error: 'An internal server error occurred during analysis.', details: error.message });
    }
};
