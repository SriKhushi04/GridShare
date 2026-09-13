import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BuildingCard from '../components/BuildingCard';
import SimulationControls from '../components/SimulationControls';
import { useGrid } from '../context/GridContext';
import { Sun, Zap, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from 'lucide-react';

export default function Buildings() {
  const navigate = useNavigate();
  const { state, loading, error } = useGrid();

  if (loading && !state) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
        <TopBar title="Buildings" subtitle="All Microgrid Nodes" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
          <span className="text-xs text-slate-400 text-mono uppercase tracking-widest">
            Loading building nodes from Grid Share Core...
          </span>
        </div>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
        <TopBar title="Buildings" subtitle="All Microgrid Nodes" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3 max-w-md">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-red-300 text-mono uppercase mb-1">
                Failed to Load Buildings
              </div>
              <p className="text-[11px] text-slate-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const buildings = state?.buildings || [];
  const surplusCount = buildings.filter((b) => b.status === 'SURPLUS').length;
  const deficitCount = buildings.filter((b) => b.status === 'DEFICIT').length;
  const balancedCount = buildings.filter((b) => b.status === 'BALANCED').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
      <TopBar title="Buildings" subtitle="All Microgrid Nodes" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Simulation Controls */}
        <SimulationControls />

        {/* Summary strip */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp size={11} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 text-mono uppercase tracking-wider font-medium">
              {surplusCount} Surplus
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20">
            <TrendingDown size={11} className="text-red-400" />
            <span className="text-[10px] text-red-400 text-mono uppercase tracking-wider font-medium">
              {deficitCount} Deficit
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20">
            <Minus size={11} className="text-blue-400" />
            <span className="text-[10px] text-blue-400 text-mono uppercase tracking-wider font-medium">
              {balancedCount} Balanced
            </span>
          </div>
          <div className="ml-auto text-[10px] text-slate-600 text-mono tracking-wider uppercase">
            Click a building to view details
          </div>
        </div>

        {/* Building grid */}
        <div className="grid grid-cols-3 xl:grid-cols-5 gap-4">
          {buildings.map((building) => (
            <BuildingCard
              key={building.buildingId}
              building={building}
              onClick={() => navigate(`/buildings/${building.buildingId}`)}
            />
          ))}
        </div>

        {/* Network overview table */}
        <div className="glass-panel rounded-lg overflow-hidden mt-2">
          <div className="px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest text-mono font-medium">
              Backend Network Overview
            </span>
          </div>
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2 border-b border-blue-900/20 bg-white/2">
            {['Node', 'Solar Gen', 'Load', 'Battery', 'Balance', 'Status'].map((h) => (
              <span key={h} className="text-[9px] text-slate-600 uppercase tracking-widest text-mono font-medium">
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-white/3">
            {buildings.map((b) => (
              <div
                key={b.buildingId}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] px-4 py-3 hover:bg-white/2 transition-colors cursor-pointer items-center"
                onClick={() => navigate(`/buildings/${b.buildingId}`)}
              >
                <span className="text-xs text-slate-200 text-mono font-medium">{b.name}</span>
                <div className="flex items-center gap-1">
                  <Sun size={10} className="text-amber-400" />
                  <span className="text-xs text-white text-mono">{b.solarGeneration} kW</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={10} className="text-blue-400" />
                  <span className="text-xs text-white text-mono">{b.consumption} kW</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.batteryLevel > 60 ? 'bg-emerald-400' : b.batteryLevel > 35 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${b.batteryLevel}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 text-mono">{b.batteryLevel}%</span>
                </div>
                <span
                  className={`text-xs font-bold text-mono ${
                    b.energyBalance > 0
                      ? 'text-emerald-400'
                      : b.energyBalance < 0
                      ? 'text-red-400'
                      : 'text-blue-400'
                  }`}
                >
                  {b.energyBalance > 0 ? '+' : ''}
                  {b.energyBalance.toFixed(1)} kW
                </span>
                <span
                  className={`text-[9px] font-medium px-2 py-0.5 rounded border w-fit tracking-widest text-mono ${
                    b.status === 'SURPLUS'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : b.status === 'DEFICIT'
                      ? 'text-red-400 bg-red-500/10 border-red-500/30'
                      : 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
