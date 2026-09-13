const SURPLUS_THRESHOLD = 0.3;
const BATTERY_CAPACITY = 100;
const MAX_LOG_ENTRIES = 40;
const MAX_TRANSACTION_HISTORY = 60;
const MAX_DECISION_HISTORY = 30;

function round1(v) {
  return parseFloat(v.toFixed(1));
}

function round2(v) {
  return parseFloat(v.toFixed(2));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function calculateEnergyBalance(solarGeneration, consumption) {
  return round1(solarGeneration - consumption);
}

function calculateBuildingStatus(energyBalance) {
  if (energyBalance > SURPLUS_THRESHOLD) return 'SURPLUS';
  if (energyBalance < -SURPLUS_THRESHOLD) return 'DEFICIT';
  return 'BALANCED';
}

function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

let _idCounter = 0;
function generateId() {
  return `${Date.now()}-${(_idCounter++).toString(36)}`;
}

function calculateGridStatus(mainGridPower, centralBatteryPct, isMainGridOnline, hasUnmetDemand) {
  if (hasUnmetDemand) return 'CRITICAL';
  if (!isMainGridOnline) return 'GRID OFFLINE';
  if (mainGridPower > 3) return 'WARNING';
  if (centralBatteryPct < 20) return 'WARNING';
  return 'STABLE';
}

module.exports = {
  SURPLUS_THRESHOLD,
  BATTERY_CAPACITY,
  MAX_LOG_ENTRIES,
  MAX_TRANSACTION_HISTORY,
  MAX_DECISION_HISTORY,
  round1,
  round2,
  clamp,
  calculateEnergyBalance,
  calculateBuildingStatus,
  getTimestamp,
  generateId,
  calculateGridStatus,
};

