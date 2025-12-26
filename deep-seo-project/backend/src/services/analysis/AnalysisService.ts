import { CrawlerService } from '../crawler/CrawlerService';
import { RuleEngine } from './RuleEngine';
import { AnalysisResult } from './types';
import { RobotsTxtRule } from './rules/technical/RobotsTxtRule';
import { SitemapRule } from './rules/technical/SitemapRule';
import { BrokenLinksRule } from './rules/technical/BrokenLinksRule';
import { TitleLengthRule } from './rules/meta/TitleLengthRule';
import { DescriptionLengthRule }
    from './rules/meta/DescriptionLengthRule';
import { OpenGraphRule } from './rules/meta/OpenGraphRule';
import { HeaderHierarchyRule } from './rules/content/HeaderHierarchyRule';
import { ImageAltRule } from './rules/content/ImageAltRule';
import { ScriptTagRule } from './rules/technical/ScriptTagRule';
import { AnalysisStorageService } from './AnalysisStorageService';

export class AnalysisService {
    private crawler: CrawlerService;
    private ruleEngine: RuleEngine;
    private storageService: AnalysisStorageService;

    constructor() {
        this.crawler = new CrawlerService({
            maxDepth: 2,
            maxPages: 50,
            timeout: 30000,
            includeExternal: false
        });

        this.ruleEngine = new RuleEngine();
        this.storageService = new AnalysisStorageService();
        this.registerDefaultRules();
    }

    private registerDefaultRules() {
        this.ruleEngine.register(new RobotsTxtRule());
        this.ruleEngine.register(new SitemapRule());
        this.ruleEngine.register(new BrokenLinksRule());
        this.ruleEngine.register(new TitleLengthRule());
        this.ruleEngine.register(new DescriptionLengthRule());
        this.ruleEngine.register(new OpenGraphRule());
        this.ruleEngine.register(new HeaderHierarchyRule());
        this.ruleEngine.register(new ImageAltRule());
    }

    public async analyzeUrl(url: string, trackingCode?: string): Promise<AnalysisResult> {
        console.log(`Starting analysis for: ${url} (Tracking Code: ${trackingCode || 'None'})`);

        // Register script verification rule if code is provided
        if (trackingCode) {
            // Check if rule already exists or just add it dynamically?
            // For now, simpler to just register a new instance.
            // Note: In a long running service, this pushes a new rule every request!
            // FIX: We should use a per-request rule engine or pass config to 'analyze'.
            // For now, let's just make a fresh engine or reset strategies. 
            // Better: Add rule only for this analysis run.
            // Since RuleEngine is stateful (stored rules), we need to be careful.
            // Let's create a *fresh* rule engine for each request or allow 'transient' rules.
            // HACK for MVP: Register, Run, Remove? Or better: pass extra rules to .analyze().
            // Let's modify RuleEngine.analyze to accept transient rules.
        }

        // 1. Crawl the site
        const crawlResult = await this.crawler.crawl(url);

        // 2. Run Analysis
        // Create transient rules array if needed
        const transientRules = [];
        if (trackingCode) {
            transientRules.push(new ScriptTagRule(trackingCode));
        }

        // Modify RuleEngine.analyze signature in next step or now?
        // Let's modify RuleEngine.analyze to accept extra rules.
        const analysisResult = await this.ruleEngine.analyze(crawlResult, url, transientRules);

        // 3. Save to Supabase (Non-blocking usually, but await for MVP debugging)
        await this.storageService.saveAnalysis(analysisResult);

        return analysisResult;
    }
}
