#!/usr/bin/env node
// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  HEADY SYSTEMS — Orchestration MCP Server                      ║
// ║  ∞ SACRED GEOMETRY ∞  Liquid Dynamic Parallel Async OS         ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Heady Orchestration MCP Server
 *
 * Provides deep orchestration tools for the Liquid Latent OS:
 * - Swarm lifecycle management
 * - Bee factory operations
 * - Conductor routing
 * - Pipeline stage control
 * - Parallel async task fanout
 * - CSL-gated decision routing
 */

const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');

const PHI = 1.618033988749895;
const PSI = 0.6180339887498949;
const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

// CSL Confidence Thresholds
const CSL = {
  MINIMUM: 0.500,
  LOW: 0.691,
  MEDIUM: 0.809,
  HIGH: 0.882,
  CRITICAL: 0.927,
  DEDUP: 0.972
};

class TaskGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.results = new Map();
    this.running = new Set();
    this.completed = new Set();
    this.failed = new Map();
  }

  addTask(id, fn, deps = []) {
    this.nodes.set(id, fn);
    this.edges.set(id, deps);
    return this;
  }

  getReady() {
    const ready = [];
    for (const [id, deps] of this.edges) {
      if (this.completed.has(id) || this.running.has(id) || this.failed.has(id)) continue;
      if (deps.every(d => this.completed.has(d))) ready.push(id);
    }
    return ready;
  }

  async execute(concurrency = FIB[8]) {
    const emitter = new EventEmitter();
    const startTime = Date.now();

    const runBatch = async () => {
      const ready = this.getReady();
      if (ready.length === 0 && this.running.size === 0) return;

      const batch = ready.slice(0, concurrency);
      const promises = batch.map(async (id) => {
        this.running.add(id);
        emitter.emit('task:start', { id, timestamp: Date.now() });
        try {
          const fn = this.nodes.get(id);
          const depResults = {};
          for (const dep of this.edges.get(id)) {
            depResults[dep] = this.results.get(dep);
          }
          const result = await fn(depResults);
          this.results.set(id, result);
          this.running.delete(id);
          this.completed.add(id);
          emitter.emit('task:complete', { id, result, timestamp: Date.now() });
        } catch (err) {
          this.running.delete(id);
          this.failed.set(id, err.message);
          emitter.emit('task:error', { id, error: err.message, timestamp: Date.now() });
        }
      });

      await Promise.allSettled(promises);
      if (this.getReady().length > 0 || this.running.size > 0) {
        await runBatch();
      }
    };

    await runBatch();

    return {
      completed: [...this.completed],
      failed: Object.fromEntries(this.failed),
      results: Object.fromEntries(this.results),
      durationMs: Date.now() - startTime,
      parallelism: concurrency
    };
  }
}

class SwarmManager {
  constructor() {
    this.swarms = new Map();
    this.beePool = { hot: [], warm: [], cold: [] };
  }

  createSwarm(id, config) {
    const swarm = {
      id,
      bees: [],
      consensus: null,
      status: 'initializing',
      created: new Date().toISOString(),
      config: {
        maxBees: config.maxBees || FIB[8],
        consensusThreshold: config.consensusThreshold || CSL.MEDIUM,
        timeout: config.timeout || FIB[13] * 1000,
        strategy: config.strategy || 'consensus-superposition',
        ...config
      }
    };
    this.swarms.set(id, swarm);
    return swarm;
  }

  spawnBee(swarmId, beeType, params = {}) {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) throw new Error(`Swarm ${swarmId} not found`);

    const bee = {
      id: `${beeType}-${Date.now().toString(36)}`,
      type: beeType,
      swarmId,
      status: 'spawned',
      resonance: params.resonance || PSI,
      priority: params.priority || 0.5,
      created: new Date().toISOString(),
      params
    };
    swarm.bees.push(bee);
    this.beePool.hot.push(bee);
    return bee;
  }

  getSwarmStatus(swarmId) {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) return null;
    return {
      ...swarm,
      beeCount: swarm.bees.length,
      poolDistribution: {
        hot: this.beePool.hot.filter(b => b.swarmId === swarmId).length,
        warm: this.beePool.warm.filter(b => b.swarmId === swarmId).length,
        cold: this.beePool.cold.filter(b => b.swarmId === swarmId).length
      }
    };
  }

  listSwarms() {
    return [...this.swarms.values()].map(s => ({
      id: s.id,
      status: s.status,
      beeCount: s.bees.length,
      created: s.created,
      strategy: s.config.strategy
    }));
  }

  dissolveSwarm(swarmId) {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) throw new Error(`Swarm ${swarmId} not found`);
    swarm.status = 'dissolved';
    swarm.bees.forEach(b => { b.status = 'retired'; });
    this.beePool.hot = this.beePool.hot.filter(b => b.swarmId !== swarmId);
    this.beePool.warm = this.beePool.warm.filter(b => b.swarmId !== swarmId);
    this.beePool.cold = this.beePool.cold.filter(b => b.swarmId !== swarmId);
    this.swarms.delete(swarmId);
    return { dissolved: swarmId, beesRetired: swarm.bees.length };
  }
}

class CSLRouter {
  constructor() {
    this.routes = new Map();
    this.metrics = { totalRouted: 0, byDomain: {} };
  }

  addRoute(domain, handler, minConfidence = CSL.MINIMUM) {
    this.routes.set(domain, { handler, minConfidence, invocations: 0 });
  }

  async route(domain, confidence, payload) {
    const route = this.routes.get(domain);
    if (!route) throw new Error(`No route for domain: ${domain}`);
    if (confidence < route.minConfidence) {
      return { routed: false, reason: `Confidence ${confidence} below threshold ${route.minConfidence}`, domain };
    }
    route.invocations++;
    this.metrics.totalRouted++;
    this.metrics.byDomain[domain] = (this.metrics.byDomain[domain] || 0) + 1;

    const pool = confidence >= CSL.CRITICAL ? 'hot'
      : confidence >= CSL.HIGH ? 'hot'
      : confidence >= CSL.MEDIUM ? 'warm'
      : 'cold';

    return {
      routed: true,
      domain,
      confidence,
      pool,
      timestamp: new Date().toISOString()
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      routes: [...this.routes.entries()].map(([domain, r]) => ({
        domain, minConfidence: r.minConfidence, invocations: r.invocations
      }))
    };
  }
}

class PipelineController {
  constructor() {
    this.stages = [
      'CHANNEL_ENTRY', 'AUTH_GATE', 'INTENT_CLASSIFY', 'CONTEXT_ASSEMBLE',
      'NODE_SELECT', 'CSL_GATE', 'BATTLE_DISPATCH', 'MC_SAMPLE',
      'BEE_DISPATCH', 'SWARM_ROUTE', 'EXECUTE', 'QUALITY_GATE',
      'ASSURANCE_GATE', 'PATTERN_CAPTURE', 'DRIFT_CHECK', 'STORY_UPDATE',
      'GOVERNANCE_LOG', 'COST_TALLY', 'CACHE_WRITE', 'RESPONSE_SHAPE', 'RECEIPT'
    ];
    this.runs = [];
    this.currentRun = null;
  }

  startRun(variant = 'FULL_PATH') {
    const variants = {
      FAST_PATH: [0, 2, 4, 10, 19, 20, 18],
      FULL_PATH: this.stages.map((_, i) => i),
      ARENA_PATH: [0, 1, 2, 3, 5, 6, 7, 11, 20],
      LEARNING_PATH: [0, 2, 3, 10, 13, 14, 15]
    };

    const stageIndices = variants[variant] || variants.FULL_PATH;
    this.currentRun = {
      id: `run-${Date.now().toString(36)}`,
      variant,
      stages: stageIndices.map(i => ({
        name: this.stages[i],
        index: i,
        status: 'pending',
        startTime: null,
        endTime: null
      })),
      status: 'running',
      startTime: new Date().toISOString()
    };
    this.runs.push(this.currentRun);
    return this.currentRun;
  }

  advanceStage(runId) {
    const run = this.runs.find(r => r.id === runId) || this.currentRun;
    if (!run) throw new Error('No active run');

    const pendingIdx = run.stages.findIndex(s => s.status === 'pending');
    if (pendingIdx === -1) {
      run.status = 'completed';
      return { completed: true, run };
    }

    if (pendingIdx > 0) {
      run.stages[pendingIdx - 1].status = 'completed';
      run.stages[pendingIdx - 1].endTime = new Date().toISOString();
    }
    run.stages[pendingIdx].status = 'running';
    run.stages[pendingIdx].startTime = new Date().toISOString();

    return { stage: run.stages[pendingIdx], nextIndex: pendingIdx + 1, totalStages: run.stages.length };
  }

  getRunStatus(runId) {
    return this.runs.find(r => r.id === runId) || this.currentRun;
  }

  listRuns() {
    return this.runs.map(r => ({
      id: r.id, variant: r.variant, status: r.status,
      stagesCompleted: r.stages.filter(s => s.status === 'completed').length,
      totalStages: r.stages.length,
      startTime: r.startTime
    }));
  }
}

// Export for use as module or standalone MCP server
const swarmManager = new SwarmManager();
const cslRouter = new CSLRouter();
const pipelineController = new PipelineController();

// Pre-register CSL domains
const domains = [
  'orchestration', 'intelligence', 'creative', 'security', 'learning',
  'performance', 'compliance', 'cost', 'evolution', 'memory',
  'self-awareness', 'code', 'data-sync'
];
domains.forEach(d => cslRouter.addRoute(d, null, CSL.MINIMUM));

module.exports = {
  TaskGraph,
  SwarmManager,
  CSLRouter,
  PipelineController,
  swarmManager,
  cslRouter,
  pipelineController,
  PHI, PSI, FIB, CSL,

  // MCP Tool definitions
  tools: [
    {
      name: 'heady_swarm_create',
      description: 'Create a new bee swarm with consensus-superposition strategy',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string', description: 'Unique swarm identifier' },
          strategy: { type: 'string', description: 'Consensus strategy: consensus-superposition, majority-vote, weighted-rank', enum: ['consensus-superposition', 'majority-vote', 'weighted-rank'] },
          maxBees: { type: 'number', description: 'Maximum bees in swarm (default: 13)' }
        },
        required: ['swarmId']
      }
    },
    {
      name: 'heady_swarm_spawn_bee',
      description: 'Spawn a new bee into an existing swarm',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string', description: 'Target swarm ID' },
          beeType: { type: 'string', description: 'Bee type from catalog (e.g., graph-rag-bee, judge-bee)' },
          resonance: { type: 'number', description: 'Initial resonance score (0-1)' },
          priority: { type: 'number', description: 'Priority level (0-1)' }
        },
        required: ['swarmId', 'beeType']
      }
    },
    {
      name: 'heady_swarm_status',
      description: 'Get status of a swarm including bee pool distribution',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string', description: 'Swarm ID to inspect' }
        },
        required: ['swarmId']
      }
    },
    {
      name: 'heady_swarm_list',
      description: 'List all active swarms',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_swarm_dissolve',
      description: 'Dissolve a swarm and retire all its bees',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string', description: 'Swarm ID to dissolve' }
        },
        required: ['swarmId']
      }
    },
    {
      name: 'heady_csl_route',
      description: 'Route a task through CSL confidence gates to the appropriate domain pool',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'CSL domain (orchestration, intelligence, creative, security, etc.)' },
          confidence: { type: 'number', description: 'Confidence score (0-1)' },
          payload: { type: 'object', description: 'Task payload data' }
        },
        required: ['domain', 'confidence']
      }
    },
    {
      name: 'heady_csl_metrics',
      description: 'Get CSL routing metrics — total routed, per-domain stats',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_pipeline_run',
      description: 'Start a new HCFullPipeline v7 run with variant selection',
      inputSchema: {
        type: 'object',
        properties: {
          variant: { type: 'string', description: 'Pipeline variant: FAST_PATH(7), FULL_PATH(21), ARENA_PATH(9), LEARNING_PATH(7)', enum: ['FAST_PATH', 'FULL_PATH', 'ARENA_PATH', 'LEARNING_PATH'] }
        }
      }
    },
    {
      name: 'heady_pipeline_advance',
      description: 'Advance to the next pipeline stage',
      inputSchema: {
        type: 'object',
        properties: {
          runId: { type: 'string', description: 'Pipeline run ID (optional, uses current run)' }
        }
      }
    },
    {
      name: 'heady_pipeline_runs',
      description: 'List all pipeline runs with status',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_task_graph_execute',
      description: 'Execute a DAG of parallel async tasks with dependency resolution',
      inputSchema: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            description: 'Array of tasks: [{id, deps:[], type}]',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deps: { type: 'array', items: { type: 'string' } },
                type: { type: 'string' }
              },
              required: ['id']
            }
          },
          concurrency: { type: 'number', description: 'Max parallel tasks (default: 13)' }
        },
        required: ['tasks']
      }
    }
  ],

  // MCP Tool handler
  async handleTool(name, args) {
    switch (name) {
      case 'heady_swarm_create':
        return swarmManager.createSwarm(args.swarmId, { strategy: args.strategy, maxBees: args.maxBees });
      case 'heady_swarm_spawn_bee':
        return swarmManager.spawnBee(args.swarmId, args.beeType, { resonance: args.resonance, priority: args.priority });
      case 'heady_swarm_status':
        return swarmManager.getSwarmStatus(args.swarmId);
      case 'heady_swarm_list':
        return swarmManager.listSwarms();
      case 'heady_swarm_dissolve':
        return swarmManager.dissolveSwarm(args.swarmId);
      case 'heady_csl_route':
        return cslRouter.route(args.domain, args.confidence, args.payload);
      case 'heady_csl_metrics':
        return cslRouter.getMetrics();
      case 'heady_pipeline_run':
        return pipelineController.startRun(args?.variant);
      case 'heady_pipeline_advance':
        return pipelineController.advanceStage(args?.runId);
      case 'heady_pipeline_runs':
        return pipelineController.listRuns();
      case 'heady_task_graph_execute': {
        const graph = new TaskGraph();
        for (const task of args.tasks) {
          graph.addTask(task.id, async () => ({ executed: task.id, type: task.type, timestamp: new Date().toISOString() }), task.deps || []);
        }
        return graph.execute(args.concurrency);
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
};
