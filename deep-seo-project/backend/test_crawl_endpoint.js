const http = require('http');

const data = JSON.stringify({
    homepage_url: 'http://localhost:5500/index.html'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/projects/crawl',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let responseData = '';
    res.on('data', chunk => {
        responseData += chunk;
    });
    res.on('end', () => {
        console.log('Response Body:');
        console.log(responseData);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
