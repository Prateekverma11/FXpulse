import React from 'react';

export default function Footer({
  lastUpdated,
  source = 'European Central Bank / Live FX Providers'
}) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Recent snapshot';

  return (
    <footer className="pt-8 pb-12 border-t border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-400 dark:text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-normal transition-colors">
      <div className="flex items-center gap-4 flex-wrap">
        <span>
          Last updated: <span className="text-zinc-600 dark:text-zinc-300 font-medium">{formattedTime}</span>
        </span>
        <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">&bull;</span>
        <span>
          Source: <span className="text-zinc-600 dark:text-zinc-300 font-medium">{source}</span>
        </span>
      </div>

      <div>
        <span>FXPulse — Currency Intelligence Platform</span>
      </div>
    </footer>
  );
}
