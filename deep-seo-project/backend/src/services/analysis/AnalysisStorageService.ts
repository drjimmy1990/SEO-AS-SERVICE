import { SupabaseClient } from '@supabase/supabase-js';
import supabase from '../supabase';
import { AnalysisResult } from './types';

export class AnalysisStorageService {
    private client: SupabaseClient;

    constructor() {
        this.client = supabase;
    }

    public async saveAnalysis(result: AnalysisResult): Promise<{ reportId: string, pageId: string } | null> {
        try {
            console.log('Saving analysis results to Supabase...');

            // 1. Find or Create Project (based on domain)
            const urlObj = new URL(result.url);
            const domain = urlObj.hostname;
            const homepageUrl = `${urlObj.protocol}//${urlObj.hostname}`;

            let { data: project } = await this.client
                .from('projects')
                .select('id')
                .eq('domain', domain)
                .single();

            if (!project) {
                const { data: newProject, error: projError } = await this.client
                    .from('projects')
                    .insert({ domain, homepage_url: homepageUrl })
                    .select('id')
                    .single();

                if (projError) throw projError;
                project = newProject;
            }

            // 2. Find or Create Page
            let { data: page } = await this.client
                .from('pages')
                .select('id')
                .eq('url', result.url)
                //.eq('project_id', project.id) // unique constraint is (project_id, url)
                .single();

            if (!page) {
                const { data: newPage, error: pageError } = await this.client
                    .from('pages')
                    .insert({
                        project_id: project.id,
                        url: result.url,
                        last_analyzed_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (pageError) throw pageError;
                page = newPage;
            } else {
                // Update last_analyzed_at
                await this.client
                    .from('pages')
                    .update({ last_analyzed_at: new Date().toISOString() })
                    .eq('id', page.id);
            }

            // 3. Create Analysis Report
            const { data: report, error: reportError } = await this.client
                .from('analysis_reports')
                .insert({
                    page_id: page.id,
                    report_data: result // Saving FULL result as JSON
                })
                .select()
                .single();

            if (reportError) {
                console.error('Error creating analysis report:', reportError);
                return null;
            }

            const reportId = report.id;
            console.log(`Analysis saved successfully. Report ID: ${reportId}`);
            return { reportId, pageId: page.id };

        } catch (error) {
            console.error('Fatal error saving analysis to Supabase:', error);
            return null;
        }
    }
}
