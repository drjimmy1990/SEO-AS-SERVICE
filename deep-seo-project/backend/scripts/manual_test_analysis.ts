import axios from 'axios';

const runTest = async () => {
    const url = 'http://localhost:3001/api/analysis/run';
    const target = 'https://example.com';

    console.log(`Testing Analysis API with target: ${target}`);

    try {
        const response = await axios.post(url, { url: target });
        console.log('Analysis Result Status:', response.status);
        console.log('Score:', response.data.score);
        console.log('Rule Results:', JSON.stringify(response.data.results, null, 2));
    } catch (error: any) {
        console.error('API Test Failed:', error.response?.data || error.message);
    }
};

runTest();
