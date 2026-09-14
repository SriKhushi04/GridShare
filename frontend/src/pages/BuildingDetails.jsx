import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useGrid } from '../context/GridContext';
import { gridApi } from '../api/gridApi';
import { getStatusBg, getStatusColor, formatBalance } from '../utils/statusHelpers';
import {
  ArrowLeft,
  Sun,
  Zap,
  Brain,
  ArrowRight,
  ArrowLeftRight,
  Loader2,
} from 'lucide-react';

function EnergyBarChart({ solar, consumption }) {
  const max = Math.max(solar, consumption, 1);
  const solarPct = (solar / max) * 100;
  const loadPct = (consumption / max) * 100;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1.5">
            <Sun size={10} className="text-amber-400" />
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Solar Generation</span>
          </div>
          <span className="text-xs font-bold text-white text-mono">{solar} kW</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${solarPct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1.5">
            <Zap size={10} className="text-blue-400" />
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Consumption</span>
          </div>
          <span className="text-xs font-bold text-white text-mono">{consumption} kW</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${loadPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function BuildingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useGrid();

  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch individual building details directly from GET /api/buildings/:id
  useEffect(() => {
    let isMounted = true;
    async function loadBuilding() {
      try {
        setLoading(true);
        const data = await gridApi.getBuildingById(id);
        if (isMounted) {
          setBuilding(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[BuildingDetails] Error fetching building:', err);
          // Fallback to central state if available
          const fallback = state?.buildings?.find((b) => b.buildingId === id);
          if (fallback) {
            setBuilding(fallback);
          } else {
            setError(err.message || 'Building not found');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBuilding();
    return () => {
      isMounted = false;
    };
  }, [id, state?.buildings]);

  if (loading && !building) {
    return (
      <div className="flex flex-col h-screen bg-[#080c14] items-center justify-center gap-3">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
        <span className="text-xs text-slate-400 text-mono uppercase tracking-widest">
          Fetching building details from backend...
        </span>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="flex flex-col h-screen bg-[#080c14] items-center justify-center p-6 text-center">
        <p className="text-red-400 text-mono text-sm mb-2">{error || 'Building not found.'}</p>
        <button onClick={() => navigate('/buildings')} className="text-blue-400 text-xs hover:underline uppercase text-mono">
          ← Back to Buildings Overview
        </button>
      </div>
    );
  }

  // Filter transfers specific to this building dynamically from backend transactions
  const transactions = state?.transactions || [];
  const recentTransfers = transactions
    .filter((tx) => tx.from === id || tx.to === id)
    .map((tx) => ({
      direction: tx.from === id ? 'OUT' : 'IN',
      target: tx.from === id ? tx.toName : tx.fromName,
      amount: tx.amount,
      timestamp: tx.timestamp,
      status: tx.status,
    }));

  const { name, solarGeneration, consumption, batteryLevel, energyBalance, status, aiPrediction } = building;
  const statusColor = getStatusColor(status);
  const statusBadge = getStatusBg(status);
  const balLabel = formatBalance(energyBalance);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
      <TopBar title={name} subtitle="Building Details & Backend Real-Time Analytics" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Back button + header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/buildings')}
            className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-200 uppercase tracking-wider transition-colors text-mono"
          >
            <ArrowLeft size={11} />
            Buildings
          </button>
          <div className="text-slate-700">/</div>
          <span className="text-[10px] text-slate-300 text-mono uppercase tracking-wider">{name}</span>
          <div className="ml-auto">
            <span className={`text-[10px] font-medium px-3 py-1 rounded border tracking-widest uppercase text-mono ${statusBadge}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left column */}
          <div className="col-span-2 space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="glass-panel rounded-lg p-3 border border-amber-500/15">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-1">Solar Gen</div>
                <div className="text-xl font-bold text-white text-mono">{solarGeneration} <span className="text-[11px] text-slate-500">kW</span></div>
              </div>
              <div className="glass-panel rounded-lg p-3 border border-blue-500/15">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-1">Load</div>
                <div className="text-xl font-bold text-white text-mono">{consumption} <span className="text-[11px] text-slate-500">kW</span></div>
              </div>
              <div className="glass-panel rounded-lg p-3 border border-white/8">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-1">Battery</div>
                <div className="text-xl font-bold text-white text-mono">{batteryLevel}<span className="text-[11px] text-slate-500">%</span></div>
                <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${batteryLevel > 60 ? 'bg-emerald-400' : batteryLevel > 35 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${batteryLevel}%` }}
                  />
                </div>
              </div>
              <div className={`glass-panel rounded-lg p-3 border ${
                energyBalance > 0 ? 'border-emerald-500/25' : energyBalance < 0 ? 'border-red-500/25' : 'border-blue-500/25'
              }`}>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-1">Balance</div>
                <div className={`text-xl font-bold text-mono ${statusColor}`}>{balLabel} <span className="text-[11px] text-slate-500">kW</span></div>
              </div>
            </div>

            {/* Energy bar chart */}
            <div className="glass-panel rounded-lg p-4 border border-blue-900/20">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest text-mono mb-4">
                Generation vs. Consumption
              </div>
              <EnergyBarChart solar={solarGeneration} consumption={consumption} />
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">Net Energy Balance</span>
                  <span className={`text-sm font-bold text-mono ${statusColor}`}>{balLabel} kW</span>
                </div>
              </div>
            </div>

            {/* Recent Transfers */}
            <div className="glass-panel rounded-lg overflow-hidden border border-blue-900/20">
              <div className="px-4 py-3 border-b border-blue-900/30">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest text-mono font-medium">
                  Recent Energy Transfers (Backend Live)
                </span>
              </div>
              {recentTransfers.length > 0 ? (
                <div className="divide-y divide-white/3">
                  {recentTransfers.map((tx, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                          tx.direction === 'OUT' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                        }`}>
                          {tx.direction === 'OUT'
                            ? <ArrowRight size={11} className="text-emerald-400" />
                            : <ArrowLeftRight size={11} className="text-blue-400" />
                          }
                        </div>
                        <div>
                          <div className="text-xs text-slate-200 text-mono">
                            {tx.direction === 'OUT' ? `→ ${tx.target}` : `← ${tx.target}`}
                          </div>
                          <div className="text-[9px] text-slate-600">{tx.timestamp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white text-mono">{tx.amount} kWh</span>
                        <span className="text-[9px] text-emerald-400 text-mono border border-emerald-500/30 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-[11px] text-slate-600">
                  No transfers recorded for this building node yet.
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* AI Prediction */}
            <div className="glass-panel rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={12} className="text-blue-400" />
                  <span className="text-[10px] text-slate-300 uppercase tracking-widest text-mono font-medium">
                    Energy Forecast
                  </span>
                </div>
                <span className="text-[8px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded text-mono">
                  PLACEHOLDER
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{aiPrediction}</p>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] text-slate-500 text-mono">Baseline Advisory · ML Pipeline Planned</span>
              </div>
            </div>

            {/* Building info */}
            <div className="glass-panel rounded-lg p-4 border border-blue-900/20 space-y-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest text-mono">Node Info</div>
              <div className="space-y-2">
                {[
                  { label: 'Building ID', value: building.buildingId.toUpperCase() },
                  { label: 'Status', value: status },
                  { label: 'Node Role', value: status === 'SURPLUS' ? 'Energy Provider' : status === 'DEFICIT' ? 'Energy Consumer' : 'Self-Sufficient' },
                  { label: 'P2P Eligible', value: status !== 'BALANCED' ? 'Yes' : 'Monitoring' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600 uppercase tracking-wider">{label}</span>
                    <span className="text-[10px] text-slate-300 text-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority indicator */}
            <div className="glass-panel rounded-lg p-4 border border-blue-900/20">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest text-mono mb-3">Energy Priority</div>
              <div className="space-y-2">
                {[
                  { level: 1, label: 'P2P Sharing', active: true },
                  { level: 2, label: 'Central Battery', active: batteryLevel < 40 },
                  { level: 3, label: 'Main Grid', active: false },
                ].map(({ level, label, active }) => (
                  <div key={level} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold text-mono ${
                      active ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/3 text-slate-600 border border-white/5'
                    }`}>
                      {level}
                    </div>
                    <span className={`text-xs ${active ? 'text-slate-200' : 'text-slate-600'}`}>{label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
