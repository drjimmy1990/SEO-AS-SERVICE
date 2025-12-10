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

const generateRecommendations = (data: any) => {
    const recs: string[] = [];
    let score = 100;

    // Title Analysis
    const titleLen = data.currentSeo.title.length;
    if (titleLen === 0) {
        recs.push("CRITICAL: Add a <title> tag to your page.");
        score -= 20;
    } else if (titleLen < 10) {
        recs.push("Improvement: Your title is too short. Aim for 50-60 characters for better visibility.");
        score -= 5;
    } else if (titleLen > 60) {
        recs.push("Improvement: Your title is too long. Google may truncate it. Aim for under 60 characters.");
        score -= 5;
    }

    // Description Analysis
    const descLen = data.currentSeo.description.length;
    if (descLen === 0) {
        recs.push("CRITICAL: Add a meta description. This is crucial for click-through rates.");
        score -= 20;
    } else if (descLen < 50) {
        recs.push("Improvement: Your meta description is too short. Elaborate to entice users (aim for 150-160 chars).");
        score -= 5;
    } else if (descLen > 160) {
        recs.push("Improvement: Your meta description is too long. Keep it under 160 characters to prevent truncation.");
        score -= 5;
    }

    // H1 Analysis
    if (data.currentSeo.h1_count === 0) {
        recs.push("CRITICAL: You are missing an <h1> tag. Every page needs exactly one main heading.");
        score -= 20;
    } else if (data.currentSeo.h1_count > 1) {
        recs.push(`Warning: You have ${data.currentSeo.h1_count} <h1> tags. Use only one <h1> per page to clearly signal the main topic.`);
        score -= 10;
    }

    // Image Analysis
    const missingAlt = data.contentAnalysis.images.filter((img: any) => !img.alt).length;
    if (missingAlt > 0) {
        recs.push(`Fix: You have ${missingAlt} images missing 'alt' text. Add descriptive alt text for accessibility and SEO.`);
        score -= (missingAlt * 2);
    }

    // Word Count
    if (data.contentAnalysis.word_count < 200) {
        recs.push("Content: Your page has very little text. 'Thin content' can hurt rankings. Aim for at least 300 words.");
        score -= 10;
    }

    return { recs, score: Math.max(0, score) };
};

export const analyzePage = async (url: string) => {
    console.log(`Analyzing page: ${url}`);

    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || '';

    const headings: { tag: string, text: string }[] = [];
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
        headings.push({
            tag: $(el).prop('tagName').toLowerCase(),
            text: $(el).text().trim()
        });
    });
    const h1_count = $('h1').length;

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

    const links = { internal: 0, external: 0, nofollow: 0 };
    const currentDomain = new URL(url).hostname;
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
            try {
                const linkUrl = new URL(href, url);
                if (linkUrl.protocol.startsWith('http')) {
                    if (linkUrl.hostname === currentDomain) {
                        links.internal++;
                    } else {
                        links.external++;
                    }
                }
            } catch (e) { }
        }
        if ($(el).attr('rel')?.includes('nofollow')) {
            links.nofollow++;
        }
    });

    let full_text_content = '';
    $('p, li, span, h1, h2, h3, h4, h5, h6').each((i, el) => {
        full_text_content += $(el).text().trim() + ' ';
    });
    const word_count = full_text_content.split(/\s+/).filter(Boolean).length;

    const partialReport = {
        url,
        currentSeo: { title, description, h1_count },
        contentAnalysis: { headings, images, links, word_count, full_text_content }
    };

    // NEW: Generate recommendations based on the data
    const { recs, score } = generateRecommendations(partialReport);

    const finalReport = {
        ...partialReport,
        seoScore: score,
        recommendations: recs
    };

    console.log(`Analysis complete for: ${url} (Score: ${score})`);
    return finalReport;
};
