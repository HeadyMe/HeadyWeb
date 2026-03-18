// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  HEADY SYSTEMS — Phi Constants & Sacred Geometry Math         ║
// ║  ∞ Every threshold φ-derived · Every pool Fibonacci-indexed  ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

const PHI = 1.618033988749895;
const PSI = 0.6180339887498949;  // 1/PHI
const PHI_SQUARED = PHI * PHI;   // 2.618...
const PHI_CUBED = PHI * PHI * PHI; // 4.236...

const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765];

// CSL Confidence Thresholds (derived from phi)
const CSL = {
  MINIMUM: 0.500,    // 1/2
  LOW: 0.691,        // ~ln(2)
  MEDIUM: 0.809,     // ~1/√φ
  HIGH: 0.882,       // ~√(1-1/φ²)
  CRITICAL: 0.927,   // ~1-1/e²
  DEDUP: 0.972       // ~1-1/e³
};

// Pool allocations (Fibonacci-derived percentages)
const POOLS = {
  HOT: 0.34,         // FIB[9] %
  WARM: 0.21,        // FIB[8] %
  COLD: 0.13,        // FIB[7] %
  RESERVE: 0.08,     // FIB[6] %
  GOVERNANCE: 0.05   // FIB[5] %
};

// Memory tier configurations
const MEMORY_TIERS = {
  T0: { name: 'Working', maxSize: FIB[8], decayRate: 1.0, backend: 'redis' },
  T1: { name: 'ShortTerm', maxSize: FIB[10], decayRate: 0.1, backend: 'in-process' },
  T2: { name: 'LongTerm', maxSize: FIB[13], decayRate: 0.01, backend: 'pgvector' }
};

// Cache TTLs (Fibonacci-indexed seconds)
const CACHE_TTLS = {
  L1: FIB[11],  // 89 seconds
  L2: FIB[14],  // 377 seconds
  L3: FIB[17]   // 1597 seconds
};

// HNSW parameters
const HNSW = {
  M: FIB[8],              // 21
  EF_CONSTRUCTION: FIB[11], // 89
  DIMENSIONS: 384           // 6 × 64
};

// Backoff calculator
function phiBackoff(attempt, baseMs = 1000) {
  const delay = Math.pow(PHI, attempt) * baseMs;
  const jitter = delay * PSI * (Math.random() - 0.5);
  return Math.min(delay + jitter, FIB[9] * 1000); // max 34 seconds
}

// Confidence to pool mapper
function confidenceToPool(confidence) {
  if (confidence >= CSL.CRITICAL) return 'hot';
  if (confidence >= CSL.HIGH) return 'hot';
  if (confidence >= CSL.MEDIUM) return 'warm';
  if (confidence >= CSL.LOW) return 'cold';
  return 'cold';
}

// Phi-scaled distribution
function phiDistribute(value, min, max) {
  return min + (max - min) * (1 - Math.pow(Math.random(), PHI));
}

// Nearest Fibonacci quantizer
function fibQuantize(value) {
  let closest = FIB[0];
  let minDist = Math.abs(value - FIB[0]);
  for (const f of FIB) {
    const dist = Math.abs(value - f);
    if (dist < minDist) {
      minDist = dist;
      closest = f;
    }
  }
  return closest;
}

module.exports = {
  PHI, PSI, PHI_SQUARED, PHI_CUBED,
  FIB, CSL, POOLS,
  MEMORY_TIERS, CACHE_TTLS, HNSW,
  phiBackoff, confidenceToPool, phiDistribute, fibQuantize
};
