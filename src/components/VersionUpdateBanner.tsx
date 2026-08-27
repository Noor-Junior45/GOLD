import React from 'react';
import { RefreshCw, Sparkles, X, ArrowUpCircle } from 'lucide-react';
import { VersionCheckState } from '../hooks/useVersionCheck';

interface VersionUpdateBannerProps {
  versionState: VersionCheckState;
}

export const VersionUpdateBanner: React.FC<VersionUpdateBannerProps> = ({ versionState }) => {
  const {
    isUpdateAvailable,
    serverVersion,
    clientVersion,
    countdown,
    isRefreshing,
    triggerSoftRefresh,
    dismissUpdate
  } = versionState;

  if (!isUpdateAvailable) return null;

  return (
    <aside
      aria-label="Application update available"
      className="fixed bottom-4 right-4 z-[9999] max-w-md w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-md text-white border border-amber-500/40 rounded-2xl shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-orange-500/20">
          <ArrowUpCircle className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> New Version Ready
            </span>
            {serverVersion && (
              <span className="text-xs text-slate-400 font-mono">
                v{serverVersion}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-slate-200 leading-snug">
            A new application update is live. Soft-refreshing to apply the latest improvements.
          </p>

          {countdown !== null && countdown > 0 && !isRefreshing && (
            <p className="text-xs text-amber-300 mt-1 font-medium">
              Auto-refreshing in <span className="font-bold underline">{countdown}s</span>...
            </p>
          )}

          {isRefreshing && (
            <p className="text-xs text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Synchronizing application build...
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={triggerSoftRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Update Now'}
            </button>

            <button
              type="button"
              onClick={dismissUpdate}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissUpdate}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
