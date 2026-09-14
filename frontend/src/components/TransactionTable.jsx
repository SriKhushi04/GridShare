import React from 'react';
import { getTransactionTypeColor, getTransactionStatusStyle } from '../utils/statusHelpers';
import { ArrowRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function TransactionTable({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl p-16 text-center text-xs text-[var(--text-muted)] space-y-2 panel-surface border border-[var(--border-subtle)]">
        <p className="text-sm font-semibold text-[var(--text-primary)]">No Dispatch Events Recorded</p>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          Energy transfers will populate automatically as peer sharing, storage buffering, or utility grid import dispatches occur.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden panel-surface border border-[var(--border-subtle)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
              <th className="py-3.5 px-5 font-medium">Route Vector</th>
              <th className="py-3.5 px-5 font-medium">Energy Volume</th>
              <th className="py-3.5 px-5 font-medium">Classification</th>
              <th className="py-3.5 px-5 font-medium">Timestamp</th>
              <th className="py-3.5 px-5 font-medium text-right">Settlement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {transactions.map((tx) => {
              const style = getTransactionStatusStyle(tx.status);
              const StatusIcon =
                style.icon === 'alert' ? AlertTriangle : style.icon === 'clock' ? Clock : CheckCircle2;

              return (
                <tr
                  key={tx.id}
                  className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                >
                  {/* Route */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                      <span>{tx.fromName}</span>
                      <ArrowRight size={12} className="text-[var(--text-muted)] shrink-0" />
                      <span>{tx.toName}</span>
                    </div>
                  </td>

                  {/* Volume (kWh) */}
                  <td className="py-4 px-5 font-mono">
                    <span className="font-light text-base text-[var(--text-primary)]">
                      {tx.amount}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] ml-1 font-mono">kWh</span>
                  </td>

                  {/* Type */}
                  <td className="py-4 px-5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border ${getTransactionTypeColor(
                        tx.type
                      )}`}
                    >
                      {tx.type}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-4 px-5 font-mono text-[11px] text-[var(--text-muted)]">
                    {tx.timestamp || 'Settled'}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 text-right">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border inline-flex items-center gap-1.5 ${style.bg} ${style.border} ${style.color}`}
                    >
                      <StatusIcon size={11} />
                      <span>{tx.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
