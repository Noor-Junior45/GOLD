import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    // Unregister service workers if broken cache was cause
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-amber-400/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-400/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Something went wrong</h2>
              <p className="text-sm text-slate-300">
                The application encountered an unexpected state during load or route transition.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 rounded-xl p-3 text-left border border-slate-800 overflow-x-auto max-h-32 text-xs font-mono text-red-400">
                {this.state.error.message || 'Unknown render exception'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-400/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>

              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}



