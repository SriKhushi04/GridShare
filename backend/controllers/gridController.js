const gridState = require('../services/gridService');
const { allocateEnergy } = require('../services/allocationService');
const { applyScenario, processTick, resetSimulation, SCENARIOS } = require('../services/simulationService');

// GET /api/health
function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'Grid Share Backend',
  });
}

// GET /api/grid
function getGridState(req, res) {
  res.json(gridState.getCompleteState());
}

// GET /api/buildings
function getBuildings(req, res) {
  res.json(gridState.buildings);
}

// GET /api/buildings/:id
function getBuildingById(req, res) {
  const building = gridState.getBuildingById(req.params.id);
  if (!building) {
    return res.status(404).json({ error: 'Building not found' });
  }
  res.json(building);
}

// GET /api/battery
function getCentralBattery(req, res) {
  res.json({
    capacity: gridState.centralBattery.capacity,
    currentEnergy: gridState.centralBattery.currentEnergy,
    percentage: gridState.centralBattery.percentage,
    batteryLevel: gridState.centralBattery.percentage,
  });
}

// GET /api/transactions
function getTransactions(req, res) {
  res.json(gridState.transactions);
}

// GET /api/ai-decisions
function getAiDecisions(req, res) {
  res.json(gridState.aiDecisions);
}

// GET /api/activity
function getActivity(req, res) {
  res.json(gridState.logs);
}

// POST /api/simulation/reset
function handleReset(req, res) {
  const updatedState = resetSimulation();
  res.json({ message: 'Simulation reset to baseline state', gridState: updatedState });
}

// POST /api/simulation/scenario
function handleScenario(req, res) {
  const { scenario } = req.body;

  if (!scenario || !SCENARIOS[scenario]) {
    return res.status(400).json({
      error: `Invalid scenario. Allowed scenarios: ${Object.keys(SCENARIOS).join(', ')}`,
    });
  }

  try {
    const updatedState = applyScenario(scenario);
    res.json({ message: `Scenario set to ${scenario}`, gridState: updatedState });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// POST /api/simulation/tick
function handleTick(req, res) {
  const updatedState = processTick();
  res.json({ message: 'Simulation tick processed', gridState: updatedState });
}

// POST /api/energy/allocate
function handleAllocate(req, res) {
  const updatedState = allocateEnergy();
  res.json({ message: 'Energy allocation executed', gridState: updatedState });
}

// POST /api/grid/main-grid
function handleMainGrid(req, res) {
  const { status } = req.body;

  if (status !== 'ONLINE' && status !== 'OFFLINE') {
    return res.status(400).json({ error: "Invalid main grid status. Must be 'ONLINE' or 'OFFLINE'." });
  }

  gridState.setMainGridStatus(status);
  const updatedState = allocateEnergy();
  res.json({ message: `Main grid status set to ${status}`, gridState: updatedState });
}

module.exports = {
  getHealth,
  getGridState,
  getBuildings,
  getBuildingById,
  getCentralBattery,
  getTransactions,
  getAiDecisions,
  getActivity,
  handleReset,
  handleScenario,
  handleTick,
  handleAllocate,
  handleMainGrid,
};

