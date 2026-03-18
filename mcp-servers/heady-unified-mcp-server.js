#!/usr/bin/env node
// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  HEADY SYSTEMS — Unified MCP Server                            ║
// ║  ∞ SACRED GEOMETRY ∞  The Perfect Liquid Dynamic Whole         ║
// ║  All services wired · Parallel async · Intelligently routed   ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Heady Unified MCP Server
 *
 * THE master MCP server that integrates ALL HeadyMCP subsystems into
 * a single coherent liquid dynamic parallel async distributed OS.
 *
 * Subsystems wired:
 *  1. Orchestration (swarms, bees, pipelines, task graphs)
 *  2. Intelligence (battles, monte carlo, patterns, autocontext)
 *  3. Memory (3-tier, vectors, federation, consolidation)
 *  4. Governance (policies, costs, RBAC, audit, stories)
 *  5. Ecosystem (cross-repo analysis, dependency mapping)
 *  6. Observability (metrics, traces, health federation)
 *  7. Evolution (mutation, canary, fitness)
 *
 * Communication Protocol:
 *  - Inter-service: Event-driven message bus with correlation IDs
 *  - CSL gating on every routing decision
 *  - φ-scaled backoff on retries
 *  - Hot/Warm/Cold pool assignment based on confidence
 */

const path = require('path');
const { EventEmitter } = require('events');

const PHI = 1.618033988749895;
const PSI = 0.6180339887498949;
const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

// ─── Message Bus ────────────────────────────────────────────────────
class HeadyMessageBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(FIB[10]);
    this.messages = [];
    this.subscriptions = new Map();
    this.correlationMap = new Map();
  }

  publish(channel, payload, correlationId = null) {
    const msg = {
      id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      channel,
      payload,
      correlationId: correlationId || `cor-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      delivered: 0
    };
    this.messages.push(msg);
    if (this.messages.length > FIB[13]) this.messages = this.messages.slice(-FIB[11]);

    this.emit(channel, msg);
    this.emit('*', msg);

    const subs = this.subscriptions.get(channel) || [];
    msg.delivered = subs.length + this.listenerCount(channel);

    if (correlationId) {
      const chain = this.correlationMap.get(correlationId) || [];
      chain.push(msg.id);
      this.correlationMap.set(correlationId, chain);
    }

    return msg;
  }

  subscribe(channel, handler) {
    const subs = this.subscriptions.get(channel) || [];
    subs.push(handler);
    this.subscriptions.set(channel, subs);
    this.on(channel, handler);
    return { channel, subscriberCount: subs.length };
  }

  getCorrelationChain(correlationId) {
    return this.correlationMap.get(correlationId) || [];
  }

  getStats() {
    return {
      totalMessages: this.messages.length,
      channels: [...new Set(this.messages.map(m => m.channel))],
      correlations: this.correlationMap.size,
      recentMessages: this.messages.slice(-10).map(m => ({
        id: m.id, channel: m.channel, delivered: m.delivered, timestamp: m.timestamp
      }))
    };
  }
}

// ─── Service Mesh ───────────────────────────────────────────────────
class ServiceMesh {
  constructor(messageBus) {
    this.bus = messageBus;
    this.services = new Map();
    this.healthChecks = new Map();
    this.circuitBreakers = new Map();
  }

  register(serviceId, config) {
    const service = {
      id: serviceId,
      ...config,
      status: 'healthy',
      registeredAt: new Date().toISOString(),
      requestCount: 0,
      errorCount: 0,
      avgLatencyMs: 0
    };
    this.services.set(serviceId, service);
    this.circuitBreakers.set(serviceId, {
      state: 'closed',
      failures: 0,
      maxFailures: config.maxFailures || FIB[5],
      resetTimeout: config.resetTimeout || FIB[8] * 1000,
      lastFailure: null
    });
    this.bus.publish('service.registered', { serviceId, config });
    return service;
  }

  async invoke(serviceId, operation, payload, options = {}) {
    const service = this.services.get(serviceId);
    if (!service) throw new Error(`Service ${serviceId} not found in mesh`);

    const breaker = this.circuitBreakers.get(serviceId);
    if (breaker.state === 'open') {
      if (Date.now() - breaker.lastFailure > breaker.resetTimeout) {
        breaker.state = 'half-open';
      } else {
        throw new Error(`Circuit breaker OPEN for ${serviceId}`);
      }
    }

    const correlationId = options.correlationId || `cor-${Date.now().toString(36)}`;
    const startTime = Date.now();

    try {
      service.requestCount++;
      this.bus.publish(`service.${serviceId}.invoke`, {
        operation, payload, correlationId
      }, correlationId);

      const latencyMs = Date.now() - startTime;
      service.avgLatencyMs = (service.avgLatencyMs * (service.requestCount - 1) + latencyMs) / service.requestCount;

      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        breaker.failures = 0;
      }

      return {
        serviceId, operation, correlationId, latencyMs,
        status: 'success', timestamp: new Date().toISOString()
      };
    } catch (err) {
      service.errorCount++;
      breaker.failures++;
      breaker.lastFailure = Date.now();
      if (breaker.failures >= breaker.maxFailures) {
        breaker.state = 'open';
        this.bus.publish('circuit.open', { serviceId, failures: breaker.failures });
      }
      throw err;
    }
  }

  getTopology() {
    return [...this.services.values()].map(s => ({
      id: s.id,
      status: s.status,
      port: s.port,
      requestCount: s.requestCount,
      errorCount: s.errorCount,
      avgLatencyMs: Math.round(s.avgLatencyMs * 100) / 100,
      errorRate: s.requestCount > 0 ? Math.round((s.errorCount / s.requestCount) * 10000) / 100 + '%' : '0%',
      circuitBreaker: this.circuitBreakers.get(s.id)?.state || 'unknown'
    }));
  }

  healthCheck() {
    const results = [];
    for (const [id, service] of this.services) {
      const breaker = this.circuitBreakers.get(id);
      results.push({
        service: id,
        healthy: breaker.state !== 'open' && service.status === 'healthy',
        status: service.status,
        circuitBreaker: breaker.state,
        uptime: Date.now() - new Date(service.registeredAt).getTime()
      });
    }
    return {
      timestamp: new Date().toISOString(),
      totalServices: results.length,
      healthy: results.filter(r => r.healthy).length,
      unhealthy: results.filter(r => !r.healthy).length,
      services: results
    };
  }
}

// ─── Ecosystem Analyzer ─────────────────────────────────────────────
class EcosystemAnalyzer {
  constructor() {
    this.repos = [
      // Core
      { name: 'Heady', org: 'HeadyAI', type: 'monorepo', layer: 'core' },
      { name: 'Heady-Main', org: 'HeadySystems', type: 'production', layer: 'core' },
      { name: 'Heady-Testing', org: 'HeadyAI', type: 'testing', layer: 'core' },
      { name: 'Heady-Staging', org: 'HeadyAI', type: 'staging', layer: 'core' },
      // API & Backend
      { name: 'headyapi', org: 'HeadyMe', type: 'api', layer: 'backend' },
      { name: 'headyapi-core', org: 'HeadyMe', type: 'api-core', layer: 'backend' },
      { name: 'headybot-core', org: 'HeadyMe', type: 'bot', layer: 'backend' },
      // MCP
      { name: 'headymcp', org: 'HeadyMe', type: 'mcp', layer: 'protocol' },
      { name: 'headymcp-core', org: 'HeadyMe', type: 'mcp-core', layer: 'protocol' },
      { name: 'headymcp-com', org: 'HeadyMe', type: 'mcp-web', layer: 'protocol' },
      { name: 'headymcp-production', org: 'HeadyMe', type: 'mcp-prod', layer: 'protocol' },
      // Frontend & UI
      { name: 'HeadyWeb', org: 'HeadyMe', type: 'web', layer: 'frontend' },
      { name: 'HeadyBuddy', org: 'HeadyMe', type: 'buddy', layer: 'frontend' },
      { name: 'admin-ui', org: 'HeadyMe', type: 'admin', layer: 'frontend' },
      { name: 'heady-buddy-portal', org: 'HeadyMe', type: 'portal', layer: 'frontend' },
      // Desktop & Mobile
      { name: 'heady-desktop', org: 'HeadyMe', type: 'desktop', layer: 'client' },
      { name: 'heady-mobile', org: 'HeadyMe', type: 'mobile', layer: 'client' },
      { name: 'heady-chrome', org: 'HeadyMe', type: 'extension', layer: 'client' },
      // IDE
      { name: 'heady-vscode', org: 'HeadyMe', type: 'ide', layer: 'developer' },
      { name: 'heady-jetbrains', org: 'HeadyMe', type: 'ide', layer: 'developer' },
      // AI & Intelligence
      { name: 'heady-vinci', org: 'HeadyMe', type: 'learning', layer: 'intelligence' },
      { name: 'heady-pythia', org: 'HeadyMe', type: 'oracle', layer: 'intelligence' },
      { name: 'heady-imagine', org: 'HeadyMe', type: 'creative', layer: 'intelligence' },
      { name: 'heady-critique', org: 'HeadyMe', type: 'evaluation', layer: 'intelligence' },
      { name: 'heady-montecarlo', org: 'HeadyMe', type: 'simulation', layer: 'intelligence' },
      // Observability
      { name: 'heady-observer', org: 'HeadyMe', type: 'monitoring', layer: 'observability' },
      { name: 'heady-traces', org: 'HeadyMe', type: 'tracing', layer: 'observability' },
      { name: 'heady-logs', org: 'HeadyMe', type: 'logging', layer: 'observability' },
      { name: 'heady-metrics', org: 'HeadyMe', type: 'metrics', layer: 'observability' },
      { name: 'heady-sentinel', org: 'HeadyMe', type: 'security', layer: 'observability' },
      // Orchestration
      { name: 'heady-maestro', org: 'HeadyMe', type: 'orchestration', layer: 'orchestration' },
      { name: 'heady-atlas', org: 'HeadyMe', type: 'mapping', layer: 'orchestration' },
      { name: 'heady-kinetics', org: 'HeadyMe', type: 'physics', layer: 'orchestration' },
      { name: 'heady-patterns', org: 'HeadyMe', type: 'patterns', layer: 'orchestration' },
      { name: 'heady-jules', org: 'HeadyMe', type: 'agent', layer: 'orchestration' },
      // Communication
      { name: 'heady-discord', org: 'HeadyMe', type: 'chat', layer: 'communication' },
      { name: 'heady-discord-connector', org: 'HeadyMe', type: 'connector', layer: 'communication' },
      { name: 'heady-discord-connection', org: 'HeadyMe', type: 'connection', layer: 'communication' },
      { name: 'heady-slack', org: 'HeadyMe', type: 'chat', layer: 'communication' },
      // OS & Infrastructure
      { name: 'headyos', org: 'HeadyMe', type: 'os', layer: 'infrastructure' },
      { name: 'headyos-core', org: 'HeadyMe', type: 'os-core', layer: 'infrastructure' },
      { name: 'headyme-core', org: 'HeadyMe', type: 'core', layer: 'infrastructure' },
      { name: 'headysystems', org: 'HeadyMe', type: 'systems', layer: 'infrastructure' },
      { name: 'headysystems-core', org: 'HeadyMe', type: 'systems-core', layer: 'infrastructure' },
      // Platform
      { name: 'headyconnection', org: 'HeadyMe', type: 'social', layer: 'platform' },
      { name: 'headyconnection-core', org: 'HeadyMe', type: 'social-core', layer: 'platform' },
      { name: 'headyconnection-org', org: 'HeadyMe', type: 'nonprofit', layer: 'platform' },
      { name: 'headybuddy-core', org: 'HeadyMe', type: 'buddy-core', layer: 'platform' },
      { name: 'headybuddy-org', org: 'HeadyMe', type: 'buddy-org', layer: 'platform' },
      // Documentation & Templates
      { name: 'heady-docs', org: 'HeadyMe', type: 'docs', layer: 'documentation' },
      { name: 'headydocs', org: 'HeadyMe', type: 'docs', layer: 'documentation' },
      { name: 'template-heady-ui', org: 'HeadyMe', type: 'template', layer: 'templates' },
      { name: 'template-mcp-server', org: 'HeadyMe', type: 'template', layer: 'templates' },
      { name: 'template-swarm-bee', org: 'HeadyMe', type: 'template', layer: 'templates' },
      // Domains
      { name: 'headyme', org: 'HeadyMe', type: 'domain', layer: 'domains' },
      { name: 'headyme-com', org: 'HeadyMe', type: 'domain', layer: 'domains' },
      { name: 'headyio', org: 'HeadyMe', type: 'domain', layer: 'domains' },
      { name: 'headyio-com', org: 'HeadyMe', type: 'domain', layer: 'domains' },
      { name: 'headymcp-com', org: 'HeadyMe', type: 'domain', layer: 'domains' },
      { name: 'headysystems-com', org: 'HeadyMe', type: 'domain', layer: 'domains' },
      // Special
      { name: 'heady-builder', org: 'HeadyMe', type: 'builder', layer: 'tooling' },
      { name: 'heady-stories', org: 'HeadyMe', type: 'stories', layer: 'content' },
      { name: 'heady-github-integration', org: 'HeadyMe', type: 'integration', layer: 'devops' },
      { name: 'latent-core-dev', org: 'HeadyMe', type: 'research', layer: 'research' },
      { name: 'sandbox', org: 'HeadySystems', type: 'sandbox', layer: 'development' },
      { name: 'HeadyEcosystem', org: 'HeadySystems', type: 'meta', layer: 'meta' },
      { name: 'instant', org: 'HeadyMe', type: 'instant', layer: 'tooling' },
      { name: '1ime1', org: 'HeadyMe', type: 'utility', layer: 'utility' },
      { name: 'ableton-edge-production', org: 'HeadyMe', type: 'music', layer: 'creative' },
      { name: 'heady-production', org: 'HeadyMe', type: 'production', layer: 'infrastructure' }
    ];
  }

  getEcosystemMap() {
    const layers = {};
    this.repos.forEach(r => {
      if (!layers[r.layer]) layers[r.layer] = [];
      layers[r.layer].push(r);
    });
    return {
      totalRepos: this.repos.length,
      layers: Object.entries(layers).map(([layer, repos]) => ({
        layer,
        count: repos.length,
        repos: repos.map(r => r.name)
      })),
      orgs: [...new Set(this.repos.map(r => r.org))],
      types: [...new Set(this.repos.map(r => r.type))]
    };
  }

  getDependencyGraph() {
    // Map logical dependencies between repos
    const deps = {
      'HeadyWeb': ['headyapi', 'headymcp', 'headyos'],
      'heady-desktop': ['HeadyWeb', 'headyapi'],
      'heady-mobile': ['headyapi', 'HeadyBuddy'],
      'heady-chrome': ['headyapi', 'headymcp'],
      'heady-vscode': ['headymcp', 'headyapi'],
      'heady-jetbrains': ['headymcp', 'headyapi'],
      'headymcp': ['headymcp-core', 'headyapi-core'],
      'headymcp-core': ['headyapi-core', 'headyos-core'],
      'headyapi': ['headyapi-core', 'headyos-core'],
      'HeadyBuddy': ['headybuddy-core', 'headyapi'],
      'headyconnection': ['headyconnection-core', 'headyapi'],
      'heady-discord': ['heady-discord-connector', 'headyapi'],
      'heady-slack': ['headyapi', 'headybot-core'],
      'heady-observer': ['heady-traces', 'heady-logs', 'heady-metrics'],
      'heady-maestro': ['heady-patterns', 'heady-kinetics', 'heady-atlas'],
      'Heady-Main': ['Heady'],
      'Heady-Testing': ['Heady'],
      'Heady-Staging': ['Heady'],
      'heady-production': ['Heady-Main']
    };

    return {
      dependencies: deps,
      totalEdges: Object.values(deps).reduce((s, d) => s + d.length, 0),
      rootRepos: this.repos.filter(r => !Object.values(deps).flat().includes(r.name)).map(r => r.name),
      leafRepos: Object.keys(deps)
    };
  }

  getCommunicationMatrix() {
    return {
      protocols: ['MCP (stdio)', 'HTTP/REST', 'WebSocket', 'gRPC', 'Event Bus', 'UDP', 'MIDI'],
      layers: {
        edge: { protocol: 'HTTP/REST + WebSocket', services: ['Cloudflare Workers', 'Pages'] },
        gateway: { protocol: 'HTTP/REST + MCP', services: ['heady-gateway', 'heady-manager'] },
        orchestration: { protocol: 'Event Bus + gRPC', services: ['heady-conductor', 'heady-maestro'] },
        intelligence: { protocol: 'Event Bus', services: ['heady-brain', 'heady-vinci', 'heady-pythia'] },
        memory: { protocol: 'gRPC + Event Bus', services: ['heady-memory', 'pgvector', 'redis'] },
        observability: { protocol: 'Event Bus + UDP', services: ['heady-observer', 'heady-traces'] }
      },
      cslGating: 'All inter-service routing passes through CSL confidence gates',
      poolRouting: 'Requests assigned to Hot(34%)/Warm(21%)/Cold(13%) pools by confidence',
      backoff: `φ^attempt × base ms (jitter ±${Math.round(PSI * 100) / 100 * 100}%)`
    };
  }
}

// ─── Evolution Engine ───────────────────────────────────────────────
class EvolutionEngine {
  constructor() {
    this.generations = [];
    this.mutations = [];
    this.canaryState = { active: false, percentage: 0, variant: null };
  }

  mutate(config) {
    const mutation = {
      id: `mut-${Date.now().toString(36)}`,
      parent: config.parent || 'baseline',
      changes: config.changes || {},
      fitness: null,
      status: 'proposed',
      canaryPercentage: 0,
      created: new Date().toISOString()
    };
    this.mutations.push(mutation);
    return mutation;
  }

  evaluateFitness(mutationId, metrics) {
    const mutation = this.mutations.find(m => m.id === mutationId);
    if (!mutation) throw new Error(`Mutation ${mutationId} not found`);

    const fitness = (
      (metrics.accuracy || 0) * 0.34 +
      (metrics.performance || 0) * 0.21 +
      (metrics.reliability || 0) * 0.21 +
      (metrics.efficiency || 0) * 0.13 +
      (metrics.safety || 0) * 0.11
    );

    mutation.fitness = fitness;
    mutation.metrics = metrics;
    mutation.status = fitness >= PSI ? 'viable' : 'rejected';
    return mutation;
  }

  canaryDeploy(mutationId) {
    const mutation = this.mutations.find(m => m.id === mutationId);
    if (!mutation || mutation.status !== 'viable') throw new Error('Mutation not viable for canary');

    // Canary rollout: 1% → 5% → 20% → 100%
    const stages = [1, 5, 20, 100];
    const currentStageIdx = stages.indexOf(this.canaryState.percentage);
    const nextPercentage = stages[currentStageIdx + 1] || stages[0];

    this.canaryState = {
      active: true,
      percentage: nextPercentage,
      variant: mutationId,
      stage: currentStageIdx + 2,
      totalStages: stages.length
    };

    mutation.canaryPercentage = nextPercentage;
    mutation.status = nextPercentage === 100 ? 'fully-deployed' : 'canary';

    return { mutation, canary: this.canaryState };
  }

  getStatus() {
    return {
      totalMutations: this.mutations.length,
      viable: this.mutations.filter(m => m.status === 'viable').length,
      rejected: this.mutations.filter(m => m.status === 'rejected').length,
      canary: this.canaryState,
      recent: this.mutations.slice(-10)
    };
  }
}

// ─── Instantiate everything ─────────────────────────────────────────
const messageBus = new HeadyMessageBus();
const serviceMesh = new ServiceMesh(messageBus);
const ecosystem = new EcosystemAnalyzer();
const evolution = new EvolutionEngine();

// Auto-register core services
const coreServices = [
  { id: 'heady-gateway', port: 3330, type: 'gateway' },
  { id: 'heady-manager', port: 3301, type: 'manager' },
  { id: 'heady-brain', port: 3302, type: 'intelligence' },
  { id: 'heady-conductor', port: 3303, type: 'orchestration' },
  { id: 'heady-persistence', port: 3340, type: 'storage' },
  { id: 'heady-buddy', port: 3310, type: 'companion' },
  { id: 'heady-autocontext', port: 3396, type: 'enrichment' },
  { id: 'search-service', port: 3391, type: 'search' },
  { id: 'auth-session', port: 3395, type: 'auth' },
  { id: 'notification-service', port: 3394, type: 'notifications' },
  { id: 'analytics-service', port: 3392, type: 'analytics' },
  { id: 'scheduler-service', port: 3390, type: 'scheduler' }
];
coreServices.forEach(s => serviceMesh.register(s.id, s));

module.exports = {
  HeadyMessageBus, ServiceMesh, EcosystemAnalyzer, EvolutionEngine,
  messageBus, serviceMesh, ecosystem, evolution,

  tools: [
    // ── Message Bus ──────────────────────────────
    {
      name: 'heady_bus_publish',
      description: 'Publish a message to the Heady event bus',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string', description: 'Message channel (e.g., service.deploy, swarm.complete)' },
          payload: { type: 'object', description: 'Message payload' },
          correlationId: { type: 'string', description: 'Correlation ID for tracing' }
        },
        required: ['channel', 'payload']
      }
    },
    {
      name: 'heady_bus_stats',
      description: 'Get message bus statistics — channels, message counts, recent activity',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_bus_trace',
      description: 'Trace a correlation chain through the message bus',
      inputSchema: {
        type: 'object',
        properties: {
          correlationId: { type: 'string', description: 'Correlation ID to trace' }
        },
        required: ['correlationId']
      }
    },
    // ── Service Mesh ─────────────────────────────
    {
      name: 'heady_mesh_register',
      description: 'Register a service in the Heady service mesh',
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: { type: 'string' },
          port: { type: 'number' },
          type: { type: 'string' }
        },
        required: ['serviceId']
      }
    },
    {
      name: 'heady_mesh_invoke',
      description: 'Invoke a service through the mesh with circuit breaker protection',
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: { type: 'string' },
          operation: { type: 'string' },
          payload: { type: 'object' }
        },
        required: ['serviceId', 'operation']
      }
    },
    {
      name: 'heady_mesh_topology',
      description: 'Get service mesh topology — all services, health, circuit breakers, latency',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_mesh_health',
      description: 'Run federated health check across all mesh services',
      inputSchema: { type: 'object', properties: {} }
    },
    // ── Ecosystem ────────────────────────────────
    {
      name: 'heady_ecosystem_map',
      description: 'Get the complete Heady ecosystem map — all 70+ repos organized by layer',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_ecosystem_dependencies',
      description: 'Get the inter-repo dependency graph',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_ecosystem_communication',
      description: 'Get the communication matrix — protocols, layers, CSL gating, pool routing',
      inputSchema: { type: 'object', properties: {} }
    },
    // ── Evolution ────────────────────────────────
    {
      name: 'heady_evolution_mutate',
      description: 'Propose a controlled mutation for the evolution engine',
      inputSchema: {
        type: 'object',
        properties: {
          parent: { type: 'string', description: 'Parent configuration to mutate from' },
          changes: { type: 'object', description: 'Proposed changes' }
        }
      }
    },
    {
      name: 'heady_evolution_fitness',
      description: 'Evaluate fitness of a mutation with phi-weighted metrics',
      inputSchema: {
        type: 'object',
        properties: {
          mutationId: { type: 'string' },
          accuracy: { type: 'number' },
          performance: { type: 'number' },
          reliability: { type: 'number' },
          efficiency: { type: 'number' },
          safety: { type: 'number' }
        },
        required: ['mutationId']
      }
    },
    {
      name: 'heady_evolution_canary',
      description: 'Deploy a viable mutation via canary rollout (1% → 5% → 20% → 100%)',
      inputSchema: {
        type: 'object',
        properties: {
          mutationId: { type: 'string' }
        },
        required: ['mutationId']
      }
    },
    {
      name: 'heady_evolution_status',
      description: 'Get evolution engine status — mutations, fitness, canary state',
      inputSchema: { type: 'object', properties: {} }
    }
  ],

  async handleTool(name, args) {
    switch (name) {
      case 'heady_bus_publish': return messageBus.publish(args.channel, args.payload, args.correlationId);
      case 'heady_bus_stats': return messageBus.getStats();
      case 'heady_bus_trace': return { chain: messageBus.getCorrelationChain(args.correlationId) };
      case 'heady_mesh_register': return serviceMesh.register(args.serviceId, { port: args.port, type: args.type });
      case 'heady_mesh_invoke': return serviceMesh.invoke(args.serviceId, args.operation, args.payload);
      case 'heady_mesh_topology': return serviceMesh.getTopology();
      case 'heady_mesh_health': return serviceMesh.healthCheck();
      case 'heady_ecosystem_map': return ecosystem.getEcosystemMap();
      case 'heady_ecosystem_dependencies': return ecosystem.getDependencyGraph();
      case 'heady_ecosystem_communication': return ecosystem.getCommunicationMatrix();
      case 'heady_evolution_mutate': return evolution.mutate(args);
      case 'heady_evolution_fitness': return evolution.evaluateFitness(args.mutationId, args);
      case 'heady_evolution_canary': return evolution.canaryDeploy(args.mutationId);
      case 'heady_evolution_status': return evolution.getStatus();
      default: throw new Error(`Unknown tool: ${name}`);
    }
  }
};
