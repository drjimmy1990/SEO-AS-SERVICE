// backend/src/api/controllers/settingsController.ts
import { Request, Response } from 'express';
import supabase from '../../services/supabase';

// Private endpoint to save settings from our dashboard
export const saveSettingsController = async (req: Request, res: Response) => {
    const { page_id, settings_data } = req.body;

    if (!page_id || !settings_data) {
        return res.status(400).json({ error: 'page_id and settings_data are required.' });
    }

    try {
        // "Upsert" is a combination of UPDATE or INSERT.
        // If a row with this page_id exists, it will be updated.
        // If it doesn't exist, a new row will be inserted.
        // This is perfect for our needs.
        const { data, error } = await supabase
            .from('live_seo_settings')
            .upsert(
                { page_id: page_id, settings_data: settings_data },
                { onConflict: 'page_id' } // This specifies the column to check for conflicts
            )
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Settings saved successfully.', settings: data });
    } catch (error: any) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Failed to save settings.', details: error.message });
    }
};

// Public endpoint for the injector script
export const getLiveSettingsController = async (req: Request, res: Response) => {
    // We will identify the page by its full URL, as that's what the injector script knows.
    const { url } = req.query;

    console.log(`[Injector Request] Received URL: ${url}`); // <-- ADD THIS LINE

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL query parameter is required.' });
    }

    try {
        // Find the page ID that corresponds to the given URL.
        // Note: In a huge production system, you might want to cache this lookup.
        const { data: page, error: pageError } = await supabase
            .from('pages')
            .select('id')
            .eq('url', url)
            .single();

        if (pageError || !page) {
            // Return 404 but with an empty object so the client script doesn't error out.
            return res.status(404).json({});
        }

        // Now fetch the live settings for that page ID.
        const { data: settings, error: settingsError } = await supabase
            .from('live_seo_settings')
            .select('settings_data')
            .eq('page_id', page.id)
            .single();

        if (settingsError || !settings) {
            return res.status(404).json({});
        }

        // Important: Set CORS headers to allow any website to call this endpoint.
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(settings.settings_data);

    } catch (error: any) {
        res.status(500).json({}); // Return empty on error
    }
};
