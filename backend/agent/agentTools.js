const gridState = require('../services/gridService');
const {
  round1,
  getTimestamp,
  generateId,
  BATTERY_CAPACITY,
} = require('../utils/gridHelpers');

/**
 * Executes tool requests safely against the authoritative backend state.
 * Enforces strict physical & business constraints.
 */
async function executeTool(toolName, args = {}) {
  const currentState = gridState.getCompleteState();

  switch (toolName) {
    case 'get_grid_state':
      return { success: true, gridState: currentState };

    case 'get_building_state': {
      const b = gridState.getBuildingById(args.buildingId);
      if (!b) return { success: false, error: `Building ${args.buildingId} not found` };
      return { success: true, building: b };
    }

    case 'get_battery_state': {
      const cb = currentState.centralBattery;
      return {
        success: true,
        battery: {
          capacity: cb.capacity,
          currentEnergy: cb.currentEnergy,
          percentage: cb.percentage,
          availableDischarge: cb.currentEnergy,
          availableCharge: round1(cb.capacity - cb.currentEnergy),
        },
      };
    }

    case 'get_main_grid_status':
      return { success: true, mainGrid: currentState.mainGrid };

    case 'get_recent_transactions': {
      const limit = args.limit || 5;
      return { success: true, transactions: currentState.transactions.slice(0, limit) };
    }

    case 'get_recent_agent_decisions': {
      const limit = args.limit || 5;
      return { success: true, decisions: currentState.aiDecisions.slice(0, limit) };
    }

    case 'calculate_energy_summary': {
      const buildings = currentState.buildings;
      const surplusNodes = buildings.filter((b) => b.status === 'SURPLUS');
      const deficitNodes = buildings.filter((b) => b.status === 'DEFICIT');

      const totalSurplus = round1(surplusNodes.reduce((sum, b) => sum + b.energyBalance, 0));
      const totalDeficit = round1(deficitNodes.reduce((sum, b) => sum + Math.abs(b.energyBalance), 0));

      return {
        success: true,
        summary: {
          totalGeneration: currentState.summaryStats.totalGeneration,
          totalConsumption: currentState.summaryStats.totalConsumption,
          totalSurplus,
          totalDeficit,
          netImbalance: round1(totalSurplus - totalDeficit),
          surplusBuildings: surplusNodes.map((b) => ({ id: b.buildingId, name: b.name, surplus: b.energyBalance })),
          deficitBuildings: deficitNodes.map((b) => ({ id: b.buildingId, name: b.name, deficit: Math.abs(b.energyBalance) })),
        },
      };
    }

    case 'rank_energy_needs': {
      const deficits = currentState.buildings
        .filter((b) => b.status === 'DEFICIT')
        .map((b) => ({
          buildingId: b.buildingId,
          name: b.name,
          deficitKwh: Math.abs(b.energyBalance),
          batteryLevel: b.batteryLevel,
          urgency: b.batteryLevel < 35 ? 'HIGH' : 'MEDIUM',
        }))
        .sort((a, b) => a.batteryLevel - b.batteryLevel || b.deficitKwh - a.deficitKwh);

      return { success: true, rankedDeficits: deficits };
    }

    case 'request_p2p_transfer': {
      const { fromBuilding, toBuilding, amountKwh } = args;

      // Validation 1: Amount check
      if (!amountKwh || amountKwh <= 0 || isNaN(amountKwh)) {
        return { success: false, status: 'REJECTED', reason: 'INVALID_AMOUNT', message: 'Amount must be positive' };
      }

      // Validation 2: Source building check
      const srcNode = gridState.getBuildingById(fromBuilding);
      const tgtNode = gridState.getBuildingById(toBuilding);

      if (!srcNode || !tgtNode) {
        return { success: false, status: 'REJECTED', reason: 'INVALID_BUILDING_ID', message: 'Invalid building ID' };
      }

      // Validation 3: Physical surplus availability check
      const availableSurplus = srcNode.solarGeneration - srcNode.consumption;
      if (availableSurplus <= 0) {
        return {
          success: false,
          status: 'REJECTED',
          reason: 'INSUFFICIENT_SOURCE_ENERGY',
          message: `${srcNode.name} has no available surplus energy (${availableSurplus.toFixed(1)} kW)`,
        };
      }

      const transferAmount = round1(Math.min(amountKwh, availableSurplus));
      const timestamp = getTimestamp();

      const tx = {
        id: generateId(),
        from: fromBuilding,
        to: toBuilding,
        fromName: srcNode.name,
        toName: tgtNode.name,
        amount: transferAmount,
        type: 'P2P',
        timestamp,
        status: 'COMPLETED',
        active: true,
      };

      gridState.addTransactions([tx]);
      gridState.addLogs([
        {
          id: generateId(),
          timestamp,
          message: `AI Agent P2P Action: ${srcNode.name} → ${tgtNode.name} (${transferAmount} kWh)`,
          type: 'success',
        },
      ]);
      gridState.updateCalculatedMetrics();

      return {
        success: true,
        status: 'APPROVED',
        executedAmount: transferAmount,
        requestedAmount: amountKwh,
        transaction: tx,
      };
    }

    case 'request_battery_discharge': {
      const { buildingId, amountKwh } = args;

      if (!amountKwh || amountKwh <= 0 || isNaN(amountKwh)) {
        return { success: false, status: 'REJECTED', reason: 'INVALID_AMOUNT', message: 'Amount must be positive' };
      }

      const tgtNode = gridState.getBuildingById(buildingId);
      if (!tgtNode) {
        return { success: false, status: 'REJECTED', reason: 'INVALID_BUILDING_ID', message: 'Invalid building ID' };
      }

      const currentBatteryEnergy = gridState.centralBattery.currentEnergy;
      if (currentBatteryEnergy <= 0) {
        return {
          success: false,
          status: 'REJECTED',
          reason: 'BATTERY_DEPLETED',
          message: 'Central battery has zero available energy',
        };
      }

      const dischargeAmount = round1(Math.min(amountKwh, currentBatteryEnergy));
      gridState.updateCentralBattery(-dischargeAmount);
      const timestamp = getTimestamp();

      const tx = {
        id: generateId(),
        from: 'core',
        to: buildingId,
        fromName: 'Central Battery',
        toName: tgtNode.name,
        amount: dischargeAmount,
        type: 'CENTRAL_BATTERY',
        timestamp,
        status: 'COMPLETED',
        active: true,
      };

      gridState.addTransactions([tx]);
      gridState.addLogs([
        {
          id: generateId(),
          timestamp,
          message: `AI Agent Battery Discharge: ${dischargeAmount} kWh → ${tgtNode.name}`,
          type: 'action',
        },
      ]);
      gridState.updateCalculatedMetrics();

      return {
        success: true,
        status: 'APPROVED',
        executedAmount: dischargeAmount,
        transaction: tx,
      };
    }

    case 'request_battery_charge': {
      const { buildingId, amountKwh } = args;

      if (!amountKwh || amountKwh <= 0 || isNaN(amountKwh)) {
        return { success: false, status: 'REJECTED', reason: 'INVALID_AMOUNT', message: 'Amount must be positive' };
      }

      const srcNode = gridState.getBuildingById(buildingId);
      if (!srcNode) {
        return { success: false, status: 'REJECTED', reason: 'INVALID_BUILDING_ID', message: 'Invalid building ID' };
      }

      const roomInBattery = round1(BATTERY_CAPACITY - gridState.centralBattery.currentEnergy);
      if (roomInBattery <= 0) {
        return {
          success: false,
          status: 'REJECTED',
          reason: 'BATTERY_FULL',
          message: 'Central battery is already at 100% capacity',
        };
      }

      const chargeAmount = round1(Math.min(amountKwh, roomInBattery));
      gridState.updateCentralBattery(chargeAmount);
      const timestamp = getTimestamp();

      const tx = {
        id: generateId(),
        from: buildingId,
        to: 'core',
        fromName: srcNode.name,
        toName: 'Central Battery',
        amount: chargeAmount,
        type: 'CHARGE',
        timestamp,
        status: 'COMPLETED',
        active: false,
      };

      gridState.addTransactions([tx]);
      gridState.addLogs([
        {
          id: generateId(),
          timestamp,
          message: `AI Agent Battery Charge: +${chargeAmount} kWh from ${srcNode.name}`,
          type: 'success',
        },
      ]);
      gridState.updateCalculatedMetrics();

      return {
        success: true,
        status: 'APPROVED',
        executedAmount: chargeAmount,
        transaction: tx,
      };
    }

    case 'request_main_grid_supply': {
      const { buildingId, amountKwh } = args;

      // Validation 1: Grid Status Check
      if (currentState.mainGrid.status !== 'ONLINE') {
        return {
          success: false,
          status: 'REJECTED',
          reason: 'GRID_OFFLINE',
          message: 'Main Power Grid is currently OFFLINE. Cannot draw energy.',
        };
      }

      if (!amountKwh || amountKwh <= 0 || isNaN(amountKwh)) {
        return { success: false, status: 'REJECTED', reason: 'INVALID_AMOUNT', message: 'Amount must be positive' };
      }

      const tgtNode = gridState.getBuildingById(buildingId);
      if (!tgtNode) {
        return { success: false, status: 'REJECTED', reason: 'INVALID_BUILDING_ID', message: 'Invalid building ID' };
      }

      const timestamp = getTimestamp();
      gridState.mainGrid.powerImported = round1(gridState.mainGrid.powerImported + amountKwh);

      const tx = {
        id: generateId(),
        from: 'grid',
        to: buildingId,
        fromName: 'Main Power Grid',
        toName: tgtNode.name,
        amount: amountKwh,
        type: 'MAIN_GRID',
        timestamp,
        status: 'COMPLETED',
        active: true,
      };

      gridState.addTransactions([tx]);
      gridState.addLogs([
        {
          id: generateId(),
          timestamp,
          message: `AI Agent Main Grid Draw: ${amountKwh} kWh → ${tgtNode.name}`,
          type: 'warning',
        },
      ]);
      gridState.updateCalculatedMetrics();

      return {
        success: true,
        status: 'APPROVED',
        executedAmount: amountKwh,
        transaction: tx,
      };
    }

    case 'verify_grid_state': {
      const updated = gridState.getCompleteState();
      return {
        success: true,
        gridStatus: updated.gridStatus,
        summaryStats: updated.summaryStats,
        centralBattery: updated.centralBattery,
      };
    }

    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}

module.exports = { executeTool };

