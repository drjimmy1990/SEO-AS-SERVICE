// backend/src/api/controllers/aiController.ts
import { Request, Response } from 'express';
import supabase from '../../services/supabase';
import axios from 'axios';

export const getAiSuggestionsController = async (req: Request, res: Response) => {
    const { report_id } = req.body;
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!report_id) {
        return res.status(400).json({ error: 'report_id is required.' });
    }
    if (!n8nWebhookUrl) {
        return res.status(500).json({ error: 'N8N_WEBHOOK_URL is not configured on the server.' });
    }

    try {
        // 1. Fetch the analysis report data from our database
        const { data: report, error: reportError } = await supabase
            .from('analysis_reports')
            .select('report_data')
            .eq('id', report_id)
            .single();

        if (reportError || !report) {
            return res.status(404).json({ error: `Analysis report with ID ${report_id} not found.` });
        }

        const reportData = report.report_data as any; // Cast to any to access dynamic properties
        const fullText = reportData.contentAnalysis.full_text_content;
        const imagesForAi = reportData.contentAnalysis.images.map((img: any) => ({
            selector: img.selector,
            src: img.src,
            current_alt: img.alt
        }));

        // 2. Call the n8n webhook with the required data
        console.log('Sending data to n8n for AI suggestions...');
        const aiResponse = await axios.post(n8nWebhookUrl, {
            full_text_content: fullText,
            images_for_ai: imagesForAi
        });

        // 3. Return the AI's response directly to the frontend
        res.status(200).json(aiResponse.data);

    } catch (error: any) {
        console.error('Error getting AI suggestions:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get AI suggestions.', details: error.message });
    }
};
