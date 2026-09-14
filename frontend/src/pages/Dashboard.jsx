import React from 'react';
import {
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import MicrogridVisualization from '../components/MicrogridVisualization';
import AIActivityPanel from '../components/AIActivityPanel';
import SimulationControls from '../components/SimulationControls';
import { useGrid } from '../context/GridContext';
import { useTheme } from '../context/ThemeContext';
import { formatBalance } from '../utils/statusHelpers';

export default function Dashboard() {
  const { state, loading, error, refreshGridState, toggleMainGrid, actionLoading } = useGrid();
  const { isDark } = useTheme();

  if (loading && !state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[65dvh] gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 dark:border-stone-700 border-t-[var(--accent-primary)] animate-spin" />
        <span className="text-xs font-mono text-[var(--text-muted)]">
          Synchronizing microgrid telemetry...
        </span>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[65dvh] gap-4 p-6 text-center">
        <div
          className="p-4 rounded-xl flex items-center gap-3 max-w-md text-left"
          style={{
            backgroundColor: 'rgba(184, 88, 84, 0.08)',
            border: '1px solid rgba(184, 88, 84, 0.25)',
          }}
        >
          <AlertCircle size={20} className="text-[var(--status-deficit)] shrink-0" />
          <div>
            <div className="text-xs font-medium text-[var(--status-deficit)] mb-0.5">
              Core Telemetry Offline
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{error}</p>
          </div>
        </div>
        <button
          onClick={() => refreshGridState(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium interactive-tap shadow-sm"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: isDark ? '#101114' : '#ffffff',
          }}
        >
          <RefreshCw size={12} />
          <span>Retry Connection</span>
        </button>
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
  } = state;

  const netBalance = parseFloat((summaryStats.totalGeneration - summaryStats.totalConsumption).toFixed(1));
  const isSurplus = netBalance > 0;
  const isDeficit = netBalance < 0;

  const batteryPct = centralBattery?.percentage ?? centralBattery?.batteryLevel ?? 0;
  const gridPower = mainGrid?.power ?? mainGrid?.powerImported ?? 0;
  const gridEnergy = mainGrid?.energyImported ?? mainGrid?.cumulativeImportKwh ?? 0;
  const isGridOnline = mainGrid?.online ?? (mainGrid?.status === 'ONLINE');

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* ── Precision Control Dock ── */}
      <div className="stagger-1">
        <SimulationControls />
      </div>

      {/* ── Primary Spatial Canvas & Telemetry Rail (Asymmetric 70/30) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Dominant Centerpiece: Spatial Microgrid Canvas (8 cols on lg) */}
        <div
          className="lg:col-span-8 rounded-2xl p-5 flex flex-col min-h-[580px] relative panel-surface border border-[var(--border-subtle)] stagger-2"
        >
          {/* Substation Eyebrow & Status */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-network-breathe" />
              <div>
                <h2 className="text-xs font-medium tracking-tight text-[var(--text-primary)]">
                  Microgrid Operational Topology
                </h2>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  5 Decentralized Substation Feeds
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span
                className="px-2 py-0.5 rounded uppercase font-medium text-[10px] border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]"
              >
                Network: {gridStatus}
              </span>
            </div>
          </div>

          {/* Active Transfers Overlay Tag */}
          {(activeTransfers || []).length > 0 && (
            <div className="absolute top-16 right-6 z-10 flex flex-col gap-1.5 max-w-xs">
              {(activeTransfers || []).slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  className="px-2.5 py-1 rounded text-xs font-medium flex items-center gap-2 shadow-sm backdrop-blur-md border border-[var(--border-subtle)]"
                  style={{
                    backgroundColor: isDark ? 'rgba(22, 23, 28, 0.9)' : 'rgba(255, 255, 255, 0.92)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-network-breathe" />
                  <span className="font-mono text-[11px]">
                    {t.fromName} → {t.toName}
                  </span>
                  <span className="ml-auto font-medium font-mono text-[var(--accent-primary)]">
                    {t.amount} kWh
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Spatial Microgrid Centerpiece */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[500px]">
            <MicrogridVisualization
              buildings={buildings}
              gridCore={{
                ...centralBattery,
                centralBattery: batteryPct,
                gridLoad: summaryStats.totalConsumption,
                energyBalance: netBalance,
                gridStatus,
              }}
              activeTransfers={activeTransfers || []}
            />
          </div>
        </div>

        {/* Unified Editorial Telemetry Rail (4 cols on lg) — Unboxed Information Architecture */}
        <div className="lg:col-span-4 flex flex-col stagger-3">
          {/* Section 1: Net Power Balance */}
          <div className="pb-8">
            <span className="text-eyebrow block mb-3">Campus Net Balance</span>
            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl font-light font-mono tracking-tight"
                style={{
                  color: isSurplus ? 'var(--status-surplus)' : isDeficit ? 'var(--status-deficit)' : 'var(--text-primary)'
                }}
              >
                {formatBalance(netBalance)}
              </span>
              <span className="text-base font-mono text-[var(--text-muted)]">kW</span>
            </div>
            <p className="text-body-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
              {isSurplus
                ? 'Generation surplus routed to peer deficit nodes and central storage buffer.'
                : isDeficit
                ? 'Campus demand exceeds solar generation; supplementary power buffered from BESS.'
                : 'Complete generation-to-demand balance across all facilities.'}
            </p>
          </div>

          {/* Section 2: Generation & Load Compartment */}
          <div className="py-6 border-t border-[var(--border-subtle)]">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-eyebrow block mb-1">Solar Output</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light font-mono text-[var(--text-primary)]">
                    {summaryStats.totalGeneration}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">kW</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">5 Substation Arrays</span>
              </div>

              <div>
                <span className="text-eyebrow block mb-1">Active Load</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light font-mono text-[var(--text-primary)]">
                    {summaryStats.totalConsumption}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">kW</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">Aggregate Demand</span>
              </div>
            </div>
          </div>

          {/* Section 3: Central Battery (BESS) */}
          <div className="py-6 border-t border-[var(--border-subtle)]">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-eyebrow block">BESS Storage Buffer</span>
                <span className="text-[11px] text-[var(--text-muted)]">100 kWh Core Reserve</span>
              </div>
              <span className="text-xl font-light font-mono text-[var(--text-primary)]">
                {batteryPct}%
              </span>
            </div>
            <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${batteryPct}%`,
                  backgroundColor: batteryPct > 30 ? 'var(--accent-primary)' : 'var(--status-deficit)',
                }}
              />
            </div>
          </div>

          {/* Section 4: Utility Grid Intertie */}
          <div className="pt-6 border-t border-[var(--border-subtle)]">
            <div className="flex items-baseline justify-between mb-1">
              <div>
                <span className="text-eyebrow block">Utility Grid Intertie</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {isGridOnline ? 'Grid Coupled' : 'Islanded Mode'}
                  </span>
                  <button
                    disabled={actionLoading}
                    onClick={toggleMainGrid}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border-subtle)] hover:border-[var(--border-default)] cursor-pointer transition-colors interactive-tap disabled:opacity-50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    title={isGridOnline ? 'Disconnect to enter islanded outage mode' : 'Reconnect to utility grid'}
                  >
                    {isGridOnline ? 'Isolate' : 'Reconnect'}
                  </button>
                </div>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-light text-[var(--text-primary)]">
                  {isGridOnline ? gridPower.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs text-[var(--text-muted)]">kW import</span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)] block mt-1">
              Cumulative draw: {gridEnergy.toFixed(1)} kWh
            </span>
          </div>
        </div>
      </div>

      {/* ── Lower Section: Active Transfers Stream & Operational Dispatch Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch stagger-4">
        {/* Active P2P Energy Transfers (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 panel-surface border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Active Peer Transfer Routes
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                Autonomous bilateral routing between substation nodes
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--accent-primary)] font-medium">
              {(activeTransfers || []).length} active
            </span>
          </div>

          <div className="space-y-2 flex-1">
            {(activeTransfers || []).length > 0 ? (
              activeTransfers.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-md border border-[var(--border-subtle)] text-xs transition-colors bg-black/[0.02] dark:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-medium"
                      style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)' }}
                    >
                      P2P
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                        <span>{tx.fromName}</span>
                        <ArrowRight size={11} className="text-[var(--text-muted)]" />
                        <span>{tx.toName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        Reservation Verified · Zero Leakage
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-medium text-[var(--accent-primary)] block">
                      {tx.amount} kWh
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase">
                      {tx.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-28 text-center text-xs text-[var(--text-muted)]">
                <span>No active P2P energy transfers in current tick.</span>
                <span className="text-[11px] opacity-70 mt-0.5">
                  Surplus buildings will route energy automatically when deficits appear.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Operational Dispatch Stream (5 cols) */}
        <div className="lg:col-span-5">
          <AIActivityPanel events={logs || []} />
        </div>
      </div>
    </div>
  );
}
