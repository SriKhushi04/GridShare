import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, Zap, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AIActivityPanel({ events = [] }) {
  const { isDark } = useTheme();
  // Prioritize active operational dispatches, transfers, and alerts over routine telemetry scans
  const prioritized = events.filter((e) => e.type === 'action' || e.type === 'success' || e.type === 'warning' || e.type === 'alert');
  const recentEvents = (prioritized.length >= 3 ? prioritized : events).slice(0, 6);

  const getEventIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={12} className="text-[var(--status-surplus)] shrink-0" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle size={12} className="text-[var(--status-deficit)] shrink-0" />;
      case 'action':
        return <Zap size={12} className="text-[var(--accent-primary)] shrink-0" />;
      default:
        return <Info size={12} className="text-[var(--text-muted)] shrink-0" />;
    }
  };

  return (
    <div className="rounded-2xl p-6 flex flex-col h-full transition-colors panel-surface border border-[var(--border-subtle)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-[var(--text-muted)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-primary)]">
            Operational Log
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          Live Dispatch
        </span>
      </div>

      {/* Timeline entries */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {recentEvents.length > 0 ? (
          recentEvents.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="flex items-start gap-2.5 p-2.5 rounded-md text-xs transition-colors border border-[var(--border-subtle)]"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <div className="mt-0.5">{getEventIcon(evt.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-normal text-[var(--text-primary)] leading-snug">
                  {evt.message}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[var(--text-muted)]">
                  <span>{evt.timestamp || 'Settled'}</span>
                  {evt.buildingId && (
                    <>
                      <span>·</span>
                      <span className="uppercase font-medium text-[var(--text-secondary)]">
                        {evt.buildingId}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-28 text-center text-xs text-[var(--text-muted)]">
            <span>Awaiting telemetry updates...</span>
          </div>
        )}
      </div>
    </div>
  );
}
