import { SupabaseClient } from '@supabase/supabase-js';
import supabase from '../supabase';
import { AnalysisResult } from './types';

export class AnalysisStorageService {
    private client: SupabaseClient;

    constructor() {
        this.client = supabase;
    }

    public async saveAnalysis(result: AnalysisResult): Promise<string | null> {
        try {
            console.log('Saving analysis results to Supabase...');

            // 1. Create Scan Record
            const { data: scan, error: scanError } = await this.client
                .from('scans')
                .insert({
                    url: result.url,
                    score: result.score.total,
                    meta: result, // Saving FULL result as JSON for AI analysis
                    status: 'completed',
                    crawled_pages: result.totalPages,
                    duration_ms: result.crawlDuration
                })
                .select()
                .single();

            if (scanError) {
                console.error('Error creating scan record:', scanError);
                return null;
            }

            const scanId = scan.id;

            // 2. Save Issues (Rule Results)
            // Flatten the results to get all issues
            const issuesToInsert = [];
            for (const ruleResult of result.results) {
                for (const issue of ruleResult.issues) {
                    issuesToInsert.push({
                        scan_id: scanId,
                        rule_id: issue.ruleId,
                        severity: issue.severity,
                        message: issue.message,
                        url: issue.url,
                        element: issue.element
                    });
                }
            }

            if (issuesToInsert.length > 0) {
                const { error: issuesError } = await this.client
                    .from('scan_issues')
                    .insert(issuesToInsert);

                if (issuesError) {
                    console.error('Error saving scan issues:', issuesError);
                }
            }

            console.log(`Analysis saved successfully. Scan ID: ${scanId}`);
            return scanId;

        } catch (error) {
            console.error('Fatal error saving analysis to Supabase:', error);
            return null;
        }
    }
}
