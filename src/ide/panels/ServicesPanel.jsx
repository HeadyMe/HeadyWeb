import React from 'react';

const SERVICES = [
  { name: 'heady-manager', port: 3300, status: 'running', type: 'API Gateway', icon: '🌐' },
  { name: 'heady-brain', port: 8081, status: 'running', type: 'Meta-Controller', icon: '🧠' },
  { name: 'hc-supervisor', port: 8082, status: 'running', type: 'Multi-Agent Router', icon: '🎯' },
  { name: 'heady-conductor', port: 8080, status: 'running', type: 'Orchestration Worker', icon: '🎼' },
  { name: 'heady-distiller', port: 3398, status: 'running', type: 'Recipe Distillation', icon: '⚗️' },
  { name: 'heady-sync', port: null, status: 'running', type: 'Git Sync', icon: '🔄' },
  { name: 'MCP Server', port: null, status: 'running', type: '47 MCP Tools', icon: '🔌' },
  { name: 'Vector Memory', port: null, status: 'running', type: '384D pgvector', icon: '💾' },
  { name: 'Redis Streams', port: 6379, status: 'running', type: 'Event Bus', icon: '📡' },
  { name: 'CF Workers', port: null, status: 'running', type: 'Edge (4 workers)', icon: '⚡' },
  { name: 'Cloud Run', port: null, status: 'running', type: '15 services', icon: '☁️' },
  { name: 'HeadySims', port: null, status: 'running', type: 'Monte Carlo', icon: '🎲' },
];

const ECOSYSTEM = [
  { name: 'headysystems.com', role: 'Enterprise Infrastructure', color: '#3b82f6' },
  { name: 'headyme.com', role: 'Personal AI Hub', color: '#8b5cf6' },
  { name: 'headybuddy.org', role: 'AI Companion', color: '#10b981' },
  { name: 'headymcp.com', role: 'MCP Protocol', color: '#f59e0b' },
  { name: 'headyio.com', role: 'Developer SDK', color: '#06b6d4' },
  { name: 'headyconnection.org', role: 'Community Hub', color: '#ec4899' },
  { name: 'headyapi.com', role: 'API Gateway', color: '#ef4444' },
  { name: 'headyai.com', role: 'AI Research Lab', color: '#a78bfa' },
];

export default function ServicesPanel() {
  return (
    <div className="services-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🏗️</span>
          Heady Service Mesh
        </div>
        <span className="services-count">{SERVICES.filter(s => s.status === 'running').length}/{SERVICES.length} online</span>
      </div>
      <div className="services-grid">
        {SERVICES.map((svc, i) => (
          <div key={i} className={`service-card ${svc.status}`}>
            <span className="svc-icon">{svc.icon}</span>
            <div className="svc-info">
              <span className="svc-name">{svc.name}</span>
              <span className="svc-type">{svc.type}</span>
            </div>
            <span className={`svc-dot ${svc.status}`} />
          </div>
        ))}
      </div>
      <div className="ecosystem-section">
        <div className="section-label">Ecosystem Domains</div>
        <div className="ecosystem-grid">
          {ECOSYSTEM.map((eco, i) => (
            <div key={i} className="eco-chip" style={{ borderColor: eco.color }}>
              <span className="eco-dot" style={{ background: eco.color }} />
              <span className="eco-name">{eco.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
