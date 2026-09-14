import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Zap,
  SunMedium,
  Moon,
  Radio,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';
import { useGrid } from '../context/GridContext';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/buildings', label: 'Substations' },
  { to: '/ai-decisions', label: 'Decisions' },
  { to: '/transactions', label: 'Ledger' },
];

export default function HeaderNav() {
  const { state, loading, error, agentStatus } = useGrid();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const tickCount = state?.tickId ?? state?.tickCount ?? state?.currentTick ?? null;
  const isPaused = state?.isPaused;
  const isGemini = agentStatus?.mode === 'GEMINI_AGENT';
  const modelName = agentStatus?.model
    ? agentStatus.model.replace(/^models\//, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Gemini';

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-400"
      style={{
        backgroundColor: isDark ? 'rgba(13, 14, 17, 0.85)' : 'rgba(247, 246, 242, 0.88)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-8">
        {/* Left: Brand Mark & Route Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group interactive-tap">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
            >
              <Zap size={13} className="fill-current" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-sm tracking-tight text-[var(--text-primary)]">
                GridShare
              </span>
              <span className="hidden sm:inline text-[9px] uppercase font-mono tracking-[0.16em] text-[var(--text-muted)]">
                EMS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(`${to}/`));
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`relative px-3 py-1.5 text-xs font-normal tracking-tight transition-all duration-150 rounded ${
                    isActive
                      ? 'text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right: Technical Telemetry & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Tick Counter */}
          {tickCount !== null && (
            <div
              className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <span className="text-[9px] tracking-wider uppercase">{isPaused ? 'PAUSED' : 'TICK'}</span>
              <span className="font-medium text-[var(--text-primary)]">#{tickCount}</span>
            </div>
          )}

          {/* Engine Mode */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isGemini ? 'var(--accent-primary)' : 'var(--status-warning)' }}
            />
            <span>{isGemini ? modelName : 'Safety Fallback'}</span>
          </div>

          {/* Network Connection Status */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
            {error ? (
              <span className="flex items-center gap-1 text-[var(--status-deficit)]">
                <AlertCircle size={12} />
                <span className="hidden sm:inline text-[10px]">Sync Error</span>
              </span>
            ) : loading && !state ? (
              <span className="flex items-center gap-1">
                <Radio size={12} className="animate-spin text-[var(--text-muted)]" />
                <span className="hidden sm:inline text-[10px]">Syncing</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-surplus)] animate-network-breathe" />
                <span className="hidden sm:inline text-[10px] text-[var(--text-muted)] font-mono">Live</span>
              </span>
            )}
          </div>

          <div className="h-3 w-px bg-[var(--border-subtle)]" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer interactive-tap border border-[var(--border-subtle)] hover:border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            }}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <SunMedium size={14} className="text-[var(--accent-primary)]" />
            ) : (
              <Moon size={14} className="text-[var(--text-secondary)]" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden w-7 h-7 rounded-md flex items-center justify-center cursor-pointer interactive-tap border border-[var(--border-subtle)] text-[var(--text-primary)]"
          >
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pt-2 pb-4 border-t space-y-1 page-transition bg-[var(--bg-surface)] border-[var(--border-subtle)]"
        >
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded text-xs font-normal transition-colors ${
                  isActive
                    ? 'bg-black/5 dark:bg-white/5 font-medium text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
