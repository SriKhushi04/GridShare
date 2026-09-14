const gridState = require('./gridService');
const {
  round1,
  calculateEnergyBalance,
  calculateBuildingStatus,
  getTimestamp,
  generateId,
  BATTERY_CAPACITY,
  powerToEnergyKwh,
  TICK_DURATION_SECONDS,
} = require('../utils/gridHelpers');

/**
 * Deterministic Energy Allocation Engine
 * Priority 1: P2P energy sharing
 * Priority 2: Central Battery
 * Priority 3: Main Power Grid (if ONLINE)
 */
function allocateEnergy(options = {}) {
  const timestamp = getTimestamp();
  const actionLogs = [];
  const diagnosticLogs = [];
  const transactions = [];
  const aiDecisions = [];
  const activeTransfers = [];

  // Lifecycle: Settle any pending transfer reservations created by agent or engine
  gridState.settleReservations();

  // Update building balances & statuses first
  gridState.updateCalculatedMetrics();

  const buildings = gridState.buildings;
  const surplusMap = {};
  const deficitMap = {};

  buildings.forEach((b) => {
    if (b.status === 'SURPLUS') {
      surplusMap[b.buildingId] = b.energyBalance;
      diagnosticLogs.push({
        id: generateId(),
        timestamp,
        message: `${b.name} surplus identified: +${b.energyBalance} kW available`,
        type: 'info',
      });
    } else if (b.status === 'DEFICIT') {
      deficitMap[b.buildingId] = Math.abs(b.energyBalance);
      diagnosticLogs.push({
        id: generateId(),
        timestamp,
        message: `${b.name} deficit detected: −${Math.abs(b.energyBalance)} kW required`,
        type: 'warning',
      });
    }
  });

  let centralEnergy = gridState.centralBattery.currentEnergy;
  const isGridOnline = gridState.mainGrid.status === 'ONLINE';
  let mainGridPowerImported = 0;

  const deficitBuildingIds = Object.keys(deficitMap);
  const surplusBuildingIds = Object.keys(surplusMap);

  // -------------------------------------------------------------
  // PRIORITY 1: P2P Sharing
  // -------------------------------------------------------------
  deficitBuildingIds.forEach((defId) => {
    let remainingDeficit = deficitMap[defId];
    const defBuilding = buildings.find((b) => b.buildingId === defId);

    surplusBuildingIds.forEach((surId) => {
      if (remainingDeficit <= 0) return;
      const availSurplus = surplusMap[surId];
      if (availSurplus <= 0) return;

      const surBuilding = buildings.find((b) => b.buildingId === surId);
      const transferAmount = round1(Math.min(remainingDeficit, availSurplus));

      if (transferAmount > 0) {
        surplusMap[surId] = round1(surplusMap[surId] - transferAmount);
        deficitMap[defId] = round1(deficitMap[defId] - transferAmount);
        remainingDeficit = round1(remainingDeficit - transferAmount);

        const transferEnergyKwh = powerToEnergyKwh(transferAmount, gridState.tickDurationSeconds);
        const tx = {
          id: generateId(),
          from: surId,
          to: defId,
          fromName: surBuilding.name,
          toName: defBuilding.name,
          amount: transferAmount,
          amountKw: transferAmount,
          energyKwh: transferEnergyKwh,
          type: 'P2P',
          timestamp,
          status: 'COMPLETED',
          active: true,
        };

        transactions.push(tx);
        activeTransfers.push(tx);

        actionLogs.push({
          id: generateId(),
          timestamp,
          message: `P2P Transfer: ${surBuilding.name} → ${defBuilding.name} (${transferAmount} kW / ${transferEnergyKwh} kWh)`,
          type: 'success',
        });

        aiDecisions.push({
          id: generateId(),
          situation: `${defBuilding.name} has a ${defBuilding.energyBalance.toFixed(1)} kW deficit.`,
          decision: `Transfer ${transferAmount} kW (${transferEnergyKwh} kWh) from ${surBuilding.name} to ${defBuilding.name} via P2P.`,
          amount: transferAmount,
          amountKw: transferAmount,
          energyKwh: transferEnergyKwh,
          reason: 'P2P energy sharing takes priority over central battery discharge to preserve grid reserves.',
          result: 'COMPLETED',
          timestamp,
        });
      }
    });

    // -------------------------------------------------------------
    // PRIORITY 2: Central Battery
    // -------------------------------------------------------------
    if (remainingDeficit > 0) {
      if (centralEnergy > 0) {
        const battSupply = round1(Math.min(remainingDeficit, centralEnergy));
        centralEnergy = round1(centralEnergy - battSupply);
        deficitMap[defId] = round1(deficitMap[defId] - battSupply);
        remainingDeficit = round1(remainingDeficit - battSupply);

        const battEnergyKwh = powerToEnergyKwh(battSupply, gridState.tickDurationSeconds);
        const tx = {
          id: generateId(),
          from: 'core',
          to: defId,
          fromName: 'Central Battery',
          toName: defBuilding.name,
          amount: battSupply,
          amountKw: battSupply,
          energyKwh: battEnergyKwh,
          type: 'CENTRAL_BATTERY',
          timestamp,
          status: 'COMPLETED',
          active: true,
        };

        transactions.push(tx);
        activeTransfers.push(tx);

        actionLogs.push({
          id: generateId(),
          timestamp,
          message: `Central Battery discharged ${battSupply} kWh → ${defBuilding.name}`,
          type: 'action',
        });

        aiDecisions.push({
          id: generateId(),
          situation: `Peer surplus exhausted. ${defBuilding.name} still has a ${remainingDeficit.toFixed(1)} kW deficit.`,
          decision: `Dispatch ${battSupply} kWh from Central Battery to ${defBuilding.name}.`,
          amount: battSupply,
          amountKw: battSupply,
          energyKwh: battEnergyKwh,
          reason: 'Local P2P capacity exhausted. Discharging central reserves before requesting main grid power.',
          result: 'COMPLETED',
          timestamp,
        });
      }
    }

    // -------------------------------------------------------------
    // PRIORITY 3: Main Power Grid
    // -------------------------------------------------------------
    if (remainingDeficit > 0) {
      if (isGridOnline) {
        const gridSupply = remainingDeficit;
        mainGridPowerImported = round1(mainGridPowerImported + gridSupply);
        deficitMap[defId] = 0;
        remainingDeficit = 0;

        const gridEnergyKwh = powerToEnergyKwh(gridSupply, gridState.tickDurationSeconds);
        const tx = {
          id: generateId(),
          from: 'grid',
          to: defId,
          fromName: 'Main Power Grid',
          toName: defBuilding.name,
          amount: gridSupply,
          amountKw: gridSupply,
          energyKwh: gridEnergyKwh,
          type: 'MAIN_GRID',
          timestamp,
          status: 'COMPLETED',
          active: true,
        };

        transactions.push(tx);
        activeTransfers.push(tx);

        actionLogs.push({
          id: generateId(),
          timestamp,
          message: `Main Grid fallback activated: ${gridSupply} kW (${gridEnergyKwh} kWh) → ${defBuilding.name}`,
          type: 'warning',
        });

        aiDecisions.push({
          id: generateId(),
          situation: `P2P and Central Battery depleted. ${defBuilding.name} requires ${gridSupply} kW.`,
          decision: `Draw ${gridSupply} kW (${gridEnergyKwh} kWh) from Main Power Grid.`,
          amount: gridSupply,
          amountKw: gridSupply,
          energyKwh: gridEnergyKwh,
          reason: 'Last resort fallback activated to prevent power outage at node.',
          result: 'COMPLETED',
          timestamp,
        });
      } else {
        // Main grid is OFFLINE! Honest handling: do NOT fulfill from grid
        actionLogs.push({
          id: generateId(),
          timestamp,
          message: `CRITICAL: Unmet demand at ${defBuilding.name} (${remainingDeficit} kW)! Main Grid OFFLINE.`,
          type: 'alert',
        });

        aiDecisions.push({
          id: generateId(),
          situation: `${defBuilding.name} deficit (${remainingDeficit} kW) unfulfilled.`,
          decision: 'Main grid unavailable. Emergency load-shedding recommended.',
          amount: 0,
          amountKw: 0,
          energyKwh: 0,
          reason: 'Main Power Grid is OFFLINE and microgrid reserves are completely exhausted.',
          result: 'FAILED',
          timestamp,
        });
      }
    }
  });

  // Absorb excess surplus into central battery if space allows
  surplusBuildingIds.forEach((surId) => {
    const leftoverSurplus = surplusMap[surId];
    if (leftoverSurplus > 0 && centralEnergy < BATTERY_CAPACITY) {
      const room = round1(BATTERY_CAPACITY - centralEnergy);
      const chargeAmount = round1(Math.min(leftoverSurplus, room));

      if (chargeAmount > 0) {
        centralEnergy = round1(centralEnergy + chargeAmount);
        const surBuilding = buildings.find((b) => b.buildingId === surId);

        const chargeEnergyKwh = powerToEnergyKwh(chargeAmount, gridState.tickDurationSeconds);
        transactions.push({
          id: generateId(),
          from: surId,
          to: 'core',
          fromName: surBuilding.name,
          toName: 'Central Battery',
          amount: chargeAmount,
          amountKw: chargeAmount,
          energyKwh: chargeEnergyKwh,
          type: 'CHARGE',
          timestamp,
          status: 'COMPLETED',
          active: false,
        });

        actionLogs.push({
          id: generateId(),
          timestamp,
          message: `Central Battery charging: +${chargeAmount} kWh from ${surBuilding.name}`,
          type: 'success',
        });
      }
    }
  });

  // Apply state changes to central state (HIGH-007: instantaneous rate)
  gridState.centralBattery.currentEnergy = centralEnergy;
  gridState.mainGrid.currentImportKw = mainGridPowerImported;
  gridState.activeTransfers = activeTransfers;
  gridState.addLogs([...actionLogs, ...diagnosticLogs]);
  gridState.addTransactions(transactions);
  if (options && options.recordAiDecisions) {
    gridState.addAiDecisions(aiDecisions);
  }

  return gridState.getCompleteState();
}

module.exports = { allocateEnergy };

