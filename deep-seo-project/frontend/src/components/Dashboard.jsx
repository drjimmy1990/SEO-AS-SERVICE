import React, { useState } from 'react';
import { startPageAnalysis } from '../services/api';
import AiRecommendations from './AiRecommendations';

const Dashboard = () => {
    const [url, setUrl] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            // Updated to pass URL directly based on Backend logic
            const response = await startPageAnalysis(url);
            setAnalysisResult(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Analysis failed. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>DeepSEO Analyzer</h1>

            <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="url"
                    placeholder="Enter URL (e.g., https://example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    style={{ flex: 1, padding: '10px', fontSize: '16px' }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {loading ? 'Analyzing...' : 'Analyze'}
                </button>
            </form>

            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

            {analysisResult && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                        <div style={statStyle}>
                            <h3>{analysisResult.score?.total ?? 'N/A'}</h3>
                            <p>Total Score</p>
                        </div>
                        <div style={statStyle}>
                            <h3>{analysisResult.score?.technical ?? 'N/A'}</h3>
                            <p>Technical</p>
                        </div>
                        <div style={statStyle}>
                            <h3>{analysisResult.score?.content ?? 'N/A'}</h3>
                            <p>Content</p>
                        </div>
                        <div style={statStyle}>
                            <h3>{analysisResult.score?.mobile ?? 'N/A'}</h3>
                            <p>Mobile</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h2>Analysis Results</h2>
                        {analysisResult.results?.map((rule, index) => (
                            <div key={index} style={{
                                border: '1px solid #eee',
                                padding: '15px',
                                marginBottom: '10px',
                                borderRadius: '5px',
                                borderLeft: `5px solid ${getStatusColor(rule.status)}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong>{rule.ruleId}</strong>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: getStatusColor(rule.status),
                                        color: 'white',
                                        fontSize: '12px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {rule.status}
                                    </span>
                                </div>
                                {rule.issues.length > 0 ? (
                                    <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                        {rule.issues.map((issue, i) => (
                                            <li key={i}>{issue.message}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ color: 'green', margin: '5px 0 0 0', fontSize: '14px' }}>Passed</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <AiRecommendations reportId={analysisResult.reportId} />
                </div>
            )}
        </div>
    );
};

const statStyle = {
    background: '#f8f9fa',
    padding: '15px',
    textAlign: 'center',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
};

const getStatusColor = (status) => {
    switch (status) {
        case 'pass': return '#28a745';
        case 'fail': return '#dc3545';
        case 'warn': return '#ffc107';
        default: return '#6c757d';
    }
};

export default Dashboard;
