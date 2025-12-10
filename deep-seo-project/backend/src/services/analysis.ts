// backend/src/services/analysis.ts

import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper to generate a simple selector for Cheerio elements
const getSelector = (el: any): string => {
    if (!el || !el.tagName) return '';
    let selector = el.tagName;
    if (el.attribs && el.attribs.id) {
        selector += `#${el.attribs.id}`;
    } else if (el.attribs && el.attribs.class) {
        selector += `.${el.attribs.class.split(/\s+/).join('.')}`;
    }
    return selector;
};

/**
 * Performs a deep SEO analysis on the HTML content of a given URL.
 * @param url The URL of the page to analyze.
 * @returns A Promise that resolves to a detailed analysis report object.
 */
export const analyzePage = async (url: string) => {
    console.log(`Analyzing page: ${url}`);

    // --- Step 1: Fetch the HTML ---
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    // --- Step 2: Perform Deep Analysis using Cheerio ---

    // Basic Meta Tags
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || '';

    // Headings Analysis
    const headings: { tag: string, text: string }[] = [];
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
        headings.push({
            tag: $(el).prop('tagName').toLowerCase(),
            text: $(el).text().trim()
        });
    });
    const h1_count = $('h1').length;

    // Image Analysis
    const images: { selector: string, src: string | undefined, alt: string }[] = [];
    $('img').each((i, el) => {
        try {
            const selector = getSelector(el);
            images.push({
                selector: selector,
                src: $(el).attr('src'),
                alt: $(el).attr('alt')?.trim() || '',
            });
        } catch (error) {
            console.warn("Could not generate selector for an image element.");
        }
    });

    // Link Analysis
    const links = { internal: 0, external: 0, nofollow: 0 };
    const currentDomain = new URL(url).hostname;
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
            try {
                const linkUrl = new URL(href, url);
                if (linkUrl.protocol.startsWith('http')) { // Only count http/https links
                    if (linkUrl.hostname === currentDomain) {
                        links.internal++;
                    } else {
                        links.external++;
                    }
                }
            } catch (e) {
                // Ignore invalid URLs like mailto:
            }
        }
        if ($(el).attr('rel')?.includes('nofollow')) {
            links.nofollow++;
        }
    });

    // Text Content for AI
    let full_text_content = '';
    $('p, li, span, h1, h2, h3, h4, h5, h6').each((i, el) => {
        full_text_content += $(el).text().trim() + ' ';
    });
    const word_count = full_text_content.split(/\s+/).filter(Boolean).length;

    // --- Step 3: Compile and Return the Report ---
    const report = {
        url,
        currentSeo: {
            title,
            description,
            h1_count,
        },
        contentAnalysis: {
            headings,
            images,
            links,
            word_count,
            full_text_content,
        }
    };

    console.log(`Analysis complete for: ${url}`);
    return report;
};
