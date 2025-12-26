
import axios from 'axios';

const runTest = async () => {
    const url = 'http://localhost:3001/api/analysis/run';
    const target = 'https://neat-lemons-send.loca.lt';
    const trackingCode = 'injector.js';

    console.log(`Testing Analysis API with target: ${target} `);
    try {
        const response = await axios.post(url, {
            url: target,
            trackingCode: trackingCode
        });

        console.log('Analysis Result Status:', response.status);
        console.log('Score:', response.data.score);
        console.log('Full Analysis Report (JSON):');
        console.dir(response.data, { depth: null, colors: true });

    } catch (error: any) {
        console.error('API Test Failed:', error.response?.data || error.message);
    }
};

runTest();
