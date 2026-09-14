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

    // -------------------------------------------------------------
    // STAGE 1A: HIGH-006 & HIGH-007 ACCOUNTING & RESERVATION TESTS
    // -------------------------------------------------------------
    console.log('\n--- Running Stage 1A Accounting & Reservation Tests ---');

    // HIGH-006: 1. Baseline available surplus observation
    const gridRes0 = await request('/grid');
    assert(gridRes0.status === 200, 'GET /grid for Stage 1A baseline');
    const b01Initial = gridRes0.data.buildings.find((b) => b.buildingId === 'b01');
    assert(b01Initial && b01Initial.solarGeneration === 8.2 && b01Initial.consumption === 5.1, 'Building 01 has expected physical baseline');

    // HIGH-006: 2. Internal tools check: reservation creation, capacity reduction, deterministic rejection
    const gridState = require('./services/gridService');
    const { executeTool } = require('./agent/agentTools');
    gridState.reset();

    const initialSurplus = gridState.getAvailableSurplus('b01'); // 3.1 kW
    assert(initialSurplus === 3.1, 'Building 01 unallocated surplus initially 3.1 kW');

    // Tool call 1: partial transfer 1.5 kW
    const call1 = await executeTool('request_p2p_transfer', { fromBuilding: 'b01', toBuilding: 'b02', amountKwh: 1.5 });
    assert(call1.success === true && call1.status === 'APPROVED', 'Tool call 1: approved for 1.5 kW');
    const surplusAfter1 = gridState.getAvailableSurplus('b01');
    assert(surplusAfter1 === 1.6, 'Available donor surplus decreases from 3.1 to 1.6 kW');

    // Check physical telemetry NOT mutated
    const b01Physical = gridState.getBuildingById('b01');
    assert(b01Physical.solarGeneration === 8.2 && b01Physical.consumption === 5.1, 'Physical telemetry unchanged by reservation');

    // Tool call 2: remaining 1.6 kW
    const call2 = await executeTool('request_p2p_transfer', { fromBuilding: 'b01', toBuilding: 'b02', amountKwh: 1.6 });
    assert(call2.success === true && call2.status === 'APPROVED', 'Tool call 2: approved for remaining 1.6 kW');
    assert(gridState.getAvailableSurplus('b01') === 0, 'Available surplus correctly drops to 0.0 kW');

    // Tool call 3: excess transfer must be rejected deterministically
    const call3 = await executeTool('request_p2p_transfer', { fromBuilding: 'b01', toBuilding: 'b04', amountKwh: 1.0 });
    assert(
      call3.success === false && call3.status === 'REJECTED' && call3.reason === 'INSUFFICIENT_SOURCE_ENERGY',
      'Tool call 3: excess transfer rejected with INSUFFICIENT_SOURCE_ENERGY'
    );

    // Repeated call cannot double-spend
    const call4 = await executeTool('request_p2p_transfer', { fromBuilding: 'b01', toBuilding: 'b05', amountKwh: 0.1 });
    assert(call4.success === false && call4.status === 'REJECTED', 'Repeated run cannot double-spend exhausted surplus');

    // Advancing tick resets reservation pool and uses fresh telemetry
    const simService = require('./services/simulationService');
    simService.processTick();
    assert(gridState.getAvailableSurplus('b01') > 0, 'processTick() closes previous tick reservations and resets unreserved pool');

    // HIGH-007: Power vs Energy semantics
    await request('/simulation/reset', { method: 'POST' });
    const freshGrid = (await request('/grid')).data;
    assert(freshGrid.tickDurationSeconds === 5, 'tickDurationSeconds is explicitly modeled as 5s');
    assert(freshGrid.mainGrid.currentImportKw === 0, 'currentImportKw initially 0');
    assert(freshGrid.mainGrid.cumulativeImportKwh === 0, 'cumulativeImportKwh initially 0');
    assert(freshGrid.mainGrid.powerImported === 0, 'Backward compatibility alias powerImported === 0');
    assert(freshGrid.mainGrid.power === 0, 'Backward compatibility alias power === 0');

    // To force Main Grid import: Chain LOW_BATTERY then LOW_SOLAR via HTTP
    await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'LOW_BATTERY' }),
    });
    await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'LOW_SOLAR' }),
    });

    const tick1 = (await request('/simulation/tick', { method: 'POST' })).data.gridState;
    const kw1 = tick1.mainGrid.currentImportKw;
    const kwh1 = tick1.mainGrid.cumulativeImportKwh;
    assert(kw1 > 0, 'Depleted reserves cause currentImportKw > 0', `${kw1} kW`);
    assert(kwh1 > 0, 'Grid draw tick integrates energy into cumulativeImportKwh', `${kwh1} kWh`);
    assert(tick1.mainGrid.powerImported === kw1, 'powerImported dynamically mirrors currentImportKw');
    assert(tick1.mainGrid.power === kw1, 'power dynamically mirrors currentImportKw');

    // Second tick accumulates monotonically
    const tick2 = (await request('/simulation/tick', { method: 'POST' })).data.gridState;
    assert(tick2.mainGrid.cumulativeImportKwh >= kwh1, 'cumulativeImportKwh increases monotonically across importing ticks');

    // GRID_FAILURE invariant: power = 0, energy freezes
    await request('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'GRID_FAILURE' }),
    });
    const gfTick = (await request('/simulation/tick', { method: 'POST' })).data.gridState;
    assert(gfTick.mainGrid.currentImportKw === 0, 'GRID_FAILURE invariant: currentImportKw strictly 0 kW');
    assert(gfTick.mainGrid.cumulativeImportKwh === tick2.mainGrid.cumulativeImportKwh, 'GRID_FAILURE invariant: cumulativeImportKwh does not increase during outage');

    // Reset invariant: resets cumulative to 0
    const resetState = (await request('/simulation/reset', { method: 'POST' })).data.gridState;
    assert(resetState.mainGrid.cumulativeImportKwh === 0 && resetState.mainGrid.currentImportKw === 0, 'RESET invariant: cumulativeImportKwh and currentImportKw reset to 0');

    // -------------------------------------------------------------
    // PHASE 1B: TELEMETRY & CONFIDENCE HONESTY TESTS
    // -------------------------------------------------------------
    console.log('\n--- Running Phase 1B Telemetry & Confidence Honesty Tests ---');

    const agentRunRes = await request('/agent/run', {
      method: 'POST',
      body: JSON.stringify({ objective: 'Verify honest telemetry' }),
    });
    assert(agentRunRes.status === 200, 'POST /agent/run for Phase 1B telemetry check');
    const decision = agentRunRes.data.decision;

    // HIGH-003: Deterministic fallback reports sourceMode accurately, toolsUsed is empty, confidence is null
    if (agentRunRes.data.mode === 'DETERMINISTIC_SAFETY_FALLBACK') {
      assert(
        decision.sourceMode === 'DETERMINISTIC_SAFETY_FALLBACK',
        'Deterministic mode reports sourceMode DETERMINISTIC_SAFETY_FALLBACK'
      );
      assert(
        Array.isArray(decision.toolsUsed) && decision.toolsUsed.length === 0,
        'Deterministic mode does NOT fabricate toolsUsed (empty array)'
      );
      assert(
        decision.confidence === null,
        'Deterministic mode does NOT fabricate confidence score (strictly null)'
      );
    } else {
      // HIGH-005: Gemini agent does not hardcode uncalibrated confidence
      assert(
        decision.confidence === null,
        'Gemini agent mode does NOT report uncalibrated hardcoded confidence (null)'
      );
    }

    // Reset to Baseline
    await request('/simulation/reset', { method: 'POST' });

  } catch (err) {
    console.error('Fatal Phase 5 Agent test error:', err);
    failed++;
  }

  console.log('\n==================================================');
  console.log(`  AGENT & STAGE 1A/1B RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests();

