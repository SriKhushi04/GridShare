import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { formatBalance } from '../utils/statusHelpers';

// ─── Spatial Geometry Dimensions ────────────────────────────────────────────
const W = 920;
const H = 580;
const CX = W / 2;      // 460
const CY = H / 2 - 16; // 274

// 5 Building Substations positioned in an expansive spatial arrangement
const BUILDING_POSITIONS = [
  { id: 'b01', x: 460, y: 76,  label: 'B01 · Science Hub' },
  { id: 'b02', x: 760, y: 206, label: 'B02 · Admin Block' },
  { id: 'b03', x: 645, y: 450, label: 'B03 · Library' },
  { id: 'b04', x: 275, y: 450, label: 'B04 · Student Center' },
  { id: 'b05', x: 160, y: 206, label: 'B05 · Engineering' },
];

const NODE_W = 136;
const NODE_H = 104;

export default function MicrogridVisualization({ buildings = [], gridCore = {}, activeTransfers = [] }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);

  const mainGridOnline = gridCore.mainGrid?.online ?? (gridCore.gridStatus !== 'GRID OFFLINE');
  const mainGridPower = Number(gridCore.mainGrid?.powerImported ?? gridCore.mainGrid?.currentImportKw ?? gridCore.mainGrid?.power ?? 0);
  
  // Guard centralBattery: backend returns object { capacity, currentEnergy, percentage, batteryLevel }
  const centralBattPct = typeof gridCore.centralBattery === 'object' && gridCore.centralBattery !== null
    ? Number(gridCore.centralBattery.percentage ?? gridCore.centralBattery.batteryLevel ?? 0)
    : (typeof gridCore.centralBattery === 'number'
        ? gridCore.centralBattery
        : Number(gridCore.percentage ?? 0));

  const netBalance = typeof gridCore.energyBalance === 'number' ? gridCore.energyBalance : Number(gridCore.energyBalance || 0);

  // Architectural Theme Palette (Graphite / Neutral Soft Stone with Rare Precious Champagne)
  const theme = {
    canvasBg: isDark ? '#0f1013' : '#f9f8f4',
    gridDot: isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(28, 27, 24, 0.03)',
    orbitLine: isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(28, 27, 24, 0.04)',
    guideline: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(28, 27, 24, 0.04)',
    nodeBg: isDark ? '#14151a' : '#ffffff',
    nodeBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(28, 27, 24, 0.07)',
    nodeHoverBorder: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(28, 27, 24, 0.22)',
    textPrimary: isDark ? '#f3f0ea' : '#191816',
    textSecondary: isDark ? '#928e85' : '#59564e',
    textMuted: isDark ? '#5c5953' : '#878379',
    coreBase: isDark ? '#16171d' : '#fcfbf9',
    coreBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 27, 24, 0.08)',
    accent: isDark ? '#c8a96e' : '#997738', // Precious champagne reserved for true energy transfer
    accentSubtle: isDark ? 'rgba(200, 169, 110, 0.08)' : 'rgba(153, 119, 56, 0.08)',
    lineDefault: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(28, 27, 24, 0.05)',
  };

  const getNodePos = (id) => BUILDING_POSITIONS.find((p) => p.id === id) || { x: CX, y: CY };

  return (
    <div className="w-full h-full relative select-none flex items-center justify-center">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full max-h-[600px] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle Canvas Dot Matrix */}
          <pattern id="microgrid-dot-matrix" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.6" fill={theme.gridDot} />
          </pattern>

          {/* Central Radial Light Diffusion */}
          <radialGradient id="hub-ambient-lighting" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)'} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Calibrated Node Soft Shadow */}
          <filter id="soft-depth" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="10"
              floodColor={isDark ? '#000000' : '#191816'}
              floodOpacity={isDark ? '0.45' : '0.04'}
            />
          </filter>
        </defs>

        {/* Spatial Canvas Environment */}
        <rect width={W} height={H} rx="16" fill={theme.canvasBg} />
        <rect width={W} height={H} rx="16" fill="url(#microgrid-dot-matrix)" />

        {/* Slow Majestic Orbital Topology Guides */}
        <g className="animate-orbit-drift" style={{ transformOrigin: `${CX}px ${CY}px` }}>
          <circle cx={CX} cy={CY} r="162" fill="none" stroke={theme.orbitLine} strokeWidth="1" strokeDasharray="3 7" />
          <circle cx={CX} cy={CY} r="236" fill="none" stroke={theme.orbitLine} strokeWidth="1" strokeDasharray="2 8" opacity="0.6" />
        </g>
        <circle cx={CX} cy={CY} r="140" fill="url(#hub-ambient-lighting)" />

        {/* ── Substation Interconnect Pathways ── */}
        {buildings.map((b) => {
          const pos = getNodePos(b.buildingId);
          const activeTx = activeTransfers.find((t) => t.from === b.buildingId || t.to === b.buildingId);
          const isFrom = activeTx && activeTx.from === b.buildingId;
          const isHovered = hoveredNode === b.buildingId;
          const isTransferring = !!activeTx;

          const strokeColor = isTransferring
            ? theme.accent
            : isHovered
            ? (isDark ? '#d4b67f' : '#685025')
            : theme.lineDefault;

          return (
            <g key={`pathway-${b.buildingId}`}>
              <line
                x1={CX}
                y1={CY}
                x2={pos.x}
                y2={pos.y}
                stroke={strokeColor}
                strokeWidth={isTransferring || isHovered ? 1.5 : 0.9}
                strokeDasharray={isTransferring ? '4 6' : 'none'}
                opacity={isTransferring ? 0.95 : isHovered ? 0.7 : 0.4}
              >
                {isTransferring && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from={isFrom ? '20' : '0'}
                    to={isFrom ? '0' : '20'}
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                )}
              </line>

              {/* Dynamic Champagne Energy Pulses */}
              {isTransferring && (
                <>
                  {[0, 0.55, 1.1].map((delay, i) => (
                    <circle key={i} r="2.2" fill={theme.accent}>
                      <animateMotion
                        dur="1.6s"
                        begin={`${delay}s`}
                        repeatCount="indefinite"
                        path={isFrom ? `M ${pos.x} ${pos.y} L ${CX} ${CY}` : `M ${CX} ${CY} L ${pos.x} ${pos.y}`}
                      />
                      <animate
                        attributeName="opacity"
                        values="0;0.9;0.9;0"
                        dur="1.6s"
                        begin={`${delay}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </>
              )}
            </g>
          );
        })}

        {/* ── Utility Grid Transmission Coupling (Bottom) ── */}
        <g>
          <line
            x1={CX}
            y1={CY + 64}
            x2={CX}
            y2={H - 46}
            stroke={mainGridOnline ? theme.orbitLine : 'var(--status-deficit)'}
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.6"
          />

          {activeTransfers.some((t) => t.type === 'MAIN_GRID' || t.from === 'grid') && mainGridOnline && (
            <>
              {[0, 0.8].map((delay, i) => (
                <circle key={i} r="2.2" fill="var(--status-warning)">
                  <animateMotion
                    dur="1.8s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                    path={`M ${CX} ${H - 46} L ${CX} ${CY + 64}`}
                  />
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </>
          )}

          {/* Grid Coupling Module */}
          <g transform={`translate(${CX - 95}, ${H - 48})`}>
            <rect
              width="190"
              height="32"
              rx="8"
              fill={theme.nodeBg}
              stroke={mainGridOnline ? theme.nodeBorder : 'var(--status-deficit)'}
              strokeWidth="1"
              filter="url(#soft-depth)"
            />
            <circle cx="16" cy="16" r="3" fill={mainGridOnline ? theme.accent : 'var(--status-deficit)'} />
            <text x="28" y="15" fontSize="8" fontWeight="500" fill={theme.textPrimary} letterSpacing="0.08em" fontFamily="Geist Mono, monospace">
              UTILITY COUPLING
            </text>
            <text x="28" y="24" fontSize="8" fontFamily="Geist Mono, monospace" fill={theme.textMuted}>
              {mainGridOnline ? `Online · ${mainGridPower.toFixed(1)} kW import` : 'Islanded / Disconnected'}
            </text>
          </g>
        </g>

        {/* ── Central BESS Storage Hub ── */}
        <g transform={`translate(${CX}, ${CY})`}>
          {/* Outer Refraction Ring */}
          <circle
            r="62"
            fill={theme.coreBase}
            stroke={theme.coreBorder}
            strokeWidth="1"
            filter="url(#soft-depth)"
          />

          {/* Battery State-of-Charge Arc */}
          <circle
            r="54"
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
            strokeWidth="3.5"
          />
          <circle
            r="54"
            fill="none"
            stroke={theme.accent}
            strokeWidth="3.5"
            strokeDasharray={`${(centralBattPct / 100) * 339.3} 339.3`}
            strokeDashoffset="84.8"
            strokeLinecap="round"
            className="transition-all duration-700"
          />

          {/* Hub Readout */}
          <text y="-18" fontSize="8" fontWeight="500" fill={theme.textMuted} letterSpacing="0.12em" fontFamily="Geist Mono, monospace" textAnchor="middle">
            BESS BUFFER
          </text>
          <text y="-1" fontSize="19" fontWeight="400" fontFamily="Geist Mono, monospace" fill={theme.textPrimary} textAnchor="middle">
            {centralBattPct}%
          </text>
          <text y="13" fontSize="8" fontFamily="Geist Mono, monospace" fill={theme.textMuted} textAnchor="middle">
            100 kWh Reserve
          </text>

          {/* Net Power Balance Indicator */}
          <g transform="translate(-40, 22)">
            <rect
              width="80"
              height="16"
              rx="4"
              fill={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
              stroke={theme.guideline}
              strokeWidth="0.8"
            />
            <text
              x="40"
              y="11"
              fontSize="7.5"
              fontWeight="500"
              fontFamily="Geist Mono, monospace"
              fill={netBalance >= 0 ? 'var(--status-surplus)' : 'var(--status-deficit)'}
              textAnchor="middle"
            >
              {formatBalance(netBalance)} kW Net
            </text>
          </g>
        </g>

        {/* ── 5 Building Substation Nodes ── */}
        {buildings.map((b) => {
          const pos = getNodePos(b.buildingId);
          const isHovered = hoveredNode === b.buildingId;
          const activeTx = activeTransfers.find((t) => t.from === b.buildingId || t.to === b.buildingId);
          const isTransferring = !!activeTx;

          const isSurplus = b.status === 'SURPLUS';
          const isDeficit = b.status === 'DEFICIT';
          const statusDot = isSurplus ? 'var(--status-surplus)' : isDeficit ? 'var(--status-deficit)' : 'var(--text-muted)';
          const bal = formatBalance(b.energyBalance);
          const nodeBattPct = typeof b.batteryLevel === 'object' && b.batteryLevel !== null
            ? Number(b.batteryLevel.percentage ?? b.batteryLevel.batteryLevel ?? 0)
            : Number(b.batteryLevel ?? 0);

          const bx = pos.x - NODE_W / 2;
          const by = pos.y - NODE_H / 2;

          return (
            <g
              key={b.buildingId}
              transform={`translate(${bx}, ${by})`}
              className="cursor-pointer transition-transform duration-150"
              onMouseEnter={() => setHoveredNode(b.buildingId)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => navigate(`/buildings/${b.buildingId}`)}
            >
              {/* Base Card Surface */}
              <rect
                width={NODE_W}
                height={NODE_H}
                rx="10"
                fill={theme.nodeBg}
                stroke={isHovered ? theme.nodeHoverBorder : isTransferring ? theme.accent : theme.nodeBorder}
                strokeWidth={isHovered || isTransferring ? 1.2 : 0.8}
                filter="url(#soft-depth)"
              />

              {/* Node ID with quiet status indicator */}
              <g transform="translate(12, 17)">
                <circle cx="3" cy="-3" r="2.5" fill={statusDot} />
                <text x="10" y="0" fontSize="8" fontWeight="500" fontFamily="Geist Mono, monospace" fill={theme.textMuted}>
                  {b.shortName || b.buildingId?.toUpperCase()}
                </text>
              </g>

              {/* Status Tag */}
              <text
                x={NODE_W - 12}
                y="17"
                fontSize="7.5"
                fontFamily="Geist Mono, monospace"
                fontWeight="500"
                fill={statusDot}
                textAnchor="end"
                letterSpacing="0.06em"
              >
                {b.status}
              </text>

              {/* Substation Name */}
              <text x="12" y="33" fontSize="10" fontWeight="500" fill={theme.textPrimary}>
                {b.name}
              </text>

              {/* Hairline Divider */}
              <line x1="12" y1="41" x2={NODE_W - 12} y2="41" stroke={theme.guideline} strokeWidth="0.8" />

              {/* Generation & Load Telemetry */}
              <g transform="translate(12, 53)">
                <text fontSize="7.5" fill={theme.textMuted}>Gen</text>
                <text x="24" fontSize="8" fontFamily="Geist Mono, monospace" fill={theme.textPrimary}>
                  {b.solarGeneration} kW
                </text>

                <text x="68" fontSize="7.5" fill={theme.textMuted}>Load</text>
                <text x="94" fontSize="8" fontFamily="Geist Mono, monospace" fill={theme.textPrimary}>
                  {b.consumption} kW
                </text>
              </g>

              {/* Local Storage Bar */}
              <g transform="translate(12, 69)">
                <text fontSize="7.5" fill={theme.textMuted}>BESS</text>
                <rect x="28" y="-5" width="62" height="3" rx="1.5" fill={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                <rect
                  x="28"
                  y="-5"
                  width={(62 * nodeBattPct) / 100}
                  height="3"
                  rx="1.5"
                  fill={nodeBattPct > 25 ? (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(28,27,24,0.45)') : 'var(--status-deficit)'}
                />
                <text x="96" fontSize="7" fontFamily="Geist Mono, monospace" fill={theme.textMuted}>
                  {nodeBattPct}%
                </text>
              </g>

              {/* Net Balance Strip */}
              <g transform="translate(12, 79)">
                <rect
                  width={NODE_W - 24}
                  height="15"
                  rx="3.5"
                  fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
                  stroke={theme.guideline}
                  strokeWidth="0.6"
                />
                <text
                  x={(NODE_W - 24) / 2}
                  y="10.5"
                  fontSize="7.5"
                  fontFamily="Geist Mono, monospace"
                  fontWeight="500"
                  fill={theme.textSecondary}
                  textAnchor="middle"
                >
                  Net {bal} kW
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Restrained Legend */}
      <div
        className="absolute bottom-3 left-4 px-3 py-1 rounded-md flex items-center gap-3 text-[10px] backdrop-blur-md transition-colors"
        style={{
          backgroundColor: isDark ? 'rgba(22, 23, 28, 0.88)' : 'rgba(255, 255, 255, 0.9)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--status-surplus)' }} />
          <span className="text-[var(--text-secondary)]">Surplus</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--status-deficit)' }} />
          <span className="text-[var(--text-secondary)]">Deficit</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
          <span className="text-[var(--text-secondary)]">Balanced</span>
        </div>
        <span className="text-[var(--border-default)]">·</span>
        <span className="text-[var(--text-muted)] text-[9px]">Select substation node to inspect</span>
      </div>
    </div>
  );
}
