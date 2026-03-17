import React, { useState, useMemo } from 'react';

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const HI = {
  clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
  search: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  trash: 'M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  x: 'M18 6L6 18M6 6l12 12',
  globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20',
  chevDown: 'M6 9l6 6 6-6',
};

function generateHistory() {
  const now = Date.now();
  const DAY = 86400000;

  const entries = [
    // Today
    { title: 'HeadySystems — The Architecture of Intelligence', url: 'https://headysystems.com', favicon: '⚙️', time: now - 1200000 },
    { title: 'HeadyBuddy AI Assistant', url: 'https://headybuddy.org', favicon: '🤖', time: now - 3600000 },
    { title: 'HeadyMCP — Model Context Protocol', url: 'https://headymcp.com', favicon: '🔌', time: now - 5400000 },
    { title: 'GitHub — headysystems', url: 'https://github.com/headysystems', favicon: '🐙', time: now - 7200000 },
    { title: 'Google Search: sacred geometry patterns CSS', url: 'https://google.com/search?q=sacred+geometry+patterns+CSS', favicon: '🔍', time: now - 9000000 },
    { title: 'MDN Web Docs — CSS Grid Layout', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout', favicon: '📚', time: now - 10800000 },
    // Yesterday
    { title: 'HeadyMe — Admin Dashboard', url: 'https://headyme.com', favicon: '👤', time: now - DAY - 1800000 },
    { title: 'Cloudflare Dashboard', url: 'https://dash.cloudflare.com', favicon: '☁️', time: now - DAY - 3600000 },
    { title: 'HeadyIO Platform', url: 'https://headyio.com', favicon: '🌐', time: now - DAY - 7200000 },
    { title: 'React Documentation', url: 'https://react.dev', favicon: '⚛️', time: now - DAY - 14400000 },
    { title: 'Stack Overflow — Vite configuration', url: 'https://stackoverflow.com/questions/vite-config', favicon: '📋', time: now - DAY - 21600000 },
    // 2 days ago
    { title: 'HeadyConnection Community', url: 'https://headyconnection.org', favicon: '🤝', time: now - 2 * DAY - 3600000 },
    { title: 'Tailwind CSS Documentation', url: 'https://tailwindcss.com/docs', favicon: '🎨', time: now - 2 * DAY - 7200000 },
    { title: 'NPM — firebase package', url: 'https://www.npmjs.com/package/firebase', favicon: '📦', time: now - 2 * DAY - 10800000 },
    // 3 days ago
    { title: 'Google — chromium browser architecture', url: 'https://google.com/search?q=chromium+browser+architecture', favicon: '🔍', time: now - 3 * DAY - 3600000 },
    { title: 'Wikipedia — Sacred Geometry', url: 'https://en.wikipedia.org/wiki/Sacred_geometry', favicon: '📖', time: now - 3 * DAY - 7200000 },
    // This week
    { title: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', favicon: '▲', time: now - 5 * DAY - 3600000 },
    { title: 'Figma — HeadyWeb Design System', url: 'https://figma.com/file/headyweb-design', favicon: '🎨', time: now - 5 * DAY - 14400000 },
    { title: 'YouTube — Building a Browser Extension', url: 'https://youtube.com/watch?v=browser-ext', favicon: '📺', time: now - 6 * DAY - 7200000 },
  ];

  return entries.map((e, i) => ({ id: i + 1, ...e }));
}

function getDateGroup(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now.setHours(0,0,0,0) - new Date(date).setHours(0,0,0,0)) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 30) return 'This month';
  return 'Older';
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ── History Item ──
function HistoryItem({ entry, onDelete, onNavigate }) {
  return (
    <div className="history-item" onClick={() => onNavigate(entry.url)}>
      <span className="history-time">{formatTime(entry.time)}</span>
      <span className="history-favicon">{entry.favicon}</span>
      <div className="history-info">
        <div className="history-title">{entry.title}</div>
        <div className="history-url">{entry.url}</div>
      </div>
      <button className="history-delete" onClick={e => { e.stopPropagation(); onDelete(entry.id); }}>
        <Icon d={HI.x} size={12} />
      </button>
    </div>
  );
}

// ── Main History Component ──
export default function History({ onNavigate }) {
  const [history, setHistory] = useState(generateHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(e =>
      e.title.toLowerCase().includes(q) || e.url.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(entry => {
      const group = getDateGroup(entry.time);
      if (!groups[group]) groups[group] = [];
      groups[group].push(entry);
    });
    return groups;
  }, [filtered]);

  const deleteEntry = (id) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  };

  const clearHistory = (range) => {
    const now = Date.now();
    const ranges = {
      'hour': 3600000,
      'day': 86400000,
      'week': 7 * 86400000,
      'all': Infinity,
    };
    const cutoff = now - (ranges[range] || Infinity);
    setHistory(prev => prev.filter(e => e.time < cutoff));
    setShowClearModal(false);
  };

  return (
    <div className="internal-page">
      <div className="internal-page-header">
        <h1 className="internal-page-title">
          <span className="text-2xl mr-3">🕐</span>
          History
        </h1>
        <p className="internal-page-subtitle">{history.length} entries</p>
      </div>

      <div className="history-toolbar">
        <div className="history-search-wrap">
          <Icon d={HI.search} size={14} className="text-white/30" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search history..." className="history-search-input" />
        </div>
        <button className="dl-clear-btn" onClick={() => setShowClearModal(true)}>
          <Icon d={HI.trash} size={12} /> Clear History
        </button>
      </div>

      <div className="history-list">
        {Object.entries(grouped).map(([group, entries]) => (
          <div key={group} className="history-group">
            <div className="history-group-header">
              <Icon d={HI.clock} size={12} className="text-blue-400/40" />
              <span>{group}</span>
              <span className="history-group-count">{entries.length}</span>
            </div>
            {entries.map(entry => (
              <HistoryItem key={entry.id} entry={entry}
                onDelete={deleteEntry}
                onNavigate={onNavigate || (() => {})} />
            ))}
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12 text-white/20">
            <Icon d={HI.clock} size={40} className="mx-auto mb-3 opacity-30" />
            <p>No history found</p>
          </div>
        )}
      </div>

      {/* Clear History Modal */}
      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="clear-history-modal" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-sm mb-3">Clear Browsing History</h3>
            <p className="text-white/40 text-xs mb-4">Choose how much history to clear:</p>
            <div className="clear-options">
              <button className="clear-option" onClick={() => clearHistory('hour')}>Last hour</button>
              <button className="clear-option" onClick={() => clearHistory('day')}>Last 24 hours</button>
              <button className="clear-option" onClick={() => clearHistory('week')}>Last 7 days</button>
              <button className="clear-option danger" onClick={() => clearHistory('all')}>All time</button>
            </div>
            <button className="text-white/30 text-xs mt-3 hover:text-white/50" onClick={() => setShowClearModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
