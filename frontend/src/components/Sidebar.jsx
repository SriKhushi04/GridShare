import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Brain,
  ArrowLeftRight,
  Zap,
  Activity,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/buildings', label: 'Buildings', icon: Building2 },
  { to: '/ai-decisions', label: 'AI Decisions', icon: Brain },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen border-r border-blue-900/30 bg-[#080c14]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-blue-900/30">
        <NavLink to="/" className="flex items-center gap-2 mb-1 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Zap size={18} className="text-blue-400" />
            <div className="absolute inset-0 blur-sm opacity-60">
              <Zap size={18} className="text-blue-400" />
            </div>
          </div>
          <span className="font-bold text-base tracking-widest text-white text-mono uppercase">
            Grid Share
          </span>
        </NavLink>
        <p className="text-[10px] text-slate-500 tracking-wider ml-6 uppercase">
          Microgrid Management
        </p>
      </div>

      {/* System Status */}
      <div className="px-5 py-3 border-b border-blue-900/20">
        <div className="flex items-center gap-2">
          <span className="animate-blink inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-medium tracking-widest text-emerald-400 uppercase text-mono">
            System Online
          </span>
        </div>
        <div className="mt-1 text-[9px] text-slate-500 tracking-wider uppercase ml-3.5">
          Simulated Microgrid
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded text-xs tracking-wider transition-all duration-150 group
              ${isActive
                ? 'bg-blue-600/15 text-blue-300 border border-blue-500/25'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/3 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={14}
                  className={isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400 transition-colors'}
                />
                <span className="uppercase font-medium">{label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-blue-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-blue-900/20">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={10} className="text-blue-500" />
          <span className="text-[9px] text-slate-600 tracking-widest uppercase">AI Core Active</span>
        </div>
        <div className="text-[8px] text-slate-700 tracking-wider uppercase">
          Grid Share v1.0
        </div>
      </div>
    </aside>
  );
}

