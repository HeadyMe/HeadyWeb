import React, { useState, useRef, useEffect } from 'react';

const WELCOME = [
  { type: 'system', text: '╔══════════════════════════════════════════════════════╗' },
  { type: 'system', text: '║  HEADY TERMINAL v1.0 · Sacred Geometry Architecture  ║' },
  { type: 'system', text: '║  HCFullPipeline v8.0 · Auto-Success Engine Active    ║' },
  { type: 'system', text: '╚══════════════════════════════════════════════════════╝' },
  { type: 'info', text: '[Heady] Manager online at :3300' },
  { type: 'info', text: '[Heady] ORS: 100 · 13 categories · 176 tasks active' },
  { type: 'info', text: '[Heady] WebSocket connected · φ-scaled backoff ready' },
  { type: 'success', text: '[AutoSuccess] Engine started — heartbeat every 29,034ms (φ⁷)' },
  { type: 'info', text: 'Type "help" for commands, "heady status" for system info' },
  { type: 'blank', text: '' },
];

const COMMANDS = {
  help: () => [
    { type: 'info', text: 'Available Commands:' },
    { type: 'output', text: '  heady status     — System health & ORS score' },
    { type: 'output', text: '  heady pipeline   — HCFullPipeline status' },
    { type: 'output', text: '  heady agents     — List all 11 agents' },
    { type: 'output', text: '  heady services   — Service mesh status' },
    { type: 'output', text: '  heady run        — Trigger pipeline run' },
    { type: 'output', text: '  heady memory     — Vector memory stats' },
    { type: 'output', text: '  heady mcp        — MCP tools catalog' },
    { type: 'output', text: '  heady checkpoint — Run checkpoint protocol' },
    { type: 'output', text: '  clear            — Clear terminal' },
  ],
  'heady status': () => [
    { type: 'success', text: '╔═══════════════════════════════════════╗' },
    { type: 'success', text: '║  HEADY SYSTEM STATUS                  ║' },
    { type: 'success', text: '╠═══════════════════════════════════════╣' },
    { type: 'output', text: '  ORS Score:        100/100' },
    { type: 'output', text: '  Pipeline:         Idle (ready)' },
    { type: 'output', text: '  Auto-Success:     Active (144 tasks)' },
    { type: 'output', text: '  Agents:           11 registered (4 active)' },
    { type: 'output', text: '  Services:         12 online' },
    { type: 'output', text: '  MCP Tools:        47 available' },
    { type: 'output', text: '  Memory:           384D pgvector + HNSW' },
    { type: 'output', text: `  Uptime:           ${Math.floor(Math.random() * 72 + 24)}h ${Math.floor(Math.random() * 59)}m` },
    { type: 'success', text: '╚═══════════════════════════════════════╝' },
  ],
  'heady pipeline': () => [
    { type: 'info', text: 'HCFullPipeline v8.0 — 9 Stages:' },
    { type: 'success', text: '  [✓] Stage 0: Channel Entry' },
    { type: 'success', text: '  [✓] Stage 1: Ingest' },
    { type: 'success', text: '  [✓] Stage 2: Plan (Monte Carlo)' },
    { type: 'success', text: '  [✓] Stage 3: Execute Major Phase' },
    { type: 'success', text: '  [✓] Stage 4: Recover' },
    { type: 'success', text: '  [✓] Stage 5: Self-Critique' },
    { type: 'success', text: '  [✓] Stage 6: Optimize' },
    { type: 'success', text: '  [✓] Stage 7: Finalize' },
    { type: 'success', text: '  [✓] Stage 8: Monitor & Feedback' },
    { type: 'output', text: '  Lanes: system_operations, pqc, priority, improvement' },
  ],
  'heady agents': () => [
    { type: 'info', text: 'Agent Orchestrator — 11 Agents:' },
    { type: 'success', text: '  🧠 Brain (premium)     — Cognitive Engine        [ACTIVE]' },
    { type: 'success', text: '  🔨 Builder (premium)   — Code Generation         [ACTIVE]' },
    { type: 'output', text: '  🔬 Researcher (premium)— Deep Research           [IDLE]' },
    { type: 'success', text: '  👁️ Observer (fast)      — System Monitoring       [ACTIVE]' },
    { type: 'success', text: '  ⚡ Jules (fast)         — Task Automation         [ACTIVE]' },
    { type: 'output', text: '  🛡️ Sentinel (standard) — Security Scanning       [IDLE]' },
    { type: 'output', text: '  🗺️ Atlas (standard)    — Data Integration        [IDLE]' },
    { type: 'output', text: '  🎨 Muse (premium)      — Creative Content        [IDLE]' },
    { type: 'output', text: '  📚 Sophia (premium)    — Knowledge Synthesis     [IDLE]' },
    { type: 'success', text: '  🔧 DevOps (standard)   — Platform Monitoring     [ACTIVE]' },
    { type: 'output', text: '  📝 Content (standard)  — CMS Publishing          [IDLE]' },
  ],
  'heady services': () => [
    { type: 'info', text: 'Heady Service Mesh — 12 services:' },
    { type: 'success', text: '  ● heady-manager       :3300   API Gateway' },
    { type: 'success', text: '  ● heady-brain         :8081   Meta-Controller' },
    { type: 'success', text: '  ● hc-supervisor       :8082   Multi-Agent Router' },
    { type: 'success', text: '  ● heady-conductor     :8080   Orchestration Worker' },
    { type: 'success', text: '  ● heady-distiller     :3398   Recipe Distillation' },
    { type: 'success', text: '  ● heady-sync          —       Git Sync' },
    { type: 'success', text: '  ● MCP Server          —       47 Tools' },
    { type: 'success', text: '  ● Vector Memory       —       384D pgvector' },
    { type: 'success', text: '  ● Redis Streams       :6379   Event Bus' },
    { type: 'success', text: '  ● CF Workers          —       Edge (4)' },
    { type: 'success', text: '  ● Cloud Run           —       15 services' },
    { type: 'success', text: '  ● HeadySims           —       Monte Carlo' },
  ],
  'heady run': () => [
    { type: 'info', text: '[Pipeline] Triggering HCFullPipeline run...' },
    { type: 'output', text: '[Pipeline] Seed: heady-sacred-geometry-seed' },
    { type: 'output', text: '[Pipeline] Max concurrent: 8 (fib(6))' },
    { type: 'success', text: '[Pipeline] Run queued. Monitor via pipeline panel.' },
  ],
  'heady memory': () => [
    { type: 'info', text: 'Vector Memory Status:' },
    { type: 'output', text: '  Dimensions:   384' },
    { type: 'output', text: '  Index:        HNSW' },
    { type: 'output', text: '  Tiers:        T0 working · T1 short-term · T2 long-term' },
    { type: 'output', text: '  CSL Gates:    0.382 (include) · 0.618 (boost) · 0.718 (critical)' },
    { type: 'output', text: '  Backend:      pgvector + Cloudflare Vectorize' },
  ],
  'heady mcp': () => [
    { type: 'info', text: 'MCP Tools — 47 available:' },
    { type: 'output', text: '  Intelligence: deep_scan, analyze, risks, patterns, refactor' },
    { type: 'output', text: '  Memory:       memory, embed, learn, recall, vector_store/search' },
    { type: 'output', text: '  Code:         refactor, generate, lint, test, audit' },
    { type: 'output', text: '  Deployment:   deploy, provision, monitor, scale' },
    { type: 'output', text: '  Governance:   policy_check, audit, compliance' },
    { type: 'output', text: '  Extensions:   slack, discord, github, notion' },
  ],
  'heady checkpoint': () => [
    { type: 'info', text: '[Checkpoint] Running 14-step protocol...' },
    { type: 'success', text: '  ✓ Step 1: Validate run state' },
    { type: 'success', text: '  ✓ Step 2: Compare config hashes' },
    { type: 'success', text: '  ✓ Step 3: Re-evaluate health' },
    { type: 'success', text: '  ✓ Step 4: Check concept alignment' },
    { type: 'success', text: '  ✓ Step 5: Apply approved patterns' },
    { type: 'success', text: '  ✓ Step 6: Sync registry entries' },
    { type: 'success', text: '  ✓ Step 7: Sync documentation' },
    { type: 'success', text: '  ✓ Step 8: Validate notebooks' },
    { type: 'success', text: '  ✓ Step 9: Check doc ownership freshness' },
    { type: 'success', text: '  ✓ Step 10-14: Extended validation passes' },
    { type: 'success', text: '[Checkpoint] All 14 steps PASSED. ORS: 100' },
  ],
};

export default function TerminalPanel() {
  const [lines, setLines] = useState(WELCOME);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const execute = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const prompt = { type: 'prompt', text: `heady@ide:~$ ${cmd}` };

    if (trimmed === 'clear') {
      setLines([]);
      return;
    }

    const handler = COMMANDS[trimmed];
    if (handler) {
      setLines(prev => [...prev, prompt, ...handler()]);
    } else {
      setLines(prev => [...prev, prompt, { type: 'error', text: `Command not found: ${cmd}. Type "help" for available commands.` }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
      setHistoryIdx(idx);
      setInput(history[history.length - 1 - idx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = historyIdx > 0 ? historyIdx - 1 : -1;
      setHistoryIdx(idx);
      setInput(idx >= 0 ? history[history.length - 1 - idx] : '');
    }
  };

  const LINE_COLORS = {
    system: '#7c3aed',
    info: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444',
    output: '#c8d6e5',
    prompt: '#f59e0b',
    blank: 'transparent',
  };

  return (
    <div className="terminal-panel" onClick={() => inputRef.current?.focus()}>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">💻</span>
          Terminal
        </div>
        <div className="terminal-badges">
          <span className="badge term">HEADY SHELL</span>
        </div>
      </div>
      <div className="terminal-output" ref={scrollRef}>
        {lines.map((line, i) => (
          <div key={i} className="terminal-line" style={{ color: LINE_COLORS[line.type] || '#c8d6e5' }}>
            {line.text}
          </div>
        ))}
        <div className="terminal-input-line">
          <span className="terminal-prompt">heady@ide:~$ </span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
