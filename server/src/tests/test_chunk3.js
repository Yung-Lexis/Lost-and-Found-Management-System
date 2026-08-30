const http = require('http');
const app = require('../server');

const runTests = async () => {
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('Test server started on port 5099');

  const baseUrl = 'http://127.0.0.1:5099';

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
    console.log('\n--- 1. Testing GET /api/health ---');
    const health = await makeRequest(`${baseUrl}/api/health`);
    console.log('Health status:', health.status, health.body);
    if (health.status !== 200) throw new Error('Health check failed');

    console.log('\n--- 2. Testing GET /api/categories ---');
    const categories = await makeRequest(`${baseUrl}/api/categories`);
    console.log('Categories status:', categories.status, 'Count:', categories.body.data.length);
    if (categories.status !== 200 || !Array.isArray(categories.body.data)) throw new Error('Categories test failed');

    console.log('\n--- 3. Testing POST /api/items (Create Lost Item) ---');
    const newItemPayload = {
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      type: 'lost',
      category: 'Electronics',
      description: 'Matte black over-ear headphones left in study pod 4.',
      location: 'Engineering Library, 3rd Floor',
      date: new Date().toISOString(),
      reporterName: 'Jordan Smith',
      reporterContact: 'jordan.smith@university.edu'
    };
    const createRes = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, newItemPayload);
    console.log('Create status:', createRes.status, 'Created ID:', createRes.body.data?._id);
    if (createRes.status !== 201 || !createRes.body.data?._id) throw new Error('Create item failed');
    const createdId = createRes.body.data._id;

    console.log('\n--- 4. Testing GET /api/items (List with Pagination) ---');
    const listRes = await makeRequest(`${baseUrl}/api/items?limit=5&page=1`);
    console.log('List status:', listRes.status, 'Total items:', listRes.body.total, 'Count in page:', listRes.body.count);
    if (listRes.status !== 200 || !Array.isArray(listRes.body.data)) throw new Error('List items failed');

    console.log('\n--- 5. Testing GET /api/items/:id (Fetch Single Item) ---');
    const singleRes = await makeRequest(`${baseUrl}/api/items/${createdId}`);
    console.log('Single item status:', singleRes.status, 'Title:', singleRes.body.data?.title);
    if (singleRes.status !== 200 || singleRes.body.data?.title !== newItemPayload.title) {
      throw new Error('Get single item failed');
    }

    console.log('\n--- 6. Testing Error Handling (Invalid ID & Missing Fields) ---');
    const invalidIdRes = await makeRequest(`${baseUrl}/api/items/invalid-id-format`);
    console.log('Invalid ID status:', invalidIdRes.status);
    if (invalidIdRes.status !== 400) throw new Error('Invalid ID handling failed');

    const invalidBodyRes = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, { title: 'No required fields' });
    console.log('Validation Error status:', invalidBodyRes.status);
    if (invalidBodyRes.status !== 400) throw new Error('Validation error handling failed');

    console.log('\n✓ ALL CHUNK 3 TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n✗ Test failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
};

runTests();
