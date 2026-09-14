import React from 'react';
import { useGrid } from '../context/GridContext';
import { SCENARIOS } from '../constants/scenarios';
import { Play, Pause, RotateCcw, Sliders, Zap, Loader2, Brain } from 'lucide-react';

const SCENARIO_LABELS = [
  { key: SCENARIOS.NORMAL, label: 'Normal' },
  { key: SCENARIOS.HIGH_SOLAR, label: 'High Solar' },
  { key: SCENARIOS.LOW_SOLAR, label: 'Low Solar' },
  { key: SCENARIOS.HIGH_DEMAND, label: 'High Demand' },
  { key: SCENARIOS.LOW_BATTERY, label: 'Low Battery' },
  { key: SCENARIOS.GRID_FAILURE, label: 'Grid Failure' },
];

export default function SimulationControls() {
  const { state, setScenario, triggerAllocate, runAgent, agentRunning, togglePause, reset, actionLoading } = useGrid();
  const currentScenario = state?.currentScenario || 'NORMAL';
  const isPaused = state?.isPaused || false;

  return (
    <div className="glass-panel rounded-lg p-2.5 border border-blue-900/30 flex items-center justify-between gap-3 shrink-0">
      {/* Label */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <Sliders size={13} className="text-blue-400" />
        <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase text-mono">
          Backend Scenarios
        </span>
      </div>

      {/* Scenario Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {SCENARIO_LABELS.map(({ key, label }) => {
          const isActive = currentScenario === key;
          const isDanger = key === SCENARIOS.GRID_FAILURE;

          return (
            <button
              key={key}
              disabled={actionLoading}
              onClick={() => setScenario(key)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium tracking-wider uppercase text-mono transition-all duration-150 border disabled:opacity-50 ${
                isActive
                  ? isDanger
                    ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                    : 'bg-blue-600/25 text-blue-300 border-blue-400/50 shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                  : 'bg-white/3 text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Manual Allocation & Controls */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-blue-900/40 shrink-0">
        <button
          disabled={actionLoading || agentRunning}
          onClick={() => runAgent()}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-semibold tracking-wider uppercase text-mono border border-purple-500/40 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(147,51,234,0.2)]"
          title="Run Bounded AI Agent Loop"
        >
          <Brain size={10} className={`text-purple-400 ${agentRunning ? 'animate-spin' : ''}`} />
          <span>{agentRunning ? 'AGENT...' : 'RUN AGENT'}</span>
        </button>

        <button
          disabled={actionLoading}
          onClick={triggerAllocate}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-semibold tracking-wider uppercase text-mono border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 disabled:opacity-50 transition-all"
          title="Trigger Backend Allocation Engine"
        >
          <Zap size={10} className="text-blue-400" />
          <span>Allocate</span>
        </button>

        <button
          onClick={togglePause}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-semibold tracking-wider uppercase text-mono border transition-all ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}
          title={isPaused ? 'Resume Simulation Ticks' : 'Pause Simulation Ticks'}
        >
          {isPaused ? <Play size={10} /> : <Pause size={10} />}
          <span>{isPaused ? 'PAUSED' : 'LIVE'}</span>
        </button>

        <button
          disabled={actionLoading}
          onClick={reset}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium tracking-wider uppercase text-mono bg-white/3 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all"
          title="Reset to Baseline State"
        >
          {actionLoading ? <Loader2 size={10} className="animate-spin text-blue-400" /> : <RotateCcw size={10} />}
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
