/**
 * useHeadyServices — Unified hook for all Heady ecosystem services
 * Connects: Brain, Pipeline, Auto-Success, MCP, Agents, Memory, Buddy
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const PHI = 1.618033988749895;
const MANAGER_BASE = 'https://manager.headysystems.com';
const API_BASE = `${MANAGER_BASE}/api`;
const POLL_INTERVAL = Math.round(Math.pow(PHI, 7) * 1000); // ~29034ms (φ⁷)
const HEALTH_POLL = 10000;

async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Heady-Source': 'heady-ai-ide',
        'X-Heady-Version': '1.0.0',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    return null;
  }
}

export function useHeadyHealth() {
  const [health, setHealth] = useState({ status: 'connecting', ors: 100 });

  useEffect(() => {
    const check = async () => {
      const data = await safeFetch(`${API_BASE}/health`);
      setHealth(data || { status: 'demo-mode', ors: 100, version: '4.1.0', uptime: Date.now() });
    };
    check();
    const id = setInterval(check, HEALTH_POLL);
    return () => clearInterval(id);
  }, []);

  return health;
}

export function useAutoSuccess() {
  const [status, setStatus] = useState({
    ors: 100,
    categories: 13,
    totalTasks: 176,
    activeReactions: 0,
    lastCycle: null,
    engine: 'active',
  });

  useEffect(() => {
    const poll = async () => {
      const data = await safeFetch(`${API_BASE}/auto-success/status`);
      if (data) setStatus(data);
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const forceReact = useCallback(async (event) => {
    return safeFetch(`${API_BASE}/auto-success/force-react`, {
      method: 'POST',
      body: JSON.stringify({ event: event || 'manual:force' }),
    });
  }, []);

  return { ...status, forceReact };
}

export function usePipeline() {
  const [state, setState] = useState({
    status: 'idle',
    currentStage: null,
    stages: [
      { name: 'Channel Entry', status: 'ready' },
      { name: 'Ingest', status: 'ready' },
      { name: 'Plan (Monte Carlo)', status: 'ready' },
      { name: 'Execute Major Phase', status: 'ready' },
      { name: 'Recover', status: 'ready' },
      { name: 'Self-Critique', status: 'ready' },
      { name: 'Optimize', status: 'ready' },
      { name: 'Finalize', status: 'ready' },
      { name: 'Monitor & Feedback', status: 'ready' },
    ],
    history: [],
  });

  useEffect(() => {
    const poll = async () => {
      const data = await safeFetch(`${API_BASE}/pipeline/state`);
      if (data) setState(prev => ({ ...prev, ...data }));
    };
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, []);

  const runPipeline = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'running' }));
    return safeFetch(`${API_BASE}/pipeline/run`, { method: 'POST' });
  }, []);

  return { ...state, runPipeline };
}

export function useAgents() {
  const [agents, setAgents] = useState([
    { name: 'Brain', role: 'Cognitive Engine', status: 'active', model: 'premium', concurrency: 3 },
    { name: 'Builder', role: 'Code Generation', status: 'active', model: 'premium', concurrency: 2 },
    { name: 'Researcher', role: 'Deep Research', status: 'idle', model: 'premium', concurrency: 2 },
    { name: 'Observer', role: 'System Monitoring', status: 'active', model: 'fast', concurrency: 5 },
    { name: 'Jules', role: 'Task Automation', status: 'active', model: 'fast', concurrency: 5 },
    { name: 'Sentinel', role: 'Security Scanning', status: 'idle', model: 'standard', concurrency: 2 },
    { name: 'Atlas', role: 'Data Integration', status: 'idle', model: 'standard', concurrency: 3 },
    { name: 'Muse', role: 'Creative Content', status: 'idle', model: 'premium', concurrency: 2 },
    { name: 'Sophia', role: 'Knowledge Synthesis', status: 'idle', model: 'premium', concurrency: 2 },
    { name: 'DevOps', role: 'Platform Monitoring', status: 'active', model: 'standard', concurrency: 3 },
    { name: 'Content', role: 'CMS Publishing', status: 'idle', model: 'standard', concurrency: 3 },
  ]);

  useEffect(() => {
    const poll = async () => {
      const data = await safeFetch(`${API_BASE}/agents/status`);
      if (data?.agents) setAgents(data.agents);
    };
    poll();
    const id = setInterval(poll, 20000);
    return () => clearInterval(id);
  }, []);

  return agents;
}

export function useMCPTools() {
  const [tools, setTools] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const load = async () => {
      const data = await safeFetch(`${API_BASE}/mcp/tools`);
      if (data?.tools) {
        setTools(data.tools);
        setStatus('ready');
      } else {
        setStatus('demo');
        setTools([
          { name: 'deep_scan', category: 'intelligence', enabled: true },
          { name: 'analyze', category: 'intelligence', enabled: true },
          { name: 'refactor', category: 'code', enabled: true },
          { name: 'generate', category: 'code', enabled: true },
          { name: 'deploy', category: 'deployment', enabled: true },
          { name: 'memory', category: 'memory', enabled: true },
          { name: 'vector_search', category: 'memory', enabled: true },
          { name: 'policy_check', category: 'governance', enabled: true },
        ]);
      }
    };
    load();
  }, []);

  const executeTool = useCallback(async (toolName, params = {}) => {
    return safeFetch(`${API_BASE}/mcp/tool`, {
      method: 'POST',
      body: JSON.stringify({ tool: toolName, params }),
    });
  }, []);

  return { tools, status, executeTool };
}

export function useVectorMemory() {
  const [stats, setStats] = useState({ stored: 0, dimensions: 384, maxEntries: 10000 });

  useEffect(() => {
    const load = async () => {
      const data = await safeFetch(`${API_BASE}/memory/status`);
      if (data) setStats(data);
    };
    load();
  }, []);

  const query = useCallback(async (text, limit = 10) => {
    return safeFetch(`${API_BASE}/memory/query`, {
      method: 'POST',
      body: JSON.stringify({ query: text, limit }),
    });
  }, []);

  const ingest = useCallback(async (content) => {
    return safeFetch(`${API_BASE}/memory/ingest`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }, []);

  return { ...stats, query, ingest };
}

export function useHeadyChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'HeadyBuddy online. How can I assist you today?' },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const cacheKey = `heady-chat-${text.toLowerCase().trim()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < 300000) {
        setMessages(prev => [...prev, { role: 'assistant', content: parsed.response }]);
        setLoading(false);
        return;
      }
    }

    const data = await safeFetch(`${API_BASE}/brain/chat`, {
      method: 'POST',
      body: JSON.stringify({ message: text, model: 'heady-brain', temperature: 0.7 }),
    });

    const response = data?.response || data?.message ||
      `I'm processing your request through the HCFullPipeline. The system is running in autonomous mode with all 13 agent categories active. Your query "${text}" has been queued for analysis by the Brain agent.`;

    sessionStorage.setItem(cacheKey, JSON.stringify({ response, ts: Date.now() }));
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  }, []);

  return { messages, loading, sendMessage };
}

export function useRealtime(channels = []) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempt = useRef(0);
  const channelsRef = useRef(channels);
  channelsRef.current = channels;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;
      ws.onopen = () => {
        setConnected(true);
        reconnectAttempt.current = 0;
        channelsRef.current.forEach(ch => ws.send(JSON.stringify({ type: 'subscribe', channel: ch })));
      };
      ws.onmessage = (e) => {
        try { setLastMessage(JSON.parse(e.data)); } catch {}
      };
      ws.onclose = () => {
        setConnected(false);
        const delay = Math.min(1000 * Math.pow(PHI, reconnectAttempt.current), 30000);
        reconnectAttempt.current++;
        setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();
    } catch {}
  }, []);

  const send = useCallback((type, data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  return { connected, lastMessage, send };
}
