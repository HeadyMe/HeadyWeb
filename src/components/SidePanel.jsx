import React, { useState, useRef, useEffect } from 'react';

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const SP = {
  x: 'M18 6L6 18M6 6l12 12',
  sparkles: 'M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5.5A2.5 2.5 0 016.5 3H20v14H6.5A2.5 2.5 0 004 19.5z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21l1.18-6.86-5-4.87 6.91-1.01z',
  clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
  plug: 'M12 2v4m0 12v4M2 12h4m12 0h4',
  zap: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z',
  check: 'M20 6L9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20',
};

// ── HeadyBuddy Quick Panel ──
function QuickAI({ onFullOpen }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    // Quick simulated response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Processing "${userMsg}"... For detailed responses, open the full HeadyBuddy sidebar.`
      }]);
    }, 500);
  };

  return (
    <div className="sp-panel-content">
      <div className="sp-ai-quick-header">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-xs font-semibold text-white/60">HeadyBuddy Quick</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400/70">AI</span>
        </div>
        <button className="sp-expand-btn" onClick={onFullOpen}>Open Full</button>
      </div>
      <div className="sp-ai-messages">
        {messages.length === 0 && (
          <div className="sp-ai-empty">
            <Icon d={SP.sparkles} size={20} className="text-blue-400/20 mb-2" />
            <div className="text-xs text-white/25">Ask HeadyBuddy anything</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`sp-ai-msg ${m.role}`}>{m.text}</div>
        ))}
      </div>
      <form onSubmit={handleSend} className="sp-ai-input-form">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Quick question..." className="sp-ai-input" />
        <button type="submit" className="sp-ai-send">
          <Icon d={SP.zap} size={12} />
        </button>
      </form>
    </div>
  );
}

// ── Reading List Panel ──
function ReadingList() {
  const [items, setItems] = useState([
    { id: 1, title: 'Understanding Sacred Geometry in UI Design', url: 'https://headysystems.com/blog/sacred-geometry-ui', read: false, addedAt: Date.now() - 86400000 },
    { id: 2, title: 'Building AI-Native Applications with HeadyBrain', url: 'https://headybuddy.org/docs/ai-native', read: false, addedAt: Date.now() - 172800000 },
    { id: 3, title: 'MCP Integration Guide', url: 'https://headymcp.com/docs/integration', read: true, addedAt: Date.now() - 259200000 },
    { id: 4, title: 'Chromium Architecture Deep Dive', url: 'https://chromium.org/architecture', read: true, addedAt: Date.now() - 345600000 },
  ]);

  const toggleRead = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, read: !item.read } : item));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const unread = items.filter(i => !i.read);
  const read = items.filter(i => i.read);

  return (
    <div className="sp-panel-content">
      <div className="sp-section">
        <div className="sp-section-title">Unread ({unread.length})</div>
        {unread.map(item => (
          <div key={item.id} className="sp-reading-item">
            <button className="sp-read-check" onClick={() => toggleRead(item.id)}>
              <span className="sp-check-circle" />
            </button>
            <div className="sp-reading-info">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="sp-reading-title">{item.title}</a>
              <div className="sp-reading-url">{item.url.replace(/^https?:\/\//, '').split('/')[0]}</div>
            </div>
            <button className="sp-item-remove" onClick={() => removeItem(item.id)}>
              <Icon d={SP.x} size={10} />
            </button>
          </div>
        ))}
        {unread.length === 0 && <div className="sp-empty-text">All caught up!</div>}
      </div>
      {read.length > 0 && (
        <div className="sp-section">
          <div className="sp-section-title">Read ({read.length})</div>
          {read.map(item => (
            <div key={item.id} className="sp-reading-item read">
              <button className="sp-read-check done" onClick={() => toggleRead(item.id)}>
                <Icon d={SP.check} size={8} />
              </button>
              <div className="sp-reading-info">
                <span className="sp-reading-title read">{item.title}</span>
                <div className="sp-reading-url">{item.url.replace(/^https?:\/\//, '').split('/')[0]}</div>
              </div>
              <button className="sp-item-remove" onClick={() => removeItem(item.id)}>
                <Icon d={SP.x} size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quick Bookmarks Panel ──
function QuickBookmarks() {
  const bookmarks = [
    { name: 'HeadySystems', url: 'https://headysystems.com', favicon: '⚙️' },
    { name: 'HeadyMe', url: 'https://headyme.com', favicon: '👤' },
    { name: 'HeadyBuddy', url: 'https://headybuddy.org', favicon: '🤖' },
    { name: 'HeadyMCP', url: 'https://headymcp.com', favicon: '🔌' },
    { name: 'GitHub', url: 'https://github.com', favicon: '🐙' },
    { name: 'MDN Docs', url: 'https://developer.mozilla.org', favicon: '📚' },
    { name: 'React', url: 'https://react.dev', favicon: '⚛️' },
    { name: 'Tailwind', url: 'https://tailwindcss.com', favicon: '🎨' },
  ];

  return (
    <div className="sp-panel-content">
      <div className="sp-bookmark-list">
        {bookmarks.map((bm, i) => (
          <a key={i} href={bm.url} target="_blank" rel="noopener noreferrer" className="sp-bookmark-item">
            <span className="text-sm">{bm.favicon}</span>
            <span className="sp-bookmark-name">{bm.name}</span>
            <Icon d={SP.globe} size={10} className="text-white/15 ml-auto" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Quick History Panel ──
function QuickHistory() {
  const recentHistory = [
    { title: 'HeadySystems', url: 'https://headysystems.com', time: '2m ago', favicon: '⚙️' },
    { title: 'HeadyBuddy AI', url: 'https://headybuddy.org', time: '15m ago', favicon: '🤖' },
    { title: 'GitHub', url: 'https://github.com', time: '1h ago', favicon: '🐙' },
    { title: 'HeadyMCP Docs', url: 'https://headymcp.com/docs', time: '2h ago', favicon: '🔌' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', time: '3h ago', favicon: '📚' },
    { title: 'Google Search', url: 'https://google.com', time: '4h ago', favicon: '🔍' },
  ];

  return (
    <div className="sp-panel-content">
      <div className="sp-history-list">
        {recentHistory.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="sp-history-item">
            <span className="text-sm">{item.favicon}</span>
            <div className="sp-history-info">
              <div className="sp-history-title">{item.title}</div>
              <div className="sp-history-url">{item.url.replace(/^https?:\/\//, '').split('/')[0]}</div>
            </div>
            <span className="sp-history-time">{item.time}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── HeadyMCP Tools Panel ──
function MCPTools() {
  const tools = [
    { name: 'HeadyPerplexity', desc: 'Deep research & analysis', icon: '🔬', status: 'active' },
    { name: 'HeadyJules', desc: 'Background coding assistant', icon: '👨‍💻', status: 'active' },
    { name: 'HuggingFace', desc: 'Model search & inference', icon: '🤗', status: 'active' },
    { name: 'Knowledge Base', desc: 'Heady ecosystem search', icon: '📚', status: 'active' },
    { name: 'Health Monitor', desc: 'Service status checker', icon: '💊', status: 'active' },
    { name: 'Deploy Tool', desc: 'HeadyCloud deployment', icon: '🚀', status: 'idle' },
  ];

  return (
    <div className="sp-panel-content">
      <div className="sp-mcp-header">
        <span className="text-xs text-white/40">Connected via HeadyMCP</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400/60">Online</span>
      </div>
      <div className="sp-tool-list">
        {tools.map((tool, i) => (
          <div key={i} className="sp-tool-item">
            <span className="text-lg mr-2">{tool.icon}</span>
            <div className="sp-tool-info">
              <div className="sp-tool-name">{tool.name}</div>
              <div className="sp-tool-desc">{tool.desc}</div>
            </div>
            <span className={`sp-tool-status ${tool.status}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tool.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Side Panel ──
export default function SidePanel({ open, onClose, onOpenFullSidebar, defaultTab = 'ai' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => { setActiveTab(defaultTab); }, [defaultTab]);

  if (!open) return null;

  const tabs = [
    { id: 'ai', label: 'AI', icon: SP.sparkles },
    { id: 'reading', label: 'Reading', icon: SP.book },
    { id: 'bookmarks', label: 'Bookmarks', icon: SP.star },
    { id: 'history', label: 'History', icon: SP.clock },
    { id: 'mcp', label: 'MCP', icon: SP.plug },
  ];

  return (
    <div className="side-panel">
      <div className="sp-header">
        <div className="sp-tabs">
          {tabs.map(tab => (
            <button key={tab.id}
              className={`sp-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}>
              <Icon d={tab.icon} size={14} />
            </button>
          ))}
        </div>
        <button className="nav-btn" onClick={onClose}>
          <Icon d={SP.x} size={14} />
        </button>
      </div>
      <div className="sp-tab-label">
        {tabs.find(t => t.id === activeTab)?.label}
      </div>
      <div className="sp-body">
        {activeTab === 'ai' && <QuickAI onFullOpen={onOpenFullSidebar} />}
        {activeTab === 'reading' && <ReadingList />}
        {activeTab === 'bookmarks' && <QuickBookmarks />}
        {activeTab === 'history' && <QuickHistory />}
        {activeTab === 'mcp' && <MCPTools />}
      </div>
    </div>
  );
}
