import { SEORule, AnalysisResult, SEOScore, RuleResult, SEOSeverity } from './types';
import { PageResult, CrawlResult } from '../crawler/types';

export class RuleEngine {
    private rules: SEORule[] = [];

    public register(rule: SEORule): void {
        this.rules.push(rule);
    }

    public async analyze(crawlResult: CrawlResult, targetUrl: string, extraRules: SEORule[] = []): Promise<AnalysisResult> {
        const results: RuleResult[] = [];

        // Normalize targetUrl to match crawler keys (e.g. remove trailing slash)
        // Since we don't import normalizeUrl here (circular dep risk if in crawler/utils?), 
        // let's manually replicate strict normalization or ensure we look for both VARIATIONS.
        // Better: look for exact match, then normalized match.

        let mainPage = crawlResult.pages.get(targetUrl);
        if (!mainPage) {
            // Try removing trailing slash
            const noSlash = targetUrl.endsWith('/') ? targetUrl.slice(0, -1) : targetUrl;
            mainPage = crawlResult.pages.get(noSlash);

            // Try adding trailing slash if not present (just in case)
            if (!mainPage) {
                const withSlash = targetUrl.endsWith('/') ? targetUrl : targetUrl + '/';
                mainPage = crawlResult.pages.get(withSlash);
            }
        }

        if (!mainPage) {
            // Debugging help
            const availableKeys = Array.from(crawlResult.pages.keys());
            console.error(`Main page ${targetUrl} not found. Available keys (Total: ${availableKeys.length}):`, JSON.stringify(availableKeys, null, 2));
            throw new Error(`Main page ${targetUrl} not found in crawl results.`);
        }

        // Run rules
        // Note: Some rules might need access to ALL pages (e.g. broken links, dupe content)
        // while others are per-page. expected behavior is to analyze the "target" page specifically
        // OR allow the engine to aggregate issues from all pages.
        // For this initial version, let's assume we are analyzing the SITE, but aggregating issues 
        // mainly from the entry point or checking global health.

        // Actually, a proper SEO audit analyzes ALL pages. 
        // But to keep it simple, let's iterate all pages for "Page Level" rules, 
        // and run "Site Level" rules once.
        // For now, let's stick to the implementation plan's implied scope: check specific rules.

        // We will run all rules against the MAIN page for now to verify logic, 
        // but the engine structure supports iterating all.

        const allRules = [...this.rules, ...extraRules];

        for (const rule of allRules) {
            try {
                const result = await rule.evaluate(mainPage, crawlResult.pages);
                results.push(result);
            } catch (e: any) {
                console.error(`Rule ${rule.id} failed:`, e);
                results.push({
                    ruleId: rule.id,
                    status: 'fail',
                    scoreImpact: 0,
                    issues: [{
                        ruleId: rule.id,
                        severity: SEOSeverity.ERROR,
                        message: `Rule execution failed: ${e.message}`,
                        url: targetUrl
                    }]
                });
            }
        }

        const score = this.calculateScore(results);

        return {
            url: targetUrl,
            crawlDuration: crawlResult.duration,
            totalPages: crawlResult.pages.size,
            score,
            results,
            timestamp: new Date()
        };
    }

    private calculateScore(results: RuleResult[]): SEOScore {
        let currentScore = 100;
        let technicalDeduction = 0;
        let contentDeduction = 0;

        for (const res of results) {
            if (res.status === 'fail' || res.status === 'warn') {
                // Deduct based on rule definition? or just simple sum for now
                // Using scoreImpact from result
                if (res.scoreImpact > 0) {
                    // Determine category from... wait, I need category here. 
                    // Assuming I can look it up or pass it through. 
                    // Simpler: Just subtract from total for now.
                    currentScore -= res.scoreImpact;
                }
            }
        }

        return {
            total: Math.max(0, currentScore),
            technical: 100, // Placeholder calculation
            content: 100,   // Placeholder calculation
            mobile: 100
        };
    }
}
