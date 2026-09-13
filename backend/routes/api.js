const express = require('express');
const router = express.Router();
const gridController = require('../controllers/gridController');

const agentController = require('../controllers/agentController');

// Health Check
router.get('/health', gridController.getHealth);

// Core Grid & Building Endpoints
router.get('/grid', gridController.getGridState);
router.get('/buildings', gridController.getBuildings);
router.get('/buildings/:id', gridController.getBuildingById);
router.get('/battery', gridController.getCentralBattery);

// History & Event Logs
router.get('/transactions', gridController.getTransactions);
router.get('/ai-decisions', gridController.getAiDecisions);
router.get('/activity', gridController.getActivity);

// Agentic AI Endpoints
router.post('/agent/run', agentController.runAgent);
router.get('/agent/decisions', agentController.getAgentDecisions);
router.get('/agent/status', agentController.getAgentStatus);

// Simulation Controls
router.post('/simulation/reset', gridController.handleReset);
router.post('/simulation/scenario', gridController.handleScenario);
router.post('/simulation/tick', gridController.handleTick);

// Energy & Grid Operations
router.post('/energy/allocate', gridController.handleAllocate);
router.post('/grid/main-grid', gridController.handleMainGrid);

module.exports = router;

