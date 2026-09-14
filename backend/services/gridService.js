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
  TICK_DURATION_SECONDS,
  powerToEnergyKwh,
  round2,
  getTimestamp,
  generateId,
} = require('../utils/gridHelpers');

// In-Memory Central Grid State
class GridState {
  constructor() {
    this.reset();
  }

  reset() {
    this.tickDurationSeconds = TICK_DURATION_SECONDS;
    this.tickId = 0;
    this.buildings = INITIAL_BUILDINGS.map((b) => ({ ...b }));
    this.centralBattery = { ...INITIAL_CENTRAL_BATTERY };
    this.mainGrid = {
      status: INITIAL_MAIN_GRID.status || 'ONLINE',
      currentImportKw: 0,
      cumulativeImportKwh: 0,
      powerExported: 0,
      get powerImported() {
        return this.currentImportKw;
      },
      set powerImported(val) {
        this.currentImportKw = round1(val);
      },
      get power() {
        return this.currentImportKw;
      },
      set power(val) {
        this.currentImportKw = round1(val);
      },
      get online() {
        return this.status === 'ONLINE';
      },
    };
    this.activeTransfers = INITIAL_TRANSACTIONS.filter((t) => t.active);
    this.completedTransfers = INITIAL_TRANSACTIONS.filter((t) => !t.active);
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.aiDecisions = [...INITIAL_AI_DECISIONS];
    this.logs = [...INITIAL_ACTIVITY_LOG];
    this.currentScenario = 'NORMAL';

    // Authoritative Reservation Ledger (HIGH-006)
    // Structure per intent: { transferId, tickId, timestamp, sourceNode, targetNode, amountKwh, amountKw, type, authorization, status }
    this.activeReservations = [];

    this.updateCalculatedMetrics();
  }

  // Get unreserved available surplus for a node (HIGH-006)
  getAvailableSurplus(buildingId) {
    const b = this.getBuildingById(buildingId);
    if (!b) return 0;
    const baseSurplus = Math.max(0, b.solarGeneration - b.consumption);
    const reservedKw = this.activeReservations
      .filter((r) => r.sourceNode === buildingId && (r.status === 'RESERVED' || r.status === 'SETTLED'))
      .reduce((sum, r) => sum + (r.amountKw !== undefined ? r.amountKw : r.amountKwh), 0);
    return round1(Math.max(0, baseSurplus - reservedKw));
  }

  // Create an energy transfer reservation (HIGH-006)
  createReservation({ sourceNode, targetNode, amountKw, type = 'P2P', authorization = {} }) {
    const avail = this.getAvailableSurplus(sourceNode);
    if (amountKw <= 0 || isNaN(amountKw)) {
      return { success: false, reason: 'INVALID_AMOUNT', message: 'Amount must be positive' };
    }
    if (amountKw > avail) {
      return {
        success: false,
        reason: 'INSUFFICIENT_SOURCE_ENERGY',
        message: `Available surplus (${avail.toFixed(1)} kW) is less than requested (${amountKw.toFixed(1)} kW)`,
      };
    }

    const transferAmountKw = round1(amountKw);
    const amountKwh = powerToEnergyKwh(transferAmountKw, this.tickDurationSeconds);
    const timestamp = getTimestamp();
    const transferId = generateId();

    const intent = {
      transferId,
      tickId: this.tickId,
      timestamp,
      sourceNode,
      targetNode,
      amountKw: transferAmountKw,
      amountKwh,
      type,
      authorization,
      status: 'RESERVED',
    };

    this.activeReservations.push(intent);
    return { success: true, intent, remainingSurplus: this.getAvailableSurplus(sourceNode) };
  }

  // Settle reservations into completed transactions
  settleReservations() {
    const settledTransactions = [];
    for (const res of this.activeReservations) {
      if (res.status === 'RESERVED') {
        res.status = 'SETTLED';
        const srcBuilding = this.getBuildingById(res.sourceNode);
        const tgtBuilding = this.getBuildingById(res.targetNode);

        const tx = {
          id: res.transferId,
          from: res.sourceNode,
          to: res.targetNode,
          fromName: srcBuilding ? srcBuilding.name : res.sourceNode,
          toName: tgtBuilding ? tgtBuilding.name : res.targetNode,
          amount: res.amountKwh,
          amountKw: res.amountKw,
          type: res.type,
          timestamp: res.timestamp,
          status: 'COMPLETED',
          active: true,
          transferIntentId: res.transferId,
        };

        settledTransactions.push(tx);
      }
    }

    if (settledTransactions.length > 0) {
      this.addTransactions(settledTransactions);
      this.activeTransfers = [...settledTransactions, ...this.activeTransfers];
    }
    return settledTransactions;
  }

  // Clear active reservations at close of tick (HIGH-006 lifecycle: CLOSE TICK)
  clearActiveReservations() {
    this.activeReservations = [];
  }

  // Accumulate energy from current power and tick duration (HIGH-007)
  integrateTickEnergy() {
    if (this.mainGrid.status === 'ONLINE' && this.mainGrid.currentImportKw > 0) {
      const importedEnergyKwh = (this.mainGrid.currentImportKw * this.tickDurationSeconds) / 3600;
      this.mainGrid.cumulativeImportKwh = round2(this.mainGrid.cumulativeImportKwh + importedEnergyKwh);
    }
  }

  updateCalculatedMetrics() {
    // Recalculate energy balance & status for each building (physical telemetry unaltered)
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
      this.mainGrid.currentImportKw,
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
        .reduce((sum, t) => sum + (t.amountKw !== undefined ? t.amountKw : t.amount), 0)
    );
    const mainGridDep = totalCons > 0 ? round1((this.mainGrid.currentImportKw / totalCons) * 100) : 0;

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
      tickId: this.tickId,
      tickDurationSeconds: this.tickDurationSeconds,
      buildings: this.buildings,
      centralBattery: {
        capacity: this.centralBattery.capacity,
        currentEnergy: this.centralBattery.currentEnergy,
        percentage: this.centralBattery.percentage,
        batteryLevel: this.centralBattery.percentage,
      },
      mainGrid: {
        status: this.mainGrid.status,
        currentImportKw: this.mainGrid.currentImportKw,
        cumulativeImportKwh: this.mainGrid.cumulativeImportKwh,
        powerImported: this.mainGrid.currentImportKw,
        powerExported: this.mainGrid.powerExported,
        // Frontend support compatibility
        connection: this.mainGrid.status,
        power: this.mainGrid.currentImportKw,
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
      activeReservations: this.activeReservations,
      transactions: this.transactions,
      aiDecisions: this.aiDecisions,
      logs: this.logs,
      currentScenario: this.currentScenario,
    };
  }

  getBuildingById(id) {
    if (!id) return null;
    const cleanId = String(id).toLowerCase().trim();
    return this.buildings.find((b) => {
      const bId = b.buildingId.toLowerCase();
      if (bId === cleanId) return true;
      const num1 = cleanId.replace(/\D/g, '');
      const num2 = bId.replace(/\D/g, '');
      return num1 && num2 && parseInt(num1, 10) === parseInt(num2, 10);
    });
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
        this.mainGrid.currentImportKw = 0;
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

