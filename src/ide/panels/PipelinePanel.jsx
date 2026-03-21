import React from 'react';

const STAGE_ICONS = ['🚪', '📥', '🎲', '⚡', '🔄', '🔍', '⚙️', '✅', '📊'];

export default function PipelinePanel({ pipeline }) {
  const { status, stages, runPipeline } = pipeline;

  return (
    <div className="pipeline-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🔷</span>
          HCFullPipeline v8.0
        </div>
        <div className="pipeline-controls">
          <span className={`pipeline-status-badge ${status}`}>{status}</span>
          <button className="run-pipeline-btn" onClick={runPipeline} disabled={status === 'running'}>
            {status === 'running' ? '⏳ Running...' : '▶ Run Pipeline'}
          </button>
        </div>
      </div>
      <div className="pipeline-stages">
        {stages.map((stage, i) => (
          <div key={i} className={`pipeline-stage ${stage.status}`}>
            <div className="stage-connector">{i > 0 && <div className="connector-line" />}</div>
            <div className="stage-node">
              <div className={`stage-dot ${stage.status}`} />
              <span className="stage-icon">{STAGE_ICONS[i] || '🔹'}</span>
              <span className="stage-name">{stage.name}</span>
              <span className={`stage-status-tag ${stage.status}`}>{stage.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pipeline-footer">
        <span className="pipeline-info">9 stages · Event-driven · Deterministic · Seeded PRNG</span>
      </div>
    </div>
  );
}
