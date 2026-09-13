const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}

export const gridApi = {
  // GET /api/health
  getHealth: () => fetchJson('/health'),

  // GET /api/grid
  getGridState: () => fetchJson('/grid'),

  // GET /api/buildings
  getBuildings: () => fetchJson('/buildings'),

  // GET /api/buildings/:id
  getBuildingById: (id) => fetchJson(`/buildings/${id}`),

  // GET /api/battery
  getBattery: () => fetchJson('/battery'),

  // GET /api/transactions
  getTransactions: () => fetchJson('/transactions'),

  // GET /api/ai-decisions
  getAiDecisions: () => fetchJson('/ai-decisions'),

  // GET /api/activity
  getActivity: () => fetchJson('/activity'),

  // POST /api/simulation/reset
  resetSimulation: () =>
    fetchJson('/simulation/reset', {
      method: 'POST',
    }),

  // POST /api/simulation/scenario
  setScenario: (scenario) =>
    fetchJson('/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    }),

  // POST /api/simulation/tick
  processTick: () =>
    fetchJson('/simulation/tick', {
      method: 'POST',
    }),

  // POST /api/energy/allocate
  allocateEnergy: () =>
    fetchJson('/energy/allocate', {
      method: 'POST',
    }),

  // POST /api/grid/main-grid
  setMainGridStatus: (status) =>
    fetchJson('/grid/main-grid', {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  // POST /api/agent/run
  runAgent: (objective) =>
    fetchJson('/agent/run', {
      method: 'POST',
      body: JSON.stringify({ objective }),
    }),

  // GET /api/agent/decisions
  getAgentDecisions: (limit = 10) => fetchJson(`/agent/decisions?limit=${limit}`),

  // GET /api/agent/status
  getAgentStatus: () => fetchJson('/agent/status'),
};

