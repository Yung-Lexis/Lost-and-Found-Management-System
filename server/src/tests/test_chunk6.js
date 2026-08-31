const http = require('http');
const app = require('../server');

const runTests = async () => {
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(5096, resolve));
  console.log('Test server started on port 5096');

  const baseUrl = 'http://127.0.0.1:5096';

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
    console.log('\n--- 1. Seed items across lost, found, and claimed states ---');
    await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, {
      title: 'Lost Silver Watch',
      type: 'lost',
      category: 'Jewelry & Watches',
      description: 'Silver wristwatch lost in gym locker room.',
      location: 'Gymnasium',
      reporterName: 'Alice',
      reporterContact: 'alice@test.com'
    });

    await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, {
      title: 'Found Smart Watch',
      type: 'found',
      category: 'Jewelry & Watches',
      description: 'Found on grass near field.',
      location: 'Sports Field',
      reporterName: 'Bob',
      reporterContact: 'bob@test.com'
    });

    const claimedItem = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, {
      title: 'Claimed Blue Backpack',
      type: 'found',
      category: 'Bags & Luggage',
      description: 'Blue JanSport backpack.',
      location: 'Auditorium',
      reporterName: 'Charlie',
      reporterContact: 'charlie@test.com'
    });

    await makeRequest(`${baseUrl}/api/items/${claimedItem.body.data._id}/status`, { method: 'PATCH' }, {
      status: 'claimed',
      claimedBy: 'Dave Owner',
      claimantContact: 'dave@test.com',
      notes: 'Picked up from lost & found office.'
    });

    console.log('\n--- 2. Test GET /api/stats/summary ---');
    const statsRes = await makeRequest(`${baseUrl}/api/stats/summary`);
    console.log('Stats status:', statsRes.status);
    console.log('Counts:', statsRes.body.data?.counts);
    console.log('Resolution Rate:', `${statsRes.body.data?.resolutionRate}%`);
    console.log('Categories breakdown count:', statsRes.body.data?.categories?.length);

    if (statsRes.status !== 200 || !statsRes.body.success) {
      throw new Error('Stats summary endpoint failed');
    }

    const { counts, resolutionRate, categories, recentItems } = statsRes.body.data;
    if (counts.total < 3 || counts.lost < 1 || counts.found < 1 || counts.claimed < 1) {
      throw new Error(`Count aggregation mismatch: ${JSON.stringify(counts)}`);
    }

    if (typeof resolutionRate !== 'number' || resolutionRate <= 0) {
      throw new Error(`Invalid resolution rate: ${resolutionRate}`);
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error('Categories aggregation missing');
    }

    if (!Array.isArray(recentItems) || recentItems.length === 0) {
      throw new Error('Recent items feed missing');
    }

    console.log('\n✓ ALL CHUNK 6 TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n✗ Chunk 6 test failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
};

runTests();
