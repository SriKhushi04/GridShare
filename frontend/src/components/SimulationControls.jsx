import React, { useState } from 'react';
import { useGrid } from '../context/GridContext';
import { SCENARIOS } from '../constants/scenarios';
import { Play, Pause, RotateCcw, Zap, Loader2, Cpu, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SCENARIO_OPTIONS = [
  { key: SCENARIOS.NORMAL, label: 'Normal Baseline' },
  { key: SCENARIOS.HIGH_SOLAR, label: 'High Solar Surge' },
  { key: SCENARIOS.LOW_SOLAR, label: 'Low Solar (Overcast)' },
  { key: SCENARIOS.HIGH_DEMAND, label: 'Campus Demand Peak' },
  { key: SCENARIOS.LOW_BATTERY, label: 'Depleted BESS Reserve' },
  { key: SCENARIOS.GRID_FAILURE, label: 'Grid Failure (Islanded Outage)' },
];

export default function SimulationControls() {
  const { state, setScenario, triggerAllocate, runAgent, agentRunning, togglePause, reset, actionLoading } = useGrid();
  const { isDark } = useTheme();
  const [allocateStatus, setAllocateStatus] = useState('idle'); // 'idle' | 'allocating' | 'complete'

  const currentScenario = state?.currentScenario || 'NORMAL';
  const isPaused = state?.isPaused || false;

  const handleAllocate = async () => {
    if (allocateStatus !== 'idle' || actionLoading) return;
    setAllocateStatus('allocating');
    try {
      await triggerAllocate();
      setAllocateStatus('complete');
      setTimeout(() => {
        setAllocateStatus('idle');
      }, 1800);
    } catch {
      setAllocateStatus('idle');
    }
  };

  return (
    <div
      className="w-full px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 transition-colors border border-[var(--border-subtle)] panel-surface"
    >
      {/* Scenario Precision Selector */}
      <div className="flex items-center gap-3 min-w-[240px]">
        <span className="text-eyebrow">
          Scenario
        </span>
        <div className="relative flex items-center">
          <select
            value={currentScenario}
            disabled={actionLoading}
            onChange={(e) => setScenario(e.target.value)}
            className="text-xs font-medium bg-transparent text-[var(--text-primary)] cursor-pointer focus:outline-none appearance-none pr-5 py-0.5"
          >
            {SCENARIO_OPTIONS.map(({ key, label }) => (
              <option
                key={key}
                value={key}
                className={isDark ? 'bg-[#181920] text-[#f3f0ea]' : 'bg-white text-[#1b1a17]'}
              >
                {label}
              </option>
            ))}
          </select>
          <ChevronDown size={11} className="pointer-events-none absolute right-0 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Run Autonomous Agent Cycle */}
        <button
          disabled={actionLoading || agentRunning}
          onClick={() => runAgent()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50 interactive-tap"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--accent-contrast)',
          }}
          title="Run autonomous AI dispatch cycle"
        >
          <Cpu size={12} className={agentRunning ? 'animate-spin' : ''} />
          <span>{agentRunning ? 'Evaluating...' : 'Dispatch Cycle'}</span>
        </button>

        {/* Allocate Energy */}
        <button
          disabled={actionLoading || allocateStatus === 'allocating'}
          onClick={handleAllocate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 interactive-tap border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
          title="Authoritatively allocate pending energy reservations"
        >
          {allocateStatus === 'allocating' ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Allocating...</span>
            </>
          ) : allocateStatus === 'complete' ? (
            <>
              <Check size={12} className="text-[var(--status-surplus)]" />
              <span className="text-[var(--status-surplus)]">Allocation complete</span>
            </>
          ) : (
            <>
              <Zap size={12} />
              <span>Allocate</span>
            </>
          )}
        </button>

        {/* Live / Pause Ticks */}
        <button
          onClick={togglePause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-normal transition-all duration-150 cursor-pointer interactive-tap font-mono border border-[var(--border-subtle)] hover:border-[var(--border-default)]"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            color: isPaused ? 'var(--status-warning)' : 'var(--text-primary)',
          }}
          title={isPaused ? 'Resume live simulation ticks' : 'Pause simulation ticks'}
        >
          {isPaused ? <Play size={11} /> : <Pause size={11} />}
          <span>{isPaused ? 'Paused' : 'Live'}</span>
        </button>

        {/* Reset */}
        <button
          disabled={actionLoading}
          onClick={reset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-normal text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50 interactive-tap font-mono border border-[var(--border-subtle)]"
          title="Reset simulation baseline"
        >
          {actionLoading ? <Loader2 size={11} className="animate-spin text-[var(--accent-primary)]" /> : <RotateCcw size={11} />}
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
