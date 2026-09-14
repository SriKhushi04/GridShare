// Utility helpers for GridShare UI with Graphite/Stone/Champagne palette
export function getStatusColor(status) {
  switch (status) {
    case 'SURPLUS': return 'text-[var(--status-surplus)]';
    case 'DEFICIT': return 'text-[var(--status-deficit)]';
    case 'BALANCED': return 'text-[var(--status-balanced)]';
    default: return 'text-[var(--text-muted)]';
  }
}

export function getStatusBg(status) {
  switch (status) {
    case 'SURPLUS':
      return 'bg-surplus-subtle border-surplus text-[var(--status-surplus)]';
    case 'DEFICIT':
      return 'bg-deficit-subtle border-deficit text-[var(--status-deficit)]';
    case 'BALANCED':
      return 'bg-black/5 dark:bg-white/5 border-[var(--border-subtle)] text-[var(--text-secondary)]';
    default:
      return 'bg-black/5 dark:bg-white/5 border-[var(--border-subtle)] text-[var(--text-muted)]';
  }
}

export function getActivityTypeColor(type) {
  switch (type) {
    case 'success': return 'text-[var(--status-surplus)]';
    case 'warning': return 'text-[var(--status-warning)]';
    case 'alert': return 'text-[var(--status-deficit)]';
    case 'action': return 'text-[var(--accent-primary)]';
    case 'info': return 'text-[var(--text-secondary)]';
    default: return 'text-[var(--text-muted)]';
  }
}

export function getTransactionTypeColor(type) {
  switch (type) {
    case 'P2P':
      return 'text-[var(--accent-primary)] bg-[var(--accent-subtle)] border-[var(--accent-border)]';
    case 'CENTRAL_BATTERY':
    case 'BATTERY':
      return 'text-[var(--status-warning)] bg-amber-500/10 border-amber-500/20';
    case 'CHARGE':
      return 'text-[var(--status-surplus)] bg-surplus-subtle border-surplus';
    case 'MAIN_GRID':
    case 'GRID':
      return 'text-[var(--text-secondary)] bg-black/5 dark:bg-white/5 border-[var(--border-subtle)]';
    default:
      return 'text-[var(--text-muted)] bg-black/5 dark:bg-white/5 border-[var(--border-subtle)]';
  }
}

export function formatBalance(balance) {
  if (balance === undefined || balance === null || isNaN(balance)) return '0.0';
  if (balance > 0) return `+${balance.toFixed(1)}`;
  return balance.toFixed(1);
}

export function getTransactionStatusStyle(status) {
  switch (status) {
    case 'COMPLETED':
    case 'EXECUTED':
      return {
        color: 'text-[var(--status-surplus)]',
        border: 'border-surplus',
        bg: 'bg-surplus-subtle',
        icon: 'check',
      };
    case 'FAILED':
    case 'REJECTED':
      return {
        color: 'text-[var(--status-deficit)]',
        border: 'border-deficit',
        bg: 'bg-deficit-subtle',
        icon: 'alert',
      };
    case 'ACTIVE':
    case 'PENDING':
    case 'RESERVED':
      return {
        color: 'text-[var(--accent-primary)]',
        border: 'border-[var(--accent-border)]',
        bg: 'bg-[var(--accent-subtle)]',
        icon: 'clock',
      };
    default:
      return {
        color: 'text-[var(--text-muted)]',
        border: 'border-[var(--border-subtle)]',
        bg: 'bg-black/5 dark:bg-white/5',
        icon: 'check',
      };
  }
}
