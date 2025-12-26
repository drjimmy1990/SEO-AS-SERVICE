import React, { useState } from 'react';
import { getAiSuggestions, saveLiveSettings } from '../services/api';

const AiRecommendations = ({ reportId, pageId }) => {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGetSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAiSuggestions(reportId);
            // The n8n webhook returns the suggestions object directly (e.g. { title_suggestions: [...] })
            setSuggestions(response.data);
        } catch (err) {
            console.error('AI Error:', err);
            setError('Failed to get suggestions. ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const [applied, setApplied] = useState({});

    const handleApplyFix = async (type, content, idx) => {
        if (!pageId) {
            alert("Error: Page ID not found. Cannot save settings.");
            return;
        }

        const settings = {};
        if (type === 'title') settings.title = content;
        if (type === 'description') settings.description = content;
        if (type === 'h1') settings.h1 = content;

        try {
            await saveLiveSettings(pageId, settings);
            setApplied({ ...applied, [`${type}-${idx}`]: true });
            // Optional: alert removed to be less intrusive, or kept as secondary confirmation
            // alert(`Success! ${type} updated.`); 
        } catch (err) {
            console.error(err);
            alert("Failed to save settings.");
        }
    };

    if (!reportId) return null;

    return (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9faf' }}>
            <h3>AI Recommendations (Powered by Gemini & n8n)</h3>

            {!suggestions && !loading && (
                <button
                    onClick={handleGetSuggestions}
                    style={{ padding: '10px 20px', fontSize: '16px', background: '#6200ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Get AI Recommendations
                </button>
            )}

            {loading && <p>Thinking... (This may take a few seconds)</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {suggestions && (
                <div style={{ marginTop: '15px' }}>
                    {suggestions.title_suggestions && (
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Suggested Titles:</strong>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {suggestions.title_suggestions.map((title, idx) => (
                                    <li key={idx} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>{title}</span>
                                        <button
                                            onClick={() => handleApplyFix('title', title)}
                                            style={{ padding: '2px 8px', fontSize: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Apply
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {suggestions.description_suggestions && (
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Suggested Descriptions:</strong>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {suggestions.description_suggestions.map((desc, idx) => (
                                    <li key={idx} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>{desc}</span>
                                        <button
                                            onClick={() => handleApplyFix('description', desc)}
                                            style={{ padding: '2px 8px', fontSize: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Apply
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {suggestions.h1_recommendations && (
                        <div style={{ marginBottom: '15px' }}>
                            <strong>H1 Recommendation:</strong>
                            <p>{suggestions.h1_recommendations}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiRecommendations;
