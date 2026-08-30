const http = require('http');
const app = require('../server');

const runTests = async () => {
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(5098, resolve));
  console.log('Test server started on port 5098');

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
    console.log('\n--- 1. Create a test item for modification ---');
    const createRes = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, {
      title: 'Hydro Flask Water Bottle 24oz',
      type: 'found',
      category: 'Other',
      description: 'Green bottle found under gym bench.',
      location: 'Gymnasium Area',
      reporterName: 'Gym Staff',
      reporterContact: 'staff@gym.com'
    });
    if (createRes.status !== 201 || !createRes.body.data?._id) {
      throw new Error(`Failed to create test item: ${JSON.stringify(createRes.body)}`);
    }
    const itemId = createRes.body.data._id;
    console.log(`✓ Created test item with ID: ${itemId}`);

    console.log('\n--- 2. Test PUT /api/items/:id (Edit Item Details) ---');
    const updateRes = await makeRequest(`${baseUrl}/api/items/${itemId}`, { method: 'PUT' }, {
      title: 'Hydro Flask Water Bottle (Olive Green, 24oz)',
      description: 'Olive green bottle with rock climbing stickers found near bench 3.',
      location: 'Gymnasium Main Court'
    });
    console.log('Update status:', updateRes.status, 'Updated title:', updateRes.body.data?.title);
    if (updateRes.status !== 200 || updateRes.body.data?.title !== 'Hydro Flask Water Bottle (Olive Green, 24oz)') {
      throw new Error('PUT update item failed');
    }
    console.log('✓ PUT update successfully modified item fields');

    console.log('\n--- 3. Test PATCH /api/items/:id/status (Mark as Claimed) ---');
    const claimRes = await makeRequest(`${baseUrl}/api/items/${itemId}/status`, { method: 'PATCH' }, {
      status: 'claimed',
      claimedBy: 'Samantha Vance',
      claimantContact: 'samantha.v@example.com',
      notes: 'Verified ownership via photo of stickers on phone.'
    });
    console.log('Claim status:', claimRes.status, 'Item status:', claimRes.body.data?.status, 'Claimant:', claimRes.body.data?.claimDetails?.claimedBy);
    if (claimRes.status !== 200 || claimRes.body.data?.status !== 'claimed' || claimRes.body.data?.claimDetails?.claimedBy !== 'Samantha Vance') {
      throw new Error('PATCH status update to claimed failed');
    }
    console.log('✓ PATCH status transition to claimed succeeded with claimant metadata');

    console.log('\n--- 4. Test DELETE /api/items/:id (Archive / Remove Item) ---');
    const deleteRes = await makeRequest(`${baseUrl}/api/items/${itemId}`, { method: 'DELETE' });
    console.log('Delete status:', deleteRes.status, 'Response:', deleteRes.body);
    if (deleteRes.status !== 200 || !deleteRes.body.success) {
      throw new Error('DELETE item failed');
    }
    console.log('✓ DELETE successfully archived item');

    console.log('\n--- 5. Verify Deleted Item is no longer accessible via GET /:id ---');
    const verifyGet = await makeRequest(`${baseUrl}/api/items/${itemId}`);
    console.log('GET deleted item status:', verifyGet.status);
    if (verifyGet.status !== 404) {
      throw new Error('Deleted item should return 404');
    }
    console.log('✓ Verified deleted item returns 404 Not Found');

    console.log('\n✓ ALL CHUNK 4 TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n✗ Chunk 4 test failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
};

runTests();
