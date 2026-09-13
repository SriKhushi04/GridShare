const {
  INITIAL_BUILDINGS,
  INITIAL_CENTRAL_BATTERY,
  INITIAL_MAIN_GRID,
  INITIAL_TRANSACTIONS,
  INITIAL_AI_DECISIONS,
  INITIAL_ACTIVITY_LOG,
} = require('../config/baselineData');
const {
  round1,
  clamp,
  calculateEnergyBalance,
  calculateBuildingStatus,
  calculateGridStatus,
  BATTERY_CAPACITY,
  MAX_LOG_ENTRIES,
  MAX_TRANSACTION_HISTORY,
  MAX_DECISION_HISTORY,
} = require('../utils/gridHelpers');

// In-Memory Central Grid State
class GridState {
  constructor() {
    this.reset();
  }

  reset() {
    this.buildings = INITIAL_BUILDINGS.map((b) => ({ ...b }));
    this.centralBattery = { ...INITIAL_CENTRAL_BATTERY };
    this.mainGrid = { ...INITIAL_MAIN_GRID };
    this.activeTransfers = INITIAL_TRANSACTIONS.filter((t) => t.active);
    this.completedTransfers = INITIAL_TRANSACTIONS.filter((t) => !t.active);
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.aiDecisions = [...INITIAL_AI_DECISIONS];
    this.logs = [...INITIAL_ACTIVITY_LOG];
    this.currentScenario = 'NORMAL';
    this.updateCalculatedMetrics();
  }

  updateCalculatedMetrics() {
    // Recalculate energy balance & status for each building
    this.buildings = this.buildings.map((b) => {
      const energyBalance = calculateEnergyBalance(b.solarGeneration, b.consumption);
      const status = calculateBuildingStatus(energyBalance);
      return {
        ...b,
        energyBalance,
        status,
      };
    });

    // Central Battery percentage
    this.centralBattery.percentage = round1(
      clamp((this.centralBattery.currentEnergy / this.centralBattery.capacity) * 100, 0, 100)
    );

    // Grid Status
    const hasUnmetDemand = this.logs.some((l) => l.type === 'alert' && l.message.includes('CRITICAL'));
    this.gridStatus = calculateGridStatus(
      this.mainGrid.powerImported,
      this.centralBattery.percentage,
      this.mainGrid.status === 'ONLINE',
      hasUnmetDemand
    );

    // Summary Totals
    const totalGen = round1(this.buildings.reduce((sum, b) => sum + b.solarGeneration, 0));
    const totalCons = round1(this.buildings.reduce((sum, b) => sum + b.consumption, 0));
    const p2pTotal = round1(
      this.activeTransfers
        .filter((t) => t.type === 'P2P')
        .reduce((sum, t) => sum + t.amount, 0)
    );
    const mainGridDep = totalCons > 0 ? round1((this.mainGrid.powerImported / totalCons) * 100) : 0;

    this.summaryStats = {
      totalGeneration: totalGen,
      totalConsumption: totalCons,
      p2pEnergyTransfer: p2pTotal,
      centralBattery: this.centralBattery.percentage,
      mainGridDependency: mainGridDep,
    };
  }

  getCompleteState() {
    this.updateCalculatedMetrics();
    return {
      buildings: this.buildings,
      centralBattery: {
        capacity: this.centralBattery.capacity,
        currentEnergy: this.centralBattery.currentEnergy,
        percentage: this.centralBattery.percentage,
        // Frontend support compatibility
        batteryLevel: this.centralBattery.percentage,
      },
      mainGrid: {
        status: this.mainGrid.status,
        powerImported: this.mainGrid.powerImported,
        powerExported: this.mainGrid.powerExported,
        // Frontend support compatibility
        connection: this.mainGrid.status,
        power: this.mainGrid.powerImported,
        online: this.mainGrid.status === 'ONLINE',
      },
      gridStatus: this.gridStatus,
      summaryStats: {
        totalGeneration: this.summaryStats.totalGeneration,
        totalConsumption: this.summaryStats.totalConsumption,
        p2pTransfer: this.summaryStats.p2pEnergyTransfer,
        centralBattery: this.summaryStats.centralBattery,
        mainGridDependency: this.summaryStats.mainGridDependency,
      },
      activeTransfers: this.activeTransfers,
      transactions: this.transactions,
      aiDecisions: this.aiDecisions,
      logs: this.logs,
      currentScenario: this.currentScenario,
    };
  }

  getBuildingById(id) {
    return this.buildings.find((b) => b.buildingId === id);
  }

  updateBuilding(id, updateData) {
    const idx = this.buildings.findIndex((b) => b.buildingId === id);
    if (idx === -1) return null;

    if (updateData.solarGeneration !== undefined) {
      this.buildings[idx].solarGeneration = Math.max(0, updateData.solarGeneration);
    }
    if (updateData.consumption !== undefined) {
      this.buildings[idx].consumption = Math.max(0, updateData.consumption);
    }
    if (updateData.batteryLevel !== undefined) {
      this.buildings[idx].batteryLevel = clamp(updateData.batteryLevel, 0, 100);
    }

    this.updateCalculatedMetrics();
    return this.buildings[idx];
  }

  updateCentralBattery(energyDelta) {
    const newEnergy = clamp(this.centralBattery.currentEnergy + energyDelta, 0, this.centralBattery.capacity);
    this.centralBattery.currentEnergy = round1(newEnergy);
    this.updateCalculatedMetrics();
    return this.centralBattery;
  }

  setMainGridStatus(status) {
    if (status === 'ONLINE' || status === 'OFFLINE') {
      this.mainGrid.status = status;
      if (status === 'OFFLINE') {
        this.mainGrid.powerImported = 0;
      }
      this.updateCalculatedMetrics();
    }
    return this.mainGrid;
  }

  addLogs(newLogs) {
    if (Array.isArray(newLogs) && newLogs.length > 0) {
      this.logs = [...newLogs, ...this.logs].slice(0, MAX_LOG_ENTRIES);
    }
  }

  addTransactions(newTx) {
    if (Array.isArray(newTx) && newTx.length > 0) {
      this.transactions = [...newTx, ...this.transactions].slice(0, MAX_TRANSACTION_HISTORY);
    }
  }

  addAiDecisions(newDecisions) {
    if (Array.isArray(newDecisions) && newDecisions.length > 0) {
      this.aiDecisions = [...newDecisions, ...this.aiDecisions].slice(0, MAX_DECISION_HISTORY);
    }
  }
}

// Export singleton instance
const gridStateInstance = new GridState();
module.exports = gridStateInstance;

