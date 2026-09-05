const http = require('http');
const app = require('../server');

const runFullE2ETest = async () => {
  console.log('====================================================');
  console.log('🚀 RUNNING FINAL END-TO-END SYSTEM VERIFICATION');
  console.log('====================================================');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5095, resolve));
  const baseUrl = 'http://127.0.0.1:5095';

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
    // Step 1: Health & Stats Baseline
    console.log('\n[Step 1] Verifying System Baseline...');
    const statsBefore = await makeRequest(`${baseUrl}/api/stats/summary`);
    if (statsBefore.status !== 200) throw new Error('Baseline stats fetch failed');
    const initialTotal = statsBefore.body.data.counts.total;
    const initialClaimed = statsBefore.body.data.counts.claimed;
    console.log(`✓ Baseline Total Items: ${initialTotal}, Claimed: ${initialClaimed}`);

    // Step 2: Report Lost Item
    console.log('\n[Step 2] Reporting a Lost Item...');
    const lostItemPayload = {
      title: 'Space Gray iPad Air (5th Gen) with Navy Smart Folio',
      type: 'lost',
      category: 'Electronics',
      description: 'Left on desk in Science Hall 204. Has a navy blue magnetic folio case and matte screen protector.',
      location: 'Science Hall, Room 204',
      date: new Date().toISOString(),
      reporterName: 'Maya Patel',
      reporterContact: 'maya.p@university.edu / (555) 901-2345'
    };
    const lostRes = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, lostItemPayload);
    if (lostRes.status !== 201 || !lostRes.body.data?._id) throw new Error('Failed to create lost item');
    const lostId = lostRes.body.data._id;
    console.log(`✓ Created Lost Report (ID: ${lostId}): "${lostRes.body.data.title}"`);

    // Step 3: Report Found Item
    console.log('\n[Step 3] Reporting a Found Item...');
    const foundItemPayload = {
      title: 'Found Apple iPad in Navy Case',
      type: 'found',
      category: 'Electronics',
      description: 'Found an Apple iPad in navy folio case left behind on study desk after physics lecture.',
      location: 'Science Hall 2nd Floor',
      date: new Date().toISOString(),
      reporterName: 'Campus Janitorial Service',
      reporterContact: 'facilities@campus.edu'
    };
    const foundRes = await makeRequest(`${baseUrl}/api/items`, { method: 'POST' }, foundItemPayload);
    if (foundRes.status !== 201 || !foundRes.body.data?._id) throw new Error('Failed to create found item');
    const foundId = foundRes.body.data._id;
    console.log(`✓ Created Found Report (ID: ${foundId}): "${foundRes.body.data.title}"`);

    // Step 4: Keyword Search & Filter
    console.log('\n[Step 4] Searching by keyword "iPad"...');
    const searchRes = await makeRequest(`${baseUrl}/api/items?q=iPad`);
    if (searchRes.status !== 200 || searchRes.body.count < 2) throw new Error('Keyword search failed to return both iPad reports');
    console.log(`✓ Search returned ${searchRes.body.count} matching item(s)`);

    // Step 5: Smart Match Detection
    console.log('\n[Step 5] Checking Smart Match Suggestions for Lost iPad...');
    const matchRes = await makeRequest(`${baseUrl}/api/items/${lostId}/matches`);
    if (matchRes.status !== 200 || matchRes.body.totalMatches < 1) throw new Error('Smart match failed to suggest found iPad');
    const match = matchRes.body.data.find((m) => m.item._id === foundId);
    if (!match) throw new Error('Target found iPad not in match list');
    console.log(`✓ Smart Match Success! Score: ${match.score}% | Match reasons: ${match.reasons.join(', ')}`);

    // Step 6: Mark Item as Claimed / Returned
    console.log('\n[Step 6] Marking Lost & Found items as Claimed / Returned...');
    const claimRes = await makeRequest(`${baseUrl}/api/items/${lostId}/status`, { method: 'PATCH' }, {
      status: 'claimed',
      claimedBy: 'Maya Patel',
      claimantContact: 'maya.p@university.edu',
      notes: 'Owner verified device serial number and passcode at campus desk.'
    });
    if (claimRes.status !== 200 || claimRes.body.data.status !== 'claimed') throw new Error('Failed to mark item as claimed');
    console.log(`✓ Successfully updated status to "claimed". Claimant: ${claimRes.body.data.claimDetails.claimedBy}`);

    // Step 7: Verify Dashboard Metrics Update
    console.log('\n[Step 7] Verifying updated Dashboard Statistics...');
    const statsAfter = await makeRequest(`${baseUrl}/api/stats/summary`);
    if (statsAfter.status !== 200) throw new Error('Failed to fetch updated stats');
    const newTotal = statsAfter.body.data.counts.total;
    const newClaimed = statsAfter.body.data.counts.claimed;
    console.log(`✓ Updated Total Items: ${newTotal} (was ${initialTotal})`);
    console.log(`✓ Updated Claimed Items: ${newClaimed} (was ${initialClaimed})`);
    console.log(`✓ Resolution Rate: ${statsAfter.body.data.resolutionRate}%`);

    if (newTotal !== initialTotal + 2 || newClaimed !== initialClaimed + 1) {
      throw new Error('Stats counts did not accurately reflect the operations performed');
    }

    // Step 8: Edit Report
    console.log('\n[Step 8] Testing Edit Item Report...');
    const editRes = await makeRequest(`${baseUrl}/api/items/${foundId}`, { method: 'PUT' }, {
      title: 'Found Apple iPad Air (Claim Handled at Front Desk)',
      location: 'Science Hall Front Desk'
    });
    if (editRes.status !== 200 || editRes.body.data.title !== 'Found Apple iPad Air (Claim Handled at Front Desk)') {
      throw new Error('Failed to update item report');
    }
    console.log(`✓ Successfully updated item title to: "${editRes.body.data.title}"`);

    // Step 9: Delete / Archive Item
    console.log('\n[Step 9] Testing Delete Item Report...');
    const deleteRes = await makeRequest(`${baseUrl}/api/items/${foundId}`, { method: 'DELETE' });
    if (deleteRes.status !== 200) throw new Error('Failed to delete item');
    console.log('✓ Successfully deleted/archived item');

    const checkGet = await makeRequest(`${baseUrl}/api/items/${foundId}`);
    if (checkGet.status !== 404) throw new Error('Deleted item should return 404');
    console.log('✓ Verified deleted item is no longer returned in active queries');

    console.log('\n====================================================');
    console.log('🎉 ALL END-TO-END SYSTEM TESTS PASSED PERFECTLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n✗ End-to-end test error:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
};

runFullE2ETest();
