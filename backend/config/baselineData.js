// Baseline initial state matching frontend specs exactly
const INITIAL_BUILDINGS = [
  {
    buildingId: 'b01',
    name: 'Building 01',
    shortName: 'B01',
    solarGeneration: 8.2,
    consumption: 5.1,
    batteryLevel: 74,
    energyBalance: 3.1,
    status: 'SURPLUS',
    position: { x: 50, y: 15 },
    aiPrediction: 'Solar generation expected to decrease by 12% in the next hour due to cloud cover.',
  },
  {
    buildingId: 'b02',
    name: 'Building 02',
    shortName: 'B02',
    solarGeneration: 2.4,
    consumption: 6.0,
    batteryLevel: 41,
    energyBalance: -3.6,
    status: 'DEFICIT',
    position: { x: 85, y: 40 },
    aiPrediction: 'Consumption peak expected at 23:00. Recommend pre-charging battery from P2P transfers.',
  },
  {
    buildingId: 'b03',
    name: 'Building 03',
    shortName: 'B03',
    solarGeneration: 9.1,
    consumption: 4.3,
    batteryLevel: 82,
    energyBalance: 4.8,
    status: 'SURPLUS',
    position: { x: 75, y: 80 },
    aiPrediction: 'Maximum surplus detected. Available for grid export or P2P sharing.',
  },
  {
    buildingId: 'b04',
    name: 'Building 04',
    shortName: 'B04',
    solarGeneration: 3.1,
    consumption: 7.0,
    batteryLevel: 32,
    energyBalance: -3.9,
    status: 'DEFICIT',
    position: { x: 25, y: 80 },
    aiPrediction: 'Critical battery level. Priority recipient for P2P transfers or central battery discharge.',
  },
  {
    buildingId: 'b05',
    name: 'Building 05',
    shortName: 'B05',
    solarGeneration: 5.2,
    consumption: 5.0,
    batteryLevel: 61,
    energyBalance: 0.2,
    status: 'BALANCED',
    position: { x: 15, y: 40 },
    aiPrediction: 'System in balance. Monitoring for demand fluctuations.',
  },
];

const INITIAL_CENTRAL_BATTERY = {
  capacity: 100,
  currentEnergy: 72,
  percentage: 72,
};

const INITIAL_MAIN_GRID = {
  status: 'ONLINE',
  powerImported: 0,
  powerExported: 0,
};

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx001',
    from: 'b01',
    to: 'b02',
    fromName: 'Building 01',
    toName: 'Building 02',
    amount: 3.0,
    type: 'P2P',
    timestamp: '22:14:06',
    status: 'COMPLETED',
    active: true,
  },
  {
    id: 'tx002',
    from: 'b03',
    to: 'b04',
    fromName: 'Building 03',
    toName: 'Building 04',
    amount: 2.0,
    type: 'P2P',
    timestamp: '22:10:33',
    status: 'COMPLETED',
    active: false,
  },
  {
    id: 'tx003',
    from: 'core',
    to: 'b04',
    fromName: 'Central Battery',
    toName: 'Building 04',
    amount: 1.5,
    type: 'CENTRAL_BATTERY',
    timestamp: '22:08:15',
    status: 'COMPLETED',
    active: false,
  },
];

const INITIAL_AI_DECISIONS = [
  {
    id: 'ad001',
    situation: 'Building 02 has a 3.6 kW energy deficit. Battery level at 41% and falling.',
    decision: 'Transfer 3.0 kWh from Building 01 to Building 02 via P2P channel.',
    amount: 3.0,
    amountKw: 3.0,
    amountKwh: 3.0,
    reason: 'Building 01 has a 3.1 kW surplus with battery at 74%. P2P sharing takes priority over central battery discharge.',
    result: 'COMPLETED',
    timestamp: '22:14:06',
    sourceMode: 'DETERMINISTIC_SAFETY_FALLBACK',
    model: null,
  },
  {
    id: 'ad002',
    situation: 'Building 04 battery critical at 32%. Deficit of 3.9 kW with no nearby surplus peer.',
    decision: 'Dispatch 1.5 kWh from Central Battery to Building 04.',
    amount: 1.5,
    amountKw: 1.5,
    amountKwh: 1.5,
    reason: 'No peer building has sufficient surplus to cover Building 04 deficit. Central battery at 72% — safe to discharge.',
    result: 'COMPLETED',
    timestamp: '22:08:15',
    sourceMode: 'DETERMINISTIC_SAFETY_FALLBACK',
    model: null,
  },
];

const INITIAL_ACTIVITY_LOG = [
  { id: 1, timestamp: '22:14:30', message: 'System balance nominal. Monitoring active.', type: 'info' },
  { id: 2, timestamp: '22:14:06', message: '3.0 kWh transferred: Building 01 → Building 02', type: 'success' },
  { id: 3, timestamp: '22:14:05', message: 'P2P transfer initiated via Grid Share Core', type: 'action' },
  { id: 4, timestamp: '22:14:04', message: 'Building 01 surplus identified: +3.1 kW available', type: 'info' },
  { id: 5, timestamp: '22:14:03', message: 'Building 02 deficit detected: −3.6 kW', type: 'warning' },
];

module.exports = {
  INITIAL_BUILDINGS,
  INITIAL_CENTRAL_BATTERY,
  INITIAL_MAIN_GRID,
  INITIAL_TRANSACTIONS,
  INITIAL_AI_DECISIONS,
  INITIAL_ACTIVITY_LOG,
};

