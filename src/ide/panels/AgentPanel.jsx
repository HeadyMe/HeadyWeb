import React from 'react';

const MODEL_COLORS = {
  premium: '#a78bfa',
  standard: '#3b82f6',
  fast: '#22c55e',
};

export default function AgentPanel({ agents }) {
  const activeCount = agents.filter(a => a.status === 'active').length;

  return (
    <div className="agent-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🤖</span>
          Agent Orchestrator
        </div>
        <span className="agent-count">{activeCount}/{agents.length} active</span>
      </div>
      <div className="agent-grid">
        {agents.map((agent, i) => (
          <div key={i} className={`agent-card ${agent.status}`}>
            <div className="agent-header-row">
              <span className={`agent-status-dot ${agent.status}`} />
              <span className="agent-name">{agent.name}</span>
              <span className="agent-model" style={{ color: MODEL_COLORS[agent.model] || '#64748b' }}>
                {agent.model}
              </span>
            </div>
            <div className="agent-role">{agent.role}</div>
            <div className="agent-meta">
              <span>Concurrency: {agent.concurrency}</span>
              <span className={`agent-status-tag ${agent.status}`}>{agent.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
