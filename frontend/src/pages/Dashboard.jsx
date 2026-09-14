import React from 'react';
import { Sun, Zap, ArrowLeftRight, Battery, Plug, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';
import MicrogridVisualization from '../components/MicrogridVisualization';
import AIActivityPanel from '../components/AIActivityPanel';
import SimulationControls from '../components/SimulationControls';
import TopBar from '../components/TopBar';
import { useGrid } from '../context/GridContext';

export default function Dashboard() {
  const { state, loading, error, refreshGridState } = useGrid();

  if (loading && !state) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
        <TopBar title="Dashboard" subtitle="Live Microgrid Digital Twin" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
          <span className="text-xs text-slate-400 text-mono uppercase tracking-widest">
            Connecting to Grid Share Core...
          </span>
        </div>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
        <TopBar title="Dashboard" subtitle="Live Microgrid Digital Twin" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3 max-w-md">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-red-300 text-mono uppercase mb-1">
                Unable to Connect to Grid Share Core
              </div>
              <p className="text-[11px] text-slate-400">{error}</p>
            </div>
          </div>
          <button
            onClick={() => refreshGridState(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-mono tracking-wider transition-colors"
          >
            <RefreshCw size={12} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const {
    buildings,
    centralBattery,
    mainGrid,
    gridStatus,
    summaryStats,
    logs,
    activeTransfers,
    isPaused,
  } = state;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
      <TopBar title="Dashboard" subtitle="Live Microgrid Digital Twin" />

      <div className="flex flex-col flex-1 overflow-hidden p-3 gap-3">
        {/* Scenario Controls */}
        <SimulationControls />

        {/* Error Callout Banner (if transient error occurs) */}
        {error && (
          <div className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-between">
            <span className="text-[10px] text-red-300 text-mono">{error}</span>
            <button
              onClick={() => refreshGridState(false)}
              className="text-[9px] text-blue-400 hover:underline uppercase text-mono"
            >
              Dismiss / Refresh
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-3 shrink-0">
          <StatCard
            label="Total Generation"
            value={summaryStats.totalGeneration}
            unit="kW"
            icon={Sun}
            accent="amber"
            trend="↑ Backend output"
          />
          <StatCard
            label="Total Consumption"
            value={summaryStats.totalConsumption}
            unit="kW"
            icon={Zap}
            accent="blue"
            trend="5 buildings active"
          />
          <StatCard
            label="P2P Transfer"
            value={summaryStats.p2pTransfer || summaryStats.p2pEnergyTransfer || 0}
            unit="kWh"
            icon={ArrowLeftRight}
            accent="green"
            trend={`${(activeTransfers || []).filter((t) => t.type === 'P2P').length} active route(s)`}
          />
          <StatCard
            label="Central Battery"
            value={`${centralBattery?.percentage || centralBattery?.batteryLevel || 0}%`}
            icon={Battery}
            accent={(centralBattery?.percentage || 0) > 30 ? 'green' : 'red'}
            trend={(centralBattery?.percentage || 0) > 30 ? 'Cap: 100 kWh' : 'Low Reserves'}
          />
          <StatCard
            label="Grid Dependency"
            value={`${summaryStats.mainGridDependency}%`}
            icon={Plug}
            accent={summaryStats.mainGridDependency > 20 ? 'amber' : 'slate'}
            trend={mainGrid?.online || mainGrid?.status === 'ONLINE' ? `Grid power: ${mainGrid?.power || mainGrid?.powerImported || 0} kW` : 'OFFLINE'}
          />
        </div>

        {/* Main Area: visualization + activity */}
        <div className="flex gap-3 flex-1 min-h-0">
          {/* Microgrid visualization */}
          <div className="glass-panel rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden relative">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-blue-900/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-[10px] text-slate-400 uppercase tracking-widest text-mono font-medium">
                  Microgrid Topology — Live Backend Data
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider">
                    {isPaused ? 'SIMULATION PAUSED' : 'LIVE BACKEND TICKS'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider text-mono px-2 py-0.5 rounded border ${
                      gridStatus === 'STABLE'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : gridStatus === 'WARNING'
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                        : 'text-red-400 border-red-500/30 bg-red-500/10'
                    }`}
                  >
                    STATUS: {gridStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Active transfer badge overlay */}
            {(activeTransfers || []).length > 0 && (
              <div className="absolute top-9 right-3 z-10 flex flex-col gap-1">
                {(activeTransfers || []).slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className="glass-panel rounded px-2 py-1 border border-emerald-500/30 flex items-center gap-1.5"
                  >
                    <div className="relative w-1.5 h-1.5">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                      <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[9px] text-emerald-400 text-mono uppercase tracking-wider">
                      {t.fromName} → {t.toName} · {t.amount} kWh ({t.type})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* SVG canvas */}
            <div className="flex-1 min-h-0 relative">
              <MicrogridVisualization
                buildings={buildings}
                gridCore={{
                  ...centralBattery,
                  centralBattery: centralBattery?.percentage || centralBattery?.batteryLevel || 0,
                  gridLoad: summaryStats.totalConsumption,
                  energyBalance: round1(summaryStats.totalGeneration - summaryStats.totalConsumption),
                  gridStatus,
                }}
                activeTransfers={activeTransfers || []}
              />
            </div>
          </div>

          {/* AI Activity */}
          <div className="w-72 shrink-0 min-h-0 flex flex-col gap-3">
            <div className="flex-1 glass-panel rounded-xl overflow-hidden min-h-0">
              <AIActivityPanel events={logs || []} agentStatus={state.agentStatus || {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function round1(v) {
  return parseFloat(v.toFixed(1));
}
