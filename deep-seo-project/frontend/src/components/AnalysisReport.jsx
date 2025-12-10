// frontend/src/components/AnalysisReport.jsx
import React from 'react';

// A small helper component for checklist items
const ReportItem = ({ status, title, children }) => {
    const statusColors = { good: '#28a745', warn: '#ffc107', bad: '#dc3545' };
    const statusIcons = { good: '✓', warn: '!', bad: '✗' };

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '5px', marginBottom: '1rem', padding: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <span style={{ color: statusColors[status], marginRight: '10px', fontSize: '24px' }}>{statusIcons[status]}</span>
                {title}
            </h3>
            <div style={{ marginLeft: '34px', paddingTop: '5px', color: '#555' }}>
                {children}
            </div>
        </div>
    );
};

const AnalysisReport = ({ reportData }) => {
    if (!reportData) return null;

    const { title, description, h1_count } = reportData.currentSeo;
    const { headings, images, word_count } = reportData.contentAnalysis;

    const titleStatus = title.length >= 10 && title.length <= 60 ? 'good' : 'warn';
    const descStatus = description.length >= 50 && description.length <= 160 ? 'good' : 'warn';
    const h1Status = h1_count === 1 ? 'good' : 'bad';
    const altTextStatus = images.every(img => img.alt) ? 'good' : 'warn';

    return (
        <div>
            <h2>Analysis Report for: <a href={reportData.url} target="_blank">{reportData.url}</a></h2>

            {/* --- META TAGS --- */}
            <ReportItem status={titleStatus} title="Title Tag">
                <p><strong>Content:</strong> "{title}"</p>
                <p>Length: {title.length} (Recommended: 10-60)</p>
            </ReportItem>

            <ReportItem status={descStatus} title="Meta Description">
                <p><strong>Content:</strong> "{description || 'Not Found'}"</p>
                <p>Length: {description.length} (Recommended: 50-160)</p>
            </ReportItem>

            {/* --- CONTENT STRUCTURE --- */}
            <ReportItem status={h1Status} title="H1 Heading">
                <p>Found {h1_count} &lt;h1&gt; tag(s). (Recommended: 1)</p>
                {headings.filter(h => h.tag === 'h1').map((h, i) => <p key={i}>- "{h.text}"</p>)}
            </ReportItem>

            <ReportItem status="good" title="Content">
                <p>Word Count: {word_count}</p>
                <p>Total Headings Found: {headings.length}</p>
            </ReportItem>

            {/* --- IMAGE SEO --- */}
            <ReportItem status={altTextStatus} title="Image Alt Texts">
                <p>Found {images.length} images.</p>
                <ul>
                    {images.map(img => (
                        <li key={img.selector} style={{ color: img.alt ? 'inherit' : 'red' }}>
                            <img src={img.src} alt="thumbnail" width="50" style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                            Alt Text: "{img.alt || 'MISSING!'}"
                        </li>
                    ))}
                </ul>
            </ReportItem>
        </div>
    );
};

export default AnalysisReport;
