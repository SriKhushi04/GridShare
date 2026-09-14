import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGrid } from '../context/GridContext';
import { gridApi } from '../api/gridApi';
import { getStatusColor, formatBalance } from '../utils/statusHelpers';
import { ArrowLeft } from 'lucide-react';

export default function BuildingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useGrid();

  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBuilding() {
      try {
        setLoading(true);
        const data = await gridApi.getBuildingById(id);
        if (isMounted) {
          setBuilding(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[BuildingDetails] Fallback to state:', err);
          const cleanId = id?.toLowerCase();
          const fallback = state?.buildings?.find((b) => {
            const bId = b.buildingId?.toLowerCase();
            return bId === cleanId || bId?.replace(/\D/g, '') === cleanId?.replace(/\D/g, '');
          });
          if (fallback) {
            setBuilding(fallback);
          } else {
            setError(err.message || 'Node not found');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBuilding();
    return () => {
      isMounted = false;
    };
  }, [id, state?.buildings]);

  if (loading && !building) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[65dvh] gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-emerald-500 animate-spin" />
        <span className="text-xs font-mono text-[var(--text-muted)]">
          Loading node telemetry...
        </span>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[65dvh] p-6 text-center">
        <p className="text-rose-500 text-sm mb-4">{error || 'Node not found.'}</p>
        <button
          onClick={() => navigate('/buildings')}
          className="text-[var(--accent-primary)] text-xs font-medium hover:underline"
        >
          ← Return to Buildings
        </button>
      </div>
    );
  }

  const transactions = state?.transactions || [];
  const cleanId = id?.toLowerCase();
  const cleanNum = cleanId?.replace(/\D/g, '');
  const nodeTransfers = transactions.filter((tx) => {
    const fromId = tx.from?.toLowerCase();
    const toId = tx.to?.toLowerCase();
    return (
      fromId === cleanId ||
      toId === cleanId ||
      (cleanNum && (fromId?.replace(/\D/g, '') === cleanNum || toId?.replace(/\D/g, '') === cleanNum))
    );
  });

  const { name, solarGeneration, consumption, batteryLevel, energyBalance, status, aiPrediction } = building;
  const statusColor = getStatusColor(status);
  const balLabel = formatBalance(energyBalance);

  const maxVal = Math.max(solarGeneration || 0, consumption || 0, 1);
  const solarWidth = Math.round(((solarGeneration || 0) / maxVal) * 100);
  const loadWidth = Math.round(((consumption || 0) / maxVal) * 100);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="flex items-center justify-between gap-4 stagger-1">
        <button
          onClick={() => navigate('/buildings')}
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer interactive-tap"
        >
          <ArrowLeft size={13} />
          <span>← All Substations</span>
        </button>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-[var(--text-muted)]">Substation: {id?.toUpperCase()}</span>
          <span className={`font-medium uppercase ${statusColor}`}>{status}</span>
        </div>
      </div>

      {/* ── Hero Balance & Profile Row ── */}
      <div className="pb-8 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-end justify-between gap-8 stagger-2">
        <div>
          <span className="text-eyebrow block mb-1">
            Substation Facility Profile
          </span>
          <h1 className="text-title-lg text-[var(--text-primary)]">
            {name}
          </h1>
          <p className="text-body-sm text-[var(--text-secondary)] mt-2 max-w-lg">
            Operational status: {status === 'SURPLUS' ? 'Exporting renewable generation surplus to campus microgrid interconnect' : status === 'DEFICIT' ? 'Buffering supplementary power from peer substations and central BESS' : 'Autonomous standalone equilibrium'}
          </p>
        </div>

        {/* Hero Balance Metric */}
        <div className="flex flex-col sm:items-end justify-center shrink-0">
          <span className="text-eyebrow mb-1">Net Power Balance</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-light font-mono tracking-tight ${statusColor}`}>
              {balLabel}
            </span>
            <span className="text-base font-mono text-[var(--text-muted)]">kW</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">Instantaneous Physical Telemetry</span>
        </div>
      </div>

      {/* ── Main Workstation: Power Comparator & Details (Asymmetric 70/30) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start stagger-3">
        {/* Left Column: Power Balance Comparator & Transfers (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Visual Power Balance Comparator */}
          <div className="p-6 panel-surface border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Power Balance Comparator
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Photovoltaic output vs active facility demand
                </span>
              </div>
              <span className="text-xs font-mono text-[var(--text-primary)] font-medium">
                Net: {balLabel} kW
              </span>
            </div>

            <div className="space-y-5">
              {/* Solar Generation Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[var(--text-secondary)]">Solar Generation</span>
                  <span className="font-medium text-[var(--text-primary)]">{solarGeneration} kW</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${solarWidth}%`, backgroundColor: 'var(--accent-primary)' }}
                  />
                </div>
              </div>

              {/* Load Demand Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[var(--text-secondary)]">Active Demand</span>
                  <span className="font-medium text-[var(--text-primary)]">{consumption} kW</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${loadWidth}%`, backgroundColor: 'var(--text-muted)' }}
                  />
                </div>
              </div>

              {/* Local Storage Bar */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[var(--text-secondary)]">Local Storage State of Charge</span>
                  <span className="font-medium text-[var(--text-primary)]">{batteryLevel}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${batteryLevel}%`,
                      backgroundColor: batteryLevel > 35 ? 'var(--text-secondary)' : 'var(--status-deficit)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Node Transfer History */}
          <div className="p-6 panel-surface border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Node Transfer Ledger
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Energy dispatches originating or terminating at this facility
                </span>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {nodeTransfers.length} Event(s)
              </span>
            </div>

            <div className="space-y-2">
              {nodeTransfers.length > 0 ? (
                nodeTransfers.map((tx, idx) => {
                  const isOut = tx.from === id;
                  return (
                    <div
                      key={tx.id || idx}
                      className="flex items-center justify-between p-3 border-b border-[var(--border-subtle)] last:border-b-0 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase text-[var(--accent-primary)] font-medium">
                          {isOut ? 'EXPORT' : 'IMPORT'}
                        </span>
                        <div>
                          <span className="font-medium text-[var(--text-primary)] block">
                            {isOut ? `→ ${tx.toName}` : `← ${tx.fromName}`}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {tx.timestamp || 'Settled'} · {tx.type}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-medium text-xs text-[var(--text-primary)] block">
                          {tx.amount} kWh
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase">
                          {tx.status || 'Settled'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                  No active transfer history recorded for this node in the current session.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Phase 3 Forecast Container & Node Specification (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Phase 3 Forecast Preview Container */}
          <div className="p-6 panel-surface border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-primary)]">
                1-Hour Forecast Baseline
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                Phase 3 Preview
              </span>
            </div>

            <div className="py-2 mb-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              <span className="text-eyebrow block mb-1 text-[10px]">
                Diurnal Advisory Model
              </span>
              <p>
                {aiPrediction || 'Diurnal baseline: Photovoltaic output expected to follow standard solar elevation curve. No acute localized deficit projected for next hour.'}
              </p>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-normal pt-3 border-t border-[var(--border-subtle)]">
              Full machine learning models will be introduced in Phase 3. No synthetic forecast charts or fabricated confidence metrics are presented.
            </p>
          </div>

          {/* Node Specification List */}
          <div className="p-6 panel-surface border border-[var(--border-subtle)]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] pb-3 mb-3 border-b border-[var(--border-subtle)]">
              Facility Specification
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Substation Identifier</span>
                <span className="text-[var(--text-primary)] font-medium">{id?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">P2P Sharing Status</span>
                <span className="text-[var(--status-surplus)] font-medium">Active Interconnect</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Central BESS Buffer</span>
                <span className="text-[var(--text-primary)] font-medium">Tier 2 Coupled</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Grid Fallback</span>
                <span className="text-[var(--text-muted)]">Tier 3 Standby</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
