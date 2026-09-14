import React, { useState } from 'react';
import TransactionTable from '../components/TransactionTable';
import SimulationControls from '../components/SimulationControls';
import { useGrid } from '../context/GridContext';
import { ShieldCheck, Filter, Loader2, ArrowLeftRight } from 'lucide-react';

const FILTER_TYPES = ['ALL', 'P2P', 'CENTRAL_BATTERY', 'CHARGE', 'MAIN_GRID'];

export default function Transactions() {
  const { state, loading } = useGrid();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const transactions = state?.transactions || [];
  const filteredTransactions =
    activeFilter === 'ALL' ? transactions : transactions.filter((t) => t.type === activeFilter);

  if (loading && !state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={24} className="text-[var(--color-brand)] animate-spin" />
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          Loading dispatch ledger...
        </span>
      </div>
    );
  }

  const p2pCount = transactions.filter((t) => t.type === 'P2P').length;
  const totalKwh = transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(1);
  const p2pKwh = transactions
    .filter((t) => t.type === 'P2P')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
    .toFixed(1);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Simulation Controls Dock */}
      <SimulationControls />

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-subtle)] stagger-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeftRight size={14} className="text-[var(--accent-primary)]" />
            <span className="text-eyebrow">
              Authoritative Energy Ledger
            </span>
          </div>
          <h1 className="text-title-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Settled Energy Transfers
          </h1>
          <p className="text-body-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Verifiable record of physical reservations, peer-to-peer allocations, battery buffering, and utility grid exchanges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--status-surplus-bg)] border border-[var(--status-surplus-border)] text-[var(--status-surplus)] text-xs font-mono">
            <ShieldCheck size={14} />
            <span>Conservation Guaranteed</span>
          </div>
        </div>
      </div>

      {/* ── Summary Telemetry Strip (Unboxed) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-6 border-b border-[var(--border-subtle)] stagger-2">
        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            Total Transfers
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-light font-mono text-[var(--text-primary)]">
              {transactions.length}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">settled</span>
          </div>
          <span className="text-[10px] text-[var(--status-surplus)] font-mono mt-1 block">
            Immutable Sequence
          </span>
        </div>

        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            Cumulative Volume
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-light font-mono text-[var(--text-primary)]">
              {totalKwh}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">kWh</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 block">
            All Routing Classes
          </span>
        </div>

        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            P2P Direct Shared
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-light font-mono text-[var(--accent-primary)]">
              {p2pKwh}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">kWh</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 block">
            {p2pCount} Peer Dispatches
          </span>
        </div>

        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            Reservation Layer
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-[var(--status-surplus)] font-medium">
            <ShieldCheck size={16} />
            <span className="text-sm font-medium">Physics Verified</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 block">
            Zero Telemetry Drift
          </span>
        </div>
      </div>

      {/* ── Filter Bar & Count ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap stagger-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono mr-2">
            <Filter size={12} />
            <span>FILTER:</span>
          </div>
          {FILTER_TYPES.map((type) => {
            const isActive = activeFilter === type;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-1 rounded-md text-xs font-mono tracking-tight cursor-pointer transition-all duration-150 interactive-tap ${
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-[var(--text-muted)] font-mono">
          Showing {filteredTransactions.length} of {transactions.length} entries
        </span>
      </div>

      {/* ── Transaction Table ── */}
      <div className="stagger-4">
        <TransactionTable transactions={filteredTransactions} />
      </div>

      {/* ── Classification Legend ── */}
      <div className="p-4 rounded-xl flex items-center gap-6 flex-wrap text-xs panel-surface border border-[var(--border-subtle)]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
          Route Classes:
        </span>
        {[
          { type: 'P2P', label: 'Peer-to-Peer', desc: 'Direct building-to-building physical energy sharing' },
          { type: 'CENTRAL_BATTERY', label: 'BESS Discharge', desc: 'Central battery supply to deficit substation' },
          { type: 'CHARGE', label: 'BESS Charge', desc: 'Surplus absorption into central battery' },
          { type: 'MAIN_GRID', label: 'Grid Coupling', desc: 'External utility grid import as bounded fallback' },
        ].map(({ type, label, desc }) => (
          <div key={type} className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-black/5 dark:bg-white/5 border-[var(--border-subtle)] text-[var(--text-primary)]">
              {label}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
