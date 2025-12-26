import { SEORule, RuleResult, SEOSeverity } from '../../types';
import { PageResult } from '../../../crawler/types';
import * as cheerio from 'cheerio';

export class HeaderHierarchyRule implements SEORule {
    id = 'content-header-hierarchy';
    name = 'Header Hierarchy';
    description = 'Checks for the existence of exactly one H1 tag and proper header structure.';
    category = 'content' as const;
    weight = 8;

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        const $ = cheerio.load(page.content);
        const h1Count = $('h1').length;
        const issues = [];

        if (h1Count === 0) {
            issues.push({
                ruleId: this.id,
                message: 'Missing H1 tag. Every page should have exactly one H1.',
                severity: SEOSeverity.ERROR,
                url: page.url
            });
        } else if (h1Count > 1) {
            issues.push({
                ruleId: this.id,
                message: `Multiple H1 tags found (${h1Count}). Recommended: exactly one H1 per page.`,
                severity: SEOSeverity.WARNING,
                url: page.url
            });
        }

        // We could also check for H2 skipping, etc., but H1 is the critical one.

        return {
            ruleId: this.id,
            status: issues.length > 0 ? (h1Count === 0 ? 'fail' : 'warn') : 'pass',
            scoreImpact: issues.length > 0 ? 5 : 0,
            issues
        };
    }
}
