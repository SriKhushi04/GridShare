# ⚡ GridShare

**GridShare** is an AI-enabled smart microgrid management and peer-to-peer (P2P) energy-sharing prototype designed for a local cluster of 5 buildings.

The platform coordinates renewable energy distribution across distributed prosumer nodes, maximizing local solar self-consumption and battery reserve utilization while minimizing dependence on the main power grid.

---

## 🏛️ System Architecture & Energy Priority

The core allocation engine enforces a strict deterministic hierarchy:

```text
┌─────────────────────────────────────────────────────────┐
│               DEFICIT OCCURS AT NODE                    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
      [Priority 1: P2P Building-to-Building Sharing]
      Surplus solar nodes supply deficit nodes directly
                            │
              (If deficit persists)
                            ▼
      [Priority 2: Central Battery Storage (100 kWh)]
      Discharges shared battery reserve to bridge local shortfall
                            │
              (If battery depleted)
                            ▼
      [Priority 3: Main Power Grid Fallback]
      Imports external grid power (only if Main Grid is ONLINE)
      If Main Grid is OFFLINE: Emergency load-shedding / unfulfilled demand
                            │
              (If excess surplus remains)
                            ▼
      [Central Battery Recharging]
      Remaining surplus charges shared battery up to 100% capacity
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (React Router v7)
- **Tooling**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Quality**: Oxlint

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express 5
- **Agent Intelligence**: Google Gemini API (`@google/genai`) with bounded multi-turn tool calling
- **Fallback Policy**: Built-in deterministic rule engine (`DETERMINISTIC_SAFETY_FALLBACK`)
- **State Model**: In-memory authoritative microgrid state (`GridState` singleton)

---

## 📁 Project Structure

```text
GridShare/
│
├── frontend/                     # React / Vite web client
│   ├── src/
│   │   ├── api/                  # API client (gridApi.js)
│   │   ├── components/           # UI components (MicrogridVisualization, StatCard, etc.)
│   │   ├── constants/            # Client constants (scenarios.js)
│   │   ├── context/              # Global state (GridContext.jsx)
│   │   ├── pages/                # Routes (Dashboard, Buildings, AIDecisions, Transactions)
│   │   └── utils/                # Styling and formatting helpers (statusHelpers.js)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Express REST API & Simulation Engine
│   ├── agent/                    # Autonomous agent loop, tool executors, prompts & schemas
│   │   ├── agentLoop.js          # Gemini function-calling loop
│   │   ├── agentPolicy.js        # Deterministic safety fallback policy
│   │   ├── agentTools.js         # Validated execution tools
│   │   └── agentService.js       # Agent orchestration
│   ├── config/                   # Baseline building and battery profiles
│   ├── controllers/              # HTTP request handlers (gridController, agentController)
│   ├── routes/                   # API route definitions (/api/*)
│   ├── services/                 # Business logic
│   │   ├── allocationService.js  # Authoritative P2P → Battery → Grid allocation
│   │   ├── gridService.js        # In-memory microgrid state & reservation ledger
│   │   └── simulationService.js  # Ticking noise & scenario management
│   ├── utils/                    # Grid metrics, unit conversion & calculation helpers
│   ├── server.js                 # HTTP server entry point
│   ├── smokeTest.js              # 18-assertion backend API test suite
│   ├── agentTest.js              # 31-assertion agent & accounting test suite
│   └── package.json
│
├── README.md                     # Repository documentation
└── .gitignore                    # Environment & local artifact rules
```

---

## 📊 Core Concepts & Accounting Model

### Instantaneous Power vs. Cumulative Energy
- **`currentImportKw`**: Instantaneous rate of grid import (kW snapshot for current tick). Correctly drives real-time badges and grid dependency ratio.
- **`cumulativeImportKwh`**: Integrated energy imported over simulation time:
  $$\Delta E_{\text{imported}} = \text{currentImportKw} \times \frac{\text{tickDurationSeconds}}{3600}$$
- **`tickDurationSeconds`**: Simulation step duration (default: 5 seconds).

### Centralized Reservation Model
- Physical building telemetry (`solarGeneration`, `consumption`, `batteryLevel`) remains immutable sensor data.
- P2P transfers are booked through an authoritative reservation ledger per tick:
  $$\text{AvailableSurplus}_i(t) = \max(0, G_i - C_i) - \text{ActiveReservedOutgoing}_i(t)$$
- Prevents double-spending of donor surplus across repeated agent iterations.
- Reservations settle into completed transaction records upon allocation completion.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v20+ and npm installed

### 2. Backend Setup
```bash
cd backend
npm install
copy .env.example .env     # (Optional) Add GEMINI_API_KEY for live agent mode
node server.js             # Starts on http://localhost:5000
```
*Note: If no `GEMINI_API_KEY` is provided, the backend operates seamlessly using its deterministic safety fallback.*

### 3. Frontend Setup
```bash
cd frontend
npm install
copy .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm run dev                # Starts on http://localhost:5173
```

### 4. Running Verification Tests
```bash
cd backend
npm test                   # Runs smoke tests & agent accounting tests (49/49 passed)

cd ../frontend
npx vite build             # Verifies clean production bundle
npx oxlint                 # Runs frontend linter
```

---

## 🔮 Scope Boundaries & Future Work

- **Energy Forecasting**: Currently, building forecasting fields display static advisory baselines. Upgrading to a 1-hour-ahead predictive model is scheduled for Phase 2.
- **Blockchain Integration**: Blockchain smart contracts and tokenized energy settlements are strictly out of scope for the current workstream. The system maintains clean transaction records (`transferIntentId`, `energyKwh`) designed for downstream on-chain ingestion.
- **Authentication**: Endpoints are currently open for local microgrid simulation and prototyping.

---

## 📜 License
Educational and research prototype.
