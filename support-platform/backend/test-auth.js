const http = require('http');

async function testAuth() {
  console.log('Testing Admin Login API...');
  
  const payload = JSON.stringify({
    username: 'aycreationconnect',
    password: 'ay@creationconnect123$',
  });

  const req = http.request('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Body:', data);
    });
  });

  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });

  req.write(payload);
  req.end();
}

testAuth();
