import React from 'react';
import { RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[var(--bg-page)] text-[var(--text-primary)]">
          <div className="max-w-md w-full p-8 rounded-2xl panel-surface border border-[var(--border-subtle)] text-center space-y-4">
            <span className="text-eyebrow block">System Fault Guard</span>
            <h2 className="text-title-md font-semibold text-[var(--status-deficit)]">
              Interface Render Exception
            </h2>
            <p className="text-body-sm text-[var(--text-secondary)]">
              An unexpected runtime error occurred while rendering the microgrid interface.
            </p>
            {this.state.error?.message && (
              <pre className="p-3 rounded-lg bg-black/5 dark:bg-white/5 text-[11px] font-mono text-[var(--text-muted)] text-left overflow-x-auto border border-[var(--border-subtle)]">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium cursor-pointer interactive-tap shadow-sm"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
            >
              <RotateCcw size={13} />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
