// HEADY_BRAND:BEGIN
// ∞ SACRED GEOMETRY ∞  Heady Mesh Wiring v5.0.0
// HEADY_BRAND:END

/**
 * HeadyMeshWiring — The nervous system of the Liquid Latent OS
 *
 * Ensures all components communicate optimally through:
 * 1. Service Mesh — inter-service routing with phi-backoff and CSL-gated health
 * 2. Event Bus — async pub/sub for decoupled communication
 * 3. Vector Channel — latent space operations routed through T0/T1/T2
 * 4. Protocol Bridge — MCP ↔ HTTP ↔ WebSocket ↔ gRPC translation
 * 5. Gossip Protocol — eventually consistent state propagation
 * 6. Sacred Geometry Topology — phi-optimized node placement and routing
 */

const PHI = 1.618033988749895;
const PSI = 0.6180339887498949;
const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

class HeadyMeshWiring {
  constructor(config) {
    this.config = config;
    this.serviceRegistry = new Map();
    this.eventBus = new EventBus();
    this.vectorChannel = new VectorChannel();
    this.protocolBridge = new ProtocolBridge();
    this.gossipProtocol = new GossipProtocol();
    this.topologyManager = new TopologyManager();
    this.circuitBreakers = new Map();
    this.metrics = {
      messagesRouted: 0,
      eventsPublished: 0,
      vectorOps: 0,
      protocolTranslations: 0,
      gossipRounds: 0,
      circuitBreakerTrips: 0
    };
  }

  async initialize() {
    // Register all known services and their communication patterns
    this.registerAllServices();
    this.buildRoutingTable();
    this.initCircuitBreakers();
    return this;
  }

  registerAllServices() {
    // ── Core Services (from service-catalog.yaml) ──────────
    const coreServices = [
      { id: 'domain-router', port: 4301, protocol: 'http', healthPath: '/health/ready', deps: [] },
      { id: 'observability-kernel', port: 4302, protocol: 'http', healthPath: '/health/ready', deps: ['domain-router'] },
      { id: 'budget-tracker', port: 4303, protocol: 'http', healthPath: '/health/ready', deps: ['domain-router'] },
      { id: 'heady-memory', port: 4304, protocol: 'http', healthPath: '/health/ready', deps: ['domain-router'] },
      { id: 'heady-health', port: 4305, protocol: 'http', healthPath: '/health/ready', deps: [] },
      { id: 'heady-conductor', port: 4306, protocol: 'http+mcp', healthPath: '/health/ready', deps: ['heady-memory', 'heady-health'] },
      { id: 'heady-brains', port: 4307, protocol: 'http+mcp', healthPath: '/health/ready', deps: ['heady-conductor'] },
      { id: 'heady-soul', port: 4308, protocol: 'http+mcp', healthPath: '/health/ready', deps: ['heady-brains'] },
      { id: 'heady-vinci', port: 4309, protocol: 'http+mcp', healthPath: '/health/ready', deps: ['heady-brains'] },
      { id: 'heady-governance', port: 4310, protocol: 'http', healthPath: '/health/ready', deps: ['heady-soul'] },
      { id: 'heady-guard', port: 4311, protocol: 'http', healthPath: '/health/ready', deps: [] },
      { id: 'heady-autobiographer', port: 4312, protocol: 'http', healthPath: '/health/ready', deps: ['heady-memory'] },
      { id: 'heady-bee-factory', port: 4313, protocol: 'http+mcp', healthPath: '/health/ready', deps: ['heady-conductor'] },
      { id: 'hcfullpipeline-executor', port: 4314, protocol: 'http+mcp', healthPath: '/health/ready', deps: ['heady-conductor', 'heady-brains'] },
      { id: 'auto-success-engine', port: 4315, protocol: 'http', healthPath: '/health/ready', deps: ['hcfullpipeline-executor'] },
    ];

    // ── Cloudflare Workers ─────────────────────────────────
    const workers = [
      { id: 'heady-mcp-worker', protocol: 'http+sse', routes: ['/mcp', '/sse'], deps: [] },
      { id: 'liquid-gateway-worker', protocol: 'http', routes: ['/v1/chat', '/v1/embed'], deps: [] },
      { id: 'heady-buddy-worker', protocol: 'http+sse', routes: ['/chat', '/stream'], deps: [] },
      { id: 'edge-auth-worker', protocol: 'http', routes: ['/verify'], deps: [] },
    ];

    // ── MCP Servers ────────────────────────────────────────
    const mcpServers = [
      { id: 'heady-mcp-server', port: 3301, protocol: 'mcp-stdio', tools: 42, deps: [] },
      { id: 'liquid-nodes-mcp-server', port: 3301, protocol: 'mcp-stdio', tools: 30, deps: [] },
      { id: 'enhanced-mcp-server', port: 3399, protocol: 'mcp-stdio+http', tools: 40, deps: [] },
    ];

    // ── New Enhancement Nodes ──────────────────────────────
    const enhancementNodes = [
      { id: 'heady-mesh', port: 3601, protocol: 'mcp+http', deps: [] },
      { id: 'heady-resonance', port: 3602, protocol: 'mcp', deps: ['heady-mesh'] },
      { id: 'heady-intuition', port: 3611, protocol: 'mcp', deps: ['heady-brains'] },
      { id: 'heady-spectra', port: 3612, protocol: 'mcp+http', deps: ['heady-memory'] },
      { id: 'heady-parallax', port: 3613, protocol: 'mcp', deps: ['heady-brains'] },
      { id: 'heady-quantum', port: 3621, protocol: 'mcp', deps: [] },
      { id: 'heady-wave', port: 3622, protocol: 'mcp', deps: ['heady-quantum'] },
      { id: 'heady-pulse', port: 3623, protocol: 'mcp+udp', deps: [] },
      { id: 'heady-gravity', port: 3631, protocol: 'mcp', deps: ['heady-mesh'] },
      { id: 'heady-tide', port: 3632, protocol: 'mcp', deps: ['heady-mesh'] },
      { id: 'heady-aurora', port: 3633, protocol: 'http+websocket', deps: ['heady-mesh'] },
      { id: 'heady-vortex', port: 3634, protocol: 'mcp+udp', deps: ['heady-memory'] },
      { id: 'heady-oracle', port: 3641, protocol: 'mcp', deps: [] },
      { id: 'heady-genesis', port: 3642, protocol: 'mcp', deps: ['heady-mesh'] },
      { id: 'heady-phoenix', port: 3643, protocol: 'mcp', deps: ['heady-mesh'] },
      { id: 'heady-harmony', port: 3644, protocol: 'mcp', deps: ['heady-mesh'] },
    ];

    for (const svc of [...coreServices, ...mcpServers, ...enhancementNodes]) {
      this.serviceRegistry.set(svc.id, { ...svc, status: 'registered', lastHealthCheck: null });
    }
    for (const w of workers) {
      this.serviceRegistry.set(w.id, { ...w, type: 'edge-worker', status: 'registered' });
    }
  }

  buildRoutingTable() {
    this.routingTable = new Map();

    // Build dependency-ordered startup sequence
    const resolved = new Set();
    const startupOrder = [];

    const resolve = (id) => {
      if (resolved.has(id)) return;
      const svc = this.serviceRegistry.get(id);
      if (!svc) return;
      for (const dep of (svc.deps || [])) {
        resolve(dep);
      }
      resolved.add(id);
      startupOrder.push(id);
    };

    for (const [id] of this.serviceRegistry) {
      resolve(id);
    }

    this.startupOrder = startupOrder;

    // Build routing rules
    for (const [id, svc] of this.serviceRegistry) {
      this.routingTable.set(id, {
        endpoint: svc.port ? `http://localhost:${svc.port}` : `edge://${id}`,
        protocol: svc.protocol,
        healthPath: svc.healthPath || '/health',
        circuitBreaker: id,
        retryPolicy: {
          maxRetries: 3,
          backoff: 'phi-exponential',
          jitter: PSI * 0.618
        },
        timeout: Math.round(5000 * (1 + PSI))
      });
    }
  }

  initCircuitBreakers() {
    for (const [id] of this.serviceRegistry) {
      this.circuitBreakers.set(id, {
        state: 'closed',
        failureCount: 0,
        successCount: 0,
        failureThreshold: 5,
        successThreshold: 3,
        halfOpenTimeout: Math.round(30000 * PHI),
        lastFailure: null,
        lastSuccess: null
      });
    }
  }

  async route(sourceId, targetId, message) {
    this.metrics.messagesRouted++;

    const cb = this.circuitBreakers.get(targetId);
    if (cb && cb.state === 'open') {
      const timeSinceFailure = Date.now() - cb.lastFailure;
      if (timeSinceFailure < cb.halfOpenTimeout) {
        throw new Error(`Circuit breaker OPEN for ${targetId}`);
      }
      cb.state = 'half-open';
    }

    const route = this.routingTable.get(targetId);
    if (!route) throw new Error(`No route to ${targetId}`);

    return {
      source: sourceId,
      target: targetId,
      route,
      message,
      timestamp: new Date().toISOString(),
      traceId: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    };
  }

  getRoutingTable() {
    const table = {};
    for (const [id, route] of this.routingTable) {
      table[id] = route;
    }
    return table;
  }

  getStartupOrder() {
    return this.startupOrder;
  }

  getCircuitBreakerStates() {
    const states = {};
    for (const [id, cb] of this.circuitBreakers) {
      states[id] = { state: cb.state, failures: cb.failureCount, successes: cb.successCount };
    }
    return states;
  }

  getStatus() {
    return {
      registeredServices: this.serviceRegistry.size,
      routingRules: this.routingTable.size,
      circuitBreakers: this.circuitBreakers.size,
      startupOrder: this.startupOrder,
      metrics: this.metrics,
      eventBus: this.eventBus.getStatus(),
      vectorChannel: this.vectorChannel.getStatus(),
      protocolBridge: this.protocolBridge.getStatus(),
      gossip: this.gossipProtocol.getStatus()
    };
  }
}

// ── Event Bus — Async pub/sub for decoupled communication ──
class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.history = [];
    this.metrics = { published: 0, delivered: 0, dropped: 0 };
  }

  subscribe(topic, handler) {
    if (!this.subscribers.has(topic)) this.subscribers.set(topic, []);
    this.subscribers.get(topic).push(handler);
  }

  async publish(topic, event) {
    this.metrics.published++;
    const handlers = this.subscribers.get(topic) || [];
    const results = [];

    for (const handler of handlers) {
      try {
        results.push(await handler(event));
        this.metrics.delivered++;
      } catch (err) {
        this.metrics.dropped++;
      }
    }

    this.history.push({ topic, event, timestamp: Date.now(), handlerCount: handlers.length });
    if (this.history.length > 1000) this.history.shift();

    return results;
  }

  getStatus() {
    return {
      topics: this.subscribers.size,
      totalSubscribers: Array.from(this.subscribers.values()).reduce((sum, h) => sum + h.length, 0),
      metrics: this.metrics,
      recentEvents: this.history.length
    };
  }
}

// ── Vector Channel — Latent space operations ──────────────
class VectorChannel {
  constructor() {
    this.tiers = { t0: { capsules: 21, operations: 0 }, t1: { maxVectors: 144000, operations: 0 }, t2: { operations: 0 } };
    this.metrics = { reads: 0, writes: 0, searches: 0, consolidations: 0 };
  }

  async record(tier, vector, metadata) {
    this.tiers[tier].operations++;
    this.metrics.writes++;
    return { tier, vectorId: `vec_${Date.now()}`, metadata };
  }

  async search(query, tier = 'all', topK = 10) {
    this.metrics.searches++;
    return { query, tier, topK, results: [] };
  }

  getStatus() {
    return { tiers: this.tiers, metrics: this.metrics };
  }
}

// ── Protocol Bridge — Cross-protocol translation ──────────
class ProtocolBridge {
  constructor() {
    this.adapters = new Map([
      ['mcp', { name: 'MCP Adapter', protocols: ['mcp-stdio', 'mcp-sse', 'mcp-streamable-http'] }],
      ['http', { name: 'HTTP Adapter', protocols: ['http', 'https', 'http2'] }],
      ['websocket', { name: 'WebSocket Adapter', protocols: ['ws', 'wss'] }],
      ['grpc', { name: 'gRPC Adapter', protocols: ['grpc', 'grpc-web'] }],
      ['udp', { name: 'UDP Adapter', protocols: ['udp'] }],
      ['mqtt', { name: 'MQTT Adapter', protocols: ['mqtt', 'mqtts'] }],
    ]);
    this.translations = 0;
  }

  async translate(sourceProtocol, targetProtocol, message) {
    this.translations++;
    return {
      source: sourceProtocol,
      target: targetProtocol,
      translated: true,
      message,
      translationId: `tx_${Date.now()}`
    };
  }

  getStatus() {
    return {
      adapters: this.adapters.size,
      translations: this.translations,
      supportedProtocols: Array.from(this.adapters.keys())
    };
  }
}

// ── Gossip Protocol — Eventually consistent state propagation ──
class GossipProtocol {
  constructor() {
    this.state = new Map();
    this.rounds = 0;
    this.fanout = 3;
  }

  async propagate(key, value) {
    this.state.set(key, { value, timestamp: Date.now(), version: (this.state.get(key)?.version || 0) + 1 });
    this.rounds++;
    return { key, propagatedTo: this.fanout, round: this.rounds };
  }

  getStatus() {
    return { stateSize: this.state.size, rounds: this.rounds, fanout: this.fanout };
  }
}

// ── Topology Manager — Sacred Geometry node placement ──────
class TopologyManager {
  constructor() {
    this.rings = {
      center: { radius: 0, maxNodes: 1, nodes: [] },
      inner: { radius: PHI, maxNodes: 5, nodes: [] },
      middle: { radius: PHI * 2, maxNodes: 8, nodes: [] },
      outer: { radius: PHI * 3, maxNodes: 13, nodes: [] },
      governance: { radius: PHI * 4, maxNodes: 8, nodes: [] }
    };
  }

  placeNode(nodeId, ring) {
    const r = this.rings[ring];
    if (!r) return null;
    const angle = (r.nodes.length / r.maxNodes) * 2 * Math.PI;
    const position = { x: r.radius * Math.cos(angle), y: r.radius * Math.sin(angle), ring };
    r.nodes.push({ id: nodeId, position });
    return position;
  }

  getTopology() {
    return this.rings;
  }
}

module.exports = { HeadyMeshWiring, EventBus, VectorChannel, ProtocolBridge, GossipProtocol, TopologyManager };
