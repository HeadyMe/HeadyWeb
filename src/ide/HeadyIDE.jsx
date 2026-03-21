/**
 * HeadyAI-IDE — The Intelligent Web IDE
 * Powered by Sacred Geometry · HCFullPipeline v8.0 · Auto-Success Engine
 *
 * Full-featured AI IDE wired to the entire Heady ecosystem:
 * - Code Editor with syntax highlighting
 * - Integrated Terminal with Heady commands
 * - File Explorer connected to HeadyMonorepo
 * - HCFullPipeline monitor (9 stages + 4 lanes)
 * - Auto-Success Engine dashboard (13 categories, 176 tasks)
 * - Agent Orchestrator (11 agents with CSL routing)
 * - HeadyBuddy AI Chat (Brain + HCFP)
 * - Vector Memory search (384D pgvector)
 * - Service Mesh monitor (12 services)
 * - MCP Tools panel (47 tools)
 * - Real-time WebSocket with φ-scaled reconnect
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  useHeadyHealth,
  useAutoSuccess,
  usePipeline,
  useAgents,
  useMCPTools,
  useVectorMemory,
  useHeadyChat,
  useRealtime,
} from './hooks/useHeadyServices';
import EditorPanel from './panels/EditorPanel';
import TerminalPanel from './panels/TerminalPanel';
import FileTreePanel from './panels/FileTreePanel';
import PipelinePanel from './panels/PipelinePanel';
import AutoSuccessPanel from './panels/AutoSuccessPanel';
import AgentPanel from './panels/AgentPanel';
import ChatPanel from './panels/ChatPanel';
import MemoryPanel from './panels/MemoryPanel';
import ServicesPanel from './panels/ServicesPanel';

const ACTIVITY_ITEMS = [
  { id: 'explorer', icon: '📂', label: 'Explorer', shortcut: 'Ctrl+1' },
  { id: 'editor', icon: '✏️', label: 'Editor', shortcut: 'Ctrl+2' },
  { id: 'pipeline', icon: '🔷', label: 'Pipeline', shortcut: 'Ctrl+3' },
  { id: 'agents', icon: '🤖', label: 'Agents', shortcut: 'Ctrl+4' },
  { id: 'services', icon: '🏗️', label: 'Services', shortcut: 'Ctrl+5' },
  { id: 'memory', icon: '🧠', label: 'Memory', shortcut: 'Ctrl+6' },
  { id: 'auto-success', icon: '🌟', label: 'Auto-Success', shortcut: 'Ctrl+7' },
  { id: 'buddy', icon: '💬', label: 'HeadyBuddy', shortcut: 'Ctrl+8' },
  { id: 'terminal', icon: '💻', label: 'Terminal', shortcut: 'Ctrl+9' },
];

export default function HeadyIDE({ onBack }) {
  const [activePanel, setActivePanel] = useState('editor');
  const [sidebarPanel, setSidebarPanel] = useState('explorer');
  const [rightPanel, setRightPanel] = useState('buddy');
  const [bottomPanel, setBottomPanel] = useState('terminal');
  const [showBottom, setShowBottom] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  // Wire all Heady services
  const health = useHeadyHealth();
  const autoSuccess = useAutoSuccess();
  const pipeline = usePipeline();
  const agents = useAgents();
  const mcpTools = useMCPTools();
  const memory = useVectorMemory();
  const chat = useHeadyChat();
  const realtime = useRealtime(['pipeline', 'agents', 'auto-success', 'health']);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (ACTIVITY_ITEMS[idx]) setActivePanel(ACTIVITY_ITEMS[idx].id);
      }
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setShowBottom(prev => !prev);
      }
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderMainPanel = () => {
    switch (activePanel) {
      case 'editor': return <EditorPanel />;
      case 'pipeline': return <PipelinePanel pipeline={pipeline} />;
      case 'agents': return <AgentPanel agents={agents} />;
      case 'services': return <ServicesPanel />;
      case 'memory': return <MemoryPanel memory={memory} />;
      case 'auto-success': return <AutoSuccessPanel autoSuccess={autoSuccess} />;
      case 'buddy': return <ChatPanel chat={chat} />;
      case 'explorer': return <EditorPanel />;
      case 'terminal': return <TerminalPanel />;
      default: return <EditorPanel />;
    }
  };

  const renderSidebarContent = () => {
    switch (sidebarPanel) {
      case 'explorer': return <FileTreePanel />;
      case 'agents': return <AgentPanel agents={agents} />;
      case 'services': return <ServicesPanel />;
      default: return <FileTreePanel />;
    }
  };

  const orsColor = (autoSuccess.ors || 100) >= 85 ? '#22c55e' : (autoSuccess.ors || 100) >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="heady-ide">
      {/* Title Bar */}
      <div className="ide-titlebar">
        <div className="titlebar-left">
          {onBack && (
            <button className="ide-back-btn" onClick={onBack} title="Back to HeadyWeb">
              ←
            </button>
          )}
          <span className="ide-logo breathing-pulse">∞</span>
          <span className="ide-title">HeadyAI-IDE</span>
          <span className="ide-version">v1.0</span>
        </div>
        <div className="titlebar-center">
          <div className="context-tabs">
            <button className="ctx-tab active">HeadyAI-IDE</button>
            <button className="ctx-tab" onClick={() => setActivePanel('pipeline')}>Pipeline</button>
            <button className="ctx-tab" onClick={() => setActivePanel('auto-success')}>Auto-Success</button>
          </div>
        </div>
        <div className="titlebar-right">
          <span className="ws-indicator" style={{ color: realtime.connected ? '#22c55e' : '#ef4444' }}>
            {realtime.connected ? '● Connected' : '○ Offline'}
          </span>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="ide-body">
        {/* Activity Bar */}
        <div className="ide-activity-bar">
          {ACTIVITY_ITEMS.map(item => (
            <button
              key={item.id}
              className={`activity-btn ${activePanel === item.id ? 'active' : ''}`}
              onClick={() => {
                if (['explorer', 'agents', 'services'].includes(item.id)) {
                  setSidebarPanel(item.id);
                  setShowSidebar(true);
                } else if (item.id === 'terminal') {
                  setShowBottom(true);
                  setBottomPanel('terminal');
                } else if (item.id === 'buddy') {
                  setShowRight(true);
                  setRightPanel('buddy');
                } else {
                  setActivePanel(item.id);
                }
              }}
              title={`${item.label} (${item.shortcut})`}
            >
              <span className="activity-icon">{item.icon}</span>
              {activePanel === item.id && <div className="activity-indicator" />}
            </button>
          ))}
          <div className="activity-spacer" />
          <button className="activity-btn settings" title="Settings">
            <span className="activity-icon">⚙️</span>
          </button>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="ide-sidebar">
            {renderSidebarContent()}
          </div>
        )}

        {/* Center (Editor + Bottom) */}
        <div className="ide-center">
          <div className="ide-main-panel">
            {renderMainPanel()}
          </div>
          {showBottom && (
            <div className="ide-bottom-panel">
              <TerminalPanel />
            </div>
          )}
        </div>

        {/* Right Panel */}
        {showRight && (
          <div className="ide-right-panel">
            {rightPanel === 'buddy' ? (
              <ChatPanel chat={chat} />
            ) : rightPanel === 'pipeline' ? (
              <PipelinePanel pipeline={pipeline} />
            ) : (
              <AutoSuccessPanel autoSuccess={autoSuccess} />
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="ide-statusbar">
        <div className="statusbar-left">
          <span className="status-item" style={{ background: orsColor }}>
            ORS {autoSuccess.ors || 100}
          </span>
          <span className="status-item">
            <span className="status-dot" style={{ background: health.status === 'demo-mode' || health.status === 'ok' ? '#22c55e' : '#f59e0b' }} />
            {health.status === 'demo-mode' ? 'Demo Mode' : 'Online'}
          </span>
          <span className="status-item">Pipeline: {pipeline.status}</span>
          <span className="status-item">ASE: {autoSuccess.engine || 'active'}</span>
        </div>
        <div className="statusbar-right">
          <span className="status-item">Agents: {agents.filter(a => a.status === 'active').length}/{agents.length}</span>
          <span className="status-item">MCP: {mcpTools.tools.length} tools</span>
          <span className="status-item">Memory: {memory.dimensions}D</span>
          <span className="status-item">φ = 1.618</span>
          <span className="status-item heady-brand">Heady v4.1.0</span>
        </div>
      </div>
    </div>
  );
}
