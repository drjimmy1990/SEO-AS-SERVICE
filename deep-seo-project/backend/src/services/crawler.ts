// backend/src/services/crawler.ts

import puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer';

/**
 * Crawls a website starting from a given URL to find all unique internal links.
 * This is a simple crawler and will not crawl pages linked from JavaScript, only href attributes.
 * @param startUrl The full URL to begin crawling from (e.g., 'https://example.com').
 * @returns A Promise that resolves to an array of unique internal URLs found.
 */
export const crawlWebsite = async (startUrl: string): Promise<string[]> => {
    const visitedUrls = new Set<string>();
    const urlsToVisit: string[] = [startUrl];
    const internalLinks = new Set<string>();

    const startUrlObject = new URL(startUrl);
    const baseDomain = startUrlObject.hostname; // The one true constant, e.g., 'localhost' or 'example.com'

    console.log(`Starting crawl at: ${startUrl}`);
    console.log(`Base domain set to: ${baseDomain}`);

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: executablePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    while (urlsToVisit.length > 0) {
        const currentUrl = urlsToVisit.shift()!;
        const currentUrlCleaned = currentUrl.split('#')[0].replace(/\/$/, '');

        if (visitedUrls.has(currentUrlCleaned)) {
            continue;
        }

        try {
            console.log(`Crawling: ${currentUrlCleaned}`);
            visitedUrls.add(currentUrlCleaned);

            await page.goto(currentUrlCleaned, { waitUntil: 'networkidle2', timeout: 30000 });

            // Evaluate code in the browser's context to find all links
            const linksOnPage = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a')).map(a => a.href);
            });

            // Process the links found on the page
            for (const link of linksOnPage) {
                if (!link) continue; // Skip empty href attributes

                const cleanedLink = link.split('#')[0].replace(/\/$/, '');

                try {
                    const linkUrlObject = new URL(cleanedLink);

                    // The CRITICAL check: Is the link on the same domain?
                    if (linkUrlObject.hostname === baseDomain) {
                        if (!internalLinks.has(cleanedLink)) {
                            internalLinks.add(cleanedLink);
                            urlsToVisit.push(cleanedLink);
                        }
                    }
                } catch (e) {
                    // This can happen for invalid URLs like "mailto:" or "javascript:void(0)"
                    // We can safely ignore these for our purposes.
                    // console.warn(`Could not parse link: ${link}`);
                }
            }

        } catch (error: any) {
            console.error(`Failed to crawl ${currentUrlCleaned}: ${error.message}`);
        }
    }

    await browser.close();

    // Ensure the starting URL is included in the final set
    internalLinks.add(startUrl.split('#')[0].replace(/\/$/, ''));

    console.log(`Crawl finished. Found ${internalLinks.size} unique internal links.`);
    return Array.from(internalLinks);
};
