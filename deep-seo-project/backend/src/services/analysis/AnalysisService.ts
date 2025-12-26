import { CrawlerService } from '../crawler/CrawlerService';
import { RuleEngine } from './RuleEngine';
import { AnalysisResult } from './types';
import { RobotsTxtRule } from './rules/technical/RobotsTxtRule';
import { SitemapRule } from './rules/technical/SitemapRule';
import { BrokenLinksRule } from './rules/technical/BrokenLinksRule';
import { TitleLengthRule } from './rules/meta/TitleLengthRule';
import { DescriptionLengthRule } from './rules/meta/DescriptionLengthRule';
import { OpenGraphRule } from './rules/meta/OpenGraphRule';
import { HeaderHierarchyRule } from './rules/content/HeaderHierarchyRule';
import { ImageAltRule } from './rules/content/ImageAltRule';

export class AnalysisService {
    private crawler: CrawlerService;
    private ruleEngine: RuleEngine;

    constructor() {
        this.crawler = new CrawlerService({
            maxDepth: 2,
            maxPages: 50,
            timeout: 30000,
            includeExternal: false
        });

        this.ruleEngine = new RuleEngine();
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

    public async analyzeUrl(url: string): Promise<AnalysisResult> {
        console.log(`Starting analysis for: ${url}`);

        // 1. Crawl the site
        const crawlResult = await this.crawler.crawl(url);

        // 2. Run Analysis
        const analysisResult = await this.ruleEngine.analyze(crawlResult, url);

        return analysisResult;
    }
}
