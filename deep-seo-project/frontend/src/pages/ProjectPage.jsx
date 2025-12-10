// frontend/src/pages/ProjectPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPagesByProjectId, startPageAnalysis } from '../services/api';
import AnalysisReport from '../components/AnalysisReport';

const ProjectPage = () => {
    const { projectId } = useParams();
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPagesByProjectId(projectId);
            setPages(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch project pages.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const handleAnalyzePage = async (pageId) => {
        try {
            await startPageAnalysis(pageId);
            // After analysis, refresh the data to get the new report
            fetchPages();
        } catch (err) {
            alert('Analysis failed. Please check the console.');
        }
    };

    if (loading) return <p>Loading project pages...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
            {/* Left Sidebar: Page List */}
            <div style={{ width: '400px', borderRight: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}>
                <a href="/">&larr; Back to Dashboard</a>
                <h2>Project Pages</h2>
                {pages.map(page => (
                    <div
                        key={page.id}
                        onClick={() => setSelectedPage(page)}
                        style={{
                            padding: '10px',
                            margin: '5px 0',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            backgroundColor: selectedPage?.id === page.id ? '#e0f7fa' : '#f4f4f4'
                        }}
                    >
                        <p style={{ margin: 0, wordBreak: 'break-all' }}>{page.url}</p>
                        <small>{page.latest_report ? `Last analyzed: ${new Date(page.last_analyzed_at).toLocaleString()}` : 'Not analyzed yet'}</small>
                    </div>
                ))}
            </div>

            {/* Right Panel: Analysis View */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                {selectedPage ? (
                    <div>
                        {!selectedPage.latest_report && (
                            <div style={{ padding: '1rem', border: '1px solid orange', marginBottom: '1rem' }}>
                                <p>This page has not been analyzed yet.</p>
                                <button onClick={() => handleAnalyzePage(selectedPage.id)}>Analyze Now</button>
                            </div>
                        )}
                        {selectedPage.latest_report && (
                            <AnalysisReport reportData={selectedPage.latest_report.report_data} />
                        )}
                    </div>
                ) : (
                    <p>Select a page from the left to view its analysis.</p>
                )}
            </div>
        </div>
    );
};

export default ProjectPage;
