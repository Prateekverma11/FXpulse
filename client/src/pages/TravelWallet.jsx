import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, ArrowLeft, ArrowRight, ArrowLeftRight, RefreshCw, Briefcase, ChevronDown } from 'lucide-react';
import NavigationSwitcher from '../components/NavigationSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { fetchPairRate } from '../services/api';

const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' }
];

const DEFAULT_SECTIONS = [
  {
    id: 'sec_1',
    name: 'Tokyo Holiday',
    foreignCurrency: 'JPY',
    symbol: '¥',
    targetCurrency: 'USD',
    targetSymbol: '$',
    items: [
      { id: 'item_1', title: 'Shinkansen bullet train', amount: 14000 },
      { id: 'item_2', title: 'Ramen & matcha dinner', amount: 2200 }
    ]
  },
  {
    id: 'sec_2',
    name: 'Trip to USA',
    foreignCurrency: 'USD',
    symbol: '$',
    targetCurrency: 'EUR',
    targetSymbol: '€',
    items: [
      { id: 'item_3', title: 'Auto rent', amount: 45 },
      { id: 'item_4', title: 'Coffee & breakfast', amount: 12.5 }
    ]
  },
  {
    id: 'sec_3',
    name: 'Europe Tour',
    foreignCurrency: 'EUR',
    symbol: '€',
    targetCurrency: 'USD',
    targetSymbol: '$',
    items: [
      { id: 'item_5', title: 'Metro pass', amount: 15 },
      { id: 'item_6', title: 'Museum ticket', amount: 22 }
    ]
  }
];

export default function TravelWallet({ onOpenDashboard, onOpenAI }) {
  const [sections, setSections] = useState(() => {
    try {
      const saved = localStorage.getItem('fxpulse_minimal_wallet');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(s => {
            const spendCode = s.foreignCurrency || 'USD';
            const targetCode = s.targetCurrency || 'USD';
            const spendObj = AVAILABLE_CURRENCIES.find(c => c.code === spendCode) || { symbol: s.symbol || spendCode };
            const targetObj = AVAILABLE_CURRENCIES.find(c => c.code === targetCode) || { symbol: targetCode };
            return {
              ...s,
              foreignCurrency: spendCode,
              symbol: s.symbol || spendObj.symbol,
              targetCurrency: targetCode,
              targetSymbol: s.targetSymbol || targetObj.symbol
            };
          });
        }
      }
      return DEFAULT_SECTIONS;
    } catch {
      return DEFAULT_SECTIONS;
    }
  });

  const [rates, setRates] = useState({});
  const [loadingRates, setLoadingRates] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCurrency, setNewSectionCurrency] = useState('JPY');
  const [newSectionTargetCurrency, setNewSectionTargetCurrency] = useState('USD');

  // Input state per section: { [sectionId]: { title: '', amount: '' } }
  const [inputs, setInputs] = useState({});

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fxpulse_minimal_wallet', JSON.stringify(sections));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [sections]);

  // Fetch live exchange rates for every unique (spendCurrency -> targetCurrency) pair
  useEffect(() => {
    const pairs = sections.map(s => ({
      from: s.foreignCurrency || 'USD',
      to: s.targetCurrency || 'USD'
    }));

    // Deduplicate pair keys
    const uniquePairsMap = new Map();
    pairs.forEach(p => {
      const key = `${p.from}_${p.to}`;
      if (!uniquePairsMap.has(key)) {
        uniquePairsMap.set(key, p);
      }
    });

    const uniquePairs = Array.from(uniquePairsMap.values());

    async function loadRates() {
      setLoadingRates(true);
      const newRates = { ...rates };

      await Promise.all(
        uniquePairs.map(async ({ from, to }) => {
          const key = `${from}_${to}`;
          if (from === to) {
            newRates[key] = 1.0;
            return;
          }
          try {
            const res = await fetchPairRate(from, to);
            if (res && res.rate) {
              newRates[key] = Number(res.rate);
            }
          } catch (e) {
            console.warn(`Rate fetch failed for ${key}:`, e.message);
          }
        })
      );

      setRates(newRates);
      setLoadingRates(false);
    }

    if (uniquePairs.length > 0) {
      loadRates();
    }
  }, [sections]);

  // Handle adding an item to a section
  const handleAddItem = (sectionId) => {
    const input = inputs[sectionId] || { title: '', amount: '' };
    const title = (input.title || '').trim();
    const amount = parseFloat(input.amount);

    if (!title || isNaN(amount) || amount <= 0) return;

    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: [
            ...sec.items,
            {
              id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              title,
              amount
            }
          ]
        };
      }
      return sec;
    }));

    // Reset input for this section
    setInputs(prev => ({
      ...prev,
      [sectionId]: { title: '', amount: '' }
    }));
  };

  // Handle deleting an item
  const handleDeleteItem = (sectionId, itemId) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: sec.items.filter(it => it.id !== itemId)
        };
      }
      return sec;
    }));
  };

  // Handle creating a new section (PREPENDS ON TOP)
  const handleCreateSection = (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const spendObj = AVAILABLE_CURRENCIES.find(c => c.code === newSectionCurrency) || AVAILABLE_CURRENCIES[0];
    const targetObj = AVAILABLE_CURRENCIES.find(c => c.code === newSectionTargetCurrency) || AVAILABLE_CURRENCIES[0];

    const newSec = {
      id: `sec_${Date.now()}`,
      name: newSectionName.trim(),
      foreignCurrency: spendObj.code,
      symbol: spendObj.symbol,
      targetCurrency: targetObj.code,
      targetSymbol: targetObj.symbol,
      items: []
    };

    // Prepend to top so it ALWAYS appears at the VERY TOP!
    setSections(prev => [newSec, ...prev]);
    setNewSectionName('');
    setShowAddSection(false);
  };

  // Handle changing spend/destination currency for a section
  const handleUpdateSectionCurrency = (sectionId, newSpendCode) => {
    const spendObj = AVAILABLE_CURRENCIES.find(c => c.code === newSpendCode);
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          foreignCurrency: newSpendCode,
          symbol: spendObj?.symbol || newSpendCode
        };
      }
      return sec;
    }));
  };

  // Handle changing target/home currency for a section
  const handleUpdateSectionTargetCurrency = (sectionId, newTargetCode) => {
    const targetObj = AVAILABLE_CURRENCIES.find(c => c.code === newTargetCode);
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          targetCurrency: newTargetCode,
          targetSymbol: targetObj?.symbol || newTargetCode
        };
      }
      return sec;
    }));
  };

  // Handle swapping spend and target currencies for a section
  const handleSwapSectionCurrencies = (sectionId) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        const nextSpend = sec.targetCurrency || 'USD';
        const nextTarget = sec.foreignCurrency || 'JPY';
        const nextSpendObj = AVAILABLE_CURRENCIES.find(c => c.code === nextSpend) || { code: nextSpend, symbol: nextSpend };
        const nextTargetObj = AVAILABLE_CURRENCIES.find(c => c.code === nextTarget) || { code: nextTarget, symbol: nextTarget };
        return {
          ...sec,
          foreignCurrency: nextSpend,
          symbol: nextSpendObj.symbol,
          targetCurrency: nextTarget,
          targetSymbol: nextTargetObj.symbol
        };
      }
      return sec;
    }));
  };

  // Handle deleting a section
  const handleDeleteSection = (sectionId) => {
    if (sections.length <= 1) {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, items: [] } : s));
      return;
    }
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  // Format currency rate for display
  const formatRate = (r) => {
    if (r === undefined || r === null || isNaN(r)) return '--';
    if (r >= 100) return r.toFixed(2);
    if (r >= 1) return r.toFixed(3);
    if (r >= 0.01) return r.toFixed(4);
    return r.toFixed(6);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      
      {/* Top Header / Navigation & Theme Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 -mb-1 sm:-mb-2">
        <div className="hidden sm:flex items-center gap-2 flex-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
            Travel Wallet
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </div>

        <div className="flex-shrink-0">
          {onOpenDashboard && (
            <NavigationSwitcher
              activeMode="wallet"
              onOpenDashboard={onOpenDashboard}
              onOpenAI={onOpenAI}
              onOpenTravelWallet={() => {}}
            />
          )}
        </div>

        <div className="flex items-center justify-end flex-1 w-full sm:w-auto">
          <ThemeToggle variant="segmented" showLabel={true} />
        </div>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          {onOpenDashboard && (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer shadow-2xs"
              title="Back to Markets"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <span>Travel Currency Wallet</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700">
                Multi-Currency
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
              Track expenses in destination currency and convert into your choice of home currency.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddSection(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 border border-transparent dark:border-zinc-700 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map(section => {
          const spendCode = section.foreignCurrency || 'USD';
          const targetCode = section.targetCurrency || 'USD';
          
          const spendObj = AVAILABLE_CURRENCIES.find(c => c.code === spendCode) || { code: spendCode, symbol: section.symbol || spendCode };
          const targetObj = AVAILABLE_CURRENCIES.find(c => c.code === targetCode) || { code: targetCode, symbol: targetCode };

          const rateKey = `${spendCode}_${targetCode}`;
          const rate = spendCode === targetCode ? 1.0 : (rates[rateKey] !== undefined ? rates[rateKey] : 1.0);

          const totalForeign = section.items.reduce((sum, item) => sum + (item.amount || 0), 0);
          const totalConverted = totalForeign * rate;
          const currentInput = inputs[section.id] || { title: '', amount: '' };

          return (
            <div
              key={section.id}
              className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 transition-all"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-base font-bold text-zinc-950 dark:text-zinc-100">
                  {section.name}
                </span>

                <div className="flex items-center gap-3">
                  {/* Converted Total */}
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    <span>{spendObj.symbol}{totalForeign.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-zinc-400 mx-1.5">➔</span>
                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 font-mono">
                      {targetObj.symbol}{totalConverted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {targetCode}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSection(section.id)}
                    title="Remove Section"
                    className="text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Currency Pair Selector & Conversion Rate Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-zinc-50/80 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Spend Currency Selector */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Spend:</span>
                    <select
                      value={spendCode}
                      onChange={(e) => handleUpdateSectionCurrency(section.id, e.target.value)}
                      className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-transparent outline-none cursor-pointer"
                    >
                      {AVAILABLE_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code} className="dark:bg-zinc-800 dark:text-zinc-100">
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Swap Button */}
                  <button
                    type="button"
                    onClick={() => handleSwapSectionCurrencies(section.id)}
                    className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer shadow-2xs"
                    title={`Swap ${spendCode} and ${targetCode}`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Target Currency Selector */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 shadow-2xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">To:</span>
                    <select
                      value={targetCode}
                      onChange={(e) => handleUpdateSectionTargetCurrency(section.id, e.target.value)}
                      className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-transparent outline-none cursor-pointer"
                    >
                      {AVAILABLE_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code} className="dark:bg-zinc-800 dark:text-zinc-100">
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Currency Rate Badge */}
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-2xs tabular-nums self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>1 {spendCode} = {formatRate(rate)} {targetCode}</span>
                </div>
              </div>

              {/* Items List (To-Do rows) */}
              {section.items.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  No items yet. Type an expense below to add.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {section.items.map(item => {
                    const itemConverted = item.amount * rate;
                    return (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs group"
                      >
                        {/* Title (e.g. Shinkansen bullet train) */}
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {item.title}
                        </span>

                        {/* Foreign Amount ➔ Converted Amount */}
                        <div className="flex items-center gap-3 shrink-0 tabular-nums">
                          <span className="font-semibold text-zinc-600 dark:text-zinc-400 font-mono">
                            {spendObj.symbol}{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-600">➔</span>
                          <span className="font-bold text-zinc-950 dark:text-zinc-100 font-mono">
                            {targetObj.symbol}{itemConverted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {targetCode}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(section.id, item.id)}
                            className="text-zinc-300 dark:text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                            title="Delete item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline Add Row */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Expense (e.g. bullet train, dinner, coffee)"
                  value={currentInput.title || ''}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    [section.id]: { ...prev[section.id], title: e.target.value }
                  }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem(section.id);
                  }}
                  className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 transition-all"
                />

                <div className="relative w-28 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                    {spendObj.symbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={currentInput.amount || ''}
                    onChange={(e) => setInputs(prev => ({
                      ...prev,
                      [section.id]: { ...prev[section.id], amount: e.target.value }
                    }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddItem(section.id);
                    }}
                    className="w-full pl-6 pr-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 transition-all tabular-nums"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddItem(section.id)}
                  className="px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 border border-transparent dark:border-zinc-700 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Add Section / Trip */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Add New Section / Trip</h3>
              <button
                type="button"
                onClick={() => setShowAddSection(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Section Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Tokyo Holiday, London Business, Dubai Visit"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                />
              </div>

              {/* Destination / Spend Currency */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Spend Currency (Destination)
                </label>
                <select
                  value={newSectionCurrency}
                  onChange={(e) => setNewSectionCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 cursor-pointer font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {AVAILABLE_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="dark:bg-zinc-800 dark:text-zinc-100">
                      {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  Currency you spend during your trip (e.g. JPY in Japan)
                </p>
              </div>

              {/* Convert To / Home Currency */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Convert To (Home Currency)
                </label>
                <select
                  value={newSectionTargetCurrency}
                  onChange={(e) => setNewSectionTargetCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 cursor-pointer font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {AVAILABLE_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="dark:bg-zinc-800 dark:text-zinc-100">
                      {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  Currency you want your expenses converted into (e.g. USD, EUR, etc.)
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddSection(false)}
                  className="px-3 py-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl font-bold shadow-xs hover:bg-zinc-800 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
