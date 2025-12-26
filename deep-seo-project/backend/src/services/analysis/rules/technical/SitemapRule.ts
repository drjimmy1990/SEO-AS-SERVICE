import { SEORule, RuleResult, SEOSeverity } from '../../types';
import { PageResult } from '../../../crawler/types';

export class SitemapRule implements SEORule {
    id = 'technical-sitemap-xml';
    name = 'Sitemap.xml Check';
    description = 'Checks for the existence of sitemap.xml';
    category = 'technical' as const;
    weight = 8;

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        const urlObj = new URL(page.url);
        const sitemapUrl = `${urlObj.protocol}//${urlObj.host}/sitemap.xml`;

        let found = false;
        if (allPages && allPages.has(sitemapUrl)) {
            const sitemapPage = allPages.get(sitemapUrl);
            if (sitemapPage && sitemapPage.statusCode >= 200 && sitemapPage.statusCode < 300) {
                found = true;
            }
        }

        const issues = [];
        if (!found) {
            issues.push({
                ruleId: this.id,
                message: 'Sitemap.xml was not found at standard location or not crawlable.',
                severity: SEOSeverity.WARNING,
                url: sitemapUrl
            });
        }

        return {
            ruleId: this.id,
            status: found ? 'pass' : 'warn',
            scoreImpact: found ? 0 : 5,
            issues
        };
    }
}
