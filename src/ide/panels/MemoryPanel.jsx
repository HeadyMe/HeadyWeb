import React, { useState } from 'react';

export default function MemoryPanel({ memory }) {
  const { stored, dimensions, maxEntries, query, ingest } = memory;
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const data = await query(searchQuery);
    setResults(data?.results || []);
    setSearching(false);
  };

  return (
    <div className="memory-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🧠</span>
          Vector Memory
        </div>
      </div>
      <div className="memory-stats">
        <div className="mem-stat">
          <span className="stat-value">{stored}</span>
          <span className="stat-label">Stored</span>
        </div>
        <div className="mem-stat">
          <span className="stat-value">{dimensions}D</span>
          <span className="stat-label">Embeddings</span>
        </div>
        <div className="mem-stat">
          <span className="stat-value">HNSW</span>
          <span className="stat-label">Index</span>
        </div>
      </div>
      <div className="memory-search">
        <input
          type="text"
          className="memory-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Semantic search..."
        />
        <button className="memory-search-btn" onClick={handleSearch} disabled={searching}>
          {searching ? '...' : '🔍'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="memory-results">
          {results.map((r, i) => (
            <div key={i} className="memory-result">
              <span className="result-score">{(r.score || 0.95).toFixed(2)}</span>
              <span className="result-content">{r.content || r.text || JSON.stringify(r)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="panel-footer">
        <span>3-tier: T0 working · T1 short-term · T2 long-term · CSL gates</span>
      </div>
    </div>
  );
}
