import React from 'react';
import { Bell, AlertTriangle, X } from 'lucide-react';

export default function NotificationToast({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xl flex items-start gap-3 transform transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
            {n.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Bell className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{n.title || 'Market Update'}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{n.time}</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              {n.message}
            </p>
          </div>

          <button
            onClick={() => onDismiss(n.id)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
