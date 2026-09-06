const http = require('http');
const app = require('../server');

const runTests = async () => {
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(5098, resolve));
  console.log('Auth test server started on port 5098');

  const baseUrl = 'http://127.0.0.1:5098';

  const makeRequest = (url, options = {}, body = null) => {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      if (body && !reqOptions.headers['Content-Type']) {
        reqOptions.headers['Content-Type'] = 'application/json';
      }

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    console.log('\n--- 1. Testing Registration ---');
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const regRes = await makeRequest(`${baseUrl}/api/auth/register`, { method: 'POST' }, {
      name: 'Test Officer',
      email: uniqueEmail,
      password: 'password123'
    });

    console.log('Register response status:', regRes.status);
    if (regRes.status !== 201 || !regRes.body.token) {
      throw new Error(`Register failed: ${JSON.stringify(regRes.body)}`);
    }
    console.log('✓ Registration passed! Token received.');

    console.log('\n--- 2. Testing Login with correct credentials ---');
    const loginRes = await makeRequest(`${baseUrl}/api/auth/login`, { method: 'POST' }, {
      email: uniqueEmail,
      password: 'password123'
    });
    console.log('Login response status:', loginRes.status);
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.token;
    console.log('✓ Login passed! Token verified.');

    console.log('\n--- 3. Testing Login with incorrect credentials ---');
    const badLoginRes = await makeRequest(`${baseUrl}/api/auth/login`, { method: 'POST' }, {
      email: uniqueEmail,
      password: 'wrongpassword'
    });
    console.log('Bad login response status:', badLoginRes.status);
    if (badLoginRes.status !== 401) {
      throw new Error(`Bad login should have returned 401: got ${badLoginRes.status}`);
    }
    console.log('✓ Bad login rejected properly with 401.');

    console.log('\n--- 4. Testing GET /api/auth/me with Bearer token ---');
    const meRes = await makeRequest(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('GET /api/auth/me status:', meRes.status);
    if (meRes.status !== 200 || meRes.body.user.email !== uniqueEmail) {
      throw new Error(`GET /api/auth/me failed: ${JSON.stringify(meRes.body)}`);
    }
    console.log(`✓ Auth profile verified! User: ${meRes.body.user.name} (${meRes.body.user.email})`);

    console.log('\n--- 5. Testing Protected Route without Token (Expected 401) ---');
    // First create a test item (public)
    const createRes = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, {
      title: 'Auth Test Watch',
      type: 'found',
      category: 'Jewelry & Watches',
      description: 'Gold wristwatch found in auditorium',
      location: 'Auditorium Row 4',
      date: '2026-03-01',
      reporterName: 'Campus Security',
      reporterContact: 'security@campus.edu'
    });
    const itemId = createRes.body.data._id;

    // Try updating status without token
    const unauthUpdate = await makeRequest(`${baseUrl}/api/items/${itemId}/status`, { method: 'PATCH' }, {
      status: 'claimed',
      claimantName: 'John Doe',
      claimantContact: 'john@example.com'
    });
    console.log('Unauthenticated status update response:', unauthUpdate.status);
    if (unauthUpdate.status !== 401) {
      throw new Error(`Expected 401 for unauthorized status change, got ${unauthUpdate.status}`);
    }
    console.log('✓ Protected route blocked unauthenticated request with 401.');

    console.log('\n--- 6. Testing Protected Route WITH Token (Expected 200) ---');
    const authUpdate = await makeRequest(`${baseUrl}/api/items/${itemId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    }, {
      status: 'claimed',
      claimantName: 'John Doe',
      claimantContact: 'john@example.com'
    });
    console.log('Authenticated status update response:', authUpdate.status);
    if (authUpdate.status !== 200 || authUpdate.body.data.status !== 'claimed') {
      throw new Error(`Authenticated status change failed: ${JSON.stringify(authUpdate.body)}`);
    }
    console.log('✓ Protected route permitted authenticated staff update.');

    console.log('\n🎉 ALL AUTHENTICATION BACKEND TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('✗ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
};

runTests();
