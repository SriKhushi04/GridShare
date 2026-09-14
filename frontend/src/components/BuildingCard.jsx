import React from 'react';
import { getStatusColor, formatBalance } from '../utils/statusHelpers';
import { ArrowRight } from 'lucide-react';

export default function BuildingCard({ building, onClick }) {
  const { buildingId, name, solarGeneration, consumption, batteryLevel, energyBalance, status } = building;
  const statusColor = getStatusColor(status);

  // Derive 2-digit index (e.g., 'b1' -> '01')
  const rawNum = buildingId ? buildingId.replace(/\D/g, '') : '';
  const nodeIndex = rawNum ? rawNum.padStart(2, '0') : '01';

  const roleText =
    status === 'SURPLUS'
      ? 'Energy Provider'
      : status === 'DEFICIT'
      ? 'Energy Consumer'
      : 'Self-Sufficient';

  const maxVal = Math.max(solarGeneration || 0, consumption || 0, 1);
  const solarWidth = Math.round(((solarGeneration || 0) / maxVal) * 100);
  const loadWidth = Math.round(((consumption || 0) / maxVal) * 100);

  return (
    <div
      onClick={onClick}
      className="p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer group interactive-tap panel-surface border border-[var(--border-subtle)] hover:border-[var(--border-default)] relative overflow-hidden"
    >
      <div>
        {/* Top bar: Large Architectural Index + Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="text-3xl font-light font-mono text-[var(--text-muted)] tracking-tighter group-hover:text-[var(--text-secondary)] transition-colors">
            {nodeIndex}
          </span>
          <div className="flex items-center gap-1.5 pt-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'SURPLUS'
                  ? 'bg-[var(--status-surplus)]'
                  : status === 'DEFICIT'
                  ? 'bg-[var(--status-deficit)]'
                  : 'bg-[var(--text-muted)]'
              }`}
            />
            <span className={`text-[11px] font-mono uppercase tracking-wider ${statusColor}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Substation Name & Role */}
        <div className="mb-5">
          <h3 className="text-base font-medium text-[var(--text-primary)] tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">
            {name}
          </h3>
          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
            {roleText}
          </span>
        </div>

        {/* Generation vs Demand Slim Proportional Meters */}
        <div className="space-y-3.5 my-5 pt-4 border-t border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-mono">
              <span className="text-[var(--text-muted)] text-[11px]">Solar Generation</span>
              <span className="font-medium text-[var(--text-primary)]">{solarGeneration} kW</span>
            </div>
            <div className="h-1 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${solarWidth}%`, backgroundColor: 'var(--accent-primary)' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-mono">
              <span className="text-[var(--text-muted)] text-[11px]">Active Demand</span>
              <span className="font-medium text-[var(--text-primary)]">{consumption} kW</span>
            </div>
            <div className="h-1 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${loadWidth}%`, backgroundColor: 'var(--text-muted)' }}
              />
            </div>
          </div>

          {/* Local BESS Telemetry */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1 font-mono">
              <span className="text-[var(--text-muted)] text-[11px]">Local BESS</span>
              <span className="font-medium text-[var(--text-primary)]">{batteryLevel}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${batteryLevel}%`,
                  backgroundColor: batteryLevel > 35 ? 'var(--text-secondary)' : 'var(--status-deficit)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Prominent Net Balance + Inspect Link */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-end justify-between">
        <div>
          <span className="text-eyebrow block mb-0.5 text-[10px]">
            Net Balance
          </span>
          <span className={`text-xl font-light font-mono tracking-tight ${statusColor}`}>
            {formatBalance(energyBalance)} <span className="text-xs font-mono text-[var(--text-muted)]">kW</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors pb-0.5 font-mono">
          <span>Details</span>
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
