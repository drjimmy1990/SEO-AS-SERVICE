// backend/src/api/controllers/projectController.ts

import { Request, Response } from 'express';
// import { v4 as uuidv4 } from 'uuid'; // Removed: DB handles ID generation
import supabase from '../../services/supabase';
import { CrawlerService } from '../../services/crawler/CrawlerService';

// Create a single instance with defaults
const crawlerService = new CrawlerService({
    maxDepth: 2,
    maxPages: 50,
    timeout: 30000,
    includeExternal: false
});

export const crawlProjectController = async (req: Request, res: Response) => {
    const { homepage_url } = req.body;

    if (!homepage_url) {
        return res.status(400).json({ error: 'homepage_url is required' });
    }

    try {
        console.log(`Starting crawl for project: ${homepage_url}`);

        // 1. Find or Create Project (Upsert logic via check first or upsert)
        // Best approach: Check if exists to avoid "duplicate key" error if we don't use .upsert() properly with constraints.
        // Assuming 'domain' or 'homepage_url' is unique? Let's assume homepage_url is the key.

        const domain = new URL(homepage_url).hostname;
        let project;
        const { data: existingProject } = await supabase
            .from('projects')
            .select()
            .eq('domain', domain)
            .single();

        if (existingProject) {
            console.log(`Project already exists: ${existingProject.id}. Updating timestamp...`);
            const { data: updatedProject, error: updateError } = await supabase
                .from('projects')
                .update({
                    last_crawled_at: new Date().toISOString(),
                    homepage_url: homepage_url
                })
                .eq('id', existingProject.id)
                .select()
                .single();

            if (updateError) throw updateError;
            project = updatedProject;
        } else {
            // Create new
            const { data: newProject, error: insertError } = await supabase
                .from('projects')
                .insert({
                    domain: domain,
                    homepage_url: homepage_url
                })
                .select()
                .single();

            if (insertError) {
                console.error('Supabase Error (Create Project):', insertError);
                return res.status(500).json({ error: 'Failed to create project. ' + insertError.message });
            }
            project = newProject;
        }

        // 2. Start the crawling process
        const foundUrls = await crawlerService.crawl(homepage_url);

        // Note: verify structure of foundUrls. CrawlerService.crawl returns CrawlResult object now!
        // We need to handle: string[] vs CrawlResult

        // Let's adapt this controller to the new CrawlerService return type.
        // CrawlerService.crawl returns Promise<CrawlResult>
        // CrawlResult has { pages: Map<string, PageResult>, ... }

        const pageUrls = Array.from(foundUrls.pages.keys());

        console.log(`Crawl complete. Found ${pageUrls.length} pages.`);

        // 3. Save found pages to Supabase
        // 3. Save found pages to Supabase (prevent duplicates)
        // Fetch existing URLs for this project to avoid duplicates
        // (Ideally schema should have UNIQUE(project_id, url), but we handle it here too)
        const { data: existingPages } = await supabase
            .from('pages')
            .select('url')
            .eq('project_id', project.id);

        const existingUrlsSet = new Set(existingPages?.map(p => p.url) || []);

        const pagesToInsert = pageUrls
            .filter(url => !existingUrlsSet.has(url))
            .map(url => ({
                project_id: project.id,
                url: url
            }));

        if (pagesToInsert.length > 0) {
            const { error: pagesError } = await supabase
                .from('pages')
                .insert(pagesToInsert);

            if (pagesError) {
                console.error('Supabase Error (Insert Pages):', pagesError);
            } else {
                console.log(`Inserted ${pagesToInsert.length} new pages.`);
            }
        } else {
            console.log('No new pages to insert.');
        }



        // 4. Update Project status
        // Note: 'status' column is missing in current schema.
        /*
        await supabase
            .from('projects')
            .update({ status: 'completed' })
            .eq('id', project.id);
        */

        res.status(200).json({
            message: 'Crawl completed successfully.',
            project: project,
            pages_count: pageUrls.length,
            pages: pageUrls // Optional: return list
        });

    } catch (error: any) {
        console.error('Crawl Controller Error:', error);
        res.status(500).json({ error: 'Internal server error during crawl.', details: error.message });
    }
};

export const getProjectPagesController = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const { data, error } = await supabase
        .from('pages')
        .select(`
            id,
            url,
            last_analyzed_at,
            analysis_reports ( id, created_at, report_data )
        `)
        .eq('project_id', projectId)
        .order('created_at', { foreignTable: 'analysis_reports', ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    // We only want the LATEST report for each page
    const pagesWithLatestReport = data.map(page => {
        const latestReport = page.analysis_reports.length > 0 ? page.analysis_reports[0] : null;
        return {
            id: page.id,
            url: page.url,
            last_analyzed_at: page.last_analyzed_at,
            latest_report: latestReport // Nest the latest report directly
        };
    });

    res.status(200).json(pagesWithLatestReport);
};
