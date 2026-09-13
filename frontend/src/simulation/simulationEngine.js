import {
  calculateBalance,
  calculateStatus,
  calculateGridStatus,
  getTimestamp,
  generateId,
  round1,
  clamp,
  BATTERY_CAPACITY,
} from './simulationUtils';

/**
 * Pure deterministic simulation engine.
 * Hierarchy: P2P Sharing -> Central Battery -> Main Power Grid
 */
export function runSimulationEngine(currentState) {
  const timestamp = getTimestamp();
  const logs = [];
  const transactions = [];
  const aiDecisions = [];
  let activeTransfers = [];

  // 1. Calculate balance & status for each building
  let updatedBuildings = currentState.buildings.map((b) => {
    const energyBalance = calculateBalance(b.solarGeneration, b.consumption);
    const status = calculateStatus(energyBalance);
    return {
      ...b,
      energyBalance,
      status,
    };
  });

  // Track available surplus and deficits
  // Positive balance = surplus available; Negative balance = deficit needed
  const surplusMap = {};
  const deficitMap = {};

  updatedBuildings.forEach((b) => {
    if (b.status === 'SURPLUS') {
      surplusMap[b.buildingId] = b.energyBalance;
      logs.push({
        id: generateId(),
        timestamp,
        message: `${b.name} surplus identified: +${b.energyBalance} kW available`,
        type: 'info',
      });
    } else if (b.status === 'DEFICIT') {
      deficitMap[b.buildingId] = Math.abs(b.energyBalance);
      logs.push({
        id: generateId(),
        timestamp,
        message: `${b.name} deficit detected: −${Math.abs(b.energyBalance)} kW required`,
        type: 'warning',
      });
    }
  });

  // Central battery & Main grid working copies
  let centralEnergy = currentState.centralBattery.currentEnergy;
  let mainGridPower = 0;
  const isGridOnline = currentState.mainGrid.online;

  let totalP2PTransferred = 0;
  let totalBatteryTransferred = 0;
  let totalGridTransferred = 0;
  let hasUnmetDemand = false;

  // -------------------------------------------------------------
  // PRIORITY 1: P2P Energy Sharing between buildings
  // -------------------------------------------------------------
  const deficitBuildingIds = Object.keys(deficitMap);
  const surplusBuildingIds = Object.keys(surplusMap);

  deficitBuildingIds.forEach((defId) => {
    let remainingDeficit = deficitMap[defId];
    const defBuilding = updatedBuildings.find((b) => b.buildingId === defId);

    surplusBuildingIds.forEach((surId) => {
      if (remainingDeficit <= 0) return;
      const availSurplus = surplusMap[surId];
      if (availSurplus <= 0) return;

      const surBuilding = updatedBuildings.find((b) => b.buildingId === surId);

      const transferAmount = round1(Math.min(remainingDeficit, availSurplus));

      if (transferAmount > 0) {
        // Deduct from surplus & deficit trackers
        surplusMap[surId] = round1(surplusMap[surId] - transferAmount);
        deficitMap[defId] = round1(deficitMap[defId] - transferAmount);
        remainingDeficit = round1(remainingDeficit - transferAmount);
        totalP2PTransferred = round1(totalP2PTransferred + transferAmount);

        const tx = {
          id: generateId(),
          from: surId,
          to: defId,
          fromName: surBuilding.name,
          toName: defBuilding.name,
          amount: transferAmount,
          type: 'P2P',
          timestamp,
          status: 'COMPLETED',
          active: true,
        };

        transactions.push(tx);
        activeTransfers.push(tx);

        logs.push({
          id: generateId(),
          timestamp,
          message: `P2P Transfer: ${surBuilding.name} → ${defBuilding.name} (${transferAmount} kWh)`,
          type: 'success',
        });

        aiDecisions.push({
          id: generateId(),
          situation: `${defBuilding.name} has a ${defBuilding.energyBalance.toFixed(1)} kW deficit.`,
          decision: `Transfer ${transferAmount} kWh from ${surBuilding.name} to ${defBuilding.name} via P2P.`,
          amount: transferAmount,
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
        totalBatteryTransferred = round1(totalBatteryTransferred + battSupply);

        const tx = {
          id: generateId(),
          from: 'core',
          to: defId,
          fromName: 'Central Battery',
          toName: defBuilding.name,
          amount: battSupply,
          type: 'BATTERY',
          timestamp,
          status: 'COMPLETED',
          active: true,
        };

        transactions.push(tx);
        activeTransfers.push(tx);

        logs.push({
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
          reason: 'Local P2P capacity exhausted. Discharging central reserves before requesting main grid power.',
          result: 'COMPLETED',
          timestamp,
        });
      }
    }

    // -------------------------------------------------------------
    // PRIORITY 3: Main Power Grid (Last Resort)
    // -------------------------------------------------------------
    if (remainingDeficit > 0) {
      if (isGridOnline) {
        const gridSupply = remainingDeficit;
        mainGridPower = round1(mainGridPower + gridSupply);
        totalGridTransferred = round1(totalGridTransferred + gridSupply);
        deficitMap[defId] = 0;
        remainingDeficit = 0;

        const tx = {
          id: generateId(),
          from: 'grid',
          to: defId,
          fromName: 'Main Power Grid',
          toName: defBuilding.name,
          amount: gridSupply,
          type: 'GRID',
          timestamp,
          status: 'COMPLETED',
          active: true,
        };

        transactions.push(tx);
        activeTransfers.push(tx);

        logs.push({
          id: generateId(),
          timestamp,
          message: `Main Grid fallback activated: ${gridSupply} kWh → ${defBuilding.name}`,
          type: 'warning',
        });

        aiDecisions.push({
          id: generateId(),
          situation: `P2P and Central Battery depleted. ${defBuilding.name} requires ${gridSupply} kWh.`,
          decision: `Draw ${gridSupply} kWh from Main Power Grid.`,
          amount: gridSupply,
          reason: 'Last resort fallback activated to prevent power outage at node.',
          result: 'COMPLETED',
          timestamp,
        });
      } else {
        // Main grid unavailable!
        hasUnmetDemand = true;
        logs.push({
          id: generateId(),
          timestamp,
          message: `CRITICAL: Unmet demand at ${defBuilding.name} (${remainingDeficit} kWh)! Main Grid OFFLINE.`,
          type: 'alert',
        });

        aiDecisions.push({
          id: generateId(),
          situation: `${defBuilding.name} deficit (${remainingDeficit} kWh) unfulfilled.`,
          decision: 'Main grid unavailable. Emergency load-shedding recommended.',
          amount: 0,
          reason: 'Main Power Grid is OFFLINE and microgrid reserves are completely exhausted.',
          result: 'CRITICAL',
          timestamp,
        });
      }
    }
  });

  // -------------------------------------------------------------
  // ABSORB REMAINING SURPLUS INTO CENTRAL BATTERY
  // -------------------------------------------------------------
  surplusBuildingIds.forEach((surId) => {
    const leftoverSurplus = surplusMap[surId];
    if (leftoverSurplus > 0 && centralEnergy < BATTERY_CAPACITY) {
      const room = round1(BATTERY_CAPACITY - centralEnergy);
      const chargeAmount = round1(Math.min(leftoverSurplus, room));

      if (chargeAmount > 0) {
        centralEnergy = round1(centralEnergy + chargeAmount);
        const surBuilding = updatedBuildings.find((b) => b.buildingId === surId);

        transactions.push({
          id: generateId(),
          from: surId,
          to: 'core',
          fromName: surBuilding.name,
          toName: 'Central Battery',
          amount: chargeAmount,
          type: 'CHARGE',
          timestamp,
          status: 'COMPLETED',
          active: false,
        });

        logs.push({
          id: generateId(),
          timestamp,
          message: `Central Battery charging: +${chargeAmount} kWh from ${surBuilding.name}`,
          type: 'success',
        });
      }
    }
  });

  // Calculate updated central battery percentage
  const newBatteryLevel = round1(clamp((centralEnergy / BATTERY_CAPACITY) * 100, 0, 100));

  const updatedCentralBattery = {
    ...currentState.centralBattery,
    currentEnergy: centralEnergy,
    batteryLevel: newBatteryLevel,
  };

  const updatedMainGrid = {
    online: isGridOnline,
    power: mainGridPower,
  };

  // Determine overall grid status
  const gridStatus = calculateGridStatus(mainGridPower, newBatteryLevel, isGridOnline, hasUnmetDemand);

  // Summary Metrics calculation
  const totalGeneration = round1(updatedBuildings.reduce((acc, b) => acc + b.solarGeneration, 0));
  const totalConsumption = round1(updatedBuildings.reduce((acc, b) => acc + b.consumption, 0));
  const mainGridDependency = totalConsumption > 0 ? round1((mainGridPower / totalConsumption) * 100) : 0;

  return {
    buildings: updatedBuildings,
    centralBattery: updatedCentralBattery,
    mainGrid: updatedMainGrid,
    gridStatus,
    summaryStats: {
      totalGeneration,
      totalConsumption,
      p2pTransfer: totalP2PTransferred,
      centralBattery: newBatteryLevel,
      mainGridDependency,
    },
    newLogs: logs,
    newTransactions: transactions,
    newAiDecisions: aiDecisions,
    activeTransfers,
  };
}

