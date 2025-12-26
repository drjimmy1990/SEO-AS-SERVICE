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

    console.log('\n--- Testing Script Detection ---');
    try {
        // Test with a tracking code that SHOULD be found on our local server
        const localTarget = 'https://neat-lemons-send.loca.lt';
        const trackingCode = 'injector.js';

        console.log(`Analyzing ${localTarget} for code ${trackingCode}...`);

        const response = await axios.post(url, {
            url: localTarget,
            trackingCode: trackingCode
        });
        const scriptRule = response.data.results.find((r: any) => r.ruleId === 'technical-script-tag');
        console.log('Script Rule Status:', scriptRule?.status);
        console.log('Script Rule Issues:', scriptRule?.issues);

    } catch (error: any) {
        console.error('API Test Failed:', error.response?.data || error.message);
    }
};

runTest();
