import { SEORule, RuleResult, SEOSeverity } from '../../types';
import { PageResult } from '../../../crawler/types';
import * as cheerio from 'cheerio';

export class DescriptionLengthRule implements SEORule {
    id = 'meta-description-length';
    name = 'Meta Description Length';
    description = 'Checks if the meta description exists and is between 50 and 160 characters.';
    category = 'meta' as const;
    weight = 9;

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        const $ = cheerio.load(page.content);
        const description = $('meta[name="description"]').attr('content')?.trim();
        const issues = [];

        if (!description) {
            issues.push({
                ruleId: this.id,
                message: 'Meta description is missing.',
                severity: SEOSeverity.ERROR,
                url: page.url
            });
        } else if (description.length < 50) {
            issues.push({
                ruleId: this.id,
                message: `Meta description is too short (${description.length} chars). Recommended: 50-160 chars.`,
                severity: SEOSeverity.WARNING,
                element: 'meta[name="description"]',
                url: page.url
            });
        } else if (description.length > 160) {
            issues.push({
                ruleId: this.id,
                message: `Meta description is too long (${description.length} chars). Recommended: 50-160 chars.`,
                severity: SEOSeverity.WARNING,
                element: 'meta[name="description"]',
                url: page.url
            });
        }

        return {
            ruleId: this.id,
            status: issues.length > 0 ? 'warn' : 'pass',
            scoreImpact: issues.length > 0 ? 3 : 0,
            issues
        };
    }
}
