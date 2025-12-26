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
        // 1. Fetch the analysis report data from 'scans' table (stored in 'meta')
        const { data: scan, error: scanError } = await supabase
            .from('scans')
            .select('meta')
            .eq('id', report_id)
            .single();

        if (scanError || !scan) {
            return res.status(404).json({ error: `Analysis scan with ID ${report_id} not found.` });
        }

        // 2. Call the n8n webhook with the ENTIRE report_data (which is in scan.meta)
        console.log('Sending full analysis report to n8n for AI suggestions...');
        const aiResponse = await axios.post(n8nWebhookUrl, {
            report_data: scan.meta
        });

        // 3. Return the AI's response directly to the frontend
        res.status(200).json(aiResponse.data);

    } catch (error: any) {
        console.error('Error getting AI suggestions:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get AI suggestions.', details: error.message });
    }
};
