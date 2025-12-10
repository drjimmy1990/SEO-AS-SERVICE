// frontend/src/components/ProjectStarter.jsx
import React, { useState } from 'react';
import { startNewCrawl, startPageAnalysis } from '../services/api';

const ProjectStarter = () => {
    const [url, setUrl] = useState('http://localhost:5500/index.html');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [analysisStatus, setAnalysisStatus] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        setAnalysisStatus({});

        try {
            const response = await startNewCrawl(url);
            setResult(response.data);
        } catch (err) {
            console.error("Crawl failed:", err);
            const errorMessage = err.response?.data?.error || err.message || "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzePage = async (pageId) => {
        setAnalysisStatus(prev => ({ ...prev, [pageId]: 'Analyzing...' }));
        try {
            const response = await startPageAnalysis(pageId);
            console.log('Analysis successful for page:', pageId, response.data);
            setAnalysisStatus(prev => ({ ...prev, [pageId]: '✓ Done' }));
        } catch (err) {
            console.error('Analysis failed for page:', pageId, err);
            setAnalysisStatus(prev => ({ ...prev, [pageId]: '✗ Error' }));
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
            <h1>Start a New SEO Project</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-website.com"
                    required
                    style={{ width: '100%', padding: '10px', fontSize: '16px', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={isLoading} style={{ marginTop: '1rem', padding: '10px 15px', fontSize: '16px' }}>
                    {isLoading ? 'Crawling...' : 'Start Crawl'}
                </button>
            </form>

            {error && (
                <div style={{ marginTop: '1rem', color: 'red', border: '1px solid red', padding: '1rem' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{ marginTop: '1rem', border: '1px solid green', padding: '1rem' }}>
                    <h2>Crawl Successful!</h2>
                    <p><strong>Project Domain:</strong> {result.project.domain}</p>
                    <p><strong>Pages Found:</strong> {result.pages.length}</p>
                    <h3>Discovered Pages:</h3>
                    <ul style={{ maxHeight: '200px', overflowY: 'auto', listStyle: 'none', padding: 0 }}>
                        {result.pages.map(page => (
                            <li key={page.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <a href={page.url} target="_blank" rel="noopener noreferrer">{page.url}</a>
                                <button onClick={() => handleAnalyzePage(page.id)} disabled={!!analysisStatus[page.id]}>
                                    {analysisStatus[page.id] || 'Analyze Page'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProjectStarter;
