import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopBar({ title, subtitle }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  });

  return (
    <header className="h-12 flex items-center justify-between px-6 border-b border-blue-900/30 bg-[#080c14] shrink-0">
      <div>
        <h1 className="text-sm font-semibold tracking-widest text-white uppercase text-mono">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[10px] text-slate-500 tracking-wider">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock size={11} />
          <span className="text-[11px] text-mono tracking-wider">{dateStr} · {timeStr}</span>
        </div>
        <div className="h-4 w-px bg-blue-900/40" />
        <div className="flex items-center gap-1.5">
          <span className="animate-blink w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] text-emerald-400 tracking-widest text-mono uppercase">Grid Share Core Active</span>
        </div>
      </div>
    </header>
  );
}

