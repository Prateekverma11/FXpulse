import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  RefreshCw, 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Globe2, 
  Flame, 
  Landmark, 
  Clock, 
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { fetchMarketNews } from '../services/api';

const DEFAULT_NEWS = [
  {
    id: 'n1',
    title: 'RBI Keeps Repo Rate Steady Amid Rupee Resilience and Controlled Headline Inflation',
    source: 'Economic Times',
    category: 'inr',
    tag: 'INR / Monetary',
    timeAgo: '18m ago',
    pubDate: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    snippet: 'Reserve Bank of India maintained liquidity buffers as foreign institutional flows stabilized dollar-rupee trading bands.',
    impact: 'High Impact',
    sentiment: 'neutral',
    link: 'https://news.google.com/search?q=RBI+repo+rate+rupee'
  },
  {
    id: 'n2',
    title: 'US Dollar Tests Key Resistance as Treasury Yields Consolidate Ahead of Fed Signals',
    source: 'Bloomberg Markets',
    category: 'macro',
    tag: 'USD / Yields',
    timeAgo: '42m ago',
    pubDate: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    snippet: 'The Dollar Index hovered around 104.1 with traders pricing in a patient stance on interest rate trajectory.',
    impact: 'Market Catalyst',
    sentiment: 'bullish',
    link: 'https://news.google.com/search?q=US+dollar+index+treasury+yields'
  },
  {
    id: 'n3',
    title: 'Crude Oil Pullback Eases Import Bill Pressure on Indian Rupee and Current Account',
    source: 'Reuters Financial',
    category: 'inr',
    tag: 'Energy & Trade',
    timeAgo: '1h ago',
    pubDate: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    snippet: 'Brent crude easing below $78 per barrel provided strong macroeconomic support for Asian net oil-importing currencies.',
    impact: 'Rupee Support',
    sentiment: 'bullish',
    link: 'https://news.google.com/search?q=crude+oil+indian+rupee+import'
  },
  {
    id: 'n4',
    title: 'ECB Monitors Eurozone Wage Growth and Disinflation Ahead of Spring Policy Meeting',
    source: 'Financial Times',
    category: 'central_banks',
    tag: 'EUR / ECB',
    timeAgo: '2h ago',
    pubDate: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    snippet: 'European Central Bank policymakers signaled a data-dependent path as regional core inflation numbers continue moderation.',
    impact: 'Euro Watch',
    sentiment: 'neutral',
    link: 'https://news.google.com/search?q=ECB+eurozone+interest+rates'
  },
  {
    id: 'n5',
    title: 'Bank of Japan Evaluates Policy Normalization as Yen Carry Trade Dynamics Shift',
    source: 'Nikkei Asia',
    category: 'central_banks',
    tag: 'JPY / BOJ',
    timeAgo: '3h ago',
    pubDate: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
    snippet: 'Governor Ueda highlighted domestic wage negotiations as central to sustaining underlying inflation above the 2% target.',
    impact: 'Carry Trade',
    sentiment: 'bearish',
    link: 'https://news.google.com/search?q=Bank+of+Japan+yen+carry+trade'
  },
  {
    id: 'n6',
    title: 'Foreign Institutional Inflows into Indian Capital Markets Hit 3-Month Peak',
    source: 'Mint Markets',
    category: 'inr',
    tag: 'FII Inflows',
    timeAgo: '4h ago',
    pubDate: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
    snippet: 'Robust domestic growth figures prompted heavy equity purchases, bolstering the rupee against emerging market peers.',
    impact: 'Capital Flow',
    sentiment: 'bullish',
    link: 'https://news.google.com/search?q=India+FII+inflows+forex'
  }
];

export default function MarketNewsPanel({
  onClose,
  baseCurrency = 'USD',
  quoteCurrency = 'INR'
}) {
  const [news, setNews] = useState(DEFAULT_NEWS);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'inr' | 'central_banks' | 'macro'
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  const loadLiveNews = async () => {
    setLoading(true);
    try {
      const query = activeCategory === 'inr' 
        ? 'Indian Rupee RBI forex market economy'
        : activeCategory === 'central_banks'
        ? 'Federal Reserve ECB Bank of England interest rates currency'
        : `${baseCurrency} ${quoteCurrency} forex global currency`;

      const res = await fetchMarketNews(query, quoteCurrency);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        // Merge with defaults so we have rich metadata
        const liveArticles = res.data.map((item, idx) => ({
          id: `live-${idx}-${Date.now()}`,
          title: item.title,
          source: item.source || 'Financial Wire',
          category: activeCategory === 'all' ? (item.title.toLowerCase().includes('rupee') || item.title.toLowerCase().includes('india') ? 'inr' : 'macro') : activeCategory,
          tag: item.source?.includes('Reuters') || item.source?.includes('Bloomberg') ? 'Breaking' : 'Market Wire',
          timeAgo: 'Just now',
          pubDate: item.pubDate || new Date().toISOString(),
          snippet: item.snippet || `Real-time intelligence report regarding ${baseCurrency}/${quoteCurrency} and broader economic drivers.`,
          impact: 'Verified Source',
          sentiment: 'neutral',
          link: item.link || `https://news.google.com/search?q=${encodeURIComponent(item.title)}`
        }));

        setNews(prev => {
          const combined = [...liveArticles, ...DEFAULT_NEWS];
          const unique = [];
          const seen = new Set();
          for (const a of combined) {
            const key = a.title.slice(0, 25).toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(a);
            }
          }
          return unique;
        });
      }
    } catch (err) {
      console.warn('Live news fetch warning (using cached feed):', err.message);
    } finally {
      setLoading(false);
      setLastRefreshed(Date.now());
    }
  };

  useEffect(() => {
    loadLiveNews();
  }, [baseCurrency, activeCategory]);

  const filteredNews = activeCategory === 'all'
    ? news
    : news.filter(item => item.category === activeCategory);

  return (
    <aside className="bg-white dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-clean-sm flex flex-col overflow-hidden transition-all duration-300">
      
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 flex items-center justify-center shadow-clean-xs">
              <Newspaper className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Market & Currency News
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                Macro drivers, central banks & INR telemetry
              </p>
            </div>
          </div>

          {/* Action buttons: Refresh and Close (Cross) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={loadLiveNews}
              disabled={loading}
              title="Refresh News Feed"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close news and center dashboard"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                aria-label="Close News Feed"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Micro Macro Ticker Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="bg-white dark:bg-zinc-850/80 border border-zinc-200/70 dark:border-zinc-800 rounded-md p-1.5 text-center shadow-2xs">
            <div className="text-[10px] text-zinc-400 font-medium">RBI Repo</div>
            <div className="font-bold text-zinc-800 dark:text-zinc-200">6.50%</div>
          </div>
          <div className="bg-white dark:bg-zinc-850/80 border border-zinc-200/70 dark:border-zinc-800 rounded-md p-1.5 text-center shadow-2xs">
            <div className="text-[10px] text-zinc-400 font-medium">Brent Crude</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">$78.20</div>
          </div>
          <div className="bg-white dark:bg-zinc-850/80 border border-zinc-200/70 dark:border-zinc-800 rounded-md p-1.5 text-center shadow-2xs">
            <div className="text-[10px] text-zinc-400 font-medium">DXY Dollar</div>
            <div className="font-bold text-zinc-800 dark:text-zinc-200">104.15</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-[#121216] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All News' },
          { id: 'inr', label: 'INR & India' },
          { id: 'central_banks', label: 'Central Banks' },
          { id: 'macro', label: 'Global Macro' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-zinc-900 dark:bg-zinc-700 text-white dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Articles Feed */}
      <div className="p-4 space-y-3.5 max-h-[620px] overflow-y-auto scrollbar-thin divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {filteredNews.map((item, idx) => (
          <article 
            key={item.id || idx} 
            className={`group pt-3.5 first:pt-0 space-y-2 transition-all`}
          >
            {/* Meta Row: Source, Time, Impact Tag */}
            <div className="flex items-center justify-between text-[11px] gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900 dark:text-zinc-200 tracking-tight">
                  {item.source}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                  {item.timeAgo}
                </span>
              </div>

              {item.impact && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  item.sentiment === 'bullish'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50'
                    : item.sentiment === 'bearish'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/50'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700'
                }`}>
                  {item.impact}
                </span>
              )}
            </div>

            {/* Headline */}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group/link"
            >
              <h4 className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400 transition-colors flex items-start justify-between gap-2">
                <span>{item.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </h4>
            </a>

            {/* Concise summary */}
            {item.snippet && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal line-clamp-2">
                {item.snippet}
              </p>
            )}

            {/* Footer tag & Action */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100/80 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                #{item.tag}
              </span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Read Story</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Footer Info & Close prompt */}
      <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>Syncing financial news wires</span>
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium hover:underline cursor-pointer"
          >
            Hide panel (center page)
          </button>
        )}
      </div>

    </aside>
  );
}
