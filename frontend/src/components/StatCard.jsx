import React from 'react';

export default function StatCard({ label, value, unit, trend, subtitle }) {
  return (
    <div className="py-1">
      <span className="text-eyebrow block mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-light tracking-tight text-[var(--text-primary)] font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {unit}
          </span>
        )}
      </div>
      {(trend || subtitle) && (
        <span className="text-[11px] text-[var(--text-muted)] font-mono mt-1 block">
          {trend || subtitle}
        </span>
      )}
    </div>
  );
}
