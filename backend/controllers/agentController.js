const agentService = require('../agent/agentService');

// POST /api/agent/run
async function runAgent(req, res) {
  try {
    const { objective } = req.body || {};
    const result = await agentService.runAgent(objective);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Agent execution failed' });
  }
}

// GET /api/agent/decisions
function getAgentDecisions(req, res) {
  const limit = parseInt(req.query.limit || '10', 10);
  res.json(agentService.getRecentDecisions(limit));
}

// GET /api/agent/status
function getAgentStatus(req, res) {
  res.json(agentService.getAgentStatus());
}

module.exports = {
  runAgent,
  getAgentDecisions,
  getAgentStatus,
};

