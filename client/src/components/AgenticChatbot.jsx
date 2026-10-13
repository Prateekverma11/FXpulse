import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Fuel, 
  Building2, 
  TrendingDown, 
  TrendingUp, 
  ExternalLink, 
  ShieldCheck, 
  RotateCcw,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sendAgentChat } from '../services/api';

const DEFAULT_SUGGESTIONS = [
  'Why is Rupee (INR) falling today?',
  'Why is the US Dollar strengthening?',
  'What is driving EUR/USD?',
  'Analyze USD/JPY moves'
];

export default function AgenticChatbot({ baseCurrency = 'USD', quoteCurrency = 'INR' }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Hello! I am your Autonomous FX Research Agent. Unlike generic chatbots, I don't give blind guesses — I actively gather live exchange rates, crude oil prices, US yield spreads, and real-time news from Reuters & Bloomberg before answering.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchStep, setResearchStep] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResearching]);

  const handleSend = async (questionText) => {
    const query = (questionText || input).trim();
    if (!query || isResearching) return;

    setInput('');
    const userMsgId = 'user-' + Date.now();
    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: query, timestamp: new Date() }
    ]);

    setIsResearching(true);
    setResearchStep('Connecting to live market feeds & technical variance...');

    const stepTimer1 = setTimeout(() => {
      setResearchStep('Querying real-time news (Reuters, Bloomberg, Google News)...');
    }, 450);

    const stepTimer2 = setTimeout(() => {
      setResearchStep('Calculating crude oil & central bank yield spreads...');
    }, 900);

    try {
      const res = await sendAgentChat(query, baseCurrency, quoteCurrency);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res?.success && res.data) {
        const d = res.data;
        const agentMsgId = 'agent-' + Date.now();
        setMessages(prev => [
          ...prev,
          {
            id: agentMsgId,
            sender: 'agent',
            data: d,
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'agent',
            text: 'I could not complete the live research loop for this query. Please check your network or try another pair.',
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error('Agent chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'agent',
          text: 'Autonomous research engine timed out while gathering live news. Please try asking again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsResearching(false);
      setResearchStep('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: `Hello! I am your Autonomous FX Research Agent. Ask me why any currency is moving (e.g. INR, EUR, JPY, GBP). I research live news, oil prices, and central banks before answering.`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="card-clean border border-[#222] bg-[#0b0b0b] rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all">
      {/* Chatbot Header */}
      <div className="p-4 bg-[#111111] border-b border-[#1f1f1f] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-white tracking-wide">
                FX Research Agent
              </h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Multi-Source Autonomous
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Researches live news, crude oil &amp; central banks before answering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Reset Conversation"
            className="p-1.5 rounded-lg bg-[#181818] text-zinc-400 hover:text-zinc-200 border border-[#262626] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-[#181818] text-zinc-400 hover:text-zinc-200 border border-[#262626] transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Messages Scroll Area */}
          <div className="p-4 space-y-4 max-h-[460px] min-h-[280px] overflow-y-auto text-xs">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'user' ? (
                  <div className="max-w-[85%] sm:max-w-[70%] bg-zinc-200 text-zinc-950 px-3.5 py-2.5 rounded-xl rounded-tr-none font-medium shadow-sm">
                    {m.text}
                  </div>
                ) : (
                  <div className="max-w-[95%] sm:max-w-[88%] space-y-3">
                    {/* Simple Text Greeting / Error */}
                    {m.text && (
                      <div className="bg-[#141414] border border-[#222] text-zinc-300 p-3.5 rounded-xl rounded-tl-none leading-relaxed font-normal">
                        {m.text}
                      </div>
                    )}

                    {/* Rich Research Response Card */}
                    {m.data && (
                      <div className="bg-[#121212] border border-[#262626] rounded-xl p-4 space-y-3 text-zinc-200 shadow-md">
                        {/* 1. Verdict Bar */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-[#202020]">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">
                              {m.data.pair} ({m.data.currentRate})
                            </span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                              m.data.direction === 'Weakening'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                            }`}>
                              {m.data.currencyName} is {m.data.direction} ({m.data.change24h})
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {m.data.confidenceScore}% Verified
                          </span>
                        </div>

                        {/* 2. Core Drivers in Concise Bullets */}
                        <div className="space-y-2">
                          {/* Primary Driver */}
                          <div className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] flex items-start gap-2.5">
                            <Fuel className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-medium text-amber-300 block">
                                {m.data.primaryDriver?.title} ({m.data.primaryDriver?.impact} Impact)
                              </span>
                              <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">
                                {m.data.primaryDriver?.detail}
                              </p>
                            </div>
                          </div>

                          {/* Macro Driver */}
                          <div className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] flex items-start gap-2.5">
                            <Building2 className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-medium text-sky-300 block">
                                {m.data.macroDriver?.title}
                              </span>
                              <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">
                                {m.data.macroDriver?.detail}
                              </p>
                            </div>
                          </div>

                          {/* Central Bank Defense */}
                          <div className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] flex items-start gap-2.5">
                            <Layers className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-medium text-purple-300 block">
                                {m.data.centralBankStance?.bank} &mdash; {m.data.centralBankStance?.action}
                              </span>
                              <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">
                                {m.data.centralBankStance?.summary}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 3. Live Verified News Evidence */}
                        {m.data.verifiedSources && m.data.verifiedSources.length > 0 && (
                          <div className="pt-2 border-t border-[#1f1f1f] space-y-1.5">
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider block">
                              Live News Citations (Fact-Checked):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.data.verifiedSources.slice(0, 3).map((s, idx) => (
                                <a
                                  key={idx}
                                  href={s.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-zinc-300 hover:text-white bg-[#161616] hover:bg-[#202020] px-2.5 py-1 rounded border border-[#2b2b2b] flex items-center gap-1 transition-colors"
                                >
                                  <span className="font-medium text-zinc-400">{s.source}:</span>
                                  <span className="truncate max-w-[200px]">{s.title}</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-zinc-500 flex-shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Catalyst Watch */}
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{m.data.catalystWatch}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Researching Animation Indicator */}
            {isResearching && (
              <div className="flex justify-start">
                <div className="bg-[#141414] border border-[#262626] rounded-xl rounded-tl-none p-3.5 space-y-2 text-xs max-w-[85%]">
                  <div className="flex items-center gap-2 text-amber-400 font-medium">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Agent Research In Progress...</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 italic">
                    {researchStep}
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Suggested Questions */}
          <div className="px-4 py-2 border-t border-[#1a1a1a] bg-[#0e0e0e] flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-zinc-500 flex-shrink-0 font-medium">Try:</span>
            {DEFAULT_SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isResearching}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#161616] text-zinc-400 hover:text-zinc-200 hover:bg-[#222] border border-[#252525] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[#111111] border-t border-[#1f1f1f] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything: 'Why is INR falling?', 'Explain EUR/USD', 'Is oil hurting Rupee?'..."
              disabled={isResearching}
              className="flex-1 bg-[#0a0a0a] border border-[#242424] focus:border-zinc-500 text-xs text-white rounded-lg px-3.5 py-2.5 outline-none transition-colors placeholder:text-zinc-600"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isResearching}
              className="px-4 py-2.5 rounded-lg bg-zinc-200 text-black hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 font-semibold text-xs transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
              <span>Ask Agent</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
