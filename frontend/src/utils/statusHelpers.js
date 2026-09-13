// Utility helpers for Grid Share UI

export function getStatusColor(status) {
  switch (status) {
    case 'SURPLUS': return 'text-emerald-400';
    case 'DEFICIT': return 'text-red-400';
    case 'BALANCED': return 'text-blue-400';
    default: return 'text-slate-400';
  }
}

export function getStatusBg(status) {
  switch (status) {
    case 'SURPLUS': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    case 'DEFICIT': return 'bg-red-500/10 border-red-500/30 text-red-400';
    case 'BALANCED': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
  }
}

export function getStatusGlow(status) {
  switch (status) {
    case 'SURPLUS': return '0 0 20px rgba(16, 185, 129, 0.2)';
    case 'DEFICIT': return '0 0 20px rgba(239, 68, 68, 0.2)';
    case 'BALANCED': return '0 0 20px rgba(96, 165, 250, 0.2)';
    default: return 'none';
  }
}

export function getStatusBorderColor(status) {
  switch (status) {
    case 'SURPLUS': return 'rgba(16, 185, 129, 0.4)';
    case 'DEFICIT': return 'rgba(239, 68, 68, 0.4)';
    case 'BALANCED': return 'rgba(96, 165, 250, 0.4)';
    default: return 'rgba(100, 116, 139, 0.4)';
  }
}

export function getActivityTypeColor(type) {
  switch (type) {
    case 'success': return 'text-emerald-400';
    case 'warning': return 'text-amber-400';
    case 'alert': return 'text-red-400';
    case 'action': return 'text-blue-400';
    case 'info': return 'text-slate-300';
    default: return 'text-slate-400';
  }
}

export function getTransactionTypeColor(type) {
  switch (type) {
    case 'P2P': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'BATTERY': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'CHARGE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    case 'GRID': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  }
}

export function formatBalance(balance) {
  if (balance > 0) return `+${balance.toFixed(1)}`;
  return balance.toFixed(1);
}

