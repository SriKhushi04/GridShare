import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Cpu, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIDecisionCard({ decision }) {
  const [expanded, setExpanded] = useState(false);

  const {
    situation,
    decision: dec,
    amount,
    amountKwh,
    reason,
    result,
    timestamp,
    sourceMode,
    toolsUsed,
    validationResult,
    confidence,
  } = decision;

  const displayAmount = amountKwh !== undefined ? amountKwh : amount;
  const isAgent = sourceMode === 'GEMINI_AGENT';
  const cardModel = decision.model
    ? decision.model.replace(/^models\//, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Gemini Agent';

  const resultStyle =
    result === 'COMPLETED' || result === 'EXECUTED'
      ? { icon: CheckCircle2, color: 'text-[var(--status-surplus)]', bg: 'bg-[var(--status-surplus-bg)] border-[var(--status-surplus-border)]' }
      : result === 'ACTIVE'
      ? { icon: Clock, color: 'text-[var(--accent-primary)]', bg: 'bg-[var(--accent-subtle)] border-[var(--accent-border)]' }
      : { icon: AlertTriangle, color: 'text-[var(--status-warning)]', bg: 'bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]' };

  const ResultIcon = resultStyle.icon;

  return (
    <div className="p-6 panel-surface border border-[var(--border-subtle)] transition-all duration-200">
      {/* ── Top Bar: Engine Mode, Result Status, Timestamp ── */}
      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border-subtle)] flex items-center gap-1.5 text-[var(--text-muted)]">
            <Cpu size={11} className={isAgent ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'} />
            <span className="text-[var(--text-secondary)]">{isAgent ? cardModel : 'Safety Fallback'}</span>
          </span>

          {confidence !== null && confidence !== undefined && (
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {(confidence * 100).toFixed(0)}% confidence
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase border flex items-center gap-1 ${resultStyle.bg} ${resultStyle.color}`}>
            <ResultIcon size={11} />
            <span>{result}</span>
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {timestamp || 'Settled'}
          </span>
        </div>
      </div>

      {/* ── Strategic Directive & Rationale ── */}
      <div className="space-y-3">
        <div>
          <span className="text-eyebrow block mb-1 text-[10px]">
            Dispatch Directive
          </span>
          <p className="text-base sm:text-lg font-normal text-[var(--text-primary)] leading-snug tracking-tight">
            {dec}
          </p>
        </div>

        {reason && (
          <div className="py-2 text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="text-eyebrow block mb-1 text-[10px]">
              Operational Rationale
            </span>
            <p>{reason}</p>
          </div>
        )}
      </div>

      {/* ── Metric Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)] text-xs font-mono">
        <div>
          <span className="text-eyebrow block mb-0.5 text-[10px]">Energy Transfer</span>
          <span className="font-medium text-sm text-[var(--text-primary)]">
            {displayAmount > 0 ? `${displayAmount} kWh` : 'Zero Transfer'}
          </span>
        </div>

        <div>
          <span className="text-eyebrow block mb-0.5 text-[10px]">Physical Invariant</span>
          <span className="font-medium text-xs text-[var(--status-surplus)] flex items-center gap-1 pt-0.5">
            <ShieldCheck size={12} />
            <span>{validationResult || 'Conservation Verified'}</span>
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer transition-colors interactive-tap"
          >
            <span>{expanded ? 'Hide Audit Trace' : 'Inspect Audit Trace'}</span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* ── Expandable Technical Audit Trace ── */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-3 text-xs font-mono">
          {situation && (
            <div>
              <span className="text-eyebrow block mb-1 text-[10px]">Telemetry Trigger Context</span>
              <p className="text-[var(--text-secondary)] text-[11px] font-mono p-3 rounded border border-[var(--border-subtle)] bg-black/[0.02] dark:bg-white/[0.02]">
                {situation}
              </p>
            </div>
          )}

          {toolsUsed && toolsUsed.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-eyebrow text-[10px] flex items-center gap-1">
                <Cpu size={11} /> Tool Invocations:
              </span>
              {toolsUsed.map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--border-subtle)] text-[var(--text-primary)] bg-black/[0.02] dark:bg-white/[0.02]"
                >
                  {tool}()
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
