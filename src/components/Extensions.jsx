import React, { useState } from 'react';

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const EI = {
  search: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  x: 'M18 6L6 18M6 6l12 12',
  trash: 'M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  moon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z',
  globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
  puzzle: 'M12 2v4m0 12v4M2 12h4m12 0h4',
  check: 'M20 6L9 17l-5-5',
  settings: 'M12 8a4 4 0 100 8 4 4 0 000-8z',
};

const BUILT_IN_EXTENSIONS = [
  {
    id: 'ad-blocker',
    name: 'HeadyShield Ad Blocker',
    description: 'Block intrusive ads, trackers, and malware. Powered by HeadyBattle verification.',
    icon: '🛡️',
    iconPath: EI.shield,
    version: '2.1.0',
    author: 'Heady Systems',
    category: 'Privacy & Security',
    enabled: true,
    builtin: true,
    stats: { blocked: 1247, trackers: 89 },
    settings: [
      { id: 'block-ads', label: 'Block advertisements', type: 'toggle', value: true },
      { id: 'block-trackers', label: 'Block tracking scripts', type: 'toggle', value: true },
      { id: 'block-malware', label: 'Block malware domains', type: 'toggle', value: true },
      { id: 'allow-acceptable', label: 'Allow acceptable ads', type: 'toggle', value: false },
    ],
  },
  {
    id: 'dark-mode',
    name: 'Universal Dark Mode',
    description: 'Apply dark mode to any website. Preserves readability with intelligent color inversion.',
    icon: '🌙',
    iconPath: EI.moon,
    version: '1.5.0',
    author: 'Heady Systems',
    category: 'Appearance',
    enabled: false,
    builtin: true,
    settings: [
      { id: 'auto-detect', label: 'Auto-detect dark mode support', type: 'toggle', value: true },
      { id: 'contrast', label: 'Contrast level', type: 'select', value: 'normal', options: ['low', 'normal', 'high'] },
      { id: 'brightness', label: 'Brightness adjustment', type: 'select', value: '100', options: ['80', '90', '100'] },
    ],
  },
  {
    id: 'screenshot',
    name: 'HeadyCapture',
    description: 'Capture full-page screenshots, visible area, or selected region. Save as PNG or copy to clipboard.',
    icon: '📸',
    iconPath: EI.camera,
    version: '1.2.0',
    author: 'Heady Systems',
    category: 'Utilities',
    enabled: true,
    builtin: true,
    settings: [
      { id: 'format', label: 'Default format', type: 'select', value: 'png', options: ['png', 'jpg', 'webp'] },
      { id: 'include-scrollbar', label: 'Include scrollbar', type: 'toggle', value: false },
    ],
  },
  {
    id: 'translator',
    name: 'HeadyTranslate',
    description: 'Instant page translation powered by HeadyBrain AI. Supports 50+ languages with context-aware accuracy.',
    icon: '🌐',
    iconPath: EI.globe,
    version: '1.8.0',
    author: 'Heady Systems',
    category: 'Productivity',
    enabled: false,
    builtin: true,
    settings: [
      { id: 'target-lang', label: 'Translate to', type: 'select', value: 'en', options: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'pt', 'ar', 'hi'] },
      { id: 'auto-translate', label: 'Auto-translate foreign pages', type: 'toggle', value: false },
    ],
  },
];

const STORE_EXTENSIONS = [
  {
    id: 'password-manager',
    name: 'HeadyVault',
    description: 'Secure password manager with biometric unlock and cross-device sync.',
    icon: '🔐',
    version: '3.0.1',
    author: 'Heady Systems',
    category: 'Security',
    rating: 4.8,
    users: '12K',
    installed: false,
  },
  {
    id: 'productivity',
    name: 'FocusMode',
    description: 'Block distracting websites, track time, and boost productivity.',
    icon: '🎯',
    version: '2.2.0',
    author: 'Community',
    category: 'Productivity',
    rating: 4.5,
    users: '8.3K',
    installed: false,
  },
  {
    id: 'reader',
    name: 'ReadClean',
    description: 'Distraction-free reading mode with customizable typography.',
    icon: '📖',
    version: '1.4.0',
    author: 'Community',
    category: 'Reading',
    rating: 4.6,
    users: '5.1K',
    installed: false,
  },
  {
    id: 'devhelper',
    name: 'DevHelper Pro',
    description: 'JSON viewer, CSS inspector, and API tester in your sidebar.',
    icon: '🔧',
    version: '2.0.0',
    author: 'Community',
    category: 'Developer Tools',
    rating: 4.7,
    users: '15K',
    installed: false,
  },
];

// ── Extension Card ──
function ExtensionCard({ ext, onToggle, onRemove, onConfigure }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={`ext-card ${ext.enabled ? 'enabled' : ''}`}>
      <div className="ext-card-header">
        <div className="ext-icon-wrap">
          <span className="text-2xl">{ext.icon}</span>
        </div>
        <div className="ext-info">
          <div className="flex items-center gap-2">
            <span className="ext-name">{ext.name}</span>
            <span className="ext-version">v{ext.version}</span>
            {ext.builtin && <span className="ext-badge builtin">Built-in</span>}
          </div>
          <div className="ext-desc">{ext.description}</div>
          <div className="ext-meta">
            <span>by {ext.author}</span>
            <span className="ext-dot">·</span>
            <span>{ext.category}</span>
          </div>
        </div>
        <div className="ext-actions">
          <label className="ext-toggle">
            <input type="checkbox" checked={ext.enabled} onChange={() => onToggle(ext.id)} />
            <span className="ext-toggle-slider" />
          </label>
        </div>
      </div>
      {ext.stats && ext.enabled && (
        <div className="ext-stats">
          {ext.stats.blocked !== undefined && (
            <span className="ext-stat"><span className="ext-stat-num">{ext.stats.blocked.toLocaleString()}</span> ads blocked</span>
          )}
          {ext.stats.trackers !== undefined && (
            <span className="ext-stat"><span className="ext-stat-num">{ext.stats.trackers}</span> trackers stopped</span>
          )}
        </div>
      )}
      {ext.settings && (
        <>
          <button className="ext-settings-toggle" onClick={() => setShowSettings(!showSettings)}>
            <Icon d={EI.settings} size={12} />
            <span>{showSettings ? 'Hide' : 'Show'} Settings</span>
          </button>
          {showSettings && (
            <div className="ext-settings-panel">
              {ext.settings.map(s => (
                <div key={s.id} className="ext-setting-row">
                  <span className="ext-setting-label">{s.label}</span>
                  {s.type === 'toggle' ? (
                    <label className="ext-toggle small">
                      <input type="checkbox" defaultChecked={s.value} />
                      <span className="ext-toggle-slider" />
                    </label>
                  ) : s.type === 'select' ? (
                    <select className="ext-select" defaultValue={s.value}>
                      {s.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {!ext.builtin && (
        <button className="ext-remove-btn" onClick={() => onRemove(ext.id)}>
          <Icon d={EI.trash} size={12} />
          Remove Extension
        </button>
      )}
    </div>
  );
}

// ── Store Extension Card ──
function StoreCard({ ext, onInstall }) {
  return (
    <div className="ext-store-card">
      <div className="ext-store-icon"><span className="text-3xl">{ext.icon}</span></div>
      <div className="ext-store-info">
        <div className="ext-name">{ext.name}</div>
        <div className="ext-desc">{ext.description}</div>
        <div className="ext-meta">
          <span>{ext.author}</span>
          <span className="ext-dot">·</span>
          <span>{'★'.repeat(Math.floor(ext.rating))} {ext.rating}</span>
          <span className="ext-dot">·</span>
          <span>{ext.users} users</span>
        </div>
      </div>
      <button className={`ext-install-btn ${ext.installed ? 'installed' : ''}`}
        onClick={() => onInstall(ext.id)} disabled={ext.installed}>
        {ext.installed ? (
          <><Icon d={EI.check} size={12} /> Installed</>
        ) : (
          <><Icon d={EI.download} size={12} /> Install</>
        )}
      </button>
    </div>
  );
}

// ── API Documentation Panel ──
function ExtensionAPI() {
  return (
    <div className="ext-api-docs">
      <h3 className="ext-api-title">HeadyWeb Extension API</h3>
      <p className="ext-api-desc">Build extensions for HeadyWeb using the Extension API. Extensions can modify page content, add sidebar panels, intercept network requests, and integrate with HeadyBuddy AI.</p>

      <div className="ext-api-section">
        <h4 className="ext-api-subtitle">manifest.json</h4>
        <pre className="ext-api-code">{`{
  "name": "My Extension",
  "version": "1.0.0",
  "description": "A HeadyWeb extension",
  "permissions": ["tabs", "storage", "headyai"],
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }],
  "sidebar_panel": {
    "default_path": "sidebar.html"
  },
  "heady_integration": {
    "ai_tools": true,
    "mcp_access": false
  }
}`}</pre>
      </div>

      <div className="ext-api-section">
        <h4 className="ext-api-subtitle">Available APIs</h4>
        <div className="ext-api-list">
          <div className="ext-api-item">
            <code>heady.tabs</code>
            <span>Create, query, update, and remove tabs</span>
          </div>
          <div className="ext-api-item">
            <code>heady.storage</code>
            <span>Local and sync storage for extension data</span>
          </div>
          <div className="ext-api-item">
            <code>heady.ai.query(prompt)</code>
            <span>Send queries to HeadyBrain AI</span>
          </div>
          <div className="ext-api-item">
            <code>heady.sidebar.open()</code>
            <span>Open extension sidebar panel</span>
          </div>
          <div className="ext-api-item">
            <code>heady.network.onRequest</code>
            <span>Intercept and modify network requests</span>
          </div>
          <div className="ext-api-item">
            <code>heady.notifications</code>
            <span>Show browser notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Extensions Component ──
export default function Extensions() {
  const [extensions, setExtensions] = useState(BUILT_IN_EXTENSIONS);
  const [storeExts, setStoreExts] = useState(STORE_EXTENSIONS);
  const [activeView, setActiveView] = useState('installed');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExtension = (id) => {
    setExtensions(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  const removeExtension = (id) => {
    setExtensions(prev => prev.filter(e => e.id !== id));
  };

  const installExtension = (id) => {
    const ext = storeExts.find(e => e.id === id);
    if (!ext || ext.installed) return;
    setStoreExts(prev => prev.map(e => e.id === id ? { ...e, installed: true } : e));
    setExtensions(prev => [...prev, {
      ...ext,
      enabled: true,
      builtin: false,
      settings: [],
    }]);
  };

  const filteredInstalled = extensions.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStore = storeExts.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="internal-page">
      <div className="internal-page-header">
        <h1 className="internal-page-title">
          <span className="text-2xl mr-3">🧩</span>
          Extensions
        </h1>
        <p className="internal-page-subtitle">Manage and discover extensions for HeadyWeb</p>
      </div>

      <div className="ext-nav">
        <button className={`ext-nav-btn ${activeView === 'installed' ? 'active' : ''}`}
          onClick={() => setActiveView('installed')}>
          Installed ({extensions.length})
        </button>
        <button className={`ext-nav-btn ${activeView === 'store' ? 'active' : ''}`}
          onClick={() => setActiveView('store')}>
          Extension Store
        </button>
        <button className={`ext-nav-btn ${activeView === 'api' ? 'active' : ''}`}
          onClick={() => setActiveView('api')}>
          Developer API
        </button>
        <div className="flex-1" />
        <div className="ext-search-wrap">
          <Icon d={EI.search} size={14} className="text-white/30" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search extensions..." className="ext-search-input" />
        </div>
      </div>

      <div className="ext-content">
        {activeView === 'installed' && (
          <div className="ext-list">
            {filteredInstalled.map(ext => (
              <ExtensionCard key={ext.id} ext={ext}
                onToggle={toggleExtension}
                onRemove={removeExtension}
                onConfigure={() => {}} />
            ))}
            {filteredInstalled.length === 0 && (
              <div className="text-center py-12 text-white/20">
                <Icon d={EI.puzzle} size={40} className="mx-auto mb-3 opacity-30" />
                <p>No extensions found</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'store' && (
          <div className="ext-store-grid">
            {filteredStore.map(ext => (
              <StoreCard key={ext.id} ext={ext} onInstall={installExtension} />
            ))}
          </div>
        )}

        {activeView === 'api' && <ExtensionAPI />}
      </div>
    </div>
  );
}
