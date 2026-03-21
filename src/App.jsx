import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchHeadyKnowledge } from './heady-knowledge.js';
import { signInGoogle, signInEmail, signUpEmail, logOut, onAuthChange, logSearch, getUserPlan } from './firebase.js';
import { HEADY_API, getQuickSites, getBookmarks, getSearchResultLinks } from './heady-registry.js';

// ── Heady Brain API + Knowledge Base ──
async function queryHeadyBrain(query) {
  // Check sessionStorage cache first
  const cacheKey = `heady-search:${query.toLowerCase().trim()}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < 5 * 60 * 1000) {
        return { ...parsed.data, cached: true };
      }
      sessionStorage.removeItem(cacheKey);
    }
  } catch { /* ignore */ }

  // 1. Try live Brain API first (3s timeout for fast fallback)
  try {
    const resp = await fetch(HEADY_API.brainChat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Heady-Source': HEADY_API.source },
      body: JSON.stringify({ message: query, model: 'heady-brain', temperature: 0.7 }),
      signal: AbortSignal.timeout(3000),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.response || data.text) {
        const result = { ok: true, title: `Heady Brain: "${query}"`, response: data.response || data.text, source: 'heady-brain-live', query, confidence: 0.95 };
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ data: result, ts: Date.now() })); } catch { /* full */ }
        return result;
      }
    }
  } catch { /* Brain API unavailable — use knowledge base */ }

  // 2. Use Heady Knowledge Base (always works)
  const result = searchHeadyKnowledge(query);
  try { sessionStorage.setItem(cacheKey, JSON.stringify({ data: result, ts: Date.now() })); } catch { /* full */ }
  return result;
}

// ── Icons (inline SVG to avoid lucide-react import issues) ──
const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const Icons = {
  plus: 'M12 5v14M5 12h14',
  x: 'M18 6L6 18M6 6l12 12',
  back: 'M19 12H5M12 19l-7-7 7-7',
  forward: 'M5 12h14M12 5l7 7-7 7',
  refresh: 'M23 4v6h-6M1 20v-6h6',
  search: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21l1.18-6.86-5-4.87 6.91-1.01z',
  globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
  sparkles: 'M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  lock: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  zap: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z',
  chat: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  settings: 'M12 8a4 4 0 100 8 4 4 0 000-8z',
};

// ── Sacred Geometry Canvas ──
function SacredGeometryBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let W, H, cx, cy, t = 0, animId;
    const stars = [];

    function resize() {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
      cx = W / 2; cy = H / 2;
      stars.length = 0;
      for (let i = 0; i < 180; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.2 + 0.2, h: Math.random() * 60 + 210,
          tw: Math.random() * Math.PI * 2
        });
      }
    }
    window.addEventListener('resize', resize);
    resize();

    function getCenters(radius, time) {
      const centers = [{ x: 0, y: 0 }];
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + time * 0.00008;
        centers.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius });
      }
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + Math.PI / 6 + time * 0.00008;
        centers.push({ x: Math.cos(a) * radius * 1.732, y: Math.sin(a) * radius * 1.732 });
      }
      return centers;
    }

    function draw() {
      t += 16.67;
      ctx.clearRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        s.tw += 0.008;
        const a = 0.3 + Math.sin(s.tw) * 0.5;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.h},65%,90%,${a})`; ctx.fill();
      }

      ctx.save();
      ctx.translate(cx, cy * 0.85);
      ctx.rotate(t * 0.000025);

      const baseR = Math.min(W, H) * 0.12;
      const hue0 = (t * 0.000008) % 1;
      const centers = getCenters(baseR, t);

      // Connecting lines
      for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
          const hue = (hue0 + (i + j) * 0.06) % 1;
          ctx.beginPath();
          ctx.moveTo(centers[i].x, centers[i].y);
          ctx.lineTo(centers[j].x, centers[j].y);
          ctx.strokeStyle = `hsla(${(hue * 360) | 0},70%,65%,${0.08 + Math.sin(t * 0.0002 + i) * 0.04})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      // Circles
      for (let i = 0; i < centers.length; i++) {
        const hue = (hue0 + i * 0.07) % 1;
        const r = baseR * 0.45 + Math.sin(t * 0.0003 + i) * baseR * 0.02;
        const alpha = 0.15 + Math.sin(t * 0.0003 + i * 0.5) * 0.06;
        ctx.beginPath(); ctx.arc(centers[i].x, centers[i].y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${(hue * 360) | 0},80%,68%,${alpha})`;
        ctx.lineWidth = 0.8; ctx.stroke();
        const grd = ctx.createRadialGradient(centers[i].x, centers[i].y, 0, centers[i].x, centers[i].y, r);
        grd.addColorStop(0, `hsla(${(hue * 360) | 0},60%,60%,${alpha * 0.3})`);
        grd.addColorStop(1, `hsla(${(hue * 360) | 0},60%,60%,0)`);
        ctx.fillStyle = grd; ctx.fill();
      }
      ctx.restore();
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); };
  }, []);

  return <canvas ref={canvasRef} id="sacred-canvas" />;
}

// ── Quick Access Sites (from canonical registry) ──
const QUICK_SITES = getQuickSites();

// ── Tab Component ──
function TabBar({ tabs, activeTab, onSelectTab, onCloseTab, onNewTab }) {
  return (
    <div className="tab-bar">
      {tabs.map((tab, i) => (
        <div key={tab.id} className={`browser-tab ${activeTab === i ? 'active' : ''}`}
          onClick={() => onSelectTab(i)}>
          <span className="text-sm mr-1">{tab.favicon || '🌐'}</span>
          <span className="truncate flex-1">{tab.title}</span>
          <button className="tab-close" onClick={e => { e.stopPropagation(); onCloseTab(i); }}>
            <Icon d={Icons.x} size={12} />
          </button>
        </div>
      ))}
      <button className="nav-btn ml-1" onClick={onNewTab} title="New Tab">
        <Icon d={Icons.plus} size={14} />
      </button>
      <div className="flex-1" /> {/* Drag area */}
    </div>
  );
}

// ── Address Bar ──
function AddressBar({ url, onNavigate, onToggleSidebar, onSearch }) {
  const [input, setInput] = useState(url);
  const inputRef = useRef(null);

  useEffect(() => { setInput(url); }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let dest = input.trim();
    if (!dest) return;
    // If it looks like a URL, navigate
    if (dest.startsWith('http') || dest.startsWith('headyweb://')) {
      onNavigate(dest);
    } else if (dest.includes('.') && !dest.includes(' ')) {
      onNavigate(`https://${dest}`);
    } else {
      // Search with Heady Brain
      onSearch(dest);
    }
  };

  return (
    <div className="address-bar">
      <button className="nav-btn" title="Back"><Icon d={Icons.back} /></button>
      <button className="nav-btn" title="Forward"><Icon d={Icons.forward} /></button>
      <button className="nav-btn" title="Refresh"><Icon d={Icons.refresh} /></button>

      <form onSubmit={handleSubmit} className="flex-1 flex">
        <div className="url-input flex items-center gap-2 w-full">
          <Icon d={Icons.lock} size={13} className="text-green-400/70 flex-shrink-0" />
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            ref={inputRef}
            placeholder="Search with Heady Brain or enter URL"
            className="bg-transparent border-none outline-none flex-1 text-sm"
            onFocus={() => inputRef.current?.select()} />
          <Icon d={Icons.sparkles} size={14} className="text-blue-400/50 flex-shrink-0" />
        </div>
      </form>

      <button className="nav-btn" title="Shield Status"><Icon d={Icons.shield} /></button>
      <button className="nav-btn" title="HeadyBuddy AI" onClick={onToggleSidebar}>
        <Icon d={Icons.sparkles} className="text-blue-400" />
      </button>
      <button className="nav-btn" title="Settings"><Icon d={Icons.settings} /></button>
    </div>
  );
}

// ── Bookmarks Bar (from canonical registry) ──
function BookmarksBar() {
  const bookmarks = getBookmarks();

  return (
    <div className="bookmarks-bar">
      {bookmarks.map((b, i) => (
        <a key={i} href={b.url} className="bookmark-chip" target="_blank" rel="noopener noreferrer">
          <span>{b.icon}</span>
          <span>{b.name}</span>
        </a>
      ))}
    </div>
  );
}

// ── AI Sidebar ──
function AISidebar({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '👋 Hi! I\'m HeadyBuddy, your AI assistant built into HeadyWeb. Ask me anything — I can help with browsing, coding, research, and more.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Call Heady Brain API
    try {
      const resp = await fetch(HEADY_API.brainChat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Heady-Source': HEADY_API.source,
          'X-Heady-Version': HEADY_API.version
        },
        body: JSON.stringify({ message: userMsg, model: 'heady-brain', temperature: 0.7 })
      });
      if (resp.ok) {
        const data = await resp.json();
        const answer = data.response || data.text || 'Heady Brain is thinking...';
        setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: '⚡ Heady Brain is processing. Try again in a moment.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '🔌 Could not reach Heady Brain. Check your connection.' }]);
    }
  };

  return (
    <div className={`ai-sidebar ${open ? '' : 'closed'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-semibold text-white">HeadyBuddy AI</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">LIVE</span>
        </div>
        <button className="nav-btn" onClick={onClose}><Icon d={Icons.x} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`text-sm leading-relaxed ${m.role === 'user'
            ? 'ml-8 px-3 py-2 rounded-xl bg-blue-600/20 text-blue-100 border border-blue-500/15'
            : 'mr-4 text-gray-300'}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="px-3 py-3 border-t border-blue-500/10">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask HeadyBuddy..."
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-blue-500/10 text-gray-200 outline-none focus:border-blue-500/30" />
          <button type="submit" className="px-3 py-2 rounded-lg bg-blue-600/30 text-blue-300 text-sm font-medium hover:bg-blue-600/50 transition-colors">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Heady Brain Search Results ──
function HeadyBrainResults({ query, result, loading }) {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.04) 0%, transparent 50%), #06091a' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Query Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <Icon d={Icons.sparkles} size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="text-white/80 text-base font-medium">{query}</div>
            <div className="text-xs text-blue-400/50">Powered by Heady Brain • manager.headysystems.com</div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-4">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-blue-300/60 text-sm">Heady Brain is processing your query...</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 rounded bg-white/[0.03] animate-pulse" style={{ width: `${90 - i * 15}%`, animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Main Response */}
            <div className="px-5 py-4 rounded-xl bg-white/[0.03] border border-blue-500/10">
              <div className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{result.response}</div>
            </div>

            {/* Services Used */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400/80 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> HeadyBrain
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400/80 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> HeadyBattle Verified
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400/80 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> HCFP Enforced
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400/80 text-xs font-medium">
                Source: {result.source}
              </span>
            </div>

            {/* Heady Ecosystem Links (from registry) */}
            <div className="border-t border-white/5 pt-4">
              <div className="text-xs text-white/25 mb-3 font-medium">Related Heady Services</div>
              <div className="grid grid-cols-3 gap-2">
                {getSearchResultLinks().map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all">
                    <span>{s.icon}</span>
                    <div>
                      <div className="text-xs text-white/60 font-medium">{s.name}</div>
                      <div className="text-[10px] text-white/25">{s.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── New Tab Page ──
function NewTabPage({ onSearch, user, userPlan, onSignIn, onSignOut, onPricing }) {
  const [searchInput, setSearchInput] = useState('');
  const [time, setTime] = useState(new Date());
  const searchRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      setSearchInput('');
    }
  };

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="new-tab-content relative">
      <SacredGeometryBg />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4">
        {/* Clock */}
        <div className="text-center mb-8 mt-4">
          <div className="text-6xl font-extralight text-white/90 tracking-tight">{formatTime(time)}</div>
          <div className="text-sm text-blue-300/50 mt-1 font-light tracking-wider">{formatDate(time)}</div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full mb-10">
          <div className="relative group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl
                            focus-within:border-blue-500/30 focus-within:bg-white/[0.07] transition-all duration-300
                            focus-within:shadow-[0_0_30px_rgba(59,130,246,0.08)]">
              <Icon d={Icons.sparkles} size={18} className="text-blue-400/40 mr-3 flex-shrink-0" />
              <input type="text" ref={searchRef} value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Search with Heady Brain — AI-powered search"
                className="flex-1 bg-transparent border-none outline-none text-white/90 text-base placeholder:text-white/20 font-light" />
              <span className="text-[10px] text-blue-400/30 font-medium ml-2 flex-shrink-0 px-1.5 py-0.5 rounded border border-blue-400/10">⌘K</span>
            </div>
          </div>
        </form>

        {/* Quick Access Tiles */}
        <div className="grid grid-cols-4 gap-3 mb-10 w-full max-w-lg">
          {QUICK_SITES.map((site, i) => (
            <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="quick-tile group">
              <div className="tile-icon" style={{ background: `${site.color}18`, color: site.color }}>
                {site.icon}
              </div>
              <span className="tile-label group-hover:text-white/80 transition-colors">{site.name}</span>
            </a>
          ))}
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-6 text-xs mt-auto mb-8">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400/60 font-medium">Heady Brain Online</span>
          </div>
          <span className="text-white/10">|</span>
          <span className="text-white/25">HeadyBattle Active</span>
          <span className="text-white/10">|</span>
          <span className="text-white/25">HCFP Enforced</span>
          <span className="text-white/10">|</span>
          <span className="text-white/25">Sacred Geometry ✦</span>
        </div>

        {/* Account & Pricing */}
        <div className="flex items-center gap-3 mb-6">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">
                {user.displayName?.[0] || user.email?.[0] || '?'}
              </div>
              <span className="text-white/40 text-xs">{user.displayName || user.email}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                userPlan === 'pro' ? 'bg-blue-500/15 text-blue-400/80' :
                userPlan === 'enterprise' ? 'bg-purple-500/15 text-purple-400/80' :
                'bg-green-500/10 text-green-400/70'
              }`}>{userPlan === 'pro' ? 'Pro' : userPlan === 'enterprise' ? 'Enterprise' : 'Free'}</span>
              <button onClick={onSignOut} className="text-white/20 hover:text-white/50 text-[10px] ml-1 transition-colors">
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={onSignIn} className="px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/15 text-blue-300 text-xs font-medium hover:bg-blue-600/30 transition-colors">
              Sign In
            </button>
          )}
          <button onClick={onPricing} className="px-4 py-1.5 rounded-full bg-purple-600/15 border border-purple-500/10 text-purple-300/80 text-xs font-medium hover:bg-purple-600/25 transition-colors">
            {user && userPlan === 'free' ? 'Upgrade' : 'View Plans'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Auth Modal ──
function AuthModal({ open, onClose, onAuth }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const fn = mode === 'signup' ? signUpEmail : signInEmail;
    const result = await fn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
    else { onAuth(result.user); onClose(); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    const result = await signInGoogle();
    setLoading(false);
    if (result.error) setError(result.error);
    else { onAuth(result.user); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm mx-4 rounded-2xl bg-[#0d1325] border border-blue-500/15 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="text-2xl mb-1">✦</div>
          <h2 className="text-white font-semibold text-lg">Welcome to HeadyWeb</h2>
          <p className="text-white/40 text-xs mt-1">{mode === 'signup' ? 'Create your account' : 'Sign in to your account'}</p>
        </div>
        {error && <div className="text-red-400 text-xs mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/15">{error}</div>}
        <button onClick={handleGoogle} disabled={loading}
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          Continue with Google
        </button>
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-white/20 text-xs">or</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <form onSubmit={handleEmail} className="space-y-2.5">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500/30" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500/30" />
          <button type="submit" disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-600 transition-colors">
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-3">
          <button onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')} className="text-blue-400/60 text-xs hover:text-blue-400">
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
        {/* Cloudflare Turnstile — invisible bot protection */}
        <div className="cf-turnstile mt-3" data-sitekey="0x4AAAAAAXXXXXXXXXXXXXXX" data-theme="dark" data-size="invisible"></div>
      </div>
    </div>
  );
}

// ── Pricing Modal ──
function PricingModal({ open, onClose }) {
  if (!open) return null;
  const plans = [
    { name: 'Free', price: '$0', period: '/forever', features: ['AI-powered search (10/day)', 'Sacred Geometry new-tab', 'Bookmarks & tabs', 'Basic HeadyBuddy'], color: 'white', cta: 'Current Plan' },
    { name: 'Pro', price: '$9.99', period: '/month', features: ['Unlimited AI search', 'Priority Heady Brain', 'Search history sync', 'Advanced HeadyBuddy', 'Ad-free experience', 'HeadyBattle analysis'], color: '#3b82f6', cta: 'Upgrade to Pro', popular: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Team management', 'API access', 'Custom branding', 'SLA + support', 'Self-hosted option', 'Dedicated resources'], color: '#8b5cf6', cta: 'Contact Sales' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl mx-4 rounded-2xl bg-[#0d1325] border border-blue-500/15 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <h2 className="text-white font-semibold text-xl">HeadyWeb Plans</h2>
          <p className="text-white/40 text-sm mt-1">Choose the plan that fits your needs</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-xl p-5 border ${plan.popular ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
              {plan.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">POPULAR</div>}
              <div className="text-sm font-bold mb-1" style={{ color: plan.color }}>{plan.name}</div>
              <div className="flex items-baseline gap-0.5 mb-4">
                <span className="text-2xl font-bold text-white">{plan.price}</span>
                <span className="text-white/30 text-xs">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f, j) => (
                  <li key={j} className="text-white/50 text-xs flex items-center gap-2">
                    <span className="text-green-400 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <button onClick={onClose} className="text-white/30 text-xs hover:text-white/50">Maybe later</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──
function App() {
  const [tabs, setTabs] = useState([
    { id: 1, title: 'New Tab', url: 'headyweb://newtab', favicon: '✦' }
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchState, setSearchState] = useState({ query: '', result: null, loading: false });
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [authOpen, setAuthOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      if (u?.uid) {
        getUserPlan(u.uid).then(setUserPlan);
      } else {
        setUserPlan('free');
      }
    });
    // Pre-warm connection to Heady Brain
    fetch(HEADY_API.brainHealth, { signal: AbortSignal.timeout(2000) }).catch(() => { });
    return () => unsub && unsub();
  }, []);

  const handleSignOut = useCallback(async () => {
    await logOut();
    setUser(null);
    setUserPlan('free');
  }, []);

  const newTab = useCallback(() => {
    const id = Date.now();
    setTabs(prev => [...prev, { id, title: 'New Tab', url: 'headyweb://newtab', favicon: '✦' }]);
    setActiveTab(tabs.length);
  }, [tabs.length]);

  const closeTab = useCallback((index) => {
    if (tabs.length <= 1) return;
    setTabs(prev => prev.filter((_, i) => i !== index));
    setActiveTab(prev => prev >= index ? Math.max(0, prev - 1) : prev);
  }, [tabs.length]);

  const navigate = useCallback((url) => {
    if (!url) return;
    setSearchState({ query: '', result: null, loading: false });
    setTabs(prev => prev.map((tab, i) =>
      i === activeTab ? { ...tab, url, title: url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'New Tab' } : tab
    ));
  }, [activeTab]);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setTabs(prev => prev.map((tab, i) =>
      i === activeTab ? { ...tab, url: `headyweb://search?q=${encodeURIComponent(query)}`, title: `🔮 ${query}`, favicon: '🔮' } : tab
    ));
    setSearchState({ query, result: null, loading: true });
    logSearch(user?.uid, query);
    const result = await queryHeadyBrain(query);
    setSearchState({ query, result, loading: false });
  }, [activeTab, user]);

  const currentTab = tabs[activeTab] || tabs[0];
  const isNewTab = currentTab?.url === 'headyweb://newtab';
  const isSearch = currentTab?.url?.startsWith('headyweb://search');

  return (
    <div className="flex flex-col h-screen bg-[#06091a] text-white">
      <TabBar tabs={tabs} activeTab={activeTab}
        onSelectTab={setActiveTab} onCloseTab={closeTab} onNewTab={newTab} />
      <AddressBar
        url={isNewTab ? '' : (isSearch ? searchState.query : (currentTab?.url || ''))}
        onNavigate={navigate}
        onSearch={handleSearch}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <BookmarksBar />

      <div className="flex-1 relative overflow-hidden">
        {isNewTab ? (
          <NewTabPage onSearch={handleSearch} user={user} userPlan={userPlan} onSignIn={() => setAuthOpen(true)} onSignOut={handleSignOut} onPricing={() => setPricingOpen(true)} />
        ) : isSearch ? (
          <HeadyBrainResults query={searchState.query} result={searchState.result} loading={searchState.loading} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
            <div className="text-center">
              <Icon d={Icons.globe} size={40} className="mx-auto mb-3 text-blue-400/20" />
              <p className="text-white/30 font-medium">{currentTab?.url}</p>
              <p className="text-white/15 text-xs mt-1">Web content renders here in full Chromium</p>
            </div>
          </div>
        )}
      </div>

      <AISidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuth={setUser} />
      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
}

export default App;
