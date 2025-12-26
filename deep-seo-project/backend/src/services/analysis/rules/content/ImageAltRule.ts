import { SEORule, RuleResult, SEOSeverity, SEOIssue } from '../../types';
import { PageResult } from '../../../crawler/types';
import * as cheerio from 'cheerio';

export class ImageAltRule implements SEORule {
    id = 'content-image-alt';
    name = 'Image Alt Text';
    description = 'Checks that all images have alt attributes.';
    category = 'content' as const;
    weight = 5;

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        const $ = cheerio.load(page.content);
        const images = $('img');
        const issues: SEOIssue[] = [];

        images.each((i, el) => {
            const alt = $(el).attr('alt');
            const src = $(el).attr('src') || 'unknown';

            if (alt === undefined || alt === null || alt.trim() === '') {
                // Ignore tracking pixels if possible (dimensions 1x1?), but hard to know without layout.
                // Just flagging all empty alt for now.
                issues.push({
                    ruleId: this.id,
                    message: 'Image missing alt text.',
                    severity: SEOSeverity.WARNING,
                    element: `img[src="${src}"]`,
                    url: page.url
                });
            }
        });

        // Limit issues report to avoid spamming 100 images
        const limitedIssues = issues.slice(0, 10);
        if (issues.length > 10) {
            limitedIssues.push({
                ruleId: this.id,
                message: `... and ${issues.length - 10} more images without alt text.`,
                severity: SEOSeverity.INFO,
                url: page.url
            });
        }

        return {
            ruleId: this.id,
            status: issues.length > 0 ? 'warn' : 'pass',
            scoreImpact: issues.length > 0 ? Math.min(issues.length, 10) : 0, // Cap penalty at 10
            issues: limitedIssues as any[]
        };
    }
}
