// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { startNewCrawl } from '../services/api';
// We need a new function to get existing projects. Let's plan for that.
// import { getProjects } from '../services/api'; 

const HomePage = () => {
    const navigate = useNavigate();

    // This is a placeholder for where we will list existing projects
    const [projects, setProjects] = useState([]);
    const [url, setUrl] = useState('http://localhost:5500/index.html');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // useEffect(() => {
    //     // In the future, we will fetch projects here:
    //     // getProjects().then(response => setProjects(response.data));
    // }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await startNewCrawl(url);
            // After crawl is successful, navigate to the new project's page
            navigate(`/projects/${response.data.project.id}`);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message;
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
            <h1>DeepSEO Dashboard</h1>
            <h2>Start a New Project</h2>
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
                    {isLoading ? 'Crawling...' : 'Start New Project'}
                </button>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            </form>

            {/* <hr style={{margin: '2rem 0'}} />
            <h2>Existing Projects</h2>
            {projects.length > 0 ? (
                <ul>
                    {projects.map(p => <li key={p.id}><Link to={`/projects/${p.id}`}>{p.domain}</Link></li>)}
                </ul>
            ) : <p>No projects found. Start one above!</p>} */}
        </div>
    );
};

export default HomePage;
