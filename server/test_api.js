const http = require('http');

const data = JSON.stringify({
  name: 'Test User',
  email: 'test@test.com',
  phone: '0123456789',
  password: 'Test1234'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => {
  console.log('ERROR:', e.message);
});

req.write(data);
req.end();
