// frontend/src/services/api.js
import axios from 'axios';

// Create an Axios instance with a base URL.
// All requests made with this instance will be prefixed with this URL.
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api', // Points to our backend
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * A function to start the crawl process for a new project.
 * @param {string} homepage_url The URL of the website's homepage.
 * @returns {Promise<object>} The response data from the server, including the new project and pages.
 */
export const startNewCrawl = (homepage_url) => {
    // The path '/projects/crawl' is appended to the baseURL.
    // Full request URL will be: http://localhost:3001/api/projects/crawl
    return apiClient.post('/projects/crawl', { homepage_url });
};


/**
 * Triggers the analysis for a specific URL.
 * @param {string} url The URL to analyze.
 * @param {string} [trackingCode] Optional tracking code to verify.
 * @returns {Promise<object>} The response containing the new analysis report.
 */
export const startPageAnalysis = (url, trackingCode) => {
    return apiClient.post('/analysis/run', { url, trackingCode });
};

// Add this function to api.js
export const getPagesByProjectId = (projectId) => {
    return apiClient.get(`/projects/${projectId}/pages`);
};

export const getAiSuggestions = (report_id) => {
    return apiClient.post('/ai/suggestions', { report_id });
};

export const saveLiveSettings = (page_id, settings_data) => {
    return apiClient.post('/settings/save', { page_id, settings_data });
};
