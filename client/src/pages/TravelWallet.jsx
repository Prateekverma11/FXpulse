import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, ArrowRight, ArrowLeft, Briefcase, Activity } from 'lucide-react';
import { fetchPairRate } from '../services/api';

const DEFAULT_SECTIONS = [
  {
    id: 'sec_1',
    name: 'Trip to USA',
    foreignCurrency: 'USD',
    symbol: '$',
    items: [
      { id: 'item_1', title: 'Auto rent', amount: 20 },
      { id: 'item_2', title: 'Coffee & breakfast', amount: 8.5 }
    ]
  },
  {
    id: 'sec_2',
    name: 'Europe Tour',
    foreignCurrency: 'EUR',
    symbol: '€',
    items: [
      { id: 'item_3', title: 'Metro day pass', amount: 15 },
      { id: 'item_4', title: 'Museum ticket', amount: 22 }
    ]
  }
];

const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
];

export default function TravelWallet({ onOpenDashboard }) {
  const [sections, setSections] = useState(() => {
    try {
      const saved = localStorage.getItem('fxpulse_minimal_wallet');
      return saved ? JSON.parse(saved) : DEFAULT_SECTIONS;
    } catch {
      return DEFAULT_SECTIONS;
    }
  });

  const [rates, setRates] = useState({});
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCurrency, setNewSectionCurrency] = useState('EUR');

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

  // Fetch live rates against INR for all currencies used in sections
  useEffect(() => {
    const currenciesToFetch = Array.from(new Set(sections.map(s => s.foreignCurrency)));
    
    async function loadRates() {
      const newRates = { ...rates };
      await Promise.all(
        currenciesToFetch.map(async (code) => {
          try {
            const res = await fetchPairRate(code, 'INR');
            if (res && res.rate) {
              newRates[code] = res.rate;
            }
          } catch (e) {
            console.warn(`Rate fetch failed for ${code}:`, e.message);
          }
        })
      );
      setRates(newRates);
    }

    if (currenciesToFetch.length > 0) {
      loadRates();
    }
  }, [sections]);

  // Handle adding an item to a section
  const handleAddItem = (sectionId, foreignCurrency) => {
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

  // Handle adding a new section
  const handleCreateSection = (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const currObj = AVAILABLE_CURRENCIES.find(c => c.code === newSectionCurrency) || AVAILABLE_CURRENCIES[0];

    const newSec = {
      id: `sec_${Date.now()}`,
      name: newSectionName.trim(),
      foreignCurrency: currObj.code,
      symbol: currObj.symbol,
      items: []
    };

    setSections(prev => [...prev, newSec]);
    setNewSectionName('');
    setShowAddSection(false);
  };

  // Handle deleting a section
  const handleDeleteSection = (sectionId) => {
    if (sections.length <= 1) {
      // Just clear items if it's the last section
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, items: [] } : s));
      return;
    }
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      
      {/* Navigation Mode Switcher: Markets vs Travel Wallet */}
      {onOpenDashboard && (
        <div className="flex justify-center pt-1">
          <div className="inline-flex items-center gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80 shadow-2xs">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer group"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-900" />
              <span>Markets</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 shadow-xs cursor-default"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Travel Wallet</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Simple Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          {onOpenDashboard && (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="p-2 rounded-xl border border-zinc-200/80 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer active:scale-95 shadow-2xs"
              title="Back to Markets"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Travel Currency Wallet
            </h1>
            <p className="text-xs text-zinc-500 font-normal mt-0.5">
              Track and manage your travel expenses
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddSection(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map(section => {
          const rate = rates[section.foreignCurrency] || 1;
          const totalForeign = section.items.reduce((sum, item) => sum + (item.amount || 0), 0);
          const totalInr = totalForeign * rate;
          const currentInput = inputs[section.id] || { title: '', amount: '' };

          return (
            <div
              key={section.id}
              className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">
                    {section.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-700">
                    {section.foreignCurrency} ({section.symbol})
                  </span>
                  <span className="text-[11px] text-zinc-400 tabular-nums">
                    @ ₹{rate.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Converted Total in INR */}
                  <span className="text-xs font-bold text-zinc-900 tabular-nums">
                    Total: {section.symbol}{totalForeign.toFixed(2)} ➔ <span className="text-emerald-700">₹{totalInr.toFixed(2)}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteSection(section.id)}
                    title="Remove Section"
                    className="text-zinc-300 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Items List (Simple To-Do rows) */}
              {section.items.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-400">
                  No items yet. Type an expense below to add.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {section.items.map(item => {
                    const itemInr = item.amount * rate;
                    return (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs group"
                      >
                        {/* Title (e.g. Auto rent) */}
                        <span className="font-medium text-zinc-800">
                          {item.title}
                        </span>

                        {/* Foreign Amount ➔ Converted INR */}
                        <div className="flex items-center gap-3 shrink-0 tabular-nums">
                          <span className="font-semibold text-zinc-600">
                            {section.symbol}{item.amount.toFixed(2)}
                          </span>
                          <span className="text-zinc-300">➔</span>
                          <span className="font-bold text-zinc-950">
                            ₹{itemInr.toFixed(2)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(section.id, item.id)}
                            className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
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

              {/* Minimal Inline Add Row */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Expense (e.g. auto rent, lunch)"
                  value={currentInput.title || ''}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    [section.id]: { ...prev[section.id], title: e.target.value }
                  }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem(section.id, section.foreignCurrency);
                  }}
                  className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 transition-all"
                />

                <div className="relative w-28 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
                    {section.symbol}
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
                      if (e.key === 'Enter') handleAddItem(section.id, section.foreignCurrency);
                    }}
                    className="w-full pl-6 pr-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 transition-all tabular-nums"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddItem(section.id, section.foreignCurrency)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  Add
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Add Section (e.g. Europe, USA, Dubai) */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">Add New Section / Trip</h3>
              <button
                type="button"
                onClick={() => setShowAddSection(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Section Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Europe Trip, Dubai Visit"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Currency</label>
                <select
                  value={newSectionCurrency}
                  onChange={(e) => setNewSectionCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900 cursor-pointer font-medium"
                >
                  {AVAILABLE_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddSection(false)}
                  className="px-3 py-1.5 text-zinc-500 hover:text-zinc-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl font-bold shadow-xs hover:bg-zinc-800"
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
