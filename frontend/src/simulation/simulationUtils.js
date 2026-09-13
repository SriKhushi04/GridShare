// ============================================================
// SIMULATION UTILITIES — Pure helpers, no React
// ============================================================

export const SURPLUS_THRESHOLD = 0.3; // kW — below this is BALANCED
export const BATTERY_CAPACITY = 100;  // kWh — central battery capacity
export const MAX_LOG_ENTRIES = 40;
export const MAX_TRANSACTION_HISTORY = 60;
export const MAX_DECISION_HISTORY = 30;
export const TICK_INTERVAL_MS = 3000;  // 3 seconds per simulation tick

export function round1(v) {
  return parseFloat(v.toFixed(1));
}

export function round2(v) {
  return parseFloat(v.toFixed(2));
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function calculateBalance(solar, consumption) {
  return round1(solar - consumption);
}

export function calculateStatus(balance) {
  if (balance > SURPLUS_THRESHOLD) return 'SURPLUS';
  if (balance < -SURPLUS_THRESHOLD) return 'DEFICIT';
  return 'BALANCED';
}

export function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

let _idCounter = 0;
export function generateId() {
  return `${Date.now()}-${(_idCounter++).toString(36)}`;
}

/**
 * Determines grid-level status based on simulation state.
 * Used to drive the GridShareCore display and top-level warnings.
 */
export function calculateGridStatus(mainGridPower, centralBatteryPct, mainGridOnline, hasUnmetDemand) {
  if (hasUnmetDemand) return 'CRITICAL';
  if (!mainGridOnline) return 'GRID OFFLINE';
  if (mainGridPower > 3) return 'WARNING';
  if (centralBatteryPct < 20) return 'WARNING';
  return 'STABLE';
}
