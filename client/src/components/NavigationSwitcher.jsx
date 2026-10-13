import React from 'react';
import { Activity, Sparkles, Briefcase } from 'lucide-react';

export default function NavigationSwitcher({
  activeMode = 'markets',
  onOpenDashboard,
  onOpenAI,
  onOpenTravelWallet
}) {
  return (
    <div className="flex justify-center -mb-2 sm:-mb-3">
      <div className="inline-flex items-center gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80 shadow-2xs">
        {/* Markets Mode */}
        <button
          type="button"
          onClick={onOpenDashboard}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'markets'
              ? 'bg-white text-zinc-950 shadow-xs cursor-default'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-zinc-900" />
          <span>Markets</span>
        </button>

        {/* Agentic AI Mode */}
        <button
          type="button"
          onClick={onOpenAI}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'ai'
              ? 'bg-white text-zinc-950 shadow-xs cursor-default'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Agentic AI</span>
        </button>

        {/* Travel Wallet Mode */}
        {onOpenTravelWallet && (
          <button
            type="button"
            onClick={onOpenTravelWallet}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'wallet'
                ? 'bg-white text-zinc-950 shadow-xs cursor-default'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Travel Wallet</span>
          </button>
        )}
      </div>
    </div>
  );
}
