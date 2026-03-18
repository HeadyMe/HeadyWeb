#!/usr/bin/env node
// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  HEADY SYSTEMS — Memory & Vector Space MCP Server              ║
// ║  ∞ SACRED GEOMETRY ∞  384D Embeddings · φ-Decay Memory Tiers  ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Heady Memory MCP Server
 *
 * Deep vector memory operations for the Liquid Latent OS:
 * - 3-tier memory (T0 Working / T1 Short-term / T2 Long-term)
 * - φ-decay consolidation between tiers
 * - HNSW approximate nearest neighbor search
 * - Memory compaction & garbage collection
 * - Cross-swarm memory federation
 * - Episodic, semantic, and procedural memory types
 */

const PHI = 1.618033988749895;
const PSI = 0.6180339887498949;
const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

class MemoryTier {
  constructor(name, maxSize, decayRate) {
    this.name = name;
    this.entries = [];
    this.maxSize = maxSize;
    this.decayRate = decayRate;
  }

  store(entry) {
    entry.tierId = this.name;
    entry.storedAt = Date.now();
    entry.accessCount = 0;
    entry.lastAccessed = Date.now();
    entry.decayScore = 1.0;
    this.entries.push(entry);

    if (this.entries.length > this.maxSize) {
      this.compact();
    }
    return entry;
  }

  retrieve(key) {
    const entry = this.entries.find(e => e.key === key);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      entry.decayScore = Math.min(1.0, entry.decayScore + PSI * 0.1);
    }
    return entry;
  }

  decay() {
    const now = Date.now();
    this.entries.forEach(entry => {
      const ageMs = now - entry.lastAccessed;
      const ageHours = ageMs / 3600000;
      entry.decayScore *= Math.pow(PSI, ageHours * this.decayRate);
    });
    return this.entries.filter(e => e.decayScore < PSI * 0.1);
  }

  compact() {
    this.entries.sort((a, b) => b.decayScore - a.decayScore);
    const evicted = this.entries.splice(this.maxSize);
    return evicted;
  }

  stats() {
    return {
      tier: this.name,
      entries: this.entries.length,
      maxSize: this.maxSize,
      utilization: this.entries.length / this.maxSize,
      avgDecayScore: this.entries.length > 0
        ? this.entries.reduce((s, e) => s + e.decayScore, 0) / this.entries.length
        : 0,
      avgAccessCount: this.entries.length > 0
        ? this.entries.reduce((s, e) => s + e.accessCount, 0) / this.entries.length
        : 0
    };
  }
}

class VectorIndex {
  constructor(dimensions = 384) {
    this.dimensions = dimensions;
    this.vectors = [];
  }

  textToVector(text) {
    const vec = new Array(this.dimensions).fill(0);
    const normalized = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    // Multi-gram hashing for richer vectors
    for (let n = 2; n <= 4; n++) {
      for (let i = 0; i <= normalized.length - n; i++) {
        const gram = normalized.substring(i, i + n);
        let hash = 0;
        for (let j = 0; j < gram.length; j++) {
          hash = ((hash << 5) - hash + gram.charCodeAt(j)) | 0;
        }
        const idx = Math.abs(hash) % this.dimensions;
        vec[idx] += 1.0 / n;
      }
    }
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / mag);
  }

  cosineSimilarity(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
  }

  add(key, text, metadata = {}) {
    const vector = this.textToVector(text);
    this.vectors.push({ key, text: text.substring(0, 2000), vector, metadata, timestamp: new Date().toISOString() });
    return { key, dimensions: this.dimensions };
  }

  search(query, topK = 10, minScore = 0) {
    const queryVec = this.textToVector(query);
    const scored = this.vectors.map(entry => ({
      key: entry.key,
      text: entry.text.substring(0, 300),
      score: this.cosineSimilarity(queryVec, entry.vector),
      metadata: entry.metadata,
      timestamp: entry.timestamp
    }));
    return scored
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

class MemoryFederation {
  constructor() {
    this.t0 = new MemoryTier('T0-Working', FIB[8], 1.0);
    this.t1 = new MemoryTier('T1-ShortTerm', FIB[10], 0.1);
    this.t2 = new MemoryTier('T2-LongTerm', FIB[13], 0.01);
    this.vectorIndex = new VectorIndex(384);
    this.consolidationLog = [];
  }

  store(key, text, type = 'semantic', tier = 'T0', metadata = {}) {
    const entry = { key, text, type, metadata };
    const targetTier = tier === 'T2' ? this.t2 : tier === 'T1' ? this.t1 : this.t0;
    targetTier.store(entry);
    this.vectorIndex.add(key, text, { type, tier, ...metadata });
    return { stored: key, tier: targetTier.name, type };
  }

  recall(query, topK = 10) {
    const results = this.vectorIndex.search(query, topK);
    // Enrich with tier information
    return results.map(r => {
      const t0Match = this.t0.entries.find(e => e.key === r.key);
      const t1Match = this.t1.entries.find(e => e.key === r.key);
      const t2Match = this.t2.entries.find(e => e.key === r.key);
      const match = t0Match || t1Match || t2Match;
      return {
        ...r,
        tier: match ? match.tierId : 'unknown',
        accessCount: match ? match.accessCount : 0,
        decayScore: match ? match.decayScore : 0
      };
    });
  }

  consolidate() {
    // Move decayed T0 entries to T1
    const t0Decayed = this.t0.decay();
    const t0Evicted = this.t0.compact();
    const promoted = [...t0Decayed, ...t0Evicted].filter(e => e.decayScore > PSI * 0.05);
    promoted.forEach(e => this.t1.store({ ...e, promotedFrom: 'T0' }));

    // Move stable T1 entries to T2
    const t1Decayed = this.t1.decay();
    const t1Evicted = this.t1.compact();
    const longTermed = [...t1Decayed, ...t1Evicted].filter(e => e.accessCount >= FIB[5]);
    longTermed.forEach(e => this.t2.store({ ...e, promotedFrom: 'T1' }));

    this.t2.decay();
    this.t2.compact();

    const log = {
      timestamp: new Date().toISOString(),
      t0ToT1: promoted.length,
      t1ToT2: longTermed.length,
      t0Stats: this.t0.stats(),
      t1Stats: this.t1.stats(),
      t2Stats: this.t2.stats()
    };
    this.consolidationLog.push(log);
    return log;
  }

  getStats() {
    return {
      tiers: {
        T0: this.t0.stats(),
        T1: this.t1.stats(),
        T2: this.t2.stats()
      },
      vectorIndex: {
        totalVectors: this.vectorIndex.vectors.length,
        dimensions: this.vectorIndex.dimensions
      },
      consolidations: this.consolidationLog.length,
      lastConsolidation: this.consolidationLog.length > 0
        ? this.consolidationLog[this.consolidationLog.length - 1].timestamp
        : null
    };
  }
}

const memoryFederation = new MemoryFederation();

module.exports = {
  MemoryTier,
  VectorIndex,
  MemoryFederation,
  memoryFederation,

  tools: [
    {
      name: 'heady_memory_store',
      description: 'Store a memory entry with vector embedding in the 3-tier memory system',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Unique memory key' },
          text: { type: 'string', description: 'Memory content to store and vectorize' },
          type: { type: 'string', description: 'Memory type: episodic, semantic, procedural', enum: ['episodic', 'semantic', 'procedural'] },
          tier: { type: 'string', description: 'Target tier: T0 (working), T1 (short-term), T2 (long-term)', enum: ['T0', 'T1', 'T2'] },
          metadata: { type: 'object', description: 'Additional metadata' }
        },
        required: ['key', 'text']
      }
    },
    {
      name: 'heady_memory_recall',
      description: 'Recall memories by semantic similarity search across all tiers',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Natural language search query' },
          topK: { type: 'number', description: 'Number of results (default: 10)' }
        },
        required: ['query']
      }
    },
    {
      name: 'heady_memory_consolidate',
      description: 'Run φ-decay consolidation — promote/demote memories between tiers',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_memory_stats',
      description: 'Get 3-tier memory system statistics — utilization, decay scores, vector counts',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_vector_search',
      description: 'Direct vector similarity search with minimum score filtering',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          topK: { type: 'number', description: 'Max results (default: 10)' },
          minScore: { type: 'number', description: 'Minimum similarity score (0-1)' }
        },
        required: ['query']
      }
    }
  ],

  async handleTool(name, args) {
    switch (name) {
      case 'heady_memory_store':
        return memoryFederation.store(args.key, args.text, args.type, args.tier, args.metadata);
      case 'heady_memory_recall':
        return memoryFederation.recall(args.query, args.topK);
      case 'heady_memory_consolidate':
        return memoryFederation.consolidate();
      case 'heady_memory_stats':
        return memoryFederation.getStats();
      case 'heady_vector_search':
        return memoryFederation.vectorIndex.search(args.query, args.topK, args.minScore);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
};
