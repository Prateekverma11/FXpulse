import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({
  variant = 'pill', // 'pill' | 'segmented' | 'icon' | 'compact'
  className = '',
  showLabel = true
}) {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div 
        className={`inline-flex items-center p-1 rounded-full bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/90 dark:border-zinc-700/80 shadow-2xs transition-colors ${className}`}
        role="group"
        aria-label="Theme mode switcher"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-200 select-none cursor-pointer ${
            !isDark
              ? 'bg-white text-zinc-950 font-semibold shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
          }`}
          aria-pressed={!isDark}
          title="Switch to Light Theme"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-zinc-400'}`} />
          {showLabel && <span>Light</span>}
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-200 select-none cursor-pointer ${
            isDark
              ? 'bg-zinc-900 text-white font-semibold shadow-xs dark:bg-zinc-700/90'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
          }`}
          aria-pressed={isDark}
          title="Switch to Dark Theme"
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400' : 'text-zinc-400'}`} />
          {showLabel && <span>Dark</span>}
        </button>
      </div>
    );
  }

  if (variant === 'icon' || variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-xl text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200/90 dark:border-zinc-700/80 transition-colors duration-200 shadow-clean-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 ${className}`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      >
        <span className="sr-only">{isDark ? 'Light mode' : 'Dark mode'}</span>
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-zinc-700" />
        )}
      </button>
    );
  }

  // Default 'pill' toggle button with icon + label + indicator
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 select-none cursor-pointer border shadow-clean-xs ${
        isDark
          ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700/80 hover:border-zinc-600'
          : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200/90 hover:border-zinc-300'
      } ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Click to switch to Light Theme' : 'Click to switch to Dark Theme'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-zinc-600" />
        )}
      </div>

      <span className="font-semibold tracking-tight">
        {isDark ? 'Dark' : 'Light'}
      </span>

      {/* Tiny subtle indicator dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          isDark ? 'bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
        }`}
      />
    </button>
  );
}
