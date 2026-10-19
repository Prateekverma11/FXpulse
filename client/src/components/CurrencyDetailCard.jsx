import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Bookmark, TrendingUp, BarChart2, Activity } from 'lucide-react';
import HistoricalChart from '../charts/HistoricalChart';
import { ChartSkeleton } from './LoadingSkeleton';

const DEFAULT_CURRENCY_META = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' }
};

export default function CurrencyDetailCard({
  currency,
  baseCurrency,
  quoteCurrency = 'INR',
  currencies = [],
  analytics,
  chartData = [],
  timeframe = '30D',
  onTimeframeChange,
  loading = false,
  isBookmarked = false,
  onToggleBookmark
}) {
  const getMeta = (code) => {
    const fromList = currencies.find(c => c.code === code);
    if (fromList) return fromList;
    return DEFAULT_CURRENCY_META[code] || { code, name: code, symbol: code };
  };

  const baseCode = (baseCurrency || currency?.code || 'AUD').toUpperCase();
  const quoteCode = (quoteCurrency || 'INR').toUpperCase();

  const baseMeta = getMeta(baseCode);
  const quoteMeta = getMeta(quoteCode);

  const rate = analytics?.currentRate || (chartData.length > 0 ? Number(chartData[chartData.length - 1].rate) : null);
  const change24h = analytics?.changes?.['24H'] ?? 0;
  const trend = analytics?.technical?.trend || 'Stable';

  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  // Format rate helper
  const formatRate = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '--';
    const num = Number(val);
    if (num >= 100) return num.toFixed(2);
    if (num >= 1) return num.toFixed(2);
    if (num >= 0.05) return num.toFixed(4);
    return num.toFixed(5);
  };

  // Calculate stats from chart data
  const validRates = chartData.map(d => Number(d.rate)).filter(r => !isNaN(r) && r > 0);
  const periodHigh = validRates.length > 0 ? Math.max(...validRates) : rate;
  const periodLow = validRates.length > 0 ? Math.min(...validRates) : rate;
  const periodAvg = validRates.length > 0 ? (validRates.reduce((a, b) => a + b, 0) / validRates.length) : rate;
  
  let periodChange = 0;
  if (validRates.length >= 2) {
    const startRate = validRates[0];
    const endRate = validRates[validRates.length - 1];
    periodChange = Number((((endRate - startRate) / startRate) * 100).toFixed(2));
  }

  let trendBadgeClass = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/90 dark:border-zinc-700';
  if (trend === 'Rising' || trend === 'Strengthening') {
    trendBadgeClass = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60';
  } else if (trend === 'Falling' || trend === 'Weakening') {
    trendBadgeClass = 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60';
  }

  return (
    <div className="card-clean p-5 sm:p-6 space-y-6 bg-white dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-clean-xs">
            {baseMeta.symbol || baseCode}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {baseCode} <span className="text-zinc-400 font-normal">/</span> {quoteCode}
              </span>
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700">
                {baseCode}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
              {baseMeta.name} vs {quoteMeta.name} spot exchange
            </p>
          </div>
        </div>

        {/* Bookmark Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleBookmark?.(baseCode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-clean-xs hover:bg-amber-100 dark:hover:bg-amber-900/50'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-750'
            }`}
            title={isBookmarked ? 'Remove from watchlist' : 'Bookmark this currency'}
          >
            <Bookmark
              className={`w-3.5 h-3.5 transition-transform ${
                isBookmarked ? 'fill-amber-500 text-amber-500 scale-105' : 'text-zinc-400'
              }`}
            />
            <span>{isBookmarked ? 'Watchlisted' : 'Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Main Rate and Change Display */}
      <div className="flex flex-wrap items-baseline gap-4">
        <div>
          <span className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight tabular-nums">
            {quoteMeta.symbol}{formatRate(rate)}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2 font-normal">
            per 1 {baseCode}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-sm sm:text-base font-semibold tabular-nums px-2 py-0.5 rounded-lg border ${
            isPositive 
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60' 
              : isNegative 
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700'
          }`}>
            {isPositive ? `+${change24h}%` : `${change24h}%`}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">24h change</span>
        </div>
      </div>

      {/* Historical Graph */}
      <div className="pt-2">
        {loading && chartData.length === 0 ? (
          <ChartSkeleton />
        ) : (
          <HistoricalChart
            data={chartData}
            pair={`${baseCode} → ${quoteCode}`}
            quoteSymbol={quoteMeta.symbol}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            isPositive={isPositive}
          />
        )}
      </div>

      {/* Key Period Metrics 4-Box Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block font-normal mb-0.5">
            {timeframe} High
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {quoteMeta.symbol}{formatRate(periodHigh)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block font-normal mb-0.5">
            {timeframe} Low
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {quoteMeta.symbol}{formatRate(periodLow)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block font-normal mb-0.5">
            {timeframe} Average
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {quoteMeta.symbol}{formatRate(periodAvg)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block font-normal mb-0.5">
            {timeframe} Movement
          </span>
          <span className={`text-sm font-bold tabular-nums ${
            periodChange > 0 ? 'text-rose-600 dark:text-rose-400' : periodChange < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
          }`}>
            {periodChange > 0 ? `+${periodChange}%` : `${periodChange}%`}
          </span>
        </div>
      </div>
    </div>
  );
}
