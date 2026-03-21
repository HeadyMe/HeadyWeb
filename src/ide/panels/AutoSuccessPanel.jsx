import React from 'react';

const CATEGORIES = [
  { name: 'Learning', tasks: 20, icon: '🧠' },
  { name: 'Optimization', tasks: 20, icon: '⚡' },
  { name: 'Integration', tasks: 15, icon: '🔗' },
  { name: 'Monitoring', tasks: 15, icon: '📊' },
  { name: 'Maintenance', tasks: 15, icon: '🔧' },
  { name: 'Discovery', tasks: 15, icon: '🔍' },
  { name: 'Verification', tasks: 15, icon: '✅' },
  { name: 'Creative', tasks: 10, icon: '🎨' },
  { name: 'Deep Intel', tasks: 10, icon: '🕵️' },
  { name: 'Hive Integration', tasks: 20, icon: '🐝' },
  { name: 'Security', tasks: 8, icon: '🛡️' },
  { name: 'Resilience', tasks: 8, icon: '💪' },
  { name: 'Evolution', tasks: 5, icon: '🧬' },
];

export default function AutoSuccessPanel({ autoSuccess }) {
  const { ors, categories, totalTasks, engine, forceReact } = autoSuccess;

  return (
    <div className="auto-success-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🌟</span>
          Auto-Success Engine
        </div>
        <div className="ase-controls">
          <div className="ors-display">
            <span className="ors-label">ORS</span>
            <span className="ors-value">{ors || 100}</span>
          </div>
          <button className="force-react-btn" onClick={() => forceReact()}>
            ⚡ Force React
          </button>
        </div>
      </div>
      <div className="ase-stats">
        <div className="ase-stat">
          <span className="stat-value">{totalTasks || 144}</span>
          <span className="stat-label">Tasks</span>
        </div>
        <div className="ase-stat">
          <span className="stat-value">{categories || 13}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="ase-stat">
          <span className="stat-value breathing-dot" style={{ color: engine === 'active' ? '#22c55e' : '#f59e0b' }}>●</span>
          <span className="stat-label">{engine || 'Active'}</span>
        </div>
        <div className="ase-stat">
          <span className="stat-value">φ⁷</span>
          <span className="stat-label">Heartbeat</span>
        </div>
      </div>
      <div className="category-grid">
        {CATEGORIES.map((cat, i) => (
          <div key={i} className="category-chip">
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
            <span className="cat-tasks">{cat.tasks}</span>
          </div>
        ))}
      </div>
      <div className="panel-footer">
        <span>100% success rate · Event-driven · No batching · All tasks fire in parallel</span>
      </div>
    </div>
  );
}
