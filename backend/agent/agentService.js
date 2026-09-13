const { runAgentLoop } = require('./agentLoop');
const gridState = require('../services/gridService');

class AgentService {
  async runAgent(objective) {
    return await runAgentLoop(objective);
  }

  getRecentDecisions(limit = 10) {
    return gridState.aiDecisions.slice(0, limit);
  }

  getAgentStatus() {
    const hasKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
    return {
      enabled: true,
      mode: hasKey ? 'GEMINI_AGENT' : 'DETERMINISTIC_SAFETY_FALLBACK',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      apiKeyConfigured: hasKey,
      maxIterations: parseInt(process.env.MAX_AGENT_ITERATIONS || '5', 10),
      maxActions: parseInt(process.env.MAX_AGENT_ACTIONS || '3', 10),
      autoIntervalMs: parseInt(process.env.AGENT_AUTO_INTERVAL_MS || '5000', 10),
    };
  }
}

module.exports = new AgentService();

