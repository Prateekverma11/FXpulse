import React from 'react';
import { Activity, Briefcase, Sparkles } from 'lucide-react';

export default function NavigationSwitcher({
  activeMode = 'markets',
  onOpenDashboard,
  onOpenAI,
  onOpenTravelWallet
}) {
  const handleMarketsClick = () => {
    if (activeMode !== 'markets' && onOpenDashboard) {
      onOpenDashboard();
    }
  };

  const handleWalletClick = () => {
    if (activeMode !== 'wallet' && onOpenTravelWallet) {
      onOpenTravelWallet();
    }
  };

  const handleAiClick = () => {
    if (activeMode !== 'ai' && onOpenAI) {
      onOpenAI();
    }
  };

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-full border border-zinc-200/90 dark:border-zinc-800 shadow-2xs transition-colors">
        {/* Markets Mode */}
        <button
          type="button"
          onClick={handleMarketsClick}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors ${
            activeMode === 'markets'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-xs cursor-default'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium cursor-pointer'
          }`}
        >
          <Activity className="w-4 h-4 text-zinc-950 dark:text-zinc-100 shrink-0" />
          <span>Markets</span>
        </button>

        {/* Travel Wallet Mode */}
        {onOpenTravelWallet && (
          <button
            type="button"
            onClick={handleWalletClick}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors ${
              activeMode === 'wallet'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-xs cursor-default'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium cursor-pointer'
            }`}
          >
            <Briefcase className="w-4 h-4 text-zinc-950 dark:text-zinc-100 shrink-0" />
            <span>Travel Wallet</span>
          </button>
        )}

        {/* Agentic AI Mode */}
        {onOpenAI && (
          <button
            type="button"
            onClick={handleAiClick}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors ${
              activeMode === 'ai'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-xs cursor-default'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium cursor-pointer'
            }`}
          >
            <Sparkles className="w-4 h-4 text-zinc-950 dark:text-zinc-100 shrink-0" />
            <span>Agentic AI</span>
          </button>
        )}
      </div>
    </div>
  );
}
