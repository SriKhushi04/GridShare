export default function StatCard({ label, value, unit, icon: Icon, accent = 'blue', trend }) {
  const accentMap = {
    blue: { border: 'border-blue-500/20', icon: 'text-blue-400', bg: 'bg-blue-500/5' },
    green: { border: 'border-emerald-500/20', icon: 'text-emerald-400', bg: 'bg-emerald-500/5' },
    amber: { border: 'border-amber-500/20', icon: 'text-amber-400', bg: 'bg-amber-500/5' },
    red: { border: 'border-red-500/20', icon: 'text-red-400', bg: 'bg-red-500/5' },
    slate: { border: 'border-slate-500/20', icon: 'text-slate-400', bg: 'bg-slate-500/5' },
  };

  const colors = accentMap[accent] || accentMap.blue;

  return (
    <div
      className={`glass-panel rounded-lg px-4 py-3 flex flex-col gap-2 ${colors.border} relative overflow-hidden`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-slate-500 tracking-widest uppercase font-medium text-mono">
          {label}
        </span>
        {Icon && (
          <div className={`${colors.bg} rounded p-1`}>
            <Icon size={12} className={colors.icon} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1">
        <span className="text-xl font-bold text-white text-mono leading-none">{value}</span>
        {unit && (
          <span className="text-[11px] text-slate-500 mb-0.5 text-mono">{unit}</span>
        )}
      </div>

      {/* Trend / extra info */}
      {trend && (
        <div className="text-[9px] text-slate-600 tracking-wider">{trend}</div>
      )}

      {/* Subtle corner accent */}
      <div className={`absolute top-0 right-0 w-12 h-12 ${colors.bg} rounded-bl-full opacity-30`} />
    </div>
  );
}

