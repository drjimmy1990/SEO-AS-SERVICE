export interface CrawlOptions {
    maxDepth: number;
    maxPages?: number;
    timeout?: number;
    waitAfterLoad?: number;
    includeExternal?: boolean; // if true, will crawl external links (usually false for SEO)
    allowedDomains?: string[]; // if set, only crawl links within these domains
}

export interface PageResult {
    url: string;
    statusCode: number;
    content: string; // HTML content
    links: string[];
    externalLinks: string[];
    error?: string;
    loadTime?: number;
}

export interface CrawlResult {
    pages: Map<string, PageResult>; // URL -> PageResult
    visitedUrls: Set<string>;
    startTime: Date;
    endTime: Date;
    duration: number; // in ms
}
