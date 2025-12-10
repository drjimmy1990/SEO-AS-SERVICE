import React, { useState } from 'react';
import { getAiSuggestions } from '../services/api';

const ReportItem = ({ status, title, children }) => {
    const statusColors = { good: '#28a745', warn: '#ffc107', bad: '#dc3545' };
    const statusIcons = { good: '✓', warn: '!', bad: '✗' };
    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '5px', marginBottom: '1rem', padding: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <span style={{ color: statusColors[status], marginRight: '10px', fontSize: '24px' }}>{statusIcons[status]}</span>
                {title}
            </h3>
            <div style={{ marginLeft: '34px', paddingTop: '5px', color: '#555' }}>{children}</div>
        </div>
    );
};

const SuggestionBox = ({ title, children }) => (
    <div style={{ border: '1px solid #007bff', backgroundColor: '#f0f8ff', borderRadius: '5px', padding: '10px', marginTop: '10px' }}>
        <strong style={{ color: '#0056b3' }}>✨ AI Suggestion: {title}</strong>
        <div style={{ marginTop: '5px' }}>{children}</div>
    </div>
);

const AnalysisReport = ({ report }) => {
    if (!report) return null;

    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGetSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await getAiSuggestions(report.id);
            setSuggestions(response.data);
        } catch (err) {
            alert('Failed to get AI suggestions.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const { report_data: reportData } = report;
    const { title, description, h1_count } = reportData.currentSeo;
    const { headings, images, word_count } = reportData.contentAnalysis;

    const titleStatus = title.length >= 10 && title.length <= 60 ? 'good' : 'warn';
    const descStatus = description.length >= 50 && description.length <= 160 ? 'good' : 'warn';
    const h1Status = h1_count === 1 ? 'good' : 'bad';
    const altTextStatus = images.every(img => img.alt && img.alt.length > 5) ? 'good' : 'warn';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <h2>Report for: <a href={reportData.url} target="_blank">{reportData.url}</a></h2>
                <button onClick={handleGetSuggestions} disabled={isLoading} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                    {isLoading ? '🤖 Thinking...' : '✨ Get AI Recommendations'}
                </button>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <ReportItem status={titleStatus} title="Title Tag">
                    <p><strong>Current:</strong> "{title}"</p>
                    {suggestions?.title_suggestions && (
                        <SuggestionBox title="New Titles">
                            <ul>{suggestions.title_suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </SuggestionBox>
                    )}
                </ReportItem>

                <ReportItem status={descStatus} title="Meta Description">
                    <p><strong>Current:</strong> "{description || 'Not Found'}"</p>
                    {suggestions?.description_suggestions && (
                        <SuggestionBox title="New Descriptions">
                            <ul>{suggestions.description_suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </SuggestionBox>
                    )}
                </ReportItem>

                <ReportItem status={h1Status} title="H1 Heading">
                    <p>Found {h1_count} &lt;h1&gt; tag(s). (Recommended: 1)</p>
                    {headings.filter(h => h.tag === 'h1').map((h, i) => <p key={i}>- "{h.text}"</p>)}
                    {suggestions?.h1_recommendations && (
                        <SuggestionBox title="How to Fix">
                            <p>{suggestions.h1_recommendations}</p>
                        </SuggestionBox>
                    )}
                </ReportItem>

                <ReportItem status={altTextStatus} title="Image Alt Texts">
                    <ul>
                        {images.map(img => {
                            const recommendation = suggestions?.image_alt_recommendations?.find(rec => rec.selector === img.selector);
                            return (
                                <li key={img.selector} style={{ marginBottom: '10px' }}>
                                    <img src={img.src} alt="thumbnail" width="50" style={{ verticalAlign: 'middle', marginRight: '10px', border: '1px solid #ccc' }} />
                                    <strong>Current Alt:</strong> <span style={{ color: !img.alt || img.alt.length < 5 ? 'red' : 'inherit' }}>"{img.alt || 'MISSING!'}"</span>
                                    {recommendation && (
                                        <SuggestionBox title="New Alt Text">
                                            <p>"{recommendation.suggested_alt}"</p>
                                        </SuggestionBox>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </ReportItem>
            </div>
        </div>
    );
};

export default AnalysisReport;
