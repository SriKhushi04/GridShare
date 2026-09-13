import { getStatusColor, getStatusBg, formatBalance } from '../utils/statusHelpers';
import { Sun, Zap, Battery } from 'lucide-react';

function BatteryBar({ level, compact = false }) {
  const color =
    level > 60 ? 'bg-emerald-400' : level > 35 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="flex items-center gap-1.5">
      {!compact && <Battery size={10} className="text-slate-500" />}
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${level}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400 text-mono w-8 text-right">{level}%</span>
    </div>
  );
}

export default function BuildingCard({ building, onClick }) {
  const { name, solarGeneration, consumption, batteryLevel, energyBalance, status } = building;
  const statusColor = getStatusColor(status);
  const statusBadge = getStatusBg(status);

  const borderColor =
    status === 'SURPLUS'
      ? 'border-emerald-500/25 hover:border-emerald-500/50'
      : status === 'DEFICIT'
      ? 'border-red-500/25 hover:border-red-500/50'
      : 'border-blue-500/25 hover:border-blue-500/50';

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-lg p-4 cursor-pointer transition-all duration-200 border ${borderColor} hover:bg-white/2 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[9px] text-slate-600 tracking-widest uppercase text-mono mb-0.5">
            Microgrid Node
          </div>
          <div className="text-sm font-semibold text-white tracking-wider text-mono uppercase">
            {name}
          </div>
        </div>
        <span
          className={`text-[9px] font-medium px-2 py-0.5 rounded border tracking-widest uppercase text-mono ${statusBadge}`}
        >
          {status}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase tracking-wider">
            <Sun size={9} className="text-amber-400" />
            Solar
          </div>
          <span className="text-sm font-bold text-white text-mono">{solarGeneration} <span className="text-[10px] text-slate-500 font-normal">kW</span></span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase tracking-wider">
            <Zap size={9} className="text-blue-400" />
            Load
          </div>
          <span className="text-sm font-bold text-white text-mono">{consumption} <span className="text-[10px] text-slate-500 font-normal">kW</span></span>
        </div>
      </div>

      {/* Battery */}
      <div className="mb-3">
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Battery</div>
        <BatteryBar level={batteryLevel} />
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-[9px] text-slate-500 uppercase tracking-wider">Balance</span>
        <span className={`text-sm font-bold text-mono ${statusColor}`}>
          {formatBalance(energyBalance)} kW
        </span>
      </div>
    </div>
  );
}

