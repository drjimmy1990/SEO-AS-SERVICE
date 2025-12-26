import React, { useState } from 'react';
import { getAiSuggestions } from '../services/api';

const AiRecommendations = ({ reportId }) => {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGetSuggestions = async () => {
        if (!reportId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAiSuggestions(reportId);
            // The response.data should be the JSON object returned by n8n
            console.log("AI Response:", response.data);
            setSuggestions(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to get AI suggestions.');
        } finally {
            setLoading(false);
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
                            <ul>
                                {suggestions.title_suggestions.map((title, idx) => (
                                    <li key={idx}>{title}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {suggestions.description_suggestions && (
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Suggested Descriptions:</strong>
                            <ul>
                                {suggestions.description_suggestions.map((desc, idx) => (
                                    <li key={idx}>{desc}</li>
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

                    {suggestions.image_alt_recommendations && suggestions.image_alt_recommendations.length > 0 && (
                        <div>
                            <strong>Image Alt Text Suggestions:</strong>
                            <ul>
                                {suggestions.image_alt_recommendations.map((img, idx) => (
                                    <li key={idx}>
                                        <code>{img.selector}</code>: {img.suggested_alt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiRecommendations;
