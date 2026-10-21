import React, { useState, useEffect } from 'react';
import CurrencyConverter from '../components/CurrencyConverter';
import CurrencyDetailCard from '../components/CurrencyDetailCard';
import QuickCurrencies from '../components/QuickCurrencies';
import NavigationSwitcher from '../components/NavigationSwitcher';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import MarketNewsPanel from '../components/MarketNewsPanel';
import { Newspaper } from 'lucide-react';
import { 
  fetchCurrencies, 
  fetchPairAnalytics, 
  fetchPairHistory, 
  fetchPairRate 
} from '../services/api';

export default function Dashboard({
  selectedCurrency = 'AUD',
  onSelectCurrency,
  currencies = [],
  systemStats,
  bookmarks = [],
  onToggleBookmark,
  isBookmarked,
  onOpenTravelWallet,
  onOpenAI
}) {
  const [baseCurrency, setBaseCurrency] = useState(selectedCurrency || 'AUD');
  const [quoteCurrency, setQuoteCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30D');
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [ratesMap, setRatesMap] = useState({});
  const [isNewsOpen, setIsNewsOpen] = useState(() => {
    const saved = localStorage.getItem('fxpulse_news_open');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleNews = (open) => {
    setIsNewsOpen(open);
    localStorage.setItem('fxpulse_news_open', String(open));
  };

  // Sync when selectedCurrency prop changes from Header or Search
  useEffect(() => {
    if (selectedCurrency && selectedCurrency !== baseCurrency) {
      if (selectedCurrency === quoteCurrency) {
        setQuoteCurrency(baseCurrency);
        setBaseCurrency(selectedCurrency);
      } else {
        setBaseCurrency(selectedCurrency);
      }
    }
  }, [selectedCurrency]);

  const activeBaseObj = currencies.find(c => c.code === baseCurrency) || {
    code: baseCurrency,
    name: baseCurrency === 'USD' ? 'US Dollar' : baseCurrency,
    symbol: baseCurrency === 'USD' ? '$' : baseCurrency
  };

  // Swap Base and Quote
  const handleSwapPair = () => {
    const nextBase = quoteCurrency;
    const nextQuote = baseCurrency;
    setBaseCurrency(nextBase);
    setQuoteCurrency(nextQuote);
    onSelectCurrency?.(nextBase);
  };

  // Set explicit pair (e.g. AUD -> INR or INR -> AUD)
  const handleSetPair = (newBase, newQuote) => {
    setBaseCurrency(newBase);
    setQuoteCurrency(newQuote);
    onSelectCurrency?.(newBase);
  };

  const handleChangeBase = (newBase) => {
    if (newBase === quoteCurrency) {
      handleSwapPair();
    } else {
      setBaseCurrency(newBase);
      onSelectCurrency?.(newBase);
    }
  };

  const handleChangeQuote = (newQuote) => {
    if (newQuote === baseCurrency) {
      handleSwapPair();
    } else {
      setQuoteCurrency(newQuote);
    }
  };

  // 1. Fetch Selected Pair Analytics and Historical Chart Data
  useEffect(() => {
    let isMounted = true;

    async function loadPairData() {
      try {
        setLoading(true);

        const [analyticsRes, historyRes] = await Promise.all([
          fetchPairAnalytics(baseCurrency, quoteCurrency).catch(() => ({ data: null })),
          fetchPairHistory(baseCurrency, quoteCurrency, timeframe).catch(() => ({ history: [] }))
        ]);

        if (isMounted) {
          setAnalytics(analyticsRes.data);
          setChartData(historyRes.history || []);
        }
      } catch (err) {
        console.warn('Pair data load error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPairData();

    return () => {
      isMounted = false;
    };
  }, [baseCurrency, quoteCurrency, timeframe]);

  // 2. Fetch quick rates for top popular currencies vs INR
  useEffect(() => {
    let isMounted = true;
    const popular = ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'AUD', 'CAD', 'SGD', 'CHF', 'SAR', 'QAR', 'THB'];

    async function loadPopularRates() {
      try {
        const promises = popular.map(async (code) => {
          try {
            const res = await fetchPairRate(code, 'INR');
            return { code, rate: res.rate };
          } catch (e) {
            return { code, rate: null };
          }
        });

        const results = await Promise.all(promises);
        if (isMounted) {
          const map = {};
          results.forEach(r => {
            if (r.rate) map[r.code] = r;
          });
          setRatesMap(map);
        }
      } catch (e) {
        console.warn('Popular rates error:', e);
      }
    }

    loadPopularRates();

    return () => {
      isMounted = false;
    };
  }, [systemStats?.lastSync]);

  const currentRate = analytics?.currentRate || (chartData.length > 0 ? chartData[chartData.length - 1].rate : null);
  const change24h = analytics?.changes?.['24H'] ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Top Header / Navigation & Theme Controls in Right Corner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 -mb-1 sm:-mb-2">
        <div className="hidden sm:flex items-center gap-2 flex-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
            Live FX Markets
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

          {/* Quick reopen button if news was closed */}
          {!isNewsOpen && (
            <button
              type="button"
              onClick={() => handleToggleNews(true)}
              className="ml-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer shadow-2xs"
              title="Show Live Market News"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Show News</span>
            </button>
          )}
        </div>

        <div className="flex-shrink-0">
          <NavigationSwitcher
            activeMode="markets"
            onOpenDashboard={() => {}}
            onOpenAI={onOpenAI}
            onOpenTravelWallet={onOpenTravelWallet}
          />
        </div>

        <div className="flex items-center justify-end flex-1 w-full sm:w-auto gap-2">
          {/* Market News Toggle Button */}
          <button
            type="button"
            onClick={() => handleToggleNews(!isNewsOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              isNewsOpen
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700'
                : 'bg-white dark:bg-[#121216] text-zinc-600 dark:text-zinc-400 border-zinc-200/90 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300'
            }`}
            title={isNewsOpen ? 'Close News Panel (Center Dashboard)' : 'Open Market News Panel'}
          >
            <Newspaper className={`w-3.5 h-3.5 ${isNewsOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
            <span className="hidden md:inline">{isNewsOpen ? 'Hide News' : 'Market News'}</span>
            {!isNewsOpen && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Theme Option in Dashboard Right Corner */}
          <ThemeToggle variant="segmented" showLabel={true} />
        </div>
      </div>

      {/* Dynamic Layout: 2-column split with News on the Right (Default), or Centered when News is closed */}
      <div className={isNewsOpen ? "grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start transition-all duration-300" : "max-w-5xl mx-auto w-full space-y-6 sm:space-y-8 transition-all duration-300"}>
        
        {/* Left Side (or Middle when centered): Currency Converter, Detail Card & Quick Currencies */}
        <div className={isNewsOpen ? "xl:col-span-8 space-y-6 sm:space-y-8" : "space-y-6 sm:space-y-8"}>
          {/* 1. Horizontal Mid-Market Currency Converter */}
          <CurrencyConverter
            baseCurrency={baseCurrency}
            quoteCurrency={quoteCurrency}
            onSwapPair={handleSwapPair}
            onChangeBase={handleChangeBase}
            onChangeQuote={handleChangeQuote}
            currencies={currencies}
            currentRate={currentRate}
            change24h={change24h}
            analytics={analytics}
            onOpenTravelWallet={onOpenTravelWallet}
            onOpenAI={onOpenAI}
          />

          {/* 2. Selected Currency Focus & Historical Graph with Bookmark Button */}
          <CurrencyDetailCard
            baseCurrency={baseCurrency}
            quoteCurrency={quoteCurrency}
            currency={activeBaseObj}
            currencies={currencies}
            analytics={analytics}
            chartData={chartData}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            loading={loading}
            isBookmarked={isBookmarked ? isBookmarked(baseCurrency) : bookmarks.includes(baseCurrency)}
            onToggleBookmark={onToggleBookmark}
          />

          {/* 3. Quick Selector for Top Global Currencies */}
          <QuickCurrencies
            currencies={currencies}
            selectedCurrency={baseCurrency}
            onSelectCurrency={(code) => {
              if (code === quoteCurrency) {
                handleSwapPair();
              } else {
                setBaseCurrency(code);
                onSelectCurrency?.(code);
              }
            }}
            ratesMap={ratesMap}
            bookmarks={bookmarks}
            onToggleBookmark={onToggleBookmark}
          />
        </div>

        {/* Right Side: Market & Currency News Panel (Default Open, Closes to center page) */}
        {isNewsOpen && (
          <div className="xl:col-span-4 sticky top-20 animate-fadeIn">
            <MarketNewsPanel
              onClose={() => handleToggleNews(false)}
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
            />
          </div>
        )}

      </div>

      {/* 4. Footer Metadata */}
      <Footer
        lastUpdated={analytics?.timestamp || systemStats?.lastSync}
        source={analytics?.source || systemStats?.provider || 'European Central Bank / Live FX'}
      />
    </div>
  );
}
