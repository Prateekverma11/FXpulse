import React, { useState, useEffect } from 'react';
import CurrencyConverter from '../components/CurrencyConverter';
import CurrencyDetailCard from '../components/CurrencyDetailCard';
import QuickCurrencies from '../components/QuickCurrencies';
import Footer from '../components/Footer';
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
  isBookmarked
}) {
  const [baseCurrency, setBaseCurrency] = useState(selectedCurrency || 'AUD');
  const [quoteCurrency, setQuoteCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30D');
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [ratesMap, setRatesMap] = useState({});

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
    <div className="space-y-8">
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

      {/* 4. Footer Metadata */}
      <Footer
        lastUpdated={analytics?.timestamp || systemStats?.lastSync}
        source={analytics?.source || systemStats?.provider || 'European Central Bank / Live FX'}
      />
    </div>
  );
}
