import React from 'react';
import TopBar from '../components/TopBar';
import AIDecisionCard from '../components/AIDecisionCard';
import SimulationControls from '../components/SimulationControls';
import { useGrid } from '../context/GridContext';
import { Brain } from 'lucide-react';

export default function AIDecisions() {
  const { state, agentRunning, autoMode, agentStatus, runAgent, toggleAutoMode } = useGrid();
  const { aiDecisions } = state || { aiDecisions: [] };

  const completed = aiDecisions.filter((d) => d.result === 'COMPLETED').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
      <TopBar title="Agent Control Room" subtitle="Grid Share Autonomous Decision Log" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Simulation Controls */}
        <SimulationControls />

        {/* Header + Stats + Agent Run Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded border ${
              agentStatus?.mode === 'GEMINI_AGENT' 
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            }`}>
              <Brain size={11} />
              <span className="text-[10px] text-mono uppercase tracking-wider font-medium">
                {agentStatus?.mode === 'GEMINI_AGENT' ? 'GEMINI ONLINE' : 'SAFETY FALLBACK'}
              </span>
            </div>
            {agentRunning && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <span className="text-[10px] text-mono uppercase tracking-wider font-medium animate-pulse">
                  AGENT RUNNING...
                </span>
              </div>
            )}
            {!agentRunning && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 text-mono uppercase tracking-wider">
                  {completed} Executed
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={agentRunning}
              onClick={() => runAgent()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold text-mono tracking-wider transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(147,51,234,0.3)]"
            >
              <Brain size={12} className={agentRunning ? 'animate-spin' : ''} />
              <span>{agentRunning ? 'AGENT REASONING...' : 'RUN AGENT'}</span>
            </button>

            <button
              onClick={toggleAutoMode}
              className={`px-3 py-1.5 rounded text-xs font-semibold text-mono tracking-wider transition-all border ${
                autoMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-white/3 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              AUTO MODE: {autoMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Decision cards */}
        <div className="space-y-3">
          {aiDecisions.map((decision) => (
            <AIDecisionCard key={decision.id} decision={decision} />
          ))}
          {aiDecisions.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-8 font-mono">
              No decisions recorded yet. Click RUN AGENT to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
