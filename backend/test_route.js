const http = require('http');

const data = JSON.stringify({
    sourceLat: 18.5314,
    sourceLng: 73.8412,
    destLat: 18.5162,
    destLng: 73.8412,
    mode: 'safest',
    vehicle: 'car'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/route',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });
    res.on('end', () => {
        console.log(responseBody);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
