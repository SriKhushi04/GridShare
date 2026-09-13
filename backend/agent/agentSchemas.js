// Function tool declarations for Gemini Function Calling
const toolDeclarations = [
  {
    name: 'get_grid_state',
    description: 'Returns the complete authoritative current grid state (buildings, battery, main grid, status).',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'get_building_state',
    description: 'Returns the authoritative state of a specific building by buildingId (e.g., b01, b02).',
    parameters: {
      type: 'OBJECT',
      properties: {
        buildingId: { type: 'STRING', description: 'Building ID (b01, b02, b03, b04, b05)' },
      },
      required: ['buildingId'],
    },
  },
  {
    name: 'get_battery_state',
    description: 'Returns central battery capacity, current stored energy, percentage, and charge/discharge constraints.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'get_main_grid_status',
    description: 'Returns whether the Main Power Grid connection is currently ONLINE or OFFLINE.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'get_recent_transactions',
    description: 'Returns recent energy transfer transaction records.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'NUMBER', description: 'Number of recent transactions to return (default: 5)' },
      },
    },
  },
  {
    name: 'get_recent_agent_decisions',
    description: 'Returns recent AI decision log entries.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'NUMBER', description: 'Number of decisions to return (default: 5)' },
      },
    },
  },
  {
    name: 'calculate_energy_summary',
    description: 'Returns aggregated microgrid metrics: total generation, total consumption, surplus buildings list, and deficit buildings list.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'rank_energy_needs',
    description: 'Ranks deficit buildings according to deficit magnitude and battery level urgency.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'request_p2p_transfer',
    description: 'Requests a peer-to-peer energy transfer from a surplus building to a deficit building. Subject to backend validation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        fromBuilding: { type: 'STRING', description: 'Building ID of surplus source (e.g., b01)' },
        toBuilding: { type: 'STRING', description: 'Building ID of deficit target (e.g., b02)' },
        amountKwh: { type: 'NUMBER', description: 'Energy amount in kWh to transfer' },
      },
      required: ['fromBuilding', 'toBuilding', 'amountKwh'],
    },
  },
  {
    name: 'request_battery_charge',
    description: 'Requests charging the central battery using excess surplus from a building. Subject to backend validation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        buildingId: { type: 'STRING', description: 'Building ID of surplus source (e.g., b01)' },
        amountKwh: { type: 'NUMBER', description: 'Energy amount in kWh' },
      },
      required: ['buildingId', 'amountKwh'],
    },
  },
  {
    name: 'request_battery_discharge',
    description: 'Requests discharging the central battery to supply a deficit building. Subject to backend validation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        buildingId: { type: 'STRING', description: 'Building ID of target deficit building (e.g., b02)' },
        amountKwh: { type: 'NUMBER', description: 'Energy amount in kWh' },
      },
      required: ['buildingId', 'amountKwh'],
    },
  },
  {
    name: 'request_main_grid_supply',
    description: 'Requests drawing power from the Main Grid for a deficit building. Rejected if Main Grid is OFFLINE.',
    parameters: {
      type: 'OBJECT',
      properties: {
        buildingId: { type: 'STRING', description: 'Building ID of target deficit building (e.g., b02)' },
        amountKwh: { type: 'NUMBER', description: 'Energy amount in kWh' },
      },
      required: ['buildingId', 'amountKwh'],
    },
  },
  {
    name: 'verify_grid_state',
    description: 'Verifies the authoritative post-action grid state and balance status.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];

module.exports = { toolDeclarations };

