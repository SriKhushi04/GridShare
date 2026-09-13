import { getTransactionTypeColor } from '../utils/statusHelpers';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TransactionTable({ transactions }) {
  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 py-2 border-b border-blue-900/30 bg-white/2">
        {['Route', 'Amount', 'Type', 'Time', 'Status'].map((h) => (
          <span key={h} className="text-[9px] text-slate-600 uppercase tracking-widest font-medium text-mono">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 py-3 hover:bg-white/2 transition-colors items-center"
          >
            {/* Route */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 text-mono font-medium">{tx.fromName}</span>
              <ArrowRight size={10} className="text-slate-600 shrink-0" />
              <span className="text-xs text-slate-300 text-mono font-medium">{tx.toName}</span>
            </div>

            {/* Amount */}
            <span className="text-xs font-bold text-white text-mono">{tx.amount} <span className="text-slate-500 font-normal">kWh</span></span>

            {/* Type */}
            <span className={`text-[9px] font-medium px-2 py-0.5 rounded border tracking-widest uppercase text-mono w-fit ${getTransactionTypeColor(tx.type)}`}>
              {tx.type}
            </span>

            {/* Time */}
            <span className="text-[11px] text-slate-500 text-mono">{tx.timestamp}</span>

            {/* Status */}
            <div className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 text-mono font-medium">{tx.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

