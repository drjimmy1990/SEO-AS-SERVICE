import puppeteer from 'puppeteer';
// using 'puppeteer' not 'puppeteer-core' to see if it works better or helps locate chrome
import { executablePath } from 'puppeteer';

(async () => {
    console.log('--- Puppeteer Debug ---');
    try {
        const output = executablePath();
        console.log(`Executable Path: ${output}`);

        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: output,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('Browser launched successfully.');

        const page = await browser.newPage();
        console.log('Page created.');

        await page.goto('https://example.com');
        console.log('Navigated to example.com');

        await browser.close();
        console.log('Browser closed.');
    } catch (e) {
        console.error('Puppeteer Error:', e);
    }
})();
