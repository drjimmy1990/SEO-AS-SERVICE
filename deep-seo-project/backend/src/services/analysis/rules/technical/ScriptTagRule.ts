import { SEORule, RuleResult, SEOSeverity } from '../../types';
import { PageResult } from '../../../crawler/types';
import * as cheerio from 'cheerio';

export class ScriptTagRule implements SEORule {
    id = 'technical-script-tag';
    name = 'Tracking Script Detection';
    description = 'Checks if a specific tracking script or pixel is present on the page.';
    category = 'technical' as const;
    weight = 10;

    private targetScriptDetail: string;

    constructor(targetScriptDetail: string) {
        this.targetScriptDetail = targetScriptDetail;
    }

    async evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult> {
        const $ = cheerio.load(page.content);
        const scripts = $('script');
        let found = false;

        console.log(`[ScriptTagRule] Checking ${scripts.length} scripts on ${page.url} for '${this.targetScriptDetail}'`);

        scripts.each((i, el) => {
            const src = $(el).attr('src');
            const content = $(el).html();
            console.log(`[ScriptTagRule] Script ${i}: src="${src}", content length=${content?.length}`);

            // Check src
            if (src && src.includes(this.targetScriptDetail)) {
                found = true;
                return false; // break loop
            }

            // Check inline content
            if (content && content.includes(this.targetScriptDetail)) {
                found = true;
                return false; // break loop
            }
        });

        const issues = [];
        if (!found) {
            issues.push({
                ruleId: this.id,
                message: `Tracking script (${this.targetScriptDetail}) was not found on the page.`,
                severity: SEOSeverity.ERROR,
                url: page.url
            });
        }

        return {
            ruleId: this.id,
            status: found ? 'pass' : 'fail',
            scoreImpact: found ? 0 : 10,
            issues
        };
    }
}
