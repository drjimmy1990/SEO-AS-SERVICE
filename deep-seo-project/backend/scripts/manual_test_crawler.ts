import { CrawlerService } from '../src/services/crawler/CrawlerService';

const runTest = async () => {
    // 1. Test basic single page crawl
    console.log('--- Test 1: Crawl single page (example.com) ---');
    const crawler = new CrawlerService({
        maxDepth: 1,
        maxPages: 5,
        timeout: 10000
    });

    try {
        const result = await crawler.crawl('https://marka.ps');
        console.log('Crawl Result for example.com:');
        console.log(`- Duration: ${result.duration}ms`);
        console.log(`- Pages Found: ${result.pages.size}`);
        console.log(`- All Result Keys: ${Array.from(result.pages.keys()).join(', ')}`); // Debugging keys
        console.log(`- Visited URLs: ${Array.from(result.visitedUrls).join(', ')}`);

        // Try to get by partial match or just first one
        const pageKeys = Array.from(result.pages.keys());
        if (pageKeys.length > 0) {
            const firstKey = pageKeys[0];
            const page = result.pages.get(firstKey);
            console.log(`- Inspecting First Page (${firstKey}):`);
            console.log(`  - Status Code: ${page?.statusCode}`);
            console.log(`  - Internal Links Found: ${page?.links.length}`);
            console.log(`  - External Links Found: ${page?.externalLinks.length}`);
            console.log(`  - Content Length: ${page?.content.length}`);
        }
    } catch (e) {
        console.error('Crawl failed:', e);
    }
};

runTest();
