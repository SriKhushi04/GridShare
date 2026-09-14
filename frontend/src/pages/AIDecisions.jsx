import React from 'react';
import AIDecisionCard from '../components/AIDecisionCard';
import SimulationControls from '../components/SimulationControls';
import { useGrid } from '../context/GridContext';
import { Cpu, CheckCircle2, Play, Pause, Sparkles, Terminal } from 'lucide-react';

export default function AIDecisions() {
  const { state, agentRunning, autoMode, agentStatus, runAgent, toggleAutoMode } = useGrid();
  const { aiDecisions } = state || { aiDecisions: [] };

  const completed = aiDecisions.filter((d) => d.result === 'COMPLETED' || d.result === 'EXECUTED').length;
  const isGemini = agentStatus?.mode === 'GEMINI_AGENT';
  const modelName = agentStatus?.model
    ? agentStatus.model.replace(/^models\//, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Gemini Flash';

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Simulation Controls Dock */}
      <SimulationControls />

      {/* ── Header & Dispatch Station ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-subtle)] stagger-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            <span className="text-eyebrow">
              Microgrid Intelligence Layer
            </span>
          </div>
          <h1 className="text-title-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Autonomous Dispatch & Optimization
          </h1>
          <p className="text-body-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Autonomous multi-agent energy routing with physical conservation constraints, priority tiers, and deterministic safety fallback validation.
          </p>
        </div>

        {/* Dispatch Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dispatch Single Cycle */}
          <button
            disabled={agentRunning}
            onClick={() => runAgent()}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed interactive-tap"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-contrast)',
            }}
          >
            <Sparkles size={13} className={agentRunning ? 'animate-spin' : ''} />
            <span>{agentRunning ? 'Evaluating Balance...' : 'Dispatch Cycle'}</span>
          </button>

          {/* Autonomous Loop Toggle */}
          <button
            onClick={toggleAutoMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-medium border transition-all duration-150 cursor-pointer interactive-tap ${
              autoMode
                ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border-[var(--accent-border)]'
                : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
            }`}
          >
            {autoMode ? <Pause size={13} /> : <Play size={13} />}
            <span>{autoMode ? 'Autonomous Active' : 'Manual Standby'}</span>
          </button>
        </div>
      </div>

      {/* ── Operational Status Metrics Strip (Unboxed) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-6 border-b border-[var(--border-subtle)] stagger-2">
        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            Inference Engine
          </span>
          <div className="flex items-center gap-2">
            <Cpu size={14} className={isGemini ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'} />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {isGemini ? modelName : 'Safety Fallback'}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 block">
            {isGemini ? 'Active Orchestrator' : 'Deterministic Rulebook'}
          </span>
        </div>

        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            Settled Dispatches
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-light font-mono text-[var(--text-primary)]">
              {completed}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">/ {aiDecisions.length}</span>
          </div>
          <span className="text-[10px] text-[var(--status-surplus)] font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} /> Physically Validated
          </span>
        </div>

        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            Execution Loop
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {autoMode ? 'Autonomous Continuous' : 'Stepwise Demand'}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 block">
            {autoMode ? 'Triggered on each tick' : 'Awaiting trigger'}
          </span>
        </div>

        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            Physical Invariants
          </span>
          <span className="text-sm font-medium text-[var(--status-surplus)]">
            100% Conserved
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 block">
            Zero Telemetry Drift
          </span>
        </div>
      </div>

      {/* ── Decision Feed ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Audit Stream ({aiDecisions.length} events)
          </span>
        </div>

        {aiDecisions.map((decision) => (
          <AIDecisionCard key={decision.id} decision={decision} />
        ))}

        {aiDecisions.length === 0 && (
          <div className="rounded-2xl p-16 text-center text-xs text-[var(--text-muted)] space-y-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <Terminal size={24} className="mx-auto text-[var(--text-muted)] opacity-60" />
            <h4 className="font-semibold text-sm text-[var(--text-primary)]">
              No Agent Decisions Logged
            </h4>
            <p className="max-w-md mx-auto text-[var(--text-secondary)] leading-relaxed">
              Trigger a manual cycle via "Dispatch Cycle" or enable the autonomous loop to observe real-time microgrid energy balancing decisions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
