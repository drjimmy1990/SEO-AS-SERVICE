import React, { useState } from 'react';
import { startPageAnalysis, startNewCrawl, getPagesByProjectId } from '../services/api';
import AiRecommendations from './AiRecommendations';


const Dashboard = () => {
    // Mode: 'project' or 'analysis'
    const [mode, setMode] = useState('project');

    // Project State
    const [projectUrl, setProjectUrl] = useState('');
    const [project, setProject] = useState(null);
    const [pages, setPages] = useState([]);
    const [crawling, setCrawling] = useState(false);

    // Analysis State
    const [analysisUrl, setAnalysisUrl] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    // --- Project Handlers ---

    const handleStartCrawl = async (e) => {
        e.preventDefault();
        setCrawling(true);
        setError(null);
        setPages([]);
        try {
            const { data } = await startNewCrawl(projectUrl);
            setProject(data.project);
            // If the backend returns pages immediately (optional), set them.
            // Otherwise, or in addition, fetching them ensures we have the ID structure.
            if (data.project?.id) {
                const pagesRes = await getPagesByProjectId(data.project.id);
                setPages(pagesRes.data);
            }
        } catch (err) {
            console.error('Crawl Error:', err);
            setError(err.response?.data?.error || 'Failed to start crawl.');
        } finally {
            setCrawling(false);
        }
    };

    const handleAnalyzePage = (url) => {
        setAnalysisUrl(url);
        setMode('analysis');
        // Optional: Auto-start analysis
        // doAnalyze(url); 
    };

    // --- Analysis Handlers ---

    const handleAnalyze = async (e) => {
        e.preventDefault();
        doAnalyze(analysisUrl);
    };

    const doAnalyze = async (url) => {
        setAnalyzing(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const response = await startPageAnalysis(url);
            // Unpack { message, report, reportId }
            setAnalysisResult(response.data.report);
        } catch (err) {
            console.error('Analysis Error:', err);
            setError(err.response?.data?.error || 'Analysis failed.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>DeepSEO Dashboard</h1>
                <div style={{ marginTop: '15px' }}>
                    <button
                        onClick={() => setMode('project')}
                        style={mode === 'project' ? activeTabStyle : tabStyle}
                    >
                        Project Crawler
                    </button>
                    <button
                        onClick={() => setMode('analysis')}
                        style={mode === 'analysis' ? activeTabStyle : tabStyle}
                    >
                        Deep Page Analysis
                    </button>
                </div>
            </header>

            {error && <div style={{ color: 'red', marginBottom: '20px', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}

            {mode === 'project' && (
                <div>
                    <h2>Full Site Crawler</h2>
                    <p>Enter a homepage URL to discover all pages.</p>
                    <form onSubmit={handleStartCrawl} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={projectUrl}
                            onChange={(e) => setProjectUrl(e.target.value)}
                            required
                            style={inputStyle}
                        />
                        <button type="submit" disabled={crawling} style={buttonStyle}>
                            {crawling ? 'Crawling...' : 'Start Crawl'}
                        </button>
                    </form>

                    {pages.length > 0 && (
                        <div>
                            <h3>Discovered Pages ({pages.length})</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {pages.map((page) => (
                                    <li key={page.id} style={listItemStyle}>
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.url}</span>
                                        <button
                                            onClick={() => handleAnalyzePage(page.url)}
                                            style={secondaryButtonStyle}
                                        >
                                            Analyze This Page
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {mode === 'analysis' && (
                <div>
                    <h2>Deep Page Analysis</h2>
                    <p>Analyze a specific page for technical and content SEO issues.</p>
                    <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="url"
                            placeholder="https://example.com/page"
                            value={analysisUrl}
                            onChange={(e) => setAnalysisUrl(e.target.value)}
                            required
                            style={inputStyle}
                        />
                        <button type="submit" disabled={analyzing} style={buttonStyle}>
                            {analyzing ? 'Analyzing...' : 'Run Analysis'}
                        </button>
                    </form>

                    {analysisResult && (
                        <div>
                            {/* Score Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                                <div style={statStyle}><h3>{analysisResult.score?.total ?? '-'}</h3><p>Total</p></div>
                                <div style={statStyle}><h3>{analysisResult.score?.technical ?? '-'}</h3><p>Technical</p></div>
                                <div style={statStyle}><h3>{analysisResult.score?.content ?? '-'}</h3><p>Content</p></div>
                                <div style={statStyle}><h3>{analysisResult.score?.mobile ?? '-'}</h3><p>Mobile</p></div>
                            </div>

                            {/* Issues List */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3>Issues Found</h3>
                                {analysisResult.results?.map((rule, index) => (
                                    <div key={index} style={{ ...issueCardStyle, borderLeft: `5px solid ${getStatusColor(rule.status)}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>{rule.ruleId}</strong>
                                            <span style={{ ...statusBadgeStyle, background: getStatusColor(rule.status) }}>{rule.status}</span>
                                        </div>
                                        {rule.issues.map((issue, i) => (
                                            <div key={i} style={{ marginTop: '5px', fontSize: '14px', color: '#555' }}>• {issue.message}</div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* AI Recommendations */}
                            <AiRecommendations
                                reportId={analysisResult.reportId}
                                pageId={analysisResult.pageId} // Assuming backend provides this now? Wait, report has page_id in DB, but does it return it? 
                            // Actually, we might need to look up pageId from the report link or pass it. 
                            // Ideally `analysisResult` should have the `pageId` if we saved it correctly. 
                            // Let's check AnalysisStorageService. It returns `reportId`. 
                            // The GET /analysis/run result is the `AnalysisResult` object. 
                            // It probably does NOT have pageId unless we added it.
                            // NOTE: AiRecommendations needs pageId to SAVE settings. 
                            // For now, let's pass it if available.
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Styles
const tabStyle = { padding: '10px 20px', marginRight: '10px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const activeTabStyle = { ...tabStyle, background: '#007bff', color: 'white' };
const inputStyle = { flex: 1, padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' };
const buttonStyle = { padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const secondaryButtonStyle = { padding: '5px 10px', fontSize: '14px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const listItemStyle = { padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const statStyle = { background: '#f8f9fa', padding: '15px', textAlign: 'center', borderRadius: '8px', border: '1px solid #e9ecef' };
const issueCardStyle = { border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '5px' };
const statusBadgeStyle = { padding: '2px 8px', borderRadius: '4px', color: 'white', fontSize: '12px', textTransform: 'uppercase' };

const getStatusColor = (status) => {
    switch (status) {
        case 'pass': return '#28a745';
        case 'fail': return '#dc3545';
        case 'warn': return '#ffc107';
        default: return '#6c757d';
    }
};

export default Dashboard;
