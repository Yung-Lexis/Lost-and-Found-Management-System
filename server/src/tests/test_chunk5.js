const http = require('http');
const app = require('../server');

const runTests = async () => {
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(5097, resolve));
  console.log('Test server started on port 5097');

  const baseUrl = 'http://127.0.0.1:5097';

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
    console.log('\n--- 1. Seed two complementary items for search & match ---');
    // Create a Lost Wallet
    const lostItemRes = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, {
      title: 'Brown Leather Fossil Trifold Wallet',
      type: 'lost',
      category: 'Wallets & Purses',
      description: 'Lost my brown fossil leather wallet with state ID and cash near library.',
      location: 'Central Library Main Floor',
      date: new Date().toISOString(),
      reporterName: 'John Doe',
      reporterContact: 'john.doe@example.com'
    });
    const lostId = lostItemRes.body.data._id;

    // Create a Found Wallet
    const foundItemRes = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, {
      title: 'Found Brown Leather Wallet',
      type: 'found',
      category: 'Wallets & Purses',
      description: 'Found a brown leather wallet on table in library with an ID inside.',
      location: 'Central Library',
      date: new Date().toISOString(),
      reporterName: 'Librarian Desk',
      reporterContact: 'library@desk.edu'
    });
    const foundId = foundItemRes.body.data._id;
    console.log(`✓ Created Lost Item (${lostId}) and Found Item (${foundId})`);

    console.log('\n--- 2. Test Keyword Search (q=Fossil) ---');
    const searchRes = await makeRequest(`${baseUrl}/api/items?q=Fossil`);
    console.log('Search status:', searchRes.status, 'Results count:', searchRes.body.count);
    if (searchRes.status !== 200 || searchRes.body.count < 1) {
      throw new Error('Keyword search failed');
    }
    console.log(`✓ Found ${searchRes.body.count} item(s) matching keyword "Fossil"`);

    console.log('\n--- 3. Test Category & Type Filter (category=Wallets & Purses, type=lost) ---');
    const filterRes = await makeRequest(`${baseUrl}/api/items?category=${encodeURIComponent('Wallets & Purses')}&type=lost`);
    console.log('Filter status:', filterRes.status, 'Results count:', filterRes.body.count);
    if (filterRes.status !== 200 || filterRes.body.data.some(i => i.type !== 'lost' || i.category !== 'Wallets & Purses')) {
      throw new Error('Category/Type filter failed');
    }
    console.log('✓ Successfully filtered by category and type');

    console.log('\n--- 4. Test Smart Match Suggestion (GET /api/items/:id/matches) ---');
    const matchRes = await makeRequest(`${baseUrl}/api/items/${lostId}/matches`);
    console.log('Match status:', matchRes.status, 'Total matches found:', matchRes.body.totalMatches);
    if (matchRes.status !== 200 || matchRes.body.totalMatches < 1) {
      throw new Error('Smart match failed to find candidate');
    }

    const topMatch = matchRes.body.data[0];
    console.log(`✓ Top Match Item: "${topMatch.item.title}"`);
    console.log(`✓ Match Score: ${topMatch.score}%`);
    console.log(`✓ Reasons: ${topMatch.reasons.join(' | ')}`);

    if (topMatch.score < 50 || topMatch.item._id !== foundId) {
      throw new Error('Smart match scoring or target candidate mismatch');
    }

    console.log('\n✓ ALL CHUNK 5 TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n✗ Chunk 5 test failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
};

runTests();
