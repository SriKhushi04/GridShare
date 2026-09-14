import { getActivityTypeColor } from '../utils/statusHelpers';
import { Brain } from 'lucide-react';

export default function AIActivityPanel({ events, agentStatus = {} }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-900/30 shrink-0 bg-[#0d131f]">
        <Brain size={12} className="text-purple-400" />
        <span className="text-[10px] font-medium tracking-widest text-slate-300 uppercase text-mono">
          Agent Activity
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {agentStatus?.mode === 'GEMINI_AGENT' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
              <span className="text-[9px] text-blue-400 text-mono">GEMINI</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-[9px] text-orange-400 text-mono">FALLBACK</span>
            </>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {events.map((event) => (
          <div
            key={event.id}
            className="px-4 py-2 hover:bg-white/2 transition-colors flex gap-3 items-start border-b border-white/3"
          >
            {/* Timestamp */}
            <span className="text-[9px] text-slate-600 text-mono shrink-0 pt-0.5 w-14">
              {event.timestamp}
            </span>

            {/* Dot */}
            <div className="shrink-0 mt-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  event.type === 'success'
                    ? 'bg-emerald-400'
                    : event.type === 'warning'
                    ? 'bg-amber-400'
                    : event.type === 'alert'
                    ? 'bg-red-400'
                    : event.type === 'action'
                    ? 'bg-blue-400'
                    : 'bg-slate-600'
                }`}
              />
            </div>

            {/* Message */}
            <span className={`text-[11px] leading-relaxed ${getActivityTypeColor(event.type)}`}>
              {event.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
