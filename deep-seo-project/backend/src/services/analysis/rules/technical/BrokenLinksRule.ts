import { SEORule, RuleResult, SEOSeverity, SEOIssue } from '../../types';
import { PageResult } from '../../../crawler/types';

export class BrokenLinksRule implements SEORule {
    id = 'technical-broken-links';
    name = 'Broken Links Check';
    description = 'Identifies internal broken links (404s) found during the crawl.';
    category = 'technical' as const;
    weight = 10;

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        // This rule is best run as a "Site Level" rule.
        // If we run it per page, we might just report if *that* page is broken, 
        // OR we report links *on* that page that are broken.

        // Strategy: Report links ON this page that lead to 404s.
        // This is more actionable: "Page X has a broken link to Y".

        const issues: SEOIssue[] = [];

        // We need to look at page.links (internal links) and see if they exist in allPages and have error status.
        if (allPages) {
            for (const link of page.links) {
                const targetPage = allPages.get(link);
                if (targetPage) {
                    if (targetPage.statusCode === 404 || targetPage.statusCode === 0 || (targetPage.statusCode >= 400)) {
                        issues.push({
                            ruleId: this.id,
                            message: `Broken link found to ${link} (Status: ${targetPage.statusCode})`,
                            severity: SEOSeverity.ERROR,
                            element: `a[href="${link}"]`, // approximated selector
                            url: page.url
                        });
                    }
                }
                // If targetPage is missing from map, it might mean we didn't crawl it (max depth?) or it wasn't found.
                // We shouldn't assume it's broken unless we have a record of it failing.
            }
        }

        return {
            ruleId: this.id,
            status: issues.length > 0 ? 'fail' : 'pass',
            scoreImpact: issues.length * 2, // Deduct 2 points per broken link
            issues
        };
    }
}
