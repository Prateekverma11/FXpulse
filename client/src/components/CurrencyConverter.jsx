import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, ChevronDown, ArrowLeftRight, Check, Search, ArrowUpRight, ArrowDownRight, Minus, Briefcase, Plane, ArrowRight, Sparkles } from 'lucide-react';

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' }
];

export default function CurrencyConverter({
  baseCurrency = 'USD',
  quoteCurrency = 'INR',
  currencies = [],
  currentRate = 96.30,
  change24h = 0,
  onSwapPair,
  onChangeBase,
  onChangeQuote,
  analytics,
  onOpenTravelWallet,
  onOpenAI,
  className = ''
}) {
  const [amount, setAmount] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [activeInput, setActiveInput] = useState('base'); // 'base' or 'quote'
  const [showTooltip, setShowTooltip] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null); // 'base' or 'quote' or null
  const [searchQuery, setSearchQuery] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  const dropdownRef = useRef(null);
  const tooltipRef = useRef(null);

  // Merge currencies list
  const currencyList = currencies.length > 0 ? currencies : POPULAR_CURRENCIES;

  // Status calculation for top right corner
  const rawTrend = analytics?.technical?.trend;
  let trend = 'Stable';
  if (rawTrend) {
    trend = rawTrend === 'Rising' ? 'Strengthening' : rawTrend === 'Falling' ? 'Weakening' : rawTrend;
  } else if (Number(change24h) > 0.05) {
    trend = 'Strengthening';
  } else if (Number(change24h) < -0.05) {
    trend = 'Weakening';
  }

  let trendBadgeClass = 'bg-zinc-100 text-zinc-700 border-zinc-200/90';
  if (trend === 'Strengthening' || trend === 'Rising' || Number(change24h) > 0.05) {
    trendBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (trend === 'Weakening' || trend === 'Falling' || Number(change24h) < -0.05) {
    trendBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200/80';
  }

  // Close dropdown or tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
        setSearchQuery('');
      }
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format number with commas for display
  const formatWithCommas = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const parts = val.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Strip commas and non-numeric chars
  const cleanNumberInput = (val) => {
    return val.replace(/[^0-9.]/g, '');
  };

  // Calculate live conversion
  useEffect(() => {
    const rate = Number(currentRate);
    if (!rate || isNaN(rate) || rate <= 0) return;

    if (activeInput === 'base') {
      const num = parseFloat(cleanNumberInput(amount));
      if (!isNaN(num)) {
        const result = num * rate;
        const formatted = result >= 1 ? result.toFixed(2) : result.toFixed(4);
        setConvertedAmount(formatted);
      } else {
        setConvertedAmount('');
      }
    } else {
      const num = parseFloat(cleanNumberInput(convertedAmount));
      if (!isNaN(num)) {
        const result = num / rate;
        const formatted = result >= 1 ? result.toFixed(2) : result.toFixed(4);
        setAmount(formatted);
      } else {
        setAmount('');
      }
    }
  }, [amount, convertedAmount, currentRate, activeInput, baseCurrency, quoteCurrency]);

  const handleAmountChange = (e) => {
    const val = cleanNumberInput(e.target.value);
    setActiveInput('base');
    setAmount(val);
  };

  const handleConvertedChange = (e) => {
    const val = cleanNumberInput(e.target.value);
    setActiveInput('quote');
    setConvertedAmount(val);
  };

  const handleSwap = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 300);

    if (onSwapPair) {
      onSwapPair();
    } else {
      const prevBase = baseCurrency;
      const prevQuote = quoteCurrency;
      onChangeBase?.(prevQuote);
      onChangeQuote?.(prevBase);
    }
  };

  const filteredCurrencies = currencyList.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.code.toLowerCase().includes(q) || (c.name && c.name.toLowerCase().includes(q));
  });

  const handleSelectCurrency = (code) => {
    if (dropdownOpen === 'base') {
      if (code === quoteCurrency) {
        handleSwap();
      } else {
        onChangeBase?.(code);
      }
    } else if (dropdownOpen === 'quote') {
      if (code === baseCurrency) {
        handleSwap();
      } else {
        onChangeQuote?.(code);
      }
    }
    setDropdownOpen(null);
    setSearchQuery('');
  };

  const formattedRate = currentRate
    ? Number(currentRate) >= 100
      ? Number(currentRate).toFixed(2)
      : Number(currentRate) >= 1
      ? Number(currentRate).toFixed(2)
      : Number(currentRate).toFixed(4)
    : '1.00';

  return (
    <div className={`card-clean relative p-6 sm:p-8 bg-white border border-zinc-200/90 shadow-sm rounded-2xl ${className}`}>
      
      {/* Top Right Corner: Stable / Strengthening / Weakening Badge */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs transition-all ${trendBadgeClass}`}>
          {trend === 'Strengthening' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
          {trend === 'Weakening' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
          {trend === 'Stable' && <Minus className="w-3.5 h-3.5 text-zinc-500" />}
          <span>{trend}</span>
          {change24h !== undefined && change24h !== null && change24h !== 0 && (
            <span className="font-normal opacity-80 text-[11px]">
              {Number(change24h) > 0 ? `+${change24h}%` : `${change24h}%`}
            </span>
          )}
        </span>
      </div>

      {/* Top Header: Mid-market exchange rate */}
      <div className="text-center mb-6 sm:mb-8 space-y-1.5 pt-1">
        <div className="inline-flex items-center justify-center gap-1.5 relative">
          <span className="text-sm sm:text-base font-semibold text-[#0a4d34] tracking-tight">
            Mid-market exchange rate
          </span>
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-[#0a4d34]/70 hover:text-[#0a4d34] transition-colors focus:outline-none cursor-pointer"
            aria-label="Mid-market rate explanation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Info Tooltip Popover */}
          {showTooltip && (
            <div
              ref={tooltipRef}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 sm:w-80 p-3.5 bg-zinc-900 text-white text-xs rounded-xl shadow-xl border border-zinc-800 text-left animate-fadeIn pointer-events-none"
            >
              <div className="font-semibold mb-1 text-emerald-400">What is the mid-market rate?</div>
              <div className="text-zinc-300 leading-relaxed font-normal">
                This is the real exchange rate — the midpoint between global buy and sell rates. Unlike traditional retail banks that add hidden margins, FXPulse tracks live mid-market data.
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Rate Display: 1 USD = 96.30 INR */}
        <div>
          <span className="text-base sm:text-lg font-bold text-[#0a4d34] tracking-tight">
            1 {baseCurrency} = {formattedRate} {quoteCurrency}
          </span>
        </div>
      </div>

      {/* Main Horizontal Converter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4 justify-between">
        
        {/* Left Input Box: Amount */}
        <div className="flex-1">
          <label className="block text-sm sm:text-base font-bold text-zinc-900 mb-2">
            Amount
          </label>
          <div className="relative flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-zinc-300 rounded-2xl hover:border-zinc-400 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all shadow-xs h-[64px] sm:h-[72px]">
            <input
              type="text"
              inputMode="decimal"
              value={formatWithCommas(amount)}
              onChange={handleAmountChange}
              placeholder="1"
              className="w-full pr-2 text-2xl sm:text-3xl font-bold text-zinc-950 bg-transparent border-none outline-none tabular-nums focus:ring-0 placeholder-zinc-300"
            />

            {/* Currency Selector Pill (No Flags) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(dropdownOpen === 'base' ? null : 'base');
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-zinc-300 hover:border-zinc-800 hover:bg-zinc-50 active:scale-98 transition-all shadow-xs cursor-pointer group"
              >
                <span className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  {baseCurrency}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-700 group-hover:text-zinc-900 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Swap Button (Simple Minimal Button, No Green) */}
        <div className="shrink-0 flex items-center justify-center pb-1 sm:pb-3 md:pb-4 self-center md:self-end">
          <button
            type="button"
            onClick={handleSwap}
            title={`Swap ${baseCurrency} and ${quoteCurrency}`}
            aria-label="Swap currencies"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-zinc-100 active:bg-zinc-200 border border-zinc-300 hover:border-zinc-400 text-zinc-700 hover:text-zinc-950 flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer hover:scale-105 active:scale-95 ${
              isRotating ? 'rotate-180' : ''
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-700 stroke-[2.2]" />
          </button>
        </div>

        {/* Right Input Box: Converted to */}
        <div className="flex-1">
          <label className="block text-sm sm:text-base font-bold text-zinc-900 mb-2">
            Converted to
          </label>
          <div className="relative flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-zinc-300 rounded-2xl hover:border-zinc-400 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all shadow-xs h-[64px] sm:h-[72px]">
            <input
              type="text"
              inputMode="decimal"
              value={formatWithCommas(convertedAmount)}
              onChange={handleConvertedChange}
              placeholder="0.00"
              className="w-full pr-2 text-2xl sm:text-3xl font-bold text-zinc-950 bg-transparent border-none outline-none tabular-nums focus:ring-0 placeholder-zinc-300"
            />

            {/* Currency Selector Pill (No Flags) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(dropdownOpen === 'quote' ? null : 'quote');
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-zinc-300 hover:border-zinc-800 hover:bg-zinc-50 active:scale-98 transition-all shadow-xs cursor-pointer group"
              >
                <span className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  {quoteCurrency}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-700 group-hover:text-zinc-900 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Travel Expense Tracker Line */}
      <div className="mt-5 sm:mt-6 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-zinc-600">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <Plane className="w-3.5 h-3.5" />
          </span>
          <span className="font-medium text-zinc-700">
            Want to travel? Track your expenses
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenTravelWallet}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs hover:shadow transition-all cursor-pointer group active:scale-95 shrink-0"
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Travel Wallet</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Agentic AI Intelligence Line */}
      {onOpenAI && (
        <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-zinc-600">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="font-medium text-zinc-700">
              Why is this currency moving? Research with AI
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAI}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs hover:shadow transition-all cursor-pointer group active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Agentic AI</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* Currency Selector Dropdown / Search Modal (Clean, No Flags) */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div
            ref={dropdownRef}
            className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-zinc-900">
                  Select {dropdownOpen === 'base' ? 'Amount (From)' : 'Converted (To)'} Currency
                </h4>
                <p className="text-xs text-zinc-500">
                  Choose your currency from live global rates
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDropdownOpen(null)}
                className="text-zinc-400 hover:text-zinc-800 text-sm font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-zinc-100 bg-zinc-50/50">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code or currency name (e.g. USD, Euro)..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 placeholder-zinc-400"
                />
              </div>
            </div>

            {/* Currencies List (No Flags) */}
            <div className="overflow-y-auto divide-y divide-zinc-50 p-2 flex-1">
              {filteredCurrencies.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No matching currencies found
                </div>
              ) : (
                filteredCurrencies.map((c) => {
                  const isSelected = dropdownOpen === 'base' ? c.code === baseCurrency : c.code === quoteCurrency;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCurrency(c.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left cursor-pointer ${
                        isSelected ? 'bg-zinc-100 font-semibold text-zinc-950' : 'hover:bg-zinc-50 text-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                          {c.code}
                          {c.symbol && <span className="text-xs font-normal text-zinc-400">({c.symbol})</span>}
                        </div>
                        <div className="text-xs text-zinc-500 font-normal">
                          {c.name}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
