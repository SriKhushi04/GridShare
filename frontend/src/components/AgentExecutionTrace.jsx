import React, { useState, useEffect, useRef } from 'react';
import { Activity, Code, CheckCircle, XCircle, AlertTriangle, Cpu, Play, Search, Eye, AlertCircle, Database } from 'lucide-react';

const TYPE_ICONS = {
  OBSERVE: <Eye size={12} className="text-blue-400" />,
  ANALYZE: <Activity size={12} className="text-purple-400" />,
  PLAN: <Search size={12} className="text-indigo-400" />,
  TOOL: <Code size={12} className="text-cyan-400" />,
  VALIDATION: <Database size={12} className="text-orange-400" />,
  ACTION: <Play size={12} className="text-pink-400" />,
  EXECUTE: <CheckCircle size={12} className="text-emerald-400" />,
  ERROR: <XCircle size={12} className="text-red-400" />,
  REPLAN: <AlertTriangle size={12} className="text-yellow-400" />,
  VERIFY: <CheckCircle size={12} className="text-emerald-400" />,
  COMPLETE: <Cpu size={12} className="text-emerald-500" />
};

const TYPE_COLORS = {
  OBSERVE: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  ANALYZE: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
  PLAN: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
  TOOL: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
  VALIDATION: 'bg-orange-500/10 border-orange-500/20 text-orange-300',
  ACTION: 'bg-pink-500/10 border-pink-500/20 text-pink-300',
  EXECUTE: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  ERROR: 'bg-red-500/10 border-red-500/20 text-red-300',
  REPLAN: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
  VERIFY: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  COMPLETE: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold'
};

export default function AgentExecutionTrace({ trace = [], compact = false, isLive = false, onComplete }) {
  const [visibleCount, setVisibleCount] = useState(isLive ? 0 : trace.length);
  const traceId = useRef(trace.length ? trace[0].timestamp : null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Reset when trace changes fundamentally (e.g. new decision selected)
    const currentTraceId = trace.length ? trace[0].timestamp : null;
    if (traceId.current !== currentTraceId) {
      traceId.current = currentTraceId;
      setVisibleCount(isLive ? 0 : trace.length);
    }
  }, [trace, isLive]);

  useEffect(() => {
    if (!isLive) {
      setVisibleCount(trace.length);
      return;
    }

    if (visibleCount >= trace.length) {
      if (onComplete) onComplete();
      return;
    }

    const nextEvent = trace[visibleCount];
    let delay = 600; 
    
    if (nextEvent) {
      if (nextEvent.type === 'OBSERVE') delay = 400;
      else if (nextEvent.type === 'ANALYZE') delay = 800;
      else if (nextEvent.type === 'PLAN') delay = 700;
      else if (nextEvent.type === 'TOOL') delay = 500;
      else if (nextEvent.type === 'VALIDATION') delay = 700;
      else if (nextEvent.type === 'EXECUTE') delay = 600;
      else if (nextEvent.type === 'COMPLETE') delay = 400;
      else if (nextEvent.type === 'ERROR') delay = 900;
    }

    const timer = setTimeout(() => {
      setVisibleCount(prev => prev + 1);
      // Auto-scroll to bottom if compact
      if (compact && containerRef.current) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, 50);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleCount, isLive, trace, onComplete, compact]);

  if (!trace || trace.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8 gap-2">
        <AlertCircle size={16} className="opacity-50" />
        No execution trace available.
      </div>
    );
  }

  const displayCount = isLive ? visibleCount : trace.length;
  const visibleTrace = trace.slice(0, displayCount);

  return (
    <div 
      ref={containerRef}
      className={`space-y-3 ${compact ? 'max-h-48 overflow-y-auto pr-2 custom-scrollbar' : 'pb-8'}`}
    >
      {visibleTrace.map((event, i) => {
        const isNewest = isLive && i === visibleCount - 1;
        return (
          <div key={i} className={`flex items-start gap-3 relative ${isNewest ? 'animate-fade-in-up' : ''}`}>
            {i < trace.length - 1 && (
              <div className={`absolute left-2.5 top-6 bottom-[-16px] w-[1px] ${isLive && i >= visibleCount - 1 ? 'bg-white/0' : 'bg-white/5 transition-colors duration-500'}`} />
            )}
            
            <div className={`mt-1 flex-shrink-0 z-10 w-5 h-5 rounded-full bg-[#0d131f] flex items-center justify-center transition-all duration-300 ${
              isNewest 
                ? 'border border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)] scale-110' 
                : 'border border-white/10 scale-100'
            }`}>
              {TYPE_ICONS[event.type] || <Activity size={10} className="text-slate-400" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border text-mono transition-colors duration-300 ${TYPE_COLORS[event.type] || 'bg-slate-800 text-slate-400 border-slate-700'} ${isNewest ? 'ring-1 ring-white/20' : ''}`}>
                  {event.type}
                </span>
                <span className="text-[10px] text-slate-500 text-mono">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className={`text-[11px] leading-relaxed font-mono whitespace-pre-wrap transition-colors duration-300 ${isNewest ? 'text-white' : 'text-slate-300'}`}>
                {event.message}
              </div>
            </div>
          </div>
        );
      })}
      
      {isLive && visibleCount < trace.length && (
        <div className="flex items-center gap-3 opacity-60 animate-fade-in-up mt-4 pl-1">
          <div className="w-4 flex justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50 animate-ping" />
          </div>
          <span className="text-[10px] text-purple-300 font-mono tracking-widest uppercase">Agent processing...</span>
        </div>
      )}
    </div>
  );
}

