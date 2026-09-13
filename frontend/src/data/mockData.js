// ============================================================
// GRID SHARE — MOCK DATA
// All mock data lives here. Replace with API calls in Phase 2.
// ============================================================

export const buildings = [
  {
    buildingId: 'b01',
    name: 'Building 01',
    shortName: 'B01',
    solarGeneration: 8.2,
    consumption: 5.1,
    batteryLevel: 74,
    energyBalance: 3.1,
    status: 'SURPLUS',
    position: { x: 50, y: 15 }, // percent-based for SVG layout
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

export const gridCore = {
  aiStatus: 'ACTIVE',
  centralBattery: 72,
  gridLoad: 18.4,
  energyBalance: 2.6,
  gridStatus: 'STABLE',
};

export const mainGrid = {
  connection: 'ONLINE',
  power: 0,
};

export const summaryStats = {
  totalGeneration: 28.0,
  totalConsumption: 27.4,
  p2pTransfer: 5.0,
  centralBattery: 72,
  mainGridDependency: 8,
};

export const energyTransfers = [
  {
    id: 'tx001',
    from: 'b01',
    to: 'b02',
    fromName: 'Building 01',
    toName: 'Building 02',
    amount: 3.0,
    type: 'P2P',
    timestamp: '22:14:06',
    status: 'VERIFIED',
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
    status: 'VERIFIED',
    active: false,
  },
  {
    id: 'tx003',
    from: 'core',
    to: 'b04',
    fromName: 'Central Battery',
    toName: 'Building 04',
    amount: 1.5,
    type: 'BATTERY',
    timestamp: '22:08:15',
    status: 'VERIFIED',
    active: false,
  },
  {
    id: 'tx004',
    from: 'b01',
    to: 'core',
    fromName: 'Building 01',
    toName: 'Central Battery',
    amount: 1.2,
    type: 'CHARGE',
    timestamp: '22:05:44',
    status: 'VERIFIED',
    active: false,
  },
  {
    id: 'tx005',
    from: 'b03',
    to: 'b02',
    fromName: 'Building 03',
    toName: 'Building 02',
    amount: 2.5,
    type: 'P2P',
    timestamp: '21:58:20',
    status: 'VERIFIED',
    active: false,
  },
  {
    id: 'tx006',
    from: 'grid',
    to: 'b04',
    fromName: 'Main Grid',
    toName: 'Building 04',
    amount: 0.8,
    type: 'GRID',
    timestamp: '21:52:10',
    status: 'VERIFIED',
    active: false,
  },
];

export const aiDecisions = [
  {
    id: 'ad001',
    situation: 'Building 02 has a 3.6 kW energy deficit. Battery level at 41% and falling.',
    decision: 'Transfer 3.0 kWh from Building 01 to Building 02 via P2P channel.',
    amount: 3.0,
    reason:
      'Building 01 has a 3.1 kW surplus with battery at 74%. P2P sharing takes priority over central battery discharge to preserve grid-level reserves. Transfer amount optimized to not deplete Building 01 below balanced threshold.',
    result: 'COMPLETED',
    timestamp: '22:14:06',
  },
  {
    id: 'ad002',
    situation: 'Building 04 battery critical at 32%. Deficit of 3.9 kW with no nearby surplus peer.',
    decision: 'Dispatch 1.5 kWh from Central Battery to Building 04.',
    amount: 1.5,
    reason:
      'No peer building has sufficient surplus to cover Building 04 deficit without disrupting their own balance. Central battery at 72% — safe to discharge. Main grid not required.',
    result: 'COMPLETED',
    timestamp: '22:08:15',
  },
  {
    id: 'ad003',
    situation: 'Building 03 solar generation at maximum (9.1 kW). Surplus of 4.8 kW detected.',
    decision: 'Route 2.0 kWh to Building 04 and 1.2 kWh to charge Central Battery.',
    amount: 3.2,
    reason:
      'Distributed surplus to highest-priority deficit node and partially recharged central reserves. Prevents energy waste and prepares the system for evening peak.',
    result: 'COMPLETED',
    timestamp: '22:05:44',
  },
  {
    id: 'ad004',
    situation: 'System-wide energy balance: +2.6 kW. All buildings in stable or surplus state.',
    decision: 'Maintain P2P routing. No grid export required. Continue monitoring.',
    amount: 0,
    reason:
      'Current generation exceeds consumption by 2.6 kW across the microgrid. Central battery charging from distributed surplus. Main grid dependency at 0 kW. System operating at optimal efficiency.',
    result: 'ACTIVE',
    timestamp: '22:14:30',
  },
];

export const aiActivityLog = [
  { id: 1, timestamp: '22:14:30', message: 'System balance nominal. Monitoring active.', type: 'info' },
  { id: 2, timestamp: '22:14:06', message: '3.0 kWh transferred: Building 01 → Building 02', type: 'success' },
  { id: 3, timestamp: '22:14:05', message: 'P2P transfer initiated via Grid Share Core', type: 'action' },
  { id: 4, timestamp: '22:14:04', message: 'Building 01 surplus identified: +3.1 kW available', type: 'info' },
  { id: 5, timestamp: '22:14:03', message: 'Building 02 deficit detected: −3.6 kW', type: 'warning' },
  { id: 6, timestamp: '22:08:15', message: 'Central battery discharged 1.5 kWh → Building 04', type: 'success' },
  { id: 7, timestamp: '22:08:10', message: 'Building 04 battery critical: 32%', type: 'alert' },
  { id: 8, timestamp: '22:05:44', message: 'Central battery charging: +1.2 kWh from Building 01', type: 'success' },
  { id: 9, timestamp: '22:05:30', message: 'Building 03 maximum solar output: 9.1 kW', type: 'info' },
  { id: 10, timestamp: '21:58:20', message: '2.5 kWh transferred: Building 03 → Building 02', type: 'success' },
];

export const buildingDetails = {
  b01: {
    recentTransfers: [
      { direction: 'OUT', to: 'Building 02', amount: 3.0, timestamp: '22:14:06', status: 'VERIFIED' },
      { direction: 'OUT', to: 'Central Battery', amount: 1.2, timestamp: '22:05:44', status: 'VERIFIED' },
    ],
  },
  b02: {
    recentTransfers: [
      { direction: 'IN', from: 'Building 01', amount: 3.0, timestamp: '22:14:06', status: 'VERIFIED' },
      { direction: 'IN', from: 'Building 03', amount: 2.5, timestamp: '21:58:20', status: 'VERIFIED' },
    ],
  },
  b03: {
    recentTransfers: [
      { direction: 'OUT', to: 'Building 04', amount: 2.0, timestamp: '22:10:33', status: 'VERIFIED' },
      { direction: 'OUT', to: 'Building 02', amount: 2.5, timestamp: '21:58:20', status: 'VERIFIED' },
    ],
  },
  b04: {
    recentTransfers: [
      { direction: 'IN', from: 'Building 03', amount: 2.0, timestamp: '22:10:33', status: 'VERIFIED' },
      { direction: 'IN', from: 'Central Battery', amount: 1.5, timestamp: '22:08:15', status: 'VERIFIED' },
      { direction: 'IN', from: 'Main Grid', amount: 0.8, timestamp: '21:52:10', status: 'VERIFIED' },
    ],
  },
  b05: {
    recentTransfers: [],
  },
};

