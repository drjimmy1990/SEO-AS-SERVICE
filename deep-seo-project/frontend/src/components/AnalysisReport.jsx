// frontend/src/components/AnalysisReport.jsx
import React, { useState } from 'react';
import { getAiSuggestions } from '../services/api';

const ReportItem = ({ status, title, children }) => {
    const statusColors = { good: '#28a745', warn: '#ffc107', bad: '#dc3545', info: '#17a2b8' };
    const statusIcons = { good: '✓', warn: '!', bad: '✗', info: 'i' };

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '5px', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', color: '#333' }}>
                <span style={{ color: statusColors[status], marginRight: '10px', fontSize: '24px', fontWeight: 'bold' }}>{statusIcons[status]}</span>
                {title}
            </h3>
            <div style={{ marginLeft: '34px', paddingTop: '10px', color: '#555' }}>
                {children}
            </div>
        </div>
    );
};

const SuggestionButton = ({ onClick, isLoading, children }) => (
    <button onClick={onClick} disabled={isLoading} style={{ marginLeft: '10px', fontSize: '12px', cursor: 'pointer' }}>
        {isLoading ? 'Thinking...' : children}
    </button>
);

const AnalysisReport = ({ report }) => { // Renamed prop to 'report' for clarity
    if (!report) return null;

    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGetSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await getAiSuggestions(report.id); // We need the report ID
            setSuggestions(response.data);
        } catch (err) {
            alert('Failed to get AI suggestions.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const { report_data: reportData } = report; // The data is nested in the report object
    const { title, description, h1_count } = reportData.currentSeo;
    const { headings, images, word_count } = reportData.contentAnalysis;
    const recommendations = reportData.recommendations || [];
    const score = reportData.seoScore || 0;

    let scoreColor = '#dc3545';
    if (score >= 80) scoreColor = '#28a745';
    else if (score >= 50) scoreColor = '#ffc107';

    // ... (All the status logic remains the same) ...
    const titleStatus = title.length >= 10 && title.length <= 60 ? 'good' : 'warn';
    const descStatus = description.length >= 50 && description.length <= 160 ? 'good' : 'warn';
    const h1Status = h1_count === 1 ? 'good' : 'bad';
    const altTextStatus = images.every(img => img.alt) ? 'good' : 'warn';

    return (
        <div>
            {/* --- HEADER & SCORE --- */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ marginTop: 0, color: '#333' }}>SEO Score</h2>
                    <SuggestionButton onClick={handleGetSuggestions} isLoading={isLoading}>
                        ✨ Get AI Suggestions
                    </SuggestionButton>
                </div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: scoreColor }}>
                    {score} / 100
                </div>
                <p>Analyzed URL: <a href={reportData.url} target="_blank" rel="noopener noreferrer">{reportData.url}</a></p>
            </div>

            {/* --- RECOMMENDATIONS SECTION --- */}
            {recommendations.length > 0 && (
                <div style={{ marginBottom: '2rem', backgroundColor: '#fff3cd', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ffeeba' }}>
                    <h3 style={{ marginTop: 0, color: '#856404' }}>🚀 Actionable Recommendations</h3>
                    <ul style={{ paddingLeft: '20px', color: '#856404' }}>
                        {recommendations.map((rec, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* --- META TAGS --- */}
            <ReportItem status={titleStatus} title="Title Tag">
                <p><strong>Current:</strong> "{title}"</p>
                <p>Length: {title.length} chars</p>
                {suggestions?.titles && (
                    <div style={{ marginTop: '10px', backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '5px' }}>
                        <strong>💡 AI Suggestions:</strong>
                        <ul style={{ marginTop: '5px' }}>
                            {suggestions.titles.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>"{s}"</li>)}
                        </ul>
                    </div>
                )}
            </ReportItem>

            <ReportItem status={descStatus} title="Meta Description">
                <p><strong>Current:</strong> "{description || 'Not Found'}"</p>
                <p>Length: {description.length} chars</p>
                {suggestions?.descriptions && (
                    <div style={{ marginTop: '10px', backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '5px' }}>
                        <strong>💡 AI Suggestions:</strong>
                        <ul style={{ marginTop: '5px' }}>
                            {suggestions.descriptions.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>"{s}"</li>)}
                        </ul>
                    </div>
                )}
            </ReportItem>

            {/* --- CONTENT STRUCTURE --- */}
            <ReportItem status={h1Status} title="H1 Heading">
                <p>Found {h1_count} &lt;h1&gt; tag(s).</p>
                {headings.filter(h => h.tag === 'h1').map((h, i) => <p key={i} style={{ fontStyle: 'italic' }}>- "{h.text}"</p>)}
            </ReportItem>

            {/* --- IMAGE SEO --- */}
            <ReportItem status={altTextStatus} title="Image Alt Texts">
                <ul>
                    {images.map(img => {
                        const suggestion = suggestions?.alt_texts?.find(s => s.selector === img.selector)?.suggestion;
                        return (
                            <li key={img.selector} style={{ color: img.alt ? 'inherit' : 'red', marginBottom: '10px' }}>
                                <img src={img.src} alt="thumbnail" width="50" style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                                <strong>Current Alt:</strong> "{img.alt || 'MISSING!'}"
                                {suggestion && (
                                    <div style={{ color: '#0056b3', marginLeft: '60px', marginTop: '5px' }}>
                                        <strong>💡 Suggestion:</strong> "{suggestion}"
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </ReportItem>
        </div>
    );
};

export default AnalysisReport;
