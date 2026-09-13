import { INITIAL_BUILDINGS, INITIAL_CENTRAL_BATTERY, INITIAL_MAIN_GRID } from './baselineData';
import { round1, clamp } from './simulationUtils';

export const SCENARIOS = {
  NORMAL: 'NORMAL',
  HIGH_SOLAR: 'HIGH_SOLAR',
  LOW_SOLAR: 'LOW_SOLAR',
  HIGH_DEMAND: 'HIGH_DEMAND',
  LOW_BATTERY: 'LOW_BATTERY',
  GRID_FAILURE: 'GRID_FAILURE',
};

/**
 * Applies a scenario configuration or dynamic fluctuation tick to buildings & central battery.
 */
export function applyScenario(state, scenarioKey) {
  let buildings = state.buildings.map((b) => ({ ...b }));
  let centralBattery = { ...state.centralBattery };
  let mainGrid = { ...state.mainGrid, power: 0 };

  switch (scenarioKey) {
    case SCENARIOS.HIGH_SOLAR:
      buildings = buildings.map((b) => ({
        ...b,
        solarGeneration: round1(b.solarGeneration * 1.5 + Math.random() * 0.5),
      }));
      mainGrid.online = true;
      break;

    case SCENARIOS.LOW_SOLAR:
      buildings = buildings.map((b) => ({
        ...b,
        solarGeneration: round1(Math.max(0.5, b.solarGeneration * 0.3 - Math.random() * 0.2)),
      }));
      mainGrid.online = true;
      break;

    case SCENARIOS.HIGH_DEMAND:
      buildings = buildings.map((b) => ({
        ...b,
        consumption: round1(b.consumption * 1.6 + Math.random() * 0.4),
      }));
      mainGrid.online = true;
      break;

    case SCENARIOS.LOW_BATTERY:
      centralBattery.currentEnergy = 10; // 10 kWh = 10%
      centralBattery.batteryLevel = 10;
      mainGrid.online = true;
      break;

    case SCENARIOS.GRID_FAILURE:
      mainGrid.online = false;
      mainGrid.power = 0;
      break;

    case SCENARIOS.NORMAL:
    default:
      // Reset to baseline parameters with subtle realistic variation
      buildings = INITIAL_BUILDINGS.map((b) => ({ ...b }));
      centralBattery = { ...INITIAL_CENTRAL_BATTERY };
      mainGrid = { ...INITIAL_MAIN_GRID };
      break;
  }

  return { buildings, centralBattery, mainGrid };
}

/**
 * Simulates a realistic microgrid tick (slight fluctuations in solar, consumption, battery levels).
 */
export function simulateTickFluctuation(buildings, centralBattery) {
  const updatedBuildings = buildings.map((b) => {
    // Small random noise: -0.2 to +0.2 kW
    const solarDelta = (Math.random() - 0.5) * 0.4;
    const loadDelta = (Math.random() - 0.5) * 0.4;

    const newSolar = round1(Math.max(0, b.solarGeneration + solarDelta));
    const newConsumption = round1(Math.max(0.5, b.consumption + loadDelta));

    // Battery level fluctuates slightly based on current balance
    const currentBalance = newSolar - newConsumption;
    let battDelta = 0;
    if (currentBalance > 1) battDelta = 1;
    else if (currentBalance < -1) battDelta = -1;

    const newBatt = clamp(b.batteryLevel + battDelta, 5, 100);

    return {
      ...b,
      solarGeneration: newSolar,
      consumption: newConsumption,
      batteryLevel: newBatt,
    };
  });

  return updatedBuildings;
}

