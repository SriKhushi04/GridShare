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

async function runPhase5Tests() {
  console.log('==================================================');
  console.log('  GRID SHARE PHASE 5 — AGENTIC AI TEST SUITE     ');
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
    // 1. GET /api/agent/status
    const statusRes = await request('/agent/status');
    assert(
      statusRes.status === 200 &&
        statusRes.data.enabled === true &&
        statusRes.data.mode !== undefined,
      'GET /api/agent/status'
    );

    // 2. GET /api/agent/decisions
    const decisionsRes = await request('/agent/decisions');
    assert(
      decisionsRes.status === 200 && Array.isArray(decisionsRes.data),
      'GET /api/agent/decisions'
    );

    // 3. POST /api/agent/run (Normal Operation)
    const runRes = await request('/agent/run', {
      method: 'POST',
      body: JSON.stringify({ objective: 'Test Agentic AI Loop' }),
    });
    assert(
      runRes.status === 200 &&
        runRes.data.success === true &&
        runRes.data.decision !== undefined &&
        runRes.data.decision.status === 'EXECUTED',
      'POST /api/agent/run (Normal Execution)'
    );

    // 4. Test Scenario: HIGH_SOLAR Agent Run
    await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'HIGH_SOLAR' }),
    });
    const highSolarAgent = await request('/agent/run', { method: 'POST' });
    assert(
      highSolarAgent.status === 200 && highSolarAgent.data.success === true,
      'POST /api/agent/run (HIGH_SOLAR Scenario)'
    );

    // 5. Test Scenario: HIGH_DEMAND Agent Run
    await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'HIGH_DEMAND' }),
    });
    const highDemandAgent = await request('/agent/run', { method: 'POST' });
    assert(
      highDemandAgent.status === 200 && highDemandAgent.data.success === true,
      'POST /api/agent/run (HIGH_DEMAND Scenario)'
    );

    // 6. Test Scenario: LOW_BATTERY Agent Run
    await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'LOW_BATTERY' }),
    });
    const lowBattAgent = await request('/agent/run', { method: 'POST' });
    assert(
      lowBattAgent.status === 200 && lowBattAgent.data.success === true,
      'POST /api/agent/run (LOW_BATTERY Scenario)'
    );

    // 7. Test Scenario: GRID_FAILURE Agent Run (Must NOT draw from main grid)
    await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'GRID_FAILURE' }),
    });
    const gridFailAgent = await request('/agent/run', { method: 'POST' });
    assert(
      gridFailAgent.status === 200 &&
        gridFailAgent.data.gridState.mainGrid.powerImported === 0 &&
        gridFailAgent.data.gridState.mainGrid.status === 'OFFLINE',
      'POST /api/agent/run (GRID_FAILURE - Main Grid Power strictly 0 kW)'
    );

    // Reset to Baseline
    await request('/simulation/reset', { method: 'POST' });

  } catch (err) {
    console.error('Fatal Phase 5 Agent test error:', err);
    failed++;
  }

  console.log('\n==================================================');
  console.log(`  PHASE 5 AGENT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests();

