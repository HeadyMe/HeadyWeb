import React, { useState, useRef, useEffect, useCallback } from 'react';

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const DT = {
  x: 'M18 6L6 18M6 6l12 12',
  chevDown: 'M6 9l6 6 6-6',
  chevRight: 'M9 6l6 6-6 6',
  trash: 'M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  search: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  sparkles: 'M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  zap: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z',
};

// ── Elements Panel ──
function ElementsPanel() {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['html', 'body', 'div#root']));
  const [selectedNode, setSelectedNode] = useState(null);

  const sampleDOM = [
    { tag: 'html', id: 'html', attrs: { lang: 'en' }, children: [
      { tag: 'head', id: 'head', children: [
        { tag: 'meta', id: 'meta-charset', attrs: { charset: 'UTF-8' }, selfClosing: true },
        { tag: 'title', id: 'title', text: 'HeadyWeb Browser' },
        { tag: 'link', id: 'link-css', attrs: { rel: 'stylesheet', href: '/src/index.css' }, selfClosing: true },
      ]},
      { tag: 'body', id: 'body', children: [
        { tag: 'div', id: 'div#root', attrs: { id: 'root' }, children: [
          { tag: 'div', id: 'app-shell', attrs: { class: 'flex flex-col h-screen bg-[#06091a]' }, children: [
            { tag: 'div', id: 'tab-bar', attrs: { class: 'tab-bar' }, text: '...' },
            { tag: 'div', id: 'address-bar', attrs: { class: 'address-bar' }, text: '...' },
            { tag: 'div', id: 'content', attrs: { class: 'flex-1 relative overflow-hidden' }, text: '...' },
          ]},
        ]},
      ]},
    ]},
  ];

  const toggleNode = (id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode === node.id;
    const indent = depth * 16;

    return (
      <div key={node.id}>
        <div className={`dt-element-row ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: indent + 8 }}
          onClick={() => setSelectedNode(node.id)}>
          {hasChildren && (
            <button className="dt-expand-btn" onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}>
              <Icon d={isExpanded ? DT.chevDown : DT.chevRight} size={10} />
            </button>
          )}
          {!hasChildren && <span style={{ width: 16 }} />}
          <span className="dt-tag">&lt;{node.tag}</span>
          {node.attrs && Object.entries(node.attrs).map(([k, v]) => (
            <span key={k}>
              <span className="dt-attr-name"> {k}</span>
              <span className="dt-attr-eq">=</span>
              <span className="dt-attr-val">"{v}"</span>
            </span>
          ))}
          <span className="dt-tag">{node.selfClosing ? ' />' : '>'}</span>
          {node.text && !hasChildren && <span className="dt-text">{node.text}</span>}
          {node.text && !hasChildren && <span className="dt-tag">&lt;/{node.tag}&gt;</span>}
        </div>
        {hasChildren && isExpanded && (
          <>
            {node.children.map(child => renderNode(child, depth + 1))}
            <div className="dt-element-row" style={{ paddingLeft: indent + 8 }}>
              <span style={{ width: 16 }} />
              <span className="dt-tag">&lt;/{node.tag}&gt;</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="dt-panel-content">
      <div className="dt-elements-tree">
        {sampleDOM.map(node => renderNode(node))}
      </div>
      {selectedNode && (
        <div className="dt-styles-panel">
          <div className="dt-section-title">Computed Styles</div>
          <div className="dt-style-row"><span className="dt-prop">display</span><span className="dt-val">flex</span></div>
          <div className="dt-style-row"><span className="dt-prop">flex-direction</span><span className="dt-val">column</span></div>
          <div className="dt-style-row"><span className="dt-prop">background</span><span className="dt-val">#06091a</span></div>
          <div className="dt-style-row"><span className="dt-prop">color</span><span className="dt-val">#ffffff</span></div>
          <div className="dt-style-row"><span className="dt-prop">font-family</span><span className="dt-val">Inter, system-ui</span></div>
          <div className="dt-style-row"><span className="dt-prop">height</span><span className="dt-val">100vh</span></div>
        </div>
      )}
    </div>
  );
}

// ── Console Panel ──
function ConsolePanel() {
  const [logs, setLogs] = useState([
    { level: 'info', text: '[HeadyWeb] Browser initialized', time: '12:00:00' },
    { level: 'info', text: '[HeadyWeb] Sacred Geometry engine loaded', time: '12:00:01' },
    { level: 'log', text: '[HeadyBrain] Connection established to manager.headysystems.com', time: '12:00:02' },
    { level: 'warn', text: '[Firebase] Using placeholder credentials — demo mode active', time: '12:00:02' },
    { level: 'info', text: '[HCFP] Core functionality platform enforced', time: '12:00:03' },
    { level: 'log', text: '[HeadyBattle] Verification system online', time: '12:00:03' },
  ]);
  const [filter, setFilter] = useState('all');
  const [input, setInput] = useState('');
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { level: 'command', text: `> ${input}`, time: now }]);

    let result;
    try {
      if (input === 'clear') {
        setLogs([]);
        setInput('');
        return;
      }
      if (input.startsWith('heady.')) {
        result = `[HeadyBrain] Command "${input}" routed to AI processing...`;
      } else {
        result = String(eval(input)); // eslint-disable-line no-eval
      }
    } catch (err) {
      result = `Error: ${err.message}`;
      setLogs(prev => [...prev, { level: 'error', text: result, time: now }]);
      setInput('');
      return;
    }
    setLogs(prev => [...prev, { level: 'result', text: result, time: now }]);
    setInput('');
  };

  const levelColors = {
    log: 'text-white/70',
    info: 'text-blue-400/80',
    warn: 'text-yellow-400/80',
    error: 'text-red-400/80',
    command: 'text-cyan-400/80',
    result: 'text-green-400/70',
  };

  const levelBg = {
    warn: 'bg-yellow-500/5 border-l-2 border-yellow-500/30',
    error: 'bg-red-500/5 border-l-2 border-red-500/30',
  };

  return (
    <div className="dt-panel-content flex flex-col">
      <div className="dt-console-toolbar">
        <div className="flex gap-1">
          {['all', 'log', 'info', 'warn', 'error'].map(level => (
            <button key={level} className={`dt-filter-btn ${filter === level ? 'active' : ''}`}
              onClick={() => setFilter(level)}>
              {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <button className="dt-filter-btn" onClick={() => setLogs([])}>
          <Icon d={DT.trash} size={12} /> Clear
        </button>
      </div>
      <div className="dt-console-logs">
        {filteredLogs.map((log, i) => (
          <div key={i} className={`dt-log-entry ${levelColors[log.level]} ${levelBg[log.level] || ''}`}>
            <span className="dt-log-time">{log.time}</span>
            <span className="dt-log-text">{log.text}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
      <form onSubmit={handleCommand} className="dt-console-input-row">
        <span className="text-blue-400/60 text-xs mr-1">&gt;</span>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Execute JavaScript..."
          className="dt-console-input" />
      </form>
    </div>
  );
}

// ── Network Panel ──
function NetworkPanel() {
  const [requests] = useState([
    { id: 1, method: 'GET', url: 'https://manager.headysystems.com/api/brain/health', status: 200, type: 'fetch', size: '124 B', time: '45ms', headers: { 'content-type': 'application/json' } },
    { id: 2, method: 'GET', url: 'https://fonts.googleapis.com/css2?family=Inter', status: 200, type: 'stylesheet', size: '4.2 KB', time: '120ms', headers: { 'content-type': 'text/css' } },
    { id: 3, method: 'POST', url: 'https://manager.headysystems.com/api/brain/chat', status: 200, type: 'fetch', size: '1.8 KB', time: '890ms', headers: { 'content-type': 'application/json' } },
    { id: 4, method: 'GET', url: '/src/index.css', status: 200, type: 'stylesheet', size: '8.1 KB', time: '12ms', headers: { 'content-type': 'text/css' } },
    { id: 5, method: 'GET', url: '/src/main.jsx', status: 200, type: 'script', size: '0.4 KB', time: '8ms', headers: { 'content-type': 'application/javascript' } },
    { id: 6, method: 'GET', url: '/src/App.jsx', status: 200, type: 'script', size: '22.3 KB', time: '15ms', headers: { 'content-type': 'application/javascript' } },
    { id: 7, method: 'GET', url: '/favicon.svg', status: 304, type: 'image', size: '0 B', time: '3ms', headers: {} },
  ]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const filtered = filterType === 'all' ? requests : requests.filter(r => r.type === filterType);

  const statusColor = (s) => {
    if (s >= 200 && s < 300) return 'text-green-400';
    if (s >= 300 && s < 400) return 'text-blue-400';
    if (s >= 400) return 'text-red-400';
    return 'text-white/60';
  };

  return (
    <div className="dt-panel-content flex flex-col">
      <div className="dt-console-toolbar">
        <div className="flex gap-1">
          {['all', 'fetch', 'script', 'stylesheet', 'image'].map(t => (
            <button key={t} className={`dt-filter-btn ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-xs text-white/25">{filtered.length} requests</span>
      </div>
      <div className="dt-network-table">
        <div className="dt-network-header">
          <span className="dt-net-col-name">Name</span>
          <span className="dt-net-col-status">Status</span>
          <span className="dt-net-col-type">Type</span>
          <span className="dt-net-col-size">Size</span>
          <span className="dt-net-col-time">Time</span>
        </div>
        {filtered.map(req => (
          <div key={req.id} className={`dt-network-row ${selectedReq === req.id ? 'selected' : ''}`}
            onClick={() => setSelectedReq(selectedReq === req.id ? null : req.id)}>
            <span className="dt-net-col-name">
              <span className="text-xs text-purple-400/60 mr-1">{req.method}</span>
              <span className="truncate">{req.url.split('/').pop() || req.url}</span>
            </span>
            <span className={`dt-net-col-status ${statusColor(req.status)}`}>{req.status}</span>
            <span className="dt-net-col-type">{req.type}</span>
            <span className="dt-net-col-size">{req.size}</span>
            <span className="dt-net-col-time">{req.time}</span>
          </div>
        ))}
      </div>
      {selectedReq && (
        <div className="dt-request-detail">
          {(() => {
            const req = requests.find(r => r.id === selectedReq);
            if (!req) return null;
            return (
              <>
                <div className="dt-section-title">Request Details</div>
                <div className="dt-style-row"><span className="dt-prop">URL</span><span className="dt-val text-xs">{req.url}</span></div>
                <div className="dt-style-row"><span className="dt-prop">Method</span><span className="dt-val">{req.method}</span></div>
                <div className="dt-style-row"><span className="dt-prop">Status</span><span className={`dt-val ${statusColor(req.status)}`}>{req.status}</span></div>
                <div className="dt-section-title mt-2">Response Headers</div>
                {Object.entries(req.headers).map(([k, v]) => (
                  <div key={k} className="dt-style-row"><span className="dt-prop">{k}</span><span className="dt-val">{v}</span></div>
                ))}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ── Performance Panel ──
function PerformancePanel() {
  const metrics = [
    { label: 'First Contentful Paint', value: '0.4s', score: 'good' },
    { label: 'Largest Contentful Paint', value: '0.8s', score: 'good' },
    { label: 'Time to Interactive', value: '1.1s', score: 'good' },
    { label: 'Cumulative Layout Shift', value: '0.01', score: 'good' },
    { label: 'Total Blocking Time', value: '50ms', score: 'good' },
    { label: 'Speed Index', value: '0.9s', score: 'good' },
  ];

  const scoreColor = { good: 'text-green-400', needs: 'text-yellow-400', poor: 'text-red-400' };
  const scoreBg = { good: 'bg-green-500/10', needs: 'bg-yellow-500/10', poor: 'bg-red-500/10' };

  return (
    <div className="dt-panel-content">
      <div className="dt-perf-grid">
        <div className="dt-perf-score-circle">
          <div className="dt-perf-ring good">
            <span className="dt-perf-number">98</span>
          </div>
          <div className="text-xs text-white/40 mt-2">Performance Score</div>
        </div>
        <div className="dt-perf-metrics">
          {metrics.map((m, i) => (
            <div key={i} className="dt-perf-metric">
              <div className="flex items-center gap-2">
                <span className={`dt-perf-dot ${scoreBg[m.score]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.score === 'good' ? 'bg-green-400' : m.score === 'needs' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                </span>
                <span className="text-xs text-white/60">{m.label}</span>
              </div>
              <span className={`text-xs font-mono ${scoreColor[m.score]}`}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="dt-section-title mt-4">Memory Usage</div>
      <div className="dt-memory-bars">
        <div className="dt-mem-bar">
          <span className="dt-mem-label">JS Heap</span>
          <div className="dt-mem-track"><div className="dt-mem-fill" style={{ width: '35%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} /></div>
          <span className="dt-mem-value">14.2 MB</span>
        </div>
        <div className="dt-mem-bar">
          <span className="dt-mem-label">DOM Nodes</span>
          <div className="dt-mem-track"><div className="dt-mem-fill" style={{ width: '15%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} /></div>
          <span className="dt-mem-value">342</span>
        </div>
        <div className="dt-mem-bar">
          <span className="dt-mem-label">Listeners</span>
          <div className="dt-mem-track"><div className="dt-mem-fill" style={{ width: '8%', background: 'linear-gradient(90deg, #f59e0b, #f97316)' }} /></div>
          <span className="dt-mem-value">47</span>
        </div>
      </div>
    </div>
  );
}

// ── HeadyAI Panel ──
function HeadyAIPanel() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'I can analyze your page, suggest optimizations, debug issues, and help with code. What would you like me to look at?' }
  ]);
  const [input, setInput] = useState('');

  const suggestions = [
    'Analyze page performance',
    'Find accessibility issues',
    'Suggest CSS improvements',
    'Explain this DOM structure',
    'Debug network errors',
  ];

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);

    // Simulated AI response
    setTimeout(() => {
      const responses = {
        'Analyze page performance': 'Page performance looks excellent. FCP is 0.4s and LCP is 0.8s. The Sacred Geometry canvas animation is GPU-accelerated. Consider lazy-loading the Firebase SDK to reduce initial bundle by ~40KB.',
        'Find accessibility issues': 'Found 3 issues:\n1. Missing alt text on quick-access tile images\n2. Tab close buttons need aria-label="Close tab"\n3. Search input needs aria-describedby for screen readers',
        'Suggest CSS improvements': 'Recommendations:\n1. Replace backdrop-blur-xl with backdrop-blur-md for 30% GPU savings\n2. Consolidate 4 similar gradient backgrounds into CSS custom properties\n3. Use contain: layout for tab bar to prevent relayout cascades',
      };
      const resp = responses[msg] || `Analyzing "${msg}"... HeadyBrain suggests checking the network tab for related requests and reviewing the DOM structure in Elements. I can provide more specific analysis if you share the relevant code.`;
      setMessages(prev => [...prev, { role: 'assistant', text: resp }]);
    }, 800);
  };

  return (
    <div className="dt-panel-content flex flex-col">
      <div className="dt-ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`dt-ai-msg ${m.role}`}>
            {m.role === 'assistant' && <span className="text-blue-400/60 text-xs font-medium mb-1 block">HeadyAI DevTools</span>}
            <div className="whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}
      </div>
      {messages.length <= 1 && (
        <div className="dt-ai-suggestions">
          {suggestions.map((s, i) => (
            <button key={i} className="dt-ai-suggestion-chip" onClick={() => handleSend(s)}>
              <Icon d={DT.sparkles} size={10} className="text-blue-400/60" />
              {s}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="dt-ai-input-row">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask HeadyAI about this page..."
          className="dt-console-input" />
        <button type="submit" className="dt-ai-send-btn">
          <Icon d={DT.zap} size={12} />
        </button>
      </form>
    </div>
  );
}

// ── Main DevTools Component ──
export default function DevTools({ open, onClose, onResize }) {
  const [activePanel, setActivePanel] = useState('elements');
  const [height, setHeight] = useState(320);
  const resizing = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const panels = [
    { id: 'elements', label: 'Elements' },
    { id: 'console', label: 'Console' },
    { id: 'network', label: 'Network' },
    { id: 'performance', label: 'Performance' },
    { id: 'headyai', label: 'HeadyAI' },
  ];

  const handleResizeStart = (e) => {
    resizing.current = true;
    startY.current = e.clientY;
    startH.current = height;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!resizing.current) return;
      const delta = startY.current - e.clientY;
      const newH = Math.max(150, Math.min(window.innerHeight * 0.7, startH.current + delta));
      setHeight(newH);
    };
    const handleUp = () => {
      resizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [height]);

  if (!open) return null;

  return (
    <div className="devtools-container" style={{ height }}>
      <div className="devtools-resize-handle" onMouseDown={handleResizeStart} />
      <div className="devtools-header">
        <div className="devtools-tabs">
          {panels.map(p => (
            <button key={p.id}
              className={`devtools-tab ${activePanel === p.id ? 'active' : ''}`}
              onClick={() => setActivePanel(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-white/20 mr-2">HeadyWeb DevTools</span>
          <button className="nav-btn" onClick={onClose}>
            <Icon d={DT.x} size={14} />
          </button>
        </div>
      </div>
      <div className="devtools-body">
        {activePanel === 'elements' && <ElementsPanel />}
        {activePanel === 'console' && <ConsolePanel />}
        {activePanel === 'network' && <NetworkPanel />}
        {activePanel === 'performance' && <PerformancePanel />}
        {activePanel === 'headyai' && <HeadyAIPanel />}
      </div>
    </div>
  );
}
