import React, { useState } from 'react';

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const SI = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  palette: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z',
  sparkles: 'M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
  refresh: 'M23 4v6h-6M1 20v-6h6',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  puzzle: 'M12 2v4m0 12v4M2 12h4m12 0h4',
  info: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01',
  globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20',
  check: 'M20 6L9 17l-5-5',
  chevRight: 'M9 6l6 6-6 6',
};

// ── Section: General ──
function GeneralSettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title"><Icon d={SI.home} size={16} className="text-blue-400/60" /> General</h3>
      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-label">
            <span>On Startup</span>
            <span className="settings-hint">Choose what HeadyWeb shows when you open it</span>
          </div>
          <select className="settings-select" value={settings.startup} onChange={e => onChange('startup', e.target.value)}>
            <option value="newtab">Open New Tab page</option>
            <option value="continue">Continue where you left off</option>
            <option value="specific">Open specific pages</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Homepage</span>
            <span className="settings-hint">The page that opens when you click Home</span>
          </div>
          <input type="text" className="settings-input" value={settings.homepage}
            onChange={e => onChange('homepage', e.target.value)} placeholder="headyweb://newtab" />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Language</span>
            <span className="settings-hint">HeadyWeb interface language</span>
          </div>
          <select className="settings-select" value={settings.language} onChange={e => onChange('language', e.target.value)}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
            <option value="ko">Korean</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Show Bookmarks Bar</span>
            <span className="settings-hint">Display your bookmarks below the address bar</span>
          </div>
          <ToggleSwitch checked={settings.showBookmarks} onChange={v => onChange('showBookmarks', v)} />
        </div>
      </div>
    </div>
  );
}

// ── Section: Privacy & Security ──
function PrivacySettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title"><Icon d={SI.shield} size={16} className="text-green-400/60" /> Privacy & Security</h3>
      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-label">
            <span>Tracking Protection</span>
            <span className="settings-hint">Block cross-site tracking to protect your privacy</span>
          </div>
          <select className="settings-select" value={settings.trackingProtection} onChange={e => onChange('trackingProtection', e.target.value)}>
            <option value="standard">Standard — blocks known trackers</option>
            <option value="strict">Strict — blocks all cross-site tracking</option>
            <option value="custom">Custom</option>
            <option value="off">Off (not recommended)</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Cookie Policy</span>
            <span className="settings-hint">Control how websites use cookies</span>
          </div>
          <select className="settings-select" value={settings.cookiePolicy} onChange={e => onChange('cookiePolicy', e.target.value)}>
            <option value="allow">Allow all cookies</option>
            <option value="block-third">Block third-party cookies</option>
            <option value="block-all">Block all cookies</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>HTTPS-Only Mode</span>
            <span className="settings-hint">Always use secure connections when available</span>
          </div>
          <ToggleSwitch checked={settings.httpsOnly} onChange={v => onChange('httpsOnly', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Send Do Not Track</span>
            <span className="settings-hint">Request websites not to track your activity</span>
          </div>
          <ToggleSwitch checked={settings.doNotTrack} onChange={v => onChange('doNotTrack', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Safe Browsing (HeadyShield)</span>
            <span className="settings-hint">Warn about dangerous sites and downloads</span>
          </div>
          <ToggleSwitch checked={settings.safeBrowsing} onChange={v => onChange('safeBrowsing', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Clear Browsing Data</span>
            <span className="settings-hint">Remove browsing history, cookies, cache, and more</span>
          </div>
          <button className="settings-button danger">Clear Data...</button>
        </div>
      </div>
    </div>
  );
}

// ── Section: Appearance ──
function AppearanceSettings({ settings, onChange }) {
  const themes = [
    { id: 'sacred-geometry', name: 'Sacred Geometry', desc: 'Dark theme with organic curves and cosmic patterns', preview: 'linear-gradient(135deg, #06091a, #0d1325, #1a0d2e)' },
    { id: 'dark', name: 'Dark', desc: 'Clean dark theme', preview: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' },
    { id: 'light', name: 'Light', desc: 'Bright and clean', preview: 'linear-gradient(135deg, #f0f4ff, #e8efff, #dde6ff)' },
    { id: 'midnight', name: 'Midnight', desc: 'Deep blue dark theme', preview: 'linear-gradient(135deg, #020617, #0f172a, #1e293b)' },
  ];

  return (
    <div className="settings-section">
      <h3 className="settings-section-title"><Icon d={SI.palette} size={16} className="text-purple-400/60" /> Appearance</h3>
      <div className="settings-group">
        <div className="settings-row-full">
          <span className="settings-label-inline">Theme</span>
          <div className="settings-theme-grid">
            {themes.map(t => (
              <button key={t.id} className={`settings-theme-card ${settings.theme === t.id ? 'active' : ''}`}
                onClick={() => onChange('theme', t.id)}>
                <div className="settings-theme-preview" style={{ background: t.preview }} />
                <div className="settings-theme-name">{t.name}</div>
                <div className="settings-theme-desc">{t.desc}</div>
                {settings.theme === t.id && (
                  <div className="settings-theme-check"><Icon d={SI.check} size={12} /></div>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Font Size</span>
            <span className="settings-hint">Adjust the base font size for all content</span>
          </div>
          <select className="settings-select" value={settings.fontSize} onChange={e => onChange('fontSize', e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium (default)</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Compact Mode</span>
            <span className="settings-hint">Reduce spacing in the browser UI</span>
          </div>
          <ToggleSwitch checked={settings.compactMode} onChange={v => onChange('compactMode', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Show Animations</span>
            <span className="settings-hint">Enable Sacred Geometry background animations</span>
          </div>
          <ToggleSwitch checked={settings.showAnimations} onChange={v => onChange('showAnimations', v)} />
        </div>
      </div>
    </div>
  );
}

// ── Section: AI Settings ──
function AISettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title"><Icon d={SI.sparkles} size={16} className="text-cyan-400/60" /> AI Settings</h3>
      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-label">
            <span>HeadyBuddy Model</span>
            <span className="settings-hint">Select the AI model for HeadyBuddy responses</span>
          </div>
          <select className="settings-select" value={settings.aiModel} onChange={e => onChange('aiModel', e.target.value)}>
            <option value="heady-brain">Heady Brain (default)</option>
            <option value="heady-brain-fast">Heady Brain Fast</option>
            <option value="heady-brain-pro">Heady Brain Pro (Pro plan)</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Search Provider</span>
            <span className="settings-hint">Default search engine for the address bar</span>
          </div>
          <select className="settings-select" value={settings.searchProvider} onChange={e => onChange('searchProvider', e.target.value)}>
            <option value="heady-brain">Heady Brain (AI-powered)</option>
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
            <option value="bing">Bing</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Auto-Suggest</span>
            <span className="settings-hint">Show AI-powered suggestions as you type in the address bar</span>
          </div>
          <ToggleSwitch checked={settings.autoSuggest} onChange={v => onChange('autoSuggest', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>AI Page Summary</span>
            <span className="settings-hint">Automatically generate page summaries with HeadyBrain</span>
          </div>
          <ToggleSwitch checked={settings.aiSummary} onChange={v => onChange('aiSummary', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>HeadyBuddy Sidebar Position</span>
            <span className="settings-hint">Which side of the window the AI panel appears</span>
          </div>
          <select className="settings-select" value={settings.sidebarPosition} onChange={e => onChange('sidebarPosition', e.target.value)}>
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ── Section: Sync ──
function SyncSettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title"><Icon d={SI.refresh} size={16} className="text-orange-400/60" /> Sync</h3>
      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-label">
            <span>Cross-Device Sync</span>
            <span className="settings-hint">Sync bookmarks, history, and settings across your devices</span>
          </div>
          <ToggleSwitch checked={settings.syncEnabled} onChange={v => onChange('syncEnabled', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Sync Bookmarks</span>
          </div>
          <ToggleSwitch checked={settings.syncBookmarks} onChange={v => onChange('syncBookmarks', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Sync History</span>
          </div>
          <ToggleSwitch checked={settings.syncHistory} onChange={v => onChange('syncHistory', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Sync Open Tabs</span>
          </div>
          <ToggleSwitch checked={settings.syncTabs} onChange={v => onChange('syncTabs', v)} />
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Sync Extensions</span>
          </div>
          <ToggleSwitch checked={settings.syncExtensions} onChange={v => onChange('syncExtensions', v)} />
        </div>
      </div>
    </div>
  );
}

// ── Section: Downloads ──
function DownloadSettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title"><Icon d={SI.download} size={16} className="text-teal-400/60" /> Downloads</h3>
      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-label">
            <span>Default Download Location</span>
            <span className="settings-hint">Where downloaded files are saved</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" className="settings-input" value={settings.downloadPath}
              onChange={e => onChange('downloadPath', e.target.value)} />
            <button className="settings-button">Browse</button>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-label">
            <span>Ask Before Downloading</span>
            <span className="settings-hint">Prompt for download location each time</span>
          </div>
          <ToggleSwitch checked={settings.askDownload} onChange={v => onChange('askDownload', v)} />
        </div>
      </div>
    </div>
  );
}

// ── Section: About ──
function AboutSection() {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title"><Icon d={SI.info} size={16} className="text-blue-400/60" /> About HeadyWeb</h3>
      <div className="settings-about">
        <div className="settings-about-logo">
          <span className="text-4xl">✦</span>
        </div>
        <div className="settings-about-info">
          <div className="text-lg font-semibold text-white">HeadyWeb Browser</div>
          <div className="text-sm text-white/40 mt-1">Version 1.0.0 (Official Build)</div>
          <div className="text-xs text-white/25 mt-0.5">Chromium 128.0.6613.120 + HeadyBrain AI</div>
          <div className="text-xs text-white/20 mt-2">Built by Heady Systems</div>
          <div className="flex gap-2 mt-3">
            <button className="settings-button">Check for Updates</button>
            <button className="settings-button">View Licenses</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toggle Switch Component ──
function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="ext-toggle">
      <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} />
      <span className="ext-toggle-slider" />
    </label>
  );
}

// ── Main Settings Component ──
export default function Settings({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General
    startup: 'newtab',
    homepage: 'headyweb://newtab',
    language: 'en',
    showBookmarks: true,
    // Privacy
    trackingProtection: 'standard',
    cookiePolicy: 'block-third',
    httpsOnly: true,
    doNotTrack: true,
    safeBrowsing: true,
    // Appearance
    theme: 'sacred-geometry',
    fontSize: 'medium',
    compactMode: false,
    showAnimations: true,
    // AI
    aiModel: 'heady-brain',
    searchProvider: 'heady-brain',
    autoSuggest: true,
    aiSummary: false,
    sidebarPosition: 'right',
    // Sync
    syncEnabled: true,
    syncBookmarks: true,
    syncHistory: true,
    syncTabs: false,
    syncExtensions: true,
    // Downloads
    downloadPath: '~/Downloads',
    askDownload: false,
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const sections = [
    { id: 'general', label: 'General', icon: SI.home },
    { id: 'privacy', label: 'Privacy & Security', icon: SI.shield },
    { id: 'appearance', label: 'Appearance', icon: SI.palette },
    { id: 'ai', label: 'AI Settings', icon: SI.sparkles },
    { id: 'sync', label: 'Sync', icon: SI.refresh },
    { id: 'downloads', label: 'Downloads', icon: SI.download },
    { id: 'extensions', label: 'Extensions', icon: SI.puzzle },
    { id: 'about', label: 'About HeadyWeb', icon: SI.info },
  ];

  return (
    <div className="internal-page">
      <div className="internal-page-header">
        <h1 className="internal-page-title">
          <span className="text-2xl mr-3">⚙️</span>
          Settings
        </h1>
        <p className="internal-page-subtitle">Customize your HeadyWeb experience</p>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          {sections.map(s => (
            <button key={s.id}
              className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => {
                if (s.id === 'extensions' && onNavigate) {
                  onNavigate('headyweb://extensions');
                } else {
                  setActiveSection(s.id);
                }
              }}>
              <Icon d={s.icon} size={14} />
              <span>{s.label}</span>
              <Icon d={SI.chevRight} size={12} className="ml-auto opacity-30" />
            </button>
          ))}
        </nav>

        <div className="settings-content">
          {activeSection === 'general' && <GeneralSettings settings={settings} onChange={handleChange} />}
          {activeSection === 'privacy' && <PrivacySettings settings={settings} onChange={handleChange} />}
          {activeSection === 'appearance' && <AppearanceSettings settings={settings} onChange={handleChange} />}
          {activeSection === 'ai' && <AISettings settings={settings} onChange={handleChange} />}
          {activeSection === 'sync' && <SyncSettings settings={settings} onChange={handleChange} />}
          {activeSection === 'downloads' && <DownloadSettings settings={settings} onChange={handleChange} />}
          {activeSection === 'about' && <AboutSection />}
        </div>
      </div>
    </div>
  );
}
