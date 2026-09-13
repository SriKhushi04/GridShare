import { CheckCircle2, Clock, AlertTriangle, Cpu, ShieldCheck } from 'lucide-react';

export default function AIDecisionCard({ decision }) {
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
  const isFallback = sourceMode === 'DETERMINISTIC_SAFETY_FALLBACK';

  const resultStyle =
    result === 'COMPLETED' || result === 'EXECUTED'
      ? { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
      : result === 'ACTIVE'
      ? { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
      : { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };

  const ResultIcon = resultStyle.icon;

  return (
    <div className="glass-panel rounded-lg p-5 border border-blue-900/20 hover:border-blue-700/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] text-slate-600 uppercase tracking-widest text-mono">Situation</span>
            {sourceMode && (
              <span
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded border text-mono uppercase tracking-wider ${
                  isAgent
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : isFallback
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                }`}
              >
                {isAgent ? 'Gemini AI Agent' : 'Safety Fallback'}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{situation}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className={`text-[9px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${resultStyle.bg} ${resultStyle.color}`}>
            <ResultIcon size={9} />
            <span className="text-mono tracking-wider uppercase">{result}</span>
          </span>
          <span className="text-[10px] text-slate-600 text-mono">{timestamp}</span>
        </div>
      </div>

      {/* Decision */}
      <div className="mb-3 p-3 bg-blue-500/5 rounded border border-blue-500/15">
        <div className="text-[9px] text-blue-400 uppercase tracking-widest text-mono mb-1 flex items-center justify-between">
          <span>AI Decision</span>
          {confidence && <span className="text-[8px] text-slate-500">Confidence: {(confidence * 100).toFixed(0)}%</span>}
        </div>
        <p className="text-xs text-slate-200">{dec}</p>
      </div>

      {/* Details row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {displayAmount > 0 ? (
          <div className="p-2 rounded bg-white/2 border border-white/5">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-0.5">Energy Amount</div>
            <div className="text-sm font-bold text-white text-mono">{displayAmount} <span className="text-[11px] text-slate-500 font-normal">kWh</span></div>
          </div>
        ) : (
          <div className="p-2 rounded bg-white/2 border border-white/5">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-0.5">Action</div>
            <div className="text-xs font-bold text-slate-300 text-mono">NO ACTION</div>
          </div>
        )}
        <div className="p-2 rounded bg-white/2 border border-white/5 col-span-1">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-0.5">Validation</div>
          <div className="text-[10px] text-emerald-400 text-mono flex items-center gap-1">
            <ShieldCheck size={10} />
            {validationResult || 'Backend Verified'}
          </div>
        </div>
        <div className="p-2 rounded bg-white/2 border border-white/5 col-span-1">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-0.5">Priority</div>
          <div className="text-xs text-slate-300">P2P → Battery → Grid</div>
        </div>
      </div>

      {/* Tools Used (if available) */}
      {toolsUsed && toolsUsed.length > 0 && (
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="text-[9px] text-slate-600 text-mono uppercase tracking-wider flex items-center gap-1">
            <Cpu size={9} /> Tools Called:
          </span>
          {toolsUsed.map((tool) => (
            <span key={tool} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/3 border border-white/10 text-slate-400">
              {tool}()
            </span>
          ))}
        </div>
      )}

      {/* Reason */}
      <div>
        <div className="text-[9px] text-slate-500 uppercase tracking-widest text-mono mb-1">Reasoning Summary</div>
        <p className="text-[11px] text-slate-400 leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}
