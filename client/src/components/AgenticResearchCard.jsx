import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Fuel, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  ShieldCheck, 
  Radio, 
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';
import { fetchCurrencyDiagnosis } from '../services/api';

const QUICK_PAIRS = [
  { base: 'USD', quote: 'INR', label: 'USD/INR' },
  { base: 'USD', quote: 'EUR', label: 'EUR/USD' },
  { base: 'USD', quote: 'GBP', label: 'GBP/USD' },
  { base: 'USD', quote: 'JPY', label: 'USD/JPY' },
  { base: 'USD', quote: 'CAD', label: 'USD/CAD' },
  { base: 'USD', quote: 'AUD', label: 'AUD/USD' }
];

export default function AgenticResearchCard({ initialBase = 'USD', initialQuote = 'INR' }) {
  const [base, setBase] = useState(initialBase);
  const [quote, setQuote] = useState(initialQuote);
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Ingesting Technicals & Volatility',
    'Scanning Multi-Source News (Reuters, Bloomberg, Google News)',
    'Measuring Macro, Oil & Yield Correlations',
    'Synthesizing Fact-Checked Attribution'
  ];

  const runResearch = async (b = base, q = quote) => {
    try {
      setLoading(true);
      setError(null);
      setActiveStep(0);

      const stepTimer1 = setTimeout(() => setActiveStep(1), 350);
      const stepTimer2 = setTimeout(() => setActiveStep(2), 700);
      const stepTimer3 = setTimeout(() => setActiveStep(3), 1050);

      const res = await fetchCurrencyDiagnosis(b, q);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (res?.success && res.data) {
        setResearchData(res.data);
      } else {
        setError('Unable to complete autonomous diagnosis for this pair.');
      }
    } catch (err) {
      console.error('Agent research failed:', err);
      setError('Autonomous research service unavailable. Please retry.');
    } finally {
      setLoading(false);
      setActiveStep(0);
    }
  };

  useEffect(() => {
    runResearch(base, quote);
  }, [base, quote]);

  const selectPair = (b, q) => {
    setBase(b);
    setQuote(q);
  };

  const isWeakening = researchData?.direction === 'Weakening';
  const isStrengthening = researchData?.direction === 'Strengthening';

  return (
    <div className="card-clean p-6 space-y-6 border border-[#222] bg-[#0c0c0c] rounded-xl shadow-xl">
      {/* Header & Pair Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Autonomous Agentic Research Engine
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Multi-Source Grounded
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Investigates the actual macro, flow &amp; news drivers behind currency moves — no generic answers.
          </p>
        </div>

        {/* Quick Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_PAIRS.map((item) => {
            const active = item.base === base && item.quote === quote;
            return (
              <button
                key={item.label}
                onClick={() => selectPair(item.base, item.quote)}
                disabled={loading}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                  active
                    ? 'bg-zinc-200 text-black shadow-sm'
                    : 'bg-[#141414] text-zinc-400 hover:text-zinc-200 border border-[#222]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => runResearch(base, quote)}
            disabled={loading}
            title="Re-run deep research"
            className="p-1.5 rounded-md bg-[#161616] border border-[#262626] text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading Steps Animation */}
      {loading && (
        <div className="p-6 rounded-lg bg-[#111] border border-[#222] space-y-4 animate-pulse">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-2 font-medium text-amber-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Agent Autonomously Investigating {base}/{quote}...
            </span>
            <span>Step {activeStep + 1} of 4</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {steps.map((st, idx) => (
              <div 
                key={st}
                className={`p-2.5 rounded-md border flex items-center gap-2 ${
                  idx === activeStep 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : idx < activeStep 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                      : 'bg-[#141414] border-[#1f1f1f] text-zinc-600'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${idx <= activeStep ? 'bg-amber-400' : 'bg-zinc-700'}`} />
                <span className="truncate">{st}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => runResearch(base, quote)}
            className="underline hover:text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Structured High-Density Research Output */}
      {!loading && researchData && (
        <div className="space-y-5">
          {/* Diagnostic Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-[#111111] border border-[#222] gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg border ${
                isWeakening 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                  : isStrengthening 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}>
                {isWeakening ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-white">
                    {researchData.pair}
                  </h4>
                  <span className="text-xs font-mono text-zinc-400">
                    {researchData.currentRate > 10 ? researchData.currentRate.toFixed(2) : researchData.currentRate.toFixed(4)}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    isWeakening 
                      ? 'bg-rose-500/20 text-rose-300' 
                      : isStrengthening 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-zinc-700 text-zinc-300'
                  }`}>
                    {researchData.currencyName} is {researchData.direction} ({researchData.change24h > 0 ? '+' : ''}{researchData.change24h}%)
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Rolling 7D Return: {researchData.change7d > 0 ? '+' : ''}{researchData.change7d}% &bull; Volatility: {researchData.volatility}% &bull; Z-Score: {researchData.zScore}&sigma;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block">Agent Confidence</span>
                <span className="text-xs font-semibold text-emerald-400">{researchData.confidenceScore}% Corroborated</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* 3 Core "Why" Drivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Primary Driver */}
            <div className="p-3.5 rounded-lg bg-[#0e0e0e] border border-[#1e1e1e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5" />
                  Primary Driver (Why)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                  {researchData.primaryDriver.impact} Impact
                </span>
              </div>
              <h5 className="text-xs font-medium text-zinc-200">
                {researchData.primaryDriver.title}
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                {researchData.primaryDriver.detail}
              </p>
            </div>

            {/* 2. Macro Driver */}
            <div className="p-3.5 rounded-lg bg-[#0e0e0e] border border-[#1e1e1e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-sky-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Macro &amp; Rates Policy
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                  {researchData.macroDriver.impact} Impact
                </span>
              </div>
              <h5 className="text-xs font-medium text-zinc-200">
                {researchData.macroDriver.title}
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                {researchData.macroDriver.detail}
              </p>
            </div>

            {/* 3. Flow & Capital Driver */}
            <div className="p-3.5 rounded-lg bg-[#0e0e0e] border border-[#1e1e1e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-purple-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Institutional Capital Flow
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                  {researchData.flowDriver.impact} Impact
                </span>
              </div>
              <h5 className="text-xs font-medium text-zinc-200">
                {researchData.flowDriver.title}
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                {researchData.flowDriver.detail}
              </p>
            </div>
          </div>

          {/* Central Bank Defense & Catalyst Watch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Central Bank Action */}
            <div className="p-3.5 rounded-lg bg-[#0e0e0e] border border-[#1e1e1e] space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300 font-medium">
                <span className="flex items-center gap-1.5 text-zinc-200">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  {researchData.centralBankStance.bank}
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">
                  {researchData.centralBankStance.action}
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                {researchData.centralBankStance.summary}
              </p>
            </div>

            {/* Catalyst Watch */}
            <div className="p-3.5 rounded-lg bg-[#0e0e0e] border border-[#1e1e1e] space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300 font-medium">
                <span className="flex items-center gap-1.5 text-zinc-200">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Upcoming Catalyst to Watch
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">High Sensitivity</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                {researchData.catalystWatch}
              </p>
            </div>
          </div>

          {/* Multi-Source Verified News Citations */}
          {researchData.verifiedSources && researchData.verifiedSources.length > 0 && (
            <div className="pt-2 border-t border-[#1a1a1a] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  Multi-Source Live News Evidence (Fact-Checked)
                </span>
                <span className="text-[11px] text-zinc-500">
                  {researchData.verifiedSources.length} verified outlets
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {researchData.verifiedSources.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="group p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1c1c1c] hover:border-zinc-700 transition-all flex items-start justify-between gap-2"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-zinc-300 font-normal group-hover:text-white transition-colors truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <span className="font-semibold text-zinc-400">{item.source}</span>
                        <span>&bull;</span>
                        <span>{new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 flex-shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
