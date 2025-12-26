# Track Spec: Core SEO Analysis Engine

## Overview
This track focuses on building the foundational analysis engine for the Deep SEO Project. It includes the crawling infrastructure and the core logic for evaluating websites against professional SEO standards.

## Objectives
- Develop a robust recursive crawler using Puppeteer.
- Implement a script-detection service to identify pages with a specific tracking script.
- Build a rule engine for "strict" SEO analysis covering technical health, content, and meta tags.

## Core Features
1. **Recursive Crawler (Puppeteer):**
    - Configurable depth and concurrency.
    - Handling of redirects, 404s, and timeouts.
2. **Analysis Services:**
    - **Technical Health:** Core Web Vitals (simulated or via Lighthouse), Robots.txt, Sitemap.xml.
    - **Content Analysis:** H1-H6 hierarchy, Image Alt text, Semantic relevance.
    - **Meta Tags:** Titles, Descriptions, Keywords, OG tags, Schema.org.
3. **Script-Detection Service:**
    - Ability to filter a crawl based on the presence of a specific `<script src="...">` tag.

## Technical Requirements
- Integration with Supabase for storing crawl results.
- High error tolerance for malformed HTML.
- Modular rule system for easy expansion of SEO criteria.
