import { SEORule, RuleResult, SEOSeverity } from '../../types';
import { PageResult } from '../../../crawler/types';
import * as cheerio from 'cheerio';

export class OpenGraphRule implements SEORule {
    id = 'meta-opengraph';
    name = 'Open Graph Tags';
    description = 'Checks for the existence of basic Open Graph tags (og:title, og:description, og:image).';
    category = 'meta' as const;
    weight = 6;

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        const $ = cheerio.load(page.content);
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogDesc = $('meta[property="og:description"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');

        const issues = [];

        if (!ogTitle) issues.push('og:title');
        if (!ogDesc) issues.push('og:description');
        if (!ogImage) issues.push('og:image');

        if (issues.length > 0) {
            return {
                ruleId: this.id,
                status: 'warn',
                scoreImpact: issues.length, // 1 point per missing tag
                issues: issues.map(tag => ({
                    ruleId: this.id,
                    message: `Missing Open Graph tag: ${tag}`,
                    severity: SEOSeverity.INFO,
                    element: `meta[property="${tag}"]`,
                    url: page.url
                }))
            };
        }

        return {
            ruleId: this.id,
            status: 'pass',
            scoreImpact: 0,
            issues: []
        };
    }
}
