import { SEORule, RuleResult, SEOSeverity } from '../../types';
import { PageResult } from '../../../crawler/types';
import * as cheerio from 'cheerio';

export class TitleLengthRule implements SEORule {
    id = 'meta-title-length';
    name = 'Title Tag Length';
    description = 'Checks if the title tag exists and is between 10 and 60 characters.';
    category = 'meta' as const;
    weight = 10;

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        const $ = cheerio.load(page.content);
        const title = $('title').text().trim();
        const issues = [];

        if (!title) {
            issues.push({
                ruleId: this.id,
                message: 'Title tag is missing or empty.',
                severity: SEOSeverity.CRITICAL,
                url: page.url
            });
        } else if (title.length < 10) {
            issues.push({
                ruleId: this.id,
                message: `Title is too short (${title.length} chars). Recommended: 10-60 chars.`,
                severity: SEOSeverity.WARNING,
                element: 'title',
                url: page.url
            });
        } else if (title.length > 60) {
            issues.push({
                ruleId: this.id,
                message: `Title is too long (${title.length} chars). Recommended: 10-60 chars.`,
                severity: SEOSeverity.WARNING,
                element: 'title',
                url: page.url
            });
        }

        return {
            ruleId: this.id,
            status: issues.length > 0 ? (issues[0].severity === SEOSeverity.CRITICAL ? 'fail' : 'warn') : 'pass',
            scoreImpact: issues.length > 0 ? 5 : 0,
            issues
        };
    }
}
