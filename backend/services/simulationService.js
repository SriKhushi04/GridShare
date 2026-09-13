const gridState = require('./gridService');
const { allocateEnergy } = require('./allocationService');
const { INITIAL_BUILDINGS, INITIAL_CENTRAL_BATTERY } = require('../config/baselineData');
const { round1, clamp } = require('../utils/gridHelpers');

const SCENARIOS = {
  NORMAL: 'NORMAL',
  HIGH_SOLAR: 'HIGH_SOLAR',
  LOW_SOLAR: 'LOW_SOLAR',
  HIGH_DEMAND: 'HIGH_DEMAND',
  LOW_BATTERY: 'LOW_BATTERY',
  GRID_FAILURE: 'GRID_FAILURE',
};

function applyScenario(scenarioKey) {
  if (!SCENARIOS[scenarioKey]) {
    throw new Error(`Invalid scenario: ${scenarioKey}`);
  }

  gridState.currentScenario = scenarioKey;
  let buildings = INITIAL_BUILDINGS.map((b) => ({ ...b }));

  switch (scenarioKey) {
    case SCENARIOS.HIGH_SOLAR:
      gridState.buildings = buildings.map((b) => ({
        ...b,
        solarGeneration: round1(b.solarGeneration * 1.5 + Math.random() * 0.5),
      }));
      gridState.mainGrid.status = 'ONLINE';
      break;

    case SCENARIOS.LOW_SOLAR:
      gridState.buildings = buildings.map((b) => ({
        ...b,
        solarGeneration: round1(Math.max(0.5, b.solarGeneration * 0.3 - Math.random() * 0.2)),
      }));
      gridState.mainGrid.status = 'ONLINE';
      break;

    case SCENARIOS.HIGH_DEMAND:
      gridState.buildings = buildings.map((b) => ({
        ...b,
        consumption: round1(b.consumption * 1.6 + Math.random() * 0.4),
      }));
      gridState.mainGrid.status = 'ONLINE';
      break;

    case SCENARIOS.LOW_BATTERY:
      gridState.buildings = buildings;
      gridState.centralBattery.currentEnergy = 10;
      gridState.mainGrid.status = 'ONLINE';
      break;

    case SCENARIOS.GRID_FAILURE:
      gridState.buildings = buildings;
      gridState.mainGrid.status = 'OFFLINE';
      gridState.mainGrid.powerImported = 0;
      break;

    case SCENARIOS.NORMAL:
    default:
      gridState.buildings = buildings;
      gridState.centralBattery.currentEnergy = INITIAL_CENTRAL_BATTERY.currentEnergy;
      gridState.mainGrid.status = 'ONLINE';
      break;
  }

  // Run allocation after applying scenario
  return allocateEnergy();
}

function processTick() {
  // Apply realistic gradual noise to building values
  gridState.buildings.forEach((b) => {
    const solarNoise = (Math.random() - 0.5) * 0.4;
    const loadNoise = (Math.random() - 0.5) * 0.4;

    b.solarGeneration = round1(Math.max(0, b.solarGeneration + solarNoise));
    b.consumption = round1(Math.max(0.5, b.consumption + loadNoise));

    const balance = b.solarGeneration - b.consumption;
    let battDelta = 0;
    if (balance > 1) battDelta = 1;
    else if (balance < -1) battDelta = -1;

    b.batteryLevel = clamp(b.batteryLevel + battDelta, 5, 100);
  });

  // Re-run allocation engine on tick
  return allocateEnergy();
}

function resetSimulation() {
  gridState.reset();
  return allocateEnergy();
}

module.exports = {
  SCENARIOS,
  applyScenario,
  processTick,
  resetSimulation,
};

