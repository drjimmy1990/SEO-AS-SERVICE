import { SEORule, RuleResult, SEOSeverity } from '../../types';
import { PageResult } from '../../../crawler/types';

export class RobotsTxtRule implements SEORule {
    id = 'technical-robots-txt';
    name = 'Robots.txt Check';
    description = 'Checks for the existence and basic validity of robots.txt';
    category = 'technical' as const;
    weight = 10;

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        // Find robots.txt in crawled pages? 
        // Typically robots.txt is at root. We need to construct the URL.
        const urlObj = new URL(page.url);
        const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

        // Check if we crawled robots.txt (if it was in the scope or we should manually fetch it?)
        // The current crawler might skip it if not linked.
        // Ideally the crawler should ALWAYS fetch robots.txt separately.
        // For now, let's assume if it's not in the map, we mark it as "Not Checked" or "Missing" 
        // depending on how we want to handle fetches inside rules.
        // RULES SHOULD NOT FETCH DATA ideally, to be pure.
        // But for this MVP, if it's missing, let's warn.

        // Real implementation: Crawler should have a specific field for 'metaFiles' like robots.txt, sitemap.xml
        // OR we just look in 'allPages' if we configured the crawler to fetch it.

        let found = false;
        if (allPages && allPages.has(robotsUrl)) {
            const robotsPage = allPages.get(robotsUrl);
            if (robotsPage && robotsPage.statusCode >= 200 && robotsPage.statusCode < 300) {
                found = true;
            }
        }

        const issues = [];
        if (!found) {
            issues.push({
                ruleId: this.id,
                message: 'Robots.txt was not found or not crawlable.',
                severity: SEOSeverity.WARNING,
                url: robotsUrl
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
