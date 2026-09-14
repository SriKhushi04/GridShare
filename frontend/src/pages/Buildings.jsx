import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuildingCard from '../components/BuildingCard';
import SimulationControls from '../components/SimulationControls';
import { useGrid } from '../context/GridContext';
import { AlertCircle } from 'lucide-react';

export default function Buildings() {
  const navigate = useNavigate();
  const { state, loading, error } = useGrid();
  const [filter, setFilter] = useState('ALL');

  if (loading && !state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[65dvh] gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 dark:border-stone-700 border-t-[var(--accent-primary)] animate-spin" />
        <span className="text-xs font-mono text-[var(--text-muted)]">
          Loading substation feeds...
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
              Substation Feeds Offline
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const buildings = state?.buildings || [];
  const surplusCount = buildings.filter((b) => b.status === 'SURPLUS').length;
  const deficitCount = buildings.filter((b) => b.status === 'DEFICIT').length;
  const balancedCount = buildings.filter((b) => b.status === 'BALANCED').length;

  const totalGen = buildings.reduce((acc, b) => acc + (b.solarGeneration || 0), 0).toFixed(1);
  const totalLoad = buildings.reduce((acc, b) => acc + (b.consumption || 0), 0).toFixed(1);

  const filteredBuildings =
    filter === 'ALL' ? buildings : buildings.filter((b) => b.status === filter);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Simulation Controls Dock */}
      <div className="stagger-1">
        <SimulationControls />
      </div>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] stagger-2">
        <div>
          <span className="text-eyebrow block mb-1">Campus Substation Network</span>
          <h1 className="text-title-lg text-[var(--text-primary)]">Substation Facilities</h1>
          <p className="text-body-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Autonomous nodes balancing local photovoltaic generation, facility demand, and local battery buffering across the campus grid.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono text-[var(--text-muted)] shrink-0">
          <div>
            Solar: <span className="font-medium text-[var(--text-primary)]">{totalGen} kW</span>
          </div>
          <span>·</span>
          <div>
            Demand: <span className="font-medium text-[var(--text-primary)]">{totalLoad} kW</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-2 flex-wrap stagger-3">
        {[
          { key: 'ALL', label: `All Facilities (${buildings.length})` },
          { key: 'SURPLUS', label: `${surplusCount} Surplus` },
          { key: 'DEFICIT', label: `${deficitCount} Deficit` },
          { key: 'BALANCED', label: `${balancedCount} Balanced` },
        ].map(({ key, label }) => {
          const isActive = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono tracking-tight cursor-pointer transition-all duration-150 interactive-tap ${
                isActive
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Substation Directory Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-4">
        {filteredBuildings.map((building) => (
          <BuildingCard
            key={building.buildingId}
            building={building}
            onClick={() => navigate(`/buildings/${building.buildingId}`)}
          />
        ))}
      </div>

      {/* ── Infrastructure Directory Footnote ── */}
      <div className="pt-6 pb-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)] stagger-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-surplus)]" />
          <span>All 5 nodes synchronized with Central BESS & Primary Interconnect</span>
        </div>
        <span className="text-[11px]">
          Select any facility for detailed power balance and transfer ledger
        </span>
      </div>
    </div>
  );
}
