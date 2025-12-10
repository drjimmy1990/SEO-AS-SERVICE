// backend/src/api/controllers/projectController.ts

import { Request, Response } from 'express';
import { crawlWebsite } from '../../services/crawler';
import supabase from '../../services/supabase';

export const startCrawlController = async (req: Request, res: Response) => {
    const { homepage_url } = req.body;

    if (!homepage_url) {
        return res.status(400).json({ error: 'homepage_url is required.' });
    }

    try {
        // --- Step 1: Create a new Project in the database ---
        console.log(`Creating project for homepage: ${homepage_url}`);
        const urlObject = new URL(homepage_url);
        const domain = urlObject.hostname;

        const { data: newProject, error: projectError } = await supabase
            .from('projects')
            .insert({ homepage_url, domain })
            .select() // .select() returns the newly created row
            .single(); // .single() ensures we get an object, not an array

        if (projectError) {
            console.error('Supabase project insert error:', projectError.message);
            // Handle potential duplicate domain error
            if (projectError.code === '23505') { // Unique violation error code
                return res.status(409).json({ error: `Project with domain '${domain}' already exists.` });
            }
            throw projectError;
        }

        console.log('Project created successfully:', newProject.id);

        // --- Step 2: Run the Crawler ---
        const foundUrls = await crawlWebsite(homepage_url);

        // --- Step 3: Prepare and Save the discovered Pages ---
        const pagesToInsert = foundUrls.map(url => ({
            project_id: newProject.id,
            url: url,
            // We could potentially get the title here, but we'll do that in the analysis step
        }));

        const { data: insertedPages, error: pagesError } = await supabase
            .from('pages')
            .insert(pagesToInsert)
            .select();

        if (pagesError) {
            console.error('Supabase pages insert error:', pagesError.message);
            // Note: In a real production app, we might want to delete the project we just created if this step fails.
            throw pagesError;
        }

        console.log(`Successfully inserted ${insertedPages.length} pages into the database.`);

        // --- Step 4: Respond to the client ---
        res.status(201).json({
            message: 'Crawl successful and project created.',
            project: newProject,
            pages: insertedPages,
        });

    } catch (error: any) {
        console.error('Error in crawl controller:', error);
        res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
    }
};
