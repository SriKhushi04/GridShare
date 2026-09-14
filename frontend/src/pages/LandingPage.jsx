import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Battery, ArrowLeftRight, Brain, Shield, Activity } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Decisions',
    desc: 'Autonomous energy routing with real-time deficit/surplus balancing across all nodes.',
  },
  {
    icon: ArrowLeftRight,
    title: 'P2P Energy Sharing',
    desc: 'Buildings trade surplus energy directly. Grid dependency drops to near zero.',
  },
  {
    icon: Battery,
    title: 'Smart Battery Core',
    desc: 'Central battery absorbs excess solar and discharges on demand — managed by AI.',
  },
  {
    icon: Shield,
    title: 'Verified Transactions',
    desc: 'Every energy transfer is logged in a tamper-proof ledger. Blockchain-ready.',
  },
];


export default function LandingPage() {
  const navigate = useNavigate();
  const [entering, setEntering] = useState(false);

  function handleEnter() {
    setEntering(true);
    setTimeout(() => navigate('/dashboard'), 600);
  }

  return (
    <div
      className={`min-h-screen bg-[#080c14] flex flex-col overflow-y-auto transition-opacity duration-500 ${entering ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* ── Grid pattern overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Ambient glow ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.08) 0%, transparent 70%)' }}
      />

      {/* ── Nav bar ── */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-blue-900/20">
        <div className="flex items-center gap-2.5">
          <Zap size={18} className="text-blue-400" />
          <span className="text-base font-bold tracking-widest text-white uppercase text-mono">
            Grid Share
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="animate-blink w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] text-emerald-400 tracking-widest uppercase text-mono">System Online</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8">
          <Activity size={11} className="text-blue-400" />
          <span className="text-[10px] text-blue-300 tracking-widest uppercase text-mono">
            AI-Powered Smart Microgrid Management
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-4">
          The Energy Grid,{' '}
          <span
            className="text-transparent"
            style={{
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              backgroundImage: 'linear-gradient(90deg, #3b82f6, #10b981)',
            }}
          >
            Reimagined
          </span>
        </h1>

        <p className="max-w-xl text-slate-400 text-base leading-relaxed mb-10">
          Grid Share connects five buildings into an intelligent microgrid that shares energy autonomously,
          minimises waste, and operates independently from the main power grid.
        </p>

        {/* CTA */}
        <button
          onClick={handleEnter}
          className="group flex items-center gap-3 px-7 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm tracking-wider transition-all duration-200 shadow-[0_0_24px_rgba(37,99,235,0.3)] hover:shadow-[0_0_32px_rgba(37,99,235,0.5)]"
        >
          <Zap size={15} />
          Enter Control Center
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-4 text-[11px] text-slate-600 tracking-wider">No login required</p>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 px-10 py-10 border-t border-blue-900/15">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass-panel rounded-lg p-4 border border-blue-900/20 hover:border-blue-700/30 transition-all"
            >
              <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                <Icon size={13} className="text-blue-400" />
              </div>
              <div className="text-xs font-semibold text-white mb-1.5">{title}</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-10 py-4 border-t border-blue-900/15 flex items-center justify-between">
        <span className="text-[10px] text-slate-700 text-mono uppercase tracking-wider">Grid Share · Phase 1</span>
        <span className="text-[10px] text-slate-700 text-mono uppercase tracking-wider">Simulated Microgrid Environment</span>
      </footer>
    </div>
  );
}

