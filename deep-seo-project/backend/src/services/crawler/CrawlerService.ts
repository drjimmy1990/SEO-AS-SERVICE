import puppeteer, { Browser, Page, executablePath } from 'puppeteer';
import { CrawlOptions, CrawlResult, PageResult } from './types';
import { normalizeUrl, isInternalLink, isValidUrl } from './utils';
import { URL } from 'url';

export class CrawlerService {
    private browser: Browser | null = null;
    private visitedUrls: Set<string> = new Set();
    private results: Map<string, PageResult> = new Map();
    private options: CrawlOptions;
    private baseDomain: string = '';

    constructor(options: CrawlOptions) {
        this.options = {
            maxPages: 100,
            timeout: 30000,
            waitAfterLoad: 1000,
            includeExternal: false,
            ...options
        };
    }

    public async crawl(startUrl: string): Promise<CrawlResult> {
        const startTime = new Date();
        this.visitedUrls.clear();
        this.results.clear();

        try {
            const urlObj = new URL(startUrl);
            this.baseDomain = urlObj.hostname;
        } catch (e) {
            throw new Error(`Invalid start URL: ${startUrl}`);
        }

        console.log(`Starting crawl of ${startUrl} with options:`, this.options);

        try {
            this.browser = await puppeteer.launch({
                headless: true,
                executablePath: executablePath(),
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            await this.crawlRecursive(startUrl, 0);

        } catch (error) {
            console.error('Fatal crawler error:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        }

        const endTime = new Date();

        // Debug: Log if empty
        if (this.results.size === 0) {
            console.warn("Crawler finished with 0 pages found. Visited:", Array.from(this.visitedUrls));
        }

        return {
            pages: this.results,
            visitedUrls: this.visitedUrls,
            startTime,
            endTime,
            duration: endTime.getTime() - startTime.getTime()
        };
    }

    private async crawlRecursive(url: string, depth: number): Promise<void> {
        const normalizedUrl = normalizeUrl(url);

        if (this.visitedUrls.has(normalizedUrl)) {
            return;
        }

        if (depth > this.options.maxDepth) {
            return;
        }

        if (this.options.maxPages && this.visitedUrls.size >= this.options.maxPages) {
            return;
        }

        this.visitedUrls.add(normalizedUrl);
        console.log(`Crawling ${normalizedUrl} (Depth: ${depth})`);

        const pageResult = await this.processPage(normalizedUrl);
        this.results.set(normalizedUrl, pageResult);

        if (pageResult.error) {
            return; // Stop if page failed to load
        }

        // Recurse
        const linksToCrawl = pageResult.links.filter(link => {
            // Only crawl internal links that haven't been visited
            return isInternalLink(link, this.baseDomain) && !this.visitedUrls.has(normalizeUrl(link));
        });

        for (const link of linksToCrawl) {
            await this.crawlRecursive(link, depth + 1);
        }
    }

    private async processPage(url: string): Promise<PageResult> {
        if (!this.browser) throw new Error('Browser not initialized');

        const page = await this.browser.newPage();
        const start = Date.now();

        const result: PageResult = {
            url,
            statusCode: 0,
            content: '',
            links: [],
            externalLinks: [],
            error: undefined,
            loadTime: 0
        };

        try {
            // Set user agent
            await page.setUserAgent('DeepSEO-Crawler/1.0 (+http://localhost:3000)');

            // Request interception to handle some errors gracefully or log them
            await page.setRequestInterception(false); // keep false for now, maybe enable for resource filtering later

            // Bypass LocalTunnel reminder page
            // We set headers on the page to ensure they are sent with the initial request
            await page.setExtraHTTPHeaders({
                'bypass-tunnel-reminder': 'true',
            });

            const response = await page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: this.options.timeout
            });

            if (response) {
                result.statusCode = response.status();
                if (!response.ok()) {
                    result.error = `HTTP Error ${response.status()}`;
                    // We might still want to parse content if it's a soft 404, but usually 404 page has no value for our analysis
                    // if it's 404, detailed content analysis might skip, but we record it.
                }
            } else {
                // File schemes or other cases might have no response
                result.error = 'No response received';
            }

            if (this.options.waitAfterLoad) {
                await new Promise(r => setTimeout(r, this.options.waitAfterLoad));
            }

            result.content = await page.content();

            // Extract links
            const links = await page.evaluate(() => {
                const anchorElements = Array.from(document.querySelectorAll('a'));
                return anchorElements.map(a => a.href).filter(href => !!href);
            });

            const uniqueLinks = new Set(links.filter(l => isValidUrl(l))); // internal check is done in parent

            // Categorize links
            for (const link of uniqueLinks) {
                if (isInternalLink(link, this.baseDomain)) {
                    result.links.push(link);
                } else {
                    result.externalLinks.push(link);
                }
            }

        } catch (err: any) {
            result.error = err.message || 'Unknown error';
            console.error(`Error processing ${url}:`, err.message);
        } finally {
            result.loadTime = Date.now() - start;
            await page.close();
        }

        return result;
    }
}
