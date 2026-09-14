import { useState } from 'react';
import { formatBalance } from '../utils/statusHelpers';

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const W = 800;
const H = 520;          // reduced height for clean fit
const CX = W / 2;       // 400
const CY = H / 2 - 10;  // 250

// Building positions — tight star layout
const BUILDING_POSITIONS = [
  { id: 'b01', bx: 400, by: 72  },   // B01 — top centre
  { id: 'b02', bx: 660, by: 195 },   // B02 — right upper
  { id: 'b03', bx: 640, by: 400 },   // B03 — right lower
  { id: 'b04', bx: 160, by: 400 },   // B04 — left lower
  { id: 'b05', bx: 140, by: 195 },   // B05 — left upper
];

const NODE_W = 112;
const NODE_H = 96;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusStroke(status) {
  if (status === 'SURPLUS') return '#10b981';
  if (status === 'DEFICIT') return '#f87171';
  return '#60a5fa';
}

// ─── Animated energy particles ────────────────────────────────────────────────
function EnergyParticles({ x1, y1, x2, y2, active, color = '#60a5fa' }) {
  if (!active) return null;
  return (
    <>
      {[0, 0.5, 1.0].map((delay, i) => (
        <circle key={i} r="3" fill={color} opacity="0.9">
          <animateMotion
            dur="1.5s"
            begin={`${delay}s`}
            repeatCount="indefinite"
            path={`M ${x1} ${y1} L ${x2} ${y2}`}
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="1.5s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </>
  );
}

// ─── Connection line ──────────────────────────────────────────────────────────
function EnergyConnection({ x1, y1, x2, y2, active, transferColor }) {
  const stroke = active ? (transferColor || '#3b82f6') : '#1e3a5f';
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0a1020" strokeWidth="3" />
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={stroke}
        strokeWidth={active ? 1.5 : 1}
        strokeDasharray={active ? '8 4' : '4 8'}
        opacity={active ? 0.7 : 0.22}
      >
        {active && (
          <animate
            attributeName="stroke-dashoffset"
            from="24" to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </line>
      <EnergyParticles x1={x1} y1={y1} x2={x2} y2={y2} active={active} color={transferColor || '#60a5fa'} />
    </g>
  );
}

// ─── Building node ────────────────────────────────────────────────────────────
function BuildingNode({ building, pos, isActive, isHovered, onHover }) {
  const { name, shortName, solarGeneration, consumption, batteryLevel, status } = building;
  const stroke = statusStroke(status);
  const balance = formatBalance(building.energyBalance);
  const bx = pos.bx - NODE_W / 2;
  const by = pos.by - NODE_H / 2;

  return (
    <g style={{ cursor: 'pointer' }} onMouseEnter={() => onHover(building.buildingId)} onMouseLeave={() => onHover(null)}>
      {/* Hover glow ring */}
      {isHovered && (
        <rect x={bx - 5} y={by - 5} width={NODE_W + 10} height={NODE_H + 10} rx="11"
          fill="none" stroke={stroke} strokeWidth="1" opacity="0.35" />
      )}

      {/* Card */}
      <rect x={bx} y={by} width={NODE_W} height={NODE_H} rx="8"
        fill="#0d1424" stroke={stroke} strokeWidth={isActive ? 1.5 : 1}
        opacity={isHovered ? 1 : 0.95}
      />
      {/* Top colour bar */}
      <rect x={bx} y={by} width={NODE_W} height="3" rx="8" fill={stroke} opacity="0.7" />

      {/* Active pulse dot */}
      {isActive && (
        <circle cx={bx + NODE_W - 10} cy={by + 12} r="3" fill={stroke} opacity="0.9">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Node label */}
      <text x={bx + 10} y={by + 17} fontSize="7" fill="#64748b" fontFamily="monospace" letterSpacing="1.5">
        NODE · {shortName}
      </text>

      {/* Name */}
      <text x={bx + NODE_W / 2} y={by + 30} fontSize="10.5" fill="white"
        fontFamily="monospace" fontWeight="bold" letterSpacing="2" textAnchor="middle">
        {name.toUpperCase()}
      </text>

      {/* Divider */}
      <line x1={bx + 10} y1={by + 36} x2={bx + NODE_W - 10} y2={by + 36} stroke="#1e3a5f" strokeWidth="0.5" />

      {/* Solar */}
      <text x={bx + 10} y={by + 48} fontSize="8" fill="#fbbf24" fontFamily="monospace">☀</text>
      <text x={bx + 22} y={by + 48} fontSize="8" fill="#94a3b8" fontFamily="monospace">{solarGeneration}kW</text>

      {/* Load */}
      <text x={bx + 10} y={by + 59} fontSize="8" fill="#60a5fa" fontFamily="monospace">⚡</text>
      <text x={bx + 22} y={by + 59} fontSize="8" fill="#94a3b8" fontFamily="monospace">{consumption}kW</text>

      {/* Battery bar */}
      <text x={bx + 10} y={by + 70} fontSize="7" fill="#64748b" fontFamily="monospace">BATT</text>
      <rect x={bx + 35} y={by + 63} width={NODE_W - 46} height="5" rx="2.5" fill="#1e293b" />
      <rect x={bx + 35} y={by + 63}
        width={(NODE_W - 46) * batteryLevel / 100} height="5" rx="2.5"
        fill={batteryLevel > 60 ? '#10b981' : batteryLevel > 35 ? '#f59e0b' : '#ef4444'}
      />
      <text x={bx + NODE_W - 8} y={by + 69} fontSize="7" fill="#94a3b8" fontFamily="monospace" textAnchor="end">
        {batteryLevel}%
      </text>

      {/* Status badge */}
      <rect x={bx + 10} y={by + 77} width={NODE_W - 20} height="13" rx="3"
        fill={stroke} opacity="0.1" />
      <rect x={bx + 10} y={by + 77} width={NODE_W - 20} height="13" rx="3"
        fill="none" stroke={stroke} strokeWidth="0.5" opacity="0.5" />
      <text x={bx + NODE_W / 2} y={by + 86.5} fontSize="7" fill={stroke}
        fontFamily="monospace" fontWeight="bold" letterSpacing="2" textAnchor="middle">
        {status}  {balance} kW
      </text>
    </g>
  );
}

// ─── Grid Share Core ──────────────────────────────────────────────────────────
function GridShareCore({ core }) {
  const cw = 136;
  const ch = 126;
  const cx = CX - cw / 2;
  const cy = CY - ch / 2;
  const battPct = core.centralBattery || core.percentage || core.batteryLevel || 0;

  return (
    <g>
      {/* Pulse rings */}
      <circle cx={CX} cy={CY} r="88" fill="none" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.15">
        <animate attributeName="r" values="84;91;84" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.12;0.28;0.12" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx={CX} cy={CY} r="72" fill="none" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.1" />

      {/* Card */}
      <rect x={cx} y={cy} width={cw} height={ch} rx="10" fill="#060d1a" stroke="#2563eb" strokeWidth="1.5" />
      <rect x={cx} y={cy} width={cw} height="3" rx="10" fill="#2563eb" opacity="0.8" />

      <text x={CX} y={cy + 20} fontSize="7" fill="#60a5fa" fontFamily="monospace"
        fontWeight="bold" letterSpacing="2" textAnchor="middle">
        GRID SHARE CORE
      </text>

      {/* AI indicator */}
      <circle cx={CX - 30} cy={cy + 32} r="3" fill="#10b981">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <text x={CX - 23} y={cy + 36} fontSize="8" fill="#10b981" fontFamily="monospace" fontWeight="bold">
        AI ACTIVE
      </text>

      <line x1={cx + 10} y1={cy + 43} x2={cx + cw - 10} y2={cy + 43} stroke="#1e3a5f" strokeWidth="0.5" />

      {/* Battery */}
      <text x={cx + 10} y={cy + 55} fontSize="7" fill="#64748b" fontFamily="monospace">BATTERY</text>
      <rect x={cx + 10} y={cy + 58} width={cw - 20} height="6" rx="3" fill="#1e293b" />
      <rect x={cx + 10} y={cy + 58} width={(cw - 20) * battPct / 100} height="6" rx="3" fill="#10b981" />
      <text x={cx + cw - 12} y={cy + 65} fontSize="7" fill="#94a3b8" fontFamily="monospace" textAnchor="end">
        {battPct}%
      </text>

      {/* Grid load */}
      <text x={cx + 10} y={cy + 80} fontSize="7" fill="#64748b" fontFamily="monospace">GRID LOAD</text>
      <text x={cx + cw - 10} y={cy + 80} fontSize="9" fill="white" fontFamily="monospace" fontWeight="bold" textAnchor="end">
        {core.gridLoad} kW
      </text>

      {/* Balance */}
      <text x={cx + 10} y={cy + 93} fontSize="7" fill="#64748b" fontFamily="monospace">BALANCE</text>
      <text x={cx + cw - 10} y={cy + 93} fontSize="9" fill="#10b981" fontFamily="monospace" fontWeight="bold" textAnchor="end">
        {core.energyBalance > 0 ? '+' : ''}{core.energyBalance} kW
      </text>

      {/* Status */}
      <rect x={cx + 10} y={cy + 100} width={cw - 20} height="14" rx="3" fill="#2563eb" opacity="0.08" />
      <rect x={cx + 10} y={cy + 100} width={cw - 20} height="14" rx="3" fill="none" stroke="#2563eb" strokeWidth="0.5" opacity="0.5" />
      <text x={CX} y={cy + 110} fontSize="7.5" fill="#60a5fa" fontFamily="monospace"
        fontWeight="bold" letterSpacing="2" textAnchor="middle">
        GRID {core.gridStatus}
      </text>
    </g>
  );
}

// ─── Main power grid indicator (bottom-centre inside viewBox) ─────────
function MainGridIndicator({ isOnline, powerImported }) {
  const gw = 130;
  const gh = 32;
  const gx = CX - gw / 2;
  const gy = H - 38;
  const statusText = isOnline ? `ONLINE · ${powerImported} kW` : 'GRID OFFLINE';
  const statusColor = isOnline ? '#10b981' : '#ef4444';

  return (
    <g>
      {/* Connector from core bottom */}
      <line x1={CX} y1={CY + 63} x2={CX} y2={gy}
        stroke={isOnline ? '#1e3a5f' : '#ef4444'} strokeWidth="1" strokeDasharray="3 5" opacity={isOnline ? 0.35 : 0.6} />

      <rect x={gx} y={gy} width={gw} height={gh} rx="5"
        fill="#090f1c" stroke={isOnline ? '#1e3a5f' : '#ef4444'} strokeWidth={isOnline ? 0.75 : 1} />
      <text x={CX} y={gy + 13} fontSize="7" fill={isOnline ? '#334155' : '#ef4444'} fontFamily="monospace"
        fontWeight="bold" letterSpacing="2" textAnchor="middle">MAIN POWER GRID</text>
      <circle cx={gx + 14} cy={gy + 22} r="3" fill={statusColor} opacity="0.8" />
      <text x={gx + 22} y={gy + 26} fontSize="7.5" fill={isOnline ? '#475569' : '#f87171'} fontFamily="monospace">{statusText}</text>
    </g>
  );
}

// ─── Master export ────────────────────────────────────────────────────────────
export default function MicrogridVisualization({ buildings = [], gridCore = {}, activeTransfers = [] }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Position mapping helper
  const getBuildingPos = (id) => {
    return BUILDING_POSITIONS.find((p) => p.id === id) || { bx: CX, by: CY };
  };

  // Check main grid online status
  const mainGridOnline = gridCore.mainGrid?.online ?? (gridCore.gridStatus !== 'GRID OFFLINE');
  const mainGridPower = gridCore.mainGrid?.powerImported ?? gridCore.mainGrid?.power ?? 0;

  // Edge point on the core border toward a building
  function coreEdge(pos) {
    const dx = pos.bx - CX;
    const dy = pos.by - CY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const r = 68;
    return { x: CX + (dx / dist) * r, y: CY + (dy / dist) * r };
  }

  // Edge point on the building border toward the core
  function buildingEdge(pos) {
    const dx = CX - pos.bx;
    const dy = CY - pos.by;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const hw = NODE_W / 2;
    const hh = NODE_H / 2;
    const t = Math.min(Math.abs(hw / dx), Math.abs(hh / dy));
    return { x: pos.bx + dx * t, y: pos.by + dy * t };
  }

  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="microgrid-dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.6" fill="#0f172a" />
          </pattern>
          <radialGradient id="coreGlow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#080c14" />
        <rect width={W} height={H} fill="url(#microgrid-dots)" />
        <circle cx={CX} cy={CY} r="160" fill="url(#coreGlow2)" />

        {/* Static Building Connections to Core */}
        {buildings.map((b) => {
          const pos = getBuildingPos(b.buildingId);
          const ce = coreEdge(pos);
          const be = buildingEdge(pos);

          // Find active transfer for this node
          const activeTx = activeTransfers.find((t) => t.from === b.buildingId || t.to === b.buildingId);
          const isFrom = activeTx && activeTx.from === b.buildingId;
          const isActive = !!activeTx;

          return (
            <EnergyConnection
              key={b.buildingId}
              x1={be.x} y1={be.y}
              x2={ce.x} y2={ce.y}
              active={isActive}
              transferColor={isFrom ? '#10b981' : '#60a5fa'}
            />
          );
        })}

        {/* Dynamic Main Grid Line Animation if MAIN_GRID active */}
        {activeTransfers.some((t) => t.type === 'MAIN_GRID' || t.from === 'grid') && mainGridOnline && (
          <EnergyParticles
            x1={CX} y1={H - 38}
            x2={CX} y2={CY + 63}
            active={true}
            color="#f59e0b"
          />
        )}

        {/* Main grid */}
        <MainGridIndicator isOnline={mainGridOnline} powerImported={mainGridPower} />

        {/* Core */}
        <GridShareCore core={gridCore} />

        {/* Buildings */}
        {buildings.map((b) => {
          const pos = getBuildingPos(b.buildingId);
          const isActive = activeTransfers.some((t) => t.from === b.buildingId || t.to === b.buildingId);

          return (
            <BuildingNode
              key={b.buildingId}
              building={b}
              pos={pos}
              isActive={isActive}
              isHovered={hoveredId === b.buildingId}
              onHover={setHoveredId}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-1 left-2 flex items-center gap-4">
        {[
          { color: '#10b981', label: 'Surplus' },
          { color: '#f87171', label: 'Deficit' },
          { color: '#60a5fa', label: 'Balanced' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
