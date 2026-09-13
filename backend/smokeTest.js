const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runSmokeTests() {
  console.log('==================================================');
  console.log('      GRID SHARE BACKEND FULL SMOKE TEST          ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health');

    // 2. Full Grid State
    const grid = await request('/grid');
    assert(
      grid.status === 200 &&
        Array.isArray(grid.data.buildings) &&
        grid.data.buildings.length === 5 &&
        grid.data.centralBattery.percentage !== undefined,
      'GET /api/grid'
    );

    // 3. Buildings List
    const buildings = await request('/buildings');
    assert(buildings.status === 200 && buildings.data.length === 5, 'GET /api/buildings');

    // 4. Single Building (Valid)
    const b1 = await request('/buildings/b01');
    assert(b1.status === 200 && b1.data.name === 'Building 01', 'GET /api/buildings/b01');

    // 5. Single Building (Invalid 404)
    const bInvalid = await request('/buildings/b999');
    assert(bInvalid.status === 404 && bInvalid.data.error === 'Building not found', 'GET /api/buildings/b999 (404)');

    // 6. Central Battery
    const battery = await request('/battery');
    assert(battery.status === 200 && battery.data.capacity === 100, 'GET /api/battery');

    // 7. Transactions
    const tx = await request('/transactions');
    assert(tx.status === 200 && Array.isArray(tx.data), 'GET /api/transactions');

    // 8. AI Decisions
    const decisions = await request('/ai-decisions');
    assert(decisions.status === 200 && Array.isArray(decisions.data), 'GET /api/ai-decisions');

    // 9. Activity Logs
    const activity = await request('/activity');
    assert(activity.status === 200 && Array.isArray(activity.data), 'GET /api/activity');

    // 10. Manual Energy Allocation Trigger
    const alloc = await request('/energy/allocate', { method: 'POST' });
    assert(alloc.status === 200 && alloc.data.gridState !== undefined, 'POST /api/energy/allocate');

    // 11. Simulation Tick
    const tick = await request('/simulation/tick', { method: 'POST' });
    assert(tick.status === 200 && tick.data.gridState !== undefined, 'POST /api/simulation/tick');

    // 12. Scenario: HIGH_SOLAR
    const highSolar = await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'HIGH_SOLAR' }),
    });
    assert(
      highSolar.status === 200 && highSolar.data.gridState.currentScenario === 'HIGH_SOLAR',
      'POST /api/simulation/scenario (HIGH_SOLAR)'
    );

    // 13. Scenario: HIGH_DEMAND
    const highDemand = await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'HIGH_DEMAND' }),
    });
    assert(
      highDemand.status === 200 && highDemand.data.gridState.currentScenario === 'HIGH_DEMAND',
      'POST /api/simulation/scenario (HIGH_DEMAND)'
    );

    // 14. Scenario: LOW_BATTERY
    const lowBatt = await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'LOW_BATTERY' }),
    });
    assert(
      lowBatt.status === 200 && lowBatt.data.gridState.centralBattery.currentEnergy <= 15,
      'POST /api/simulation/scenario (LOW_BATTERY)'
    );

    // 15. Scenario: GRID_FAILURE
    const gridFail = await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'GRID_FAILURE' }),
    });
    assert(
      gridFail.status === 200 &&
        gridFail.data.gridState.mainGrid.status === 'OFFLINE' &&
        gridFail.data.gridState.mainGrid.powerImported === 0,
      'POST /api/simulation/scenario (GRID_FAILURE)'
    );

    // 16. Manual Main Grid Toggle (OFFLINE to ONLINE)
    const mainGridToggle = await request('/grid/main-grid', {
      method: 'POST',
      body: JSON.stringify({ status: 'ONLINE' }),
    });
    assert(
      mainGridToggle.status === 200 && mainGridToggle.data.gridState.mainGrid.status === 'ONLINE',
      'POST /api/grid/main-grid (ONLINE)'
    );

    // 17. Invalid Scenario (400)
    const invalidScenario = await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'INVALID_SCENARIO' }),
    });
    assert(invalidScenario.status === 400 && invalidScenario.data.error !== undefined, 'POST /api/simulation/scenario (400)');

    // 18. Reset Simulation
    const reset = await request('/simulation/reset', { method: 'POST' });
    assert(
      reset.status === 200 && reset.data.gridState.currentScenario === 'NORMAL',
      'POST /api/simulation/reset'
    );

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failed++;
  }

  console.log('\n==================================================');
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests();
