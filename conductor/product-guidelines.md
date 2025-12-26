# Product Guidelines

## Tone and Voice
- **Authoritative & Prescriptive:** Deliver clear, firm directives for critical technical issues. The tool should act as an expert auditor, telling the user exactly what "must" be fixed to meet professional standards.
- **Educational & Explanatory:** While being firm, always provide the "why" behind a rule. Use tooltips or expandable sections to explain the SEO impact of a specific error, bridging the gap between technical enforcement and user understanding.
- **Encouraging & Simple (Strategic):** Use this tone specifically for the high-level dashboard and "quick wins" sections to keep website owners motivated. Complex technical jargon should be simplified in summaries but available in full detail for deeper analysis.

## Visual Design & User Experience
- **Data-Dense & Analytical:** The core audit views must support high information density. Use compact tables, code snippet views (with syntax highlighting), and detailed charts to visualize data like crawl depth or keyword distribution.
- **Interactive & Dynamic:**
    - **Drill-Down Architecture:** Start with high-level scores and allow users to click through to see the specific lines of code or pages affecting that score.
    - **Real-Time Feedback:** When analyzing a specific page (especially via extension/overlay), show loading states and immediate results as checks complete.
    - **Collapsible Sections:** Manage the complexity by grouping related checks (e.g., "Meta Tags," "Performance," "Links") into collapsible accordions to avoid overwhelming the user initially.

## Coding Standards (Implicit)
- **Robust Error Handling:** Given the "strict" nature of the tool, the codebase must handle edge cases in crawling (e.g., timeouts, malformed HTML) gracefully without crashing.
- **Performance:** The analysis engine itself must be performant, ensuring that "deep" audits don't take an unreasonable amount of time.
