// Heady Ecosystem Site Registry — canonical source of truth
// Every surface in HeadyWeb (quick tiles, bookmarks, search links, knowledge base,
// allowed hosts, auth contract) consumes this registry rather than hardcoding URLs.

// ── Canonical site definitions ──
const HEADY_SITES = Object.freeze({
  headysystems: {
    id: 'headysystems',
    name: 'HeadySystems',
    url: 'https://headysystems.com',
    docsUrl: 'https://docs.headysystems.com',
    description: 'Architecture & infrastructure hub',
    icon: '⚙️',
    color: '#3b82f6',
    category: 'core',
  },
  headyme: {
    id: 'headyme',
    name: 'HeadyMe',
    url: 'https://headyme.com',
    description: 'Admin command center',
    icon: '👤',
    color: '#8b5cf6',
    category: 'core',
  },
  headybuddy: {
    id: 'headybuddy',
    name: 'HeadyBuddy',
    url: 'https://headybuddy.org',
    description: 'AI assistant',
    icon: '🤖',
    color: '#10b981',
    category: 'core',
  },
  headymcp: {
    id: 'headymcp',
    name: 'HeadyMCP',
    url: 'https://headymcp.com',
    description: 'API & tool integration',
    icon: '🔌',
    color: '#f59e0b',
    category: 'core',
  },
  headyio: {
    id: 'headyio',
    name: 'HeadyIO',
    url: 'https://headyio.com',
    description: 'Data & integration platform',
    icon: '🌐',
    color: '#06b6d4',
    category: 'core',
  },
  headyconnection: {
    id: 'headyconnection',
    name: 'HeadyConnection',
    url: 'https://headyconnection.org',
    description: 'Community platform',
    icon: '🤝',
    color: '#ec4899',
    category: 'core',
  },
  headyweb: {
    id: 'headyweb',
    name: 'HeadyWeb',
    url: 'https://headyweb.com',
    description: 'Intelligent browser',
    icon: '✦',
    color: '#6366f1',
    category: 'core',
  },
  headydocs: {
    id: 'headydocs',
    name: 'Heady Docs',
    url: 'https://docs.headysystems.com',
    description: 'Documentation & guides',
    icon: '📚',
    color: '#14b8a6',
    category: 'docs',
  },
});

// ── External (non-Heady) sites shown in quick tiles ──
const EXTERNAL_SITES = Object.freeze({
  google: { id: 'google', name: 'Google', url: 'https://google.com', icon: '🔍', color: '#4285f4', category: 'external' },
  github: { id: 'github', name: 'GitHub', url: 'https://github.com', icon: '🐙', color: '#8b949e', category: 'external' },
});

// ── API endpoints ──
const HEADY_API = Object.freeze({
  brainBase: 'https://manager.headysystems.com',
  brainChat: 'https://manager.headysystems.com/api/brain/chat',
  brainHealth: 'https://manager.headysystems.com/api/brain/health',
  source: 'headyweb-browser',
  version: '1.0.0',
});

// ── Auth contract ──
// Cross-site auth is Firebase-based. Each Heady site that shares auth must
// reference the same Firebase project and use these allowed origins.
const AUTH_CONTRACT = Object.freeze({
  provider: 'firebase',
  // Origins allowed to share the Firebase session / receive auth redirects.
  // Strict: no wildcards. Each entry is a full origin (scheme + host).
  allowedOrigins: [
    'https://headysystems.com',
    'https://www.headysystems.com',
    'https://headyweb.com',
    'https://www.headyweb.com',
    'https://headyme.com',
    'https://headybuddy.org',
    'https://headymcp.com',
    'https://headyio.com',
    'https://headyconnection.org',
    'https://docs.headysystems.com',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  // Firebase config sourced from env at runtime (no secrets in code).
  envKeys: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_ID',
    'VITE_FIREBASE_APP_ID',
  ],
  // User profile shape (Firestore: users/{uid})
  profileFields: ['email', 'displayName', 'photoURL', 'plan', 'searchCount', 'source', 'createdAt', 'lastLogin'],
  plans: ['free', 'pro', 'enterprise'],
  defaultPlan: 'free',
});

// ── Derived helpers ──

/** Sites shown as quick-access tiles on the new-tab page. */
function getQuickSites() {
  return [
    HEADY_SITES.headysystems,
    HEADY_SITES.headyme,
    HEADY_SITES.headybuddy,
    HEADY_SITES.headymcp,
    HEADY_SITES.headyio,
    HEADY_SITES.headyconnection,
    EXTERNAL_SITES.google,
    EXTERNAL_SITES.github,
  ];
}

/** Sites shown in the bookmarks bar. */
function getBookmarks() {
  return [
    HEADY_SITES.headysystems,
    HEADY_SITES.headyme,
    HEADY_SITES.headybuddy,
    HEADY_SITES.headymcp,
    HEADY_SITES.headydocs,
    EXTERNAL_SITES.github,
  ];
}

/** "Related Heady Services" links shown on search result pages. */
function getSearchResultLinks() {
  return [
    { ...HEADY_SITES.headybuddy, desc: 'Interactive AI chat' },
    { ...HEADY_SITES.headymcp, desc: 'API & tool integration' },
    { ...HEADY_SITES.headydocs, desc: 'Docs & guides' },
  ];
}

/** Hostnames for Vite allowedHosts (dev server). */
function getAllowedHosts() {
  const hosts = new Set(['localhost']);
  for (const site of Object.values(HEADY_SITES)) {
    try {
      const host = new URL(site.url).hostname;
      hosts.add(host);
      hosts.add(`www.${host}`);
      hosts.add(`web.${host}`);
    } catch { /* skip invalid */ }
  }
  return [...hosts];
}

/** Look up a site entry by id or partial name match. */
function findSite(idOrName) {
  const key = idOrName.toLowerCase().replace(/[^a-z]/g, '');
  return HEADY_SITES[key] || Object.values(HEADY_SITES).find(s =>
    s.name.toLowerCase().replace(/[^a-z]/g, '') === key
  ) || null;
}

export {
  HEADY_SITES,
  EXTERNAL_SITES,
  HEADY_API,
  AUTH_CONTRACT,
  getQuickSites,
  getBookmarks,
  getSearchResultLinks,
  getAllowedHosts,
  findSite,
};
