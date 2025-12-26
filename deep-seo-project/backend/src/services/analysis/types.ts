import { PageResult } from '../crawler/types';

export enum SEOSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

export interface SEOIssue {
    ruleId: string;
    message: string;
    severity: SEOSeverity;
    element?: string; // selector or description of the element
    url: string; // page where the issue was found
}

export interface SEOScore {
    total: number; // 0 to 100
    technical: number;
    content: number;
    mobile: number; // Placeholder for now
}

export interface RuleResult {
    ruleId: string;
    status: 'pass' | 'fail' | 'warn' | 'skip';
    scoreImpact: number; // How much this rule affects the score (negative)
    issues: SEOIssue[];
}

export interface SEORule {
    id: string;
    name: string;
    description: string;
    category: 'technical' | 'content' | 'meta';
    weight: number; // Importance (0-10)
    evaluate(page: PageResult, allPages?: Map<string, PageResult>): Promise<RuleResult>;
}

export interface AnalysisResult {
    url: string;
    crawlDuration: number;
    totalPages: number;
    score: SEOScore;
    results: RuleResult[];
    timestamp: Date;
}
