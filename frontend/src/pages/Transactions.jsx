import React from 'react';
import TopBar from '../components/TopBar';
import TransactionTable from '../components/TransactionTable';
import SimulationControls from '../components/SimulationControls';
import { useGrid } from '../context/GridContext';
import { ArrowLeftRight, ShieldCheck, Info } from 'lucide-react';

export default function Transactions() {
  const { state } = useGrid();
  const { transactions } = state;

  const p2pCount = transactions.filter((t) => t.type === 'P2P').length;
  const totalKwh = transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(1);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080c14]">
      <TopBar title="Transactions" subtitle="Energy Transfer Ledger" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Simulation Controls */}
        <SimulationControls />

        {/* Stats strip */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20">
            <ArrowLeftRight size={11} className="text-blue-400" />
            <span className="text-[10px] text-blue-400 text-mono uppercase tracking-wider font-medium">
              {transactions.length} Transactions
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 text-mono uppercase tracking-wider">
              Simulation Verified
            </span>
          </div>
          <div className="text-[10px] text-slate-500 text-mono">
            Total: <span className="text-white font-bold">{totalKwh} kWh</span> transferred
          </div>
          <div className="text-[10px] text-slate-500 text-mono">
            P2P Transfers: <span className="text-blue-400 font-bold">{p2pCount}</span>
          </div>
        </div>



        {/* Transaction table */}
        <TransactionTable transactions={transactions} />

        {/* Type legend */}
        <div className="flex items-center gap-5 pt-2">
          <span className="text-[9px] text-slate-700 uppercase tracking-widest">Transaction Types:</span>
          {[
            { type: 'P2P', desc: 'Building-to-building sharing', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
            { type: 'BATTERY', desc: 'Central battery discharge', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
            { type: 'CHARGE', desc: 'Battery charging from surplus', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
            { type: 'GRID', desc: 'Main grid fallback', color: 'text-slate-400 border-slate-500/30 bg-slate-500/10' },
          ].map(({ type, desc, color }) => (
            <div key={type} className="flex items-center gap-2">
              <span className={`text-[9px] font-medium px-2 py-0.5 rounded border tracking-widest text-mono ${color}`}>
                {type}
              </span>
              <span className="text-[9px] text-slate-600">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
