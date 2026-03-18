// HEADY_BRAND:BEGIN
// ∞ SACRED GEOMETRY ∞  Liquid Node Registry v5.0.0
// HEADY_BRAND:END

/**
 * LiquidNodeRegistry — Extended node system for the Liquid Latent OS
 *
 * NEW NODES (extending the existing 26 nodes from node-registry.yaml):
 *
 * ORCHESTRATION:
 *   HeadyMesh       — Service mesh controller, inter-node communication optimizer
 *   HeadyResonance  — Harmonic node synchronization, phase-locked execution
 *
 * INTELLIGENCE:
 *   HeadyIntuition  — Pre-cognitive pattern matching, intent prediction before CSL
 *   HeadySpectra    — Multi-modal embedding fusion (text+code+image→unified vector)
 *   HeadyParallax   — Perspective shifting, same problem from multiple angles
 *
 * EXECUTION:
 *   HeadyQuantum    — Quantum-inspired optimization, superposition-based search
 *   HeadyWave       — Wave function collapse for constraint satisfaction
 *   HeadyPulse      — Heartbeat node, system-wide timing and synchronization
 *
 * INFRASTRUCTURE:
 *   HeadyGravity    — Resource attraction/repulsion, phi-weighted load distribution
 *   HeadyTide       — Data flow management, backpressure, buffering
 *   HeadyAurora     — Visualization node, real-time system state rendering
 *   HeadyVortex     — Log aggregation with vector compression
 *
 * SPECIALIZED:
 *   HeadyOracle     — Prediction node, time-series forecasting
 *   HeadyGenesis    — Service genesis, automated creation of new microservices
 *   HeadyPhoenix    — Resurrection node, automatic recovery from catastrophic failure
 *   HeadyHarmony    — Consensus node, distributed agreement protocol
 */

const PHI = 1.618033988749895;
const PSI = 0.6180339887498949;

class LiquidNodeRegistry {
  constructor(config) {
    this.config = config;
    this.nodes = new Map();
    this.connections = new Map();
    this.topology = { center: [], inner: [], middle: [], outer: [], governance: [] };
    this.registerAllNodes();
  }

  async initialize() {
    this.buildTopology();
    return this;
  }

  registerAllNodes() {
    // ── ORCHESTRATION NODES ──────────────────────────────────

    this.register({
      id: 'heady-mesh',
      name: 'HeadyMesh',
      category: 'orchestration',
      ring: 'inner',
      port: 3601,
      description: 'Service mesh controller — optimizes inter-node communication, discovers routes, manages load',
      capabilities: [
        'service-discovery', 'load-balancing', 'circuit-breaking',
        'retry-with-phi-backoff', 'request-routing', 'health-monitoring',
        'traffic-shaping', 'canary-routing', 'blue-green-switching'
      ],
      connections: ['all-nodes'],
      protocol: 'mcp+http',
      metrics: {
        requestsPerSecond: 0,
        avgLatency: 0,
        p99Latency: 0,
        activeConnections: 0,
        circuitBreakerState: 'closed'
      },
      phiConfig: {
        retryBackoff: 'PHI^attempt × 1000ms',
        loadDistribution: { hot: 0.34, warm: 0.21, cold: 0.13, reserve: 0.08 },
        jitter: 0.382
      }
    });

    this.register({
      id: 'heady-resonance',
      name: 'HeadyResonance',
      category: 'orchestration',
      ring: 'inner',
      port: 3602,
      description: 'Harmonic synchronization — phase-locks node execution for coherent distributed behavior',
      capabilities: [
        'phase-locking', 'clock-synchronization', 'distributed-barrier',
        'consensus-timing', 'phi-harmonic-intervals', 'wave-scheduling'
      ],
      connections: ['heady-mesh', 'heady-conductor', 'heady-pulse'],
      protocol: 'mcp',
      phiConfig: {
        harmonicInterval: `${(1000 / PHI).toFixed(0)}ms`,
        phaseAccuracy: '±1ms',
        syncProtocol: 'vector-clock + phi-drift-compensation'
      }
    });

    // ── INTELLIGENCE NODES ───────────────────────────────────

    this.register({
      id: 'heady-intuition',
      name: 'HeadyIntuition',
      category: 'intelligence',
      ring: 'middle',
      port: 3611,
      description: 'Pre-cognitive pattern matching — predicts intent before CSL evaluation, reduces cold-start latency',
      capabilities: [
        'intent-prediction', 'pattern-precognition', 'fast-path-selection',
        'context-prefetching', 'behavioral-prediction', 'anomaly-foresight'
      ],
      connections: ['heady-brain', 'heady-conductor', 'heady-autocontext'],
      protocol: 'mcp',
      cslThreshold: 0.382,
      phiConfig: {
        predictionWindow: '21ms lookahead',
        embeddingDim: 384,
        prefetchDepth: 3,
        confidenceGate: PSI
      }
    });

    this.register({
      id: 'heady-spectra',
      name: 'HeadySpectra',
      category: 'intelligence',
      ring: 'middle',
      port: 3612,
      description: 'Multi-modal embedding fusion — combines text, code, and image vectors into unified representation',
      capabilities: [
        'text-embedding', 'code-embedding', 'image-embedding',
        'modal-fusion', 'cross-modal-search', 'similarity-scoring',
        'dimensionality-reduction'
      ],
      connections: ['heady-memory', 'heady-autocontext', 'heady-vinci'],
      protocol: 'mcp+http',
      phiConfig: {
        textDim: 1536,
        codeDim: 768,
        imageDim: 512,
        fusedDim: 384,
        fusionMethod: 'phi-weighted-attention'
      }
    });

    this.register({
      id: 'heady-parallax',
      name: 'HeadyParallax',
      category: 'intelligence',
      ring: 'middle',
      port: 3613,
      description: 'Perspective shifting — analyzes problems from multiple angles simultaneously',
      capabilities: [
        'multi-perspective-analysis', 'adversarial-reasoning',
        'devils-advocate', 'red-team-blue-team', 'consensus-synthesis',
        'viewpoint-rotation', 'blind-spot-detection'
      ],
      connections: ['heady-brain', 'heady-sophia', 'heady-nova'],
      protocol: 'mcp',
      phiConfig: {
        perspectives: 5,
        rotationAngle: `${(360 / PHI).toFixed(1)}°`,
        synthesisMethod: 'phi-weighted-consensus'
      }
    });

    // ── EXECUTION NODES ──────────────────────────────────────

    this.register({
      id: 'heady-quantum',
      name: 'HeadyQuantum',
      category: 'execution',
      ring: 'middle',
      port: 3621,
      description: 'Quantum-inspired optimization — superposition-based parallel search for optimal solutions',
      capabilities: [
        'quantum-annealing', 'grover-search', 'qaoa-optimization',
        'superposition-sampling', 'entanglement-correlation',
        'quantum-walk', 'variational-eigensolving'
      ],
      connections: ['heady-mc', 'heady-brain', 'heady-battle'],
      protocol: 'mcp',
      phiConfig: {
        qubits: 21,
        annealing_schedule: 'phi-cosine',
        samplingRate: 'fibonacci-indexed'
      }
    });

    this.register({
      id: 'heady-wave',
      name: 'HeadyWave',
      category: 'execution',
      ring: 'middle',
      port: 3622,
      description: 'Wave function collapse — constraint satisfaction for configuration and scheduling problems',
      capabilities: [
        'constraint-propagation', 'wave-function-collapse',
        'backtracking-search', 'arc-consistency', 'domain-reduction',
        'configuration-solving', 'schedule-optimization'
      ],
      connections: ['heady-quantum', 'heady-conductor', 'heady-chronos'],
      protocol: 'mcp',
      phiConfig: {
        collapseStrategy: 'minimum-entropy-first',
        propagationDepth: 'fibonacci-bounded',
        constraintPriority: 'phi-weighted'
      }
    });

    this.register({
      id: 'heady-pulse',
      name: 'HeadyPulse',
      category: 'execution',
      ring: 'inner',
      port: 3623,
      description: 'System heartbeat — global timing signal, synchronization primitive, liveliness detection',
      capabilities: [
        'heartbeat-emission', 'liveliness-detection', 'clock-sync',
        'phase-detection', 'rhythm-generation', 'tempo-adjustment',
        'dead-node-detection', 'phi-timed-pulses'
      ],
      connections: ['heady-resonance', 'heady-mesh', 'all-nodes'],
      protocol: 'mcp+udp',
      phiConfig: {
        baseInterval: `${Math.round(1000 / PHI)}ms`,
        deadTimeout: `${Math.round(1000 * PHI * 5)}ms`,
        phaseWindows: 8,
        rhythmPattern: 'fibonacci-polyrhythm'
      }
    });

    // ── INFRASTRUCTURE NODES ─────────────────────────────────

    this.register({
      id: 'heady-gravity',
      name: 'HeadyGravity',
      category: 'infrastructure',
      ring: 'middle',
      port: 3631,
      description: 'Resource gravity field — phi-weighted load distribution across nodes and regions',
      capabilities: [
        'load-distribution', 'resource-attraction', 'capacity-planning',
        'auto-scaling', 'region-affinity', 'cost-optimization',
        'thermal-throttling'
      ],
      connections: ['heady-mesh', 'heady-conductor', 'heady-chronos'],
      protocol: 'mcp',
      phiConfig: {
        gravityConstant: PHI,
        massCalculation: 'cpu×memory×connections',
        orbitRadius: 'fibonacci-zones',
        poolDistribution: { hot: 0.34, warm: 0.21, cold: 0.13, reserve: 0.08, governance: 0.05 }
      }
    });

    this.register({
      id: 'heady-tide',
      name: 'HeadyTide',
      category: 'infrastructure',
      ring: 'middle',
      port: 3632,
      description: 'Data flow management — backpressure control, buffering, flow rate optimization',
      capabilities: [
        'backpressure-management', 'flow-control', 'buffering',
        'rate-shaping', 'priority-queuing', 'dead-letter-routing',
        'overflow-handling', 'phi-scaled-throttling'
      ],
      connections: ['heady-flux', 'heady-mesh', 'heady-gravity'],
      protocol: 'mcp',
      phiConfig: {
        bufferSize: 'fibonacci-scaled',
        highWaterMark: `${(PSI * 100).toFixed(1)}%`,
        lowWaterMark: `${(PSI * PSI * 100).toFixed(1)}%`,
        throttleRate: 'phi-exponential-backoff'
      }
    });

    this.register({
      id: 'heady-aurora',
      name: 'HeadyAurora',
      category: 'infrastructure',
      ring: 'outer',
      port: 3633,
      description: 'Visualization engine — real-time system state rendering, topology views, metric dashboards',
      capabilities: [
        'topology-visualization', 'metric-dashboards', 'flow-diagrams',
        'heatmaps', '3d-latent-space-view', 'sacred-geometry-layout',
        'real-time-streaming', 'alert-overlays'
      ],
      connections: ['heady-mesh', 'heady-observer', 'heady-lens'],
      protocol: 'http+websocket',
      phiConfig: {
        refreshRate: `${Math.round(1000 / PHI)}ms`,
        layoutAlgorithm: 'sacred-geometry-force-directed',
        colorScheme: 'phi-harmonic-palette'
      }
    });

    this.register({
      id: 'heady-vortex',
      name: 'HeadyVortex',
      category: 'infrastructure',
      ring: 'middle',
      port: 3634,
      description: 'Log vortex — high-throughput log aggregation with vector compression and semantic indexing',
      capabilities: [
        'log-aggregation', 'vector-compression', 'semantic-indexing',
        'correlation-detection', 'log-search', 'pattern-extraction',
        'anomaly-highlight', 'retention-management'
      ],
      connections: ['heady-observer', 'heady-tide', 'heady-memory'],
      protocol: 'mcp+udp',
      phiConfig: {
        compressionRatio: PHI,
        retentionTiers: { hot: '21d', warm: '55d', cold: '144d', archive: '377d' },
        indexDimensions: 384
      }
    });

    // ── SPECIALIZED NODES ────────────────────────────────────

    this.register({
      id: 'heady-oracle',
      name: 'HeadyOracle',
      category: 'specialized',
      ring: 'outer',
      port: 3641,
      description: 'Prediction engine — time-series forecasting, trend detection, capacity prediction',
      capabilities: [
        'time-series-forecast', 'trend-detection', 'seasonality-analysis',
        'capacity-prediction', 'cost-forecast', 'traffic-prediction',
        'sla-prediction', 'degradation-forecast'
      ],
      connections: ['heady-pythia', 'heady-mc', 'heady-lens'],
      protocol: 'mcp',
      phiConfig: {
        forecastHorizon: 'fibonacci-scaled-days',
        confidenceInterval: PSI,
        models: ['arima', 'prophet', 'lstm', 'ensemble']
      }
    });

    this.register({
      id: 'heady-genesis',
      name: 'HeadyGenesis',
      category: 'specialized',
      ring: 'outer',
      port: 3642,
      description: 'Service genesis — automated creation of new microservices from templates',
      capabilities: [
        'service-creation', 'template-instantiation', 'dependency-wiring',
        'config-generation', 'health-endpoint-creation', 'test-scaffolding',
        'ci-pipeline-generation', 'documentation-generation'
      ],
      connections: ['heady-forge', 'heady-conductor', 'heady-mesh'],
      protocol: 'mcp',
      templates: ['cloud-run', 'cloudflare-worker', 'mcp-server', 'swarm-bee', 'liquid-node', 'heady-ui']
    });

    this.register({
      id: 'heady-phoenix',
      name: 'HeadyPhoenix',
      category: 'specialized',
      ring: 'outer',
      port: 3643,
      description: 'Resurrection node — recovers from catastrophic failures, rebuilds state from snapshots',
      capabilities: [
        'state-reconstruction', 'snapshot-recovery', 'data-rehydration',
        'service-resurrection', 'cluster-rebuild', 'disaster-recovery',
        'point-in-time-recovery', 'cross-region-failover'
      ],
      connections: ['heady-murphy', 'heady-mesh', 'heady-memory'],
      protocol: 'mcp',
      phiConfig: {
        recoveryPriority: 'sacred-geometry-ring-order',
        snapshotInterval: `${21 * 60}s`,
        maxRecoveryTime: `${(PHI * 60).toFixed(0)}s`
      }
    });

    this.register({
      id: 'heady-harmony',
      name: 'HeadyHarmony',
      category: 'specialized',
      ring: 'outer',
      port: 3644,
      description: 'Consensus engine — distributed agreement protocol for multi-node decisions',
      capabilities: [
        'consensus-protocol', 'distributed-voting', 'conflict-resolution',
        'quorum-management', 'byzantine-tolerance', 'leader-election',
        'state-machine-replication'
      ],
      connections: ['heady-resonance', 'heady-mesh', 'heady-soul'],
      protocol: 'mcp',
      phiConfig: {
        quorumSize: `ceil(N × ${PSI.toFixed(3)})`,
        votingTimeout: `${Math.round(1000 * PHI)}ms`,
        byzantineTolerance: `floor(N / ${Math.round(PHI * 2)})`
      }
    });
  }

  register(nodeDef) {
    this.nodes.set(nodeDef.id, nodeDef);
  }

  buildTopology() {
    for (const [id, node] of this.nodes) {
      const ring = node.ring || 'outer';
      if (!this.topology[ring]) this.topology[ring] = [];
      this.topology[ring].push(node.name);

      // Build connection graph
      if (node.connections) {
        this.connections.set(id, node.connections);
      }
    }
  }

  getNodeDefinitions() {
    return Array.from(this.nodes.values()).map(n => ({
      id: n.id,
      name: n.name,
      category: n.category,
      ring: n.ring,
      port: n.port,
      description: n.description,
      capabilities: n.capabilities,
      connections: n.connections,
      protocol: n.protocol
    }));
  }

  getTopology() {
    return this.topology;
  }

  getConnectionGraph() {
    const graph = {};
    for (const [id, connections] of this.connections) {
      graph[id] = connections;
    }
    return graph;
  }

  getStatus() {
    const categories = {};
    for (const [, node] of this.nodes) {
      categories[node.category] = (categories[node.category] || 0) + 1;
    }
    return {
      totalNodes: this.nodes.size,
      categories,
      topology: this.topology,
      connectionCount: this.connections.size
    };
  }
}

module.exports = { LiquidNodeRegistry };
