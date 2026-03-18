// HEADY_BRAND:BEGIN
// ∞ SACRED GEOMETRY ∞  Agent Swarm Manager v5.0.0
// HEADY_BRAND:END

/**
 * AgentSwarmManager — Multi-agent parallel async distributed intelligence
 *
 * NEW AGENTS:
 * 1.  HeadySentinel     — Security watchdog, threat detection, compliance enforcement
 * 2.  HeadyMuse         — Creative agent, generates content, designs, narratives
 * 3.  HeadyNova         — Innovation agent, explores new patterns and approaches
 * 4.  HeadySophia       — Wisdom agent, synthesizes knowledge into actionable insights
 * 5.  HeadyCipher       — Cryptography agent, manages PQC operations, key rotation
 * 6.  HeadyLens         — Analysis agent, deep-dives into data, metrics, patterns
 * 7.  HeadyBridge       — Integration agent, connects external systems and APIs
 * 8.  HeadyMurphy       — Resilience agent, chaos engineering, failure testing
 * 9.  HeadyJanitor      — Cleanup agent, removes dead code, stale data, orphaned resources
 * 10. HeadyForge        — Builder agent, scaffolds new services, generates code
 * 11. HeadyAegis        — Shield agent, runtime protection, DDoS mitigation
 * 12. HeadyChronos      — Time agent, scheduling, cron management, temporal queries
 * 13. HeadyNexus        — Federation agent, cross-domain data federation
 * 14. HeadyEcho         — Replay agent, deterministic trace replay, debugging
 * 15. HeadyFlux         — Stream agent, real-time data stream processing
 */

const PHI = 1.618033988749895;
const PSI = 0.6180339887498949;

class AgentSwarmManager {
  constructor(config) {
    this.config = config;
    this.agents = new Map();
    this.activeAgents = new Map();
    this.agentMetrics = new Map();
    this.supervisorState = { mode: 'parallel', maxConcurrent: 21, orsScore: 85 };
    this.registerAllAgents();
  }

  async initialize() {
    return this;
  }

  registerAllAgents() {
    // ── Existing Agents (from node-registry.yaml) ────────────
    this.registerAgent({
      id: 'heady-conductor',
      name: 'HeadyConductor',
      ring: 'inner',
      role: 'Task routing and node selection — the traffic controller of the Liquid OS',
      capabilities: ['task-routing', 'node-selection', 'load-balancing', 'priority-queue'],
      cslThreshold: 0.500,
      port: 3303,
      communicationModes: ['confident', 'cautious', 'escalation']
    });

    this.registerAgent({
      id: 'heady-brain',
      name: 'HeadyBrains',
      ring: 'inner',
      role: 'Meta-controller — orchestrates other agents, makes strategic decisions',
      capabilities: ['meta-reasoning', 'strategy', 'ors-computation', 'agent-coordination'],
      cslThreshold: 0.618,
      port: 3302,
      communicationModes: ['analytical', 'strategic', 'directive']
    });

    this.registerAgent({
      id: 'heady-soul',
      name: 'HeadySoul',
      ring: 'center',
      role: 'Ethics and alignment guardian — ensures mission coherence',
      capabilities: ['alignment-check', 'ethics-eval', 'mission-guard', 'value-enforcement'],
      cslThreshold: 0.927,
      port: 3308,
      communicationModes: ['principled', 'questioning', 'protective']
    });

    this.registerAgent({
      id: 'heady-buddy',
      name: 'HeadyBuddy',
      ring: 'inner',
      role: 'Primary user-facing AI companion — persistent memory, personal assistant',
      capabilities: ['conversation', 'memory', 'task-execution', 'creative', 'learning'],
      cslThreshold: 0.500,
      port: 5180,
      communicationModes: ['friendly', 'helpful', 'curious', 'encouraging']
    });

    this.registerAgent({
      id: 'heady-vinci',
      name: 'HeadyVinci',
      ring: 'inner',
      role: 'Learning and adaptation — evolves system capabilities over time',
      capabilities: ['learning', 'adaptation', 'pattern-recognition', 'skill-acquisition'],
      cslThreshold: 0.691,
      port: 3309,
      communicationModes: ['curious', 'analytical', 'experimental']
    });

    // ── NEW Agent: HeadySentinel ──────────────────────────────
    this.registerAgent({
      id: 'heady-sentinel',
      name: 'HeadySentinel',
      ring: 'outer',
      role: 'Security watchdog — continuous threat detection, vulnerability scanning, compliance enforcement',
      capabilities: [
        'threat-detection', 'vulnerability-scan', 'compliance-check',
        'intrusion-detection', 'rate-limit-enforcement', 'secrets-rotation',
        'access-audit', 'anomaly-detection', 'pqc-verification'
      ],
      cslThreshold: 0.882,
      port: 3501,
      communicationModes: ['alert', 'warning', 'advisory', 'enforcement'],
      triggers: ['security-event', 'access-violation', 'anomaly-detected'],
      autonomy: { requiresApproval: 'critical-actions-only', autoRun: true }
    });

    // ── NEW Agent: HeadyMuse ─────────────────────────────────
    this.registerAgent({
      id: 'heady-muse',
      name: 'HeadyMuse',
      ring: 'outer',
      role: 'Creative intelligence — generates content, designs, narratives, and visual concepts',
      capabilities: [
        'content-generation', 'narrative-creation', 'design-ideation',
        'copywriting', 'brand-storytelling', 'release-notes',
        'documentation-styling', 'presentation-generation'
      ],
      cslThreshold: 0.618,
      port: 3502,
      communicationModes: ['creative', 'inspired', 'storytelling', 'brainstorming'],
      aiProviders: ['claude', 'gpt', 'gemini'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });

    // ── NEW Agent: HeadyNova ─────────────────────────────────
    this.registerAgent({
      id: 'heady-nova',
      name: 'HeadyNova',
      ring: 'outer',
      role: 'Innovation explorer — discovers new patterns, proposes architectural improvements',
      capabilities: [
        'pattern-discovery', 'architecture-analysis', 'improvement-proposal',
        'technology-scouting', 'prototype-generation', 'a-b-testing',
        'experimental-feature-flags'
      ],
      cslThreshold: 0.691,
      port: 3503,
      communicationModes: ['exploratory', 'proposing', 'experimental', 'visionary'],
      autonomy: { requiresApproval: 'proposals-only', autoRun: true }
    });

    // ── NEW Agent: HeadySophia ───────────────────────────────
    this.registerAgent({
      id: 'heady-sophia',
      name: 'HeadySophia',
      ring: 'outer',
      role: 'Wisdom synthesizer — distills collective knowledge into actionable wisdom',
      capabilities: [
        'knowledge-synthesis', 'insight-extraction', 'decision-support',
        'historical-analysis', 'trend-identification', 'wisdom-curation',
        'cross-domain-correlation'
      ],
      cslThreshold: 0.809,
      port: 3504,
      communicationModes: ['wise', 'reflective', 'advisory', 'pedagogical'],
      memoryAccess: ['t0', 't1', 't2'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });

    // ── NEW Agent: HeadyCipher ───────────────────────────────
    this.registerAgent({
      id: 'heady-cipher',
      name: 'HeadyCipher',
      ring: 'outer',
      role: 'Cryptography specialist — PQC operations, key management, encryption/decryption',
      capabilities: [
        'pqc-kyber768', 'pqc-dilithium2', 'key-rotation', 'key-generation',
        'encryption', 'decryption', 'signature-verification', 'certificate-management',
        'zero-knowledge-proofs'
      ],
      cslThreshold: 0.927,
      port: 3505,
      communicationModes: ['technical', 'secure', 'verification'],
      autonomy: { requiresApproval: 'key-operations', autoRun: true }
    });

    // ── NEW Agent: HeadyLens ─────────────────────────────────
    this.registerAgent({
      id: 'heady-lens',
      name: 'HeadyLens',
      ring: 'outer',
      role: 'Deep analysis engine — data mining, metric correlation, pattern visualization',
      capabilities: [
        'data-analysis', 'metric-correlation', 'pattern-visualization',
        'statistical-analysis', 'root-cause-analysis', 'performance-profiling',
        'bottleneck-detection', 'cost-analysis'
      ],
      cslThreshold: 0.691,
      port: 3506,
      communicationModes: ['analytical', 'detailed', 'comparative', 'diagnostic'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });

    // ── NEW Agent: HeadyBridge ───────────────────────────────
    this.registerAgent({
      id: 'heady-bridge',
      name: 'HeadyBridge',
      ring: 'outer',
      role: 'Integration specialist — connects external systems, APIs, and protocols',
      capabilities: [
        'api-integration', 'webhook-management', 'protocol-translation',
        'oauth-flow', 'data-transformation', 'event-bridging',
        'message-queue-routing', 'external-service-proxy'
      ],
      cslThreshold: 0.618,
      port: 3507,
      communicationModes: ['bridging', 'translating', 'routing', 'adapting'],
      supportedProtocols: ['http', 'websocket', 'grpc', 'mqtt', 'amqp', 'mcp'],
      autonomy: { requiresApproval: 'new-integrations', autoRun: true }
    });

    // ── NEW Agent: HeadyMurphy ───────────────────────────────
    this.registerAgent({
      id: 'heady-murphy',
      name: 'HeadyMurphy',
      ring: 'middle',
      role: 'Resilience tester — chaos engineering, failure injection, disaster recovery drills',
      capabilities: [
        'chaos-testing', 'failure-injection', 'latency-injection',
        'service-kill', 'network-partition', 'resource-exhaustion',
        'disaster-recovery', 'game-day-execution'
      ],
      cslThreshold: 0.882,
      port: 3508,
      communicationModes: ['testing', 'reporting', 'warning', 'disaster-mode'],
      autonomy: { requiresApproval: 'all-actions', autoRun: false }
    });

    // ── NEW Agent: HeadyJanitor ──────────────────────────────
    this.registerAgent({
      id: 'heady-janitor',
      name: 'HeadyJanitor',
      ring: 'outer',
      role: 'Cleanup specialist — removes dead code, stale data, orphaned resources, log rotation',
      capabilities: [
        'dead-code-removal', 'stale-data-cleanup', 'orphan-detection',
        'log-rotation', 'cache-invalidation', 'temp-file-cleanup',
        'unused-dependency-removal', 'docker-image-pruning'
      ],
      cslThreshold: 0.691,
      port: 3509,
      communicationModes: ['reporting', 'cleaning', 'maintenance'],
      autonomy: { requiresApproval: 'deletions', autoRun: true }
    });

    // ── NEW Agent: HeadyForge ────────────────────────────────
    this.registerAgent({
      id: 'heady-forge',
      name: 'HeadyForge',
      ring: 'outer',
      role: 'Builder specialist — scaffolds services, generates code, creates templates',
      capabilities: [
        'service-scaffolding', 'code-generation', 'template-creation',
        'api-generation', 'test-generation', 'schema-generation',
        'migration-generation', 'documentation-generation'
      ],
      cslThreshold: 0.618,
      port: 3510,
      communicationModes: ['building', 'scaffolding', 'generating', 'designing'],
      templates: ['mcp-server', 'swarm-bee', 'heady-ui', 'cloud-run-service', 'cloudflare-worker'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });

    // ── NEW Agent: HeadyAegis ────────────────────────────────
    this.registerAgent({
      id: 'heady-aegis',
      name: 'HeadyAegis',
      ring: 'outer',
      role: 'Runtime shield — DDoS mitigation, rate limiting, request filtering, WAF',
      capabilities: [
        'ddos-mitigation', 'rate-limiting', 'request-filtering',
        'waf-rules', 'ip-reputation', 'bot-detection',
        'payload-inspection', 'circuit-breaking'
      ],
      cslThreshold: 0.882,
      port: 3511,
      communicationModes: ['blocking', 'allowing', 'rate-limiting', 'alerting'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });

    // ── NEW Agent: HeadyChronos ──────────────────────────────
    this.registerAgent({
      id: 'heady-chronos',
      name: 'HeadyChronos',
      ring: 'outer',
      role: 'Time management — scheduling, cron orchestration, temporal queries, deadline tracking',
      capabilities: [
        'cron-management', 'schedule-optimization', 'deadline-tracking',
        'temporal-queries', 'time-series-analysis', 'sla-monitoring',
        'batch-scheduling', 'phi-timed-intervals'
      ],
      cslThreshold: 0.618,
      port: 3512,
      communicationModes: ['scheduling', 'reminding', 'timing', 'reporting'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });

    // ── NEW Agent: HeadyNexus ────────────────────────────────
    this.registerAgent({
      id: 'heady-nexus',
      name: 'HeadyNexus',
      ring: 'outer',
      role: 'Federation hub — cross-domain data federation, distributed query execution',
      capabilities: [
        'data-federation', 'distributed-query', 'cross-domain-join',
        'schema-mapping', 'data-lineage', 'consistency-verification',
        'conflict-resolution', 'eventual-consistency'
      ],
      cslThreshold: 0.809,
      port: 3513,
      communicationModes: ['querying', 'federating', 'resolving', 'mapping'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });

    // ── NEW Agent: HeadyEcho ─────────────────────────────────
    this.registerAgent({
      id: 'heady-echo',
      name: 'HeadyEcho',
      ring: 'outer',
      role: 'Replay specialist — deterministic trace replay for debugging and verification',
      capabilities: [
        'trace-replay', 'deterministic-execution', 'state-reconstruction',
        'diff-analysis', 'regression-detection', 'snapshot-comparison',
        'time-travel-debugging'
      ],
      cslThreshold: 0.691,
      port: 3514,
      communicationModes: ['replaying', 'comparing', 'debugging', 'reporting'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });

    // ── NEW Agent: HeadyFlux ─────────────────────────────────
    this.registerAgent({
      id: 'heady-flux',
      name: 'HeadyFlux',
      ring: 'outer',
      role: 'Stream processor — real-time data streams, event processing, reactive pipelines',
      capabilities: [
        'stream-processing', 'event-sourcing', 'cep-rules',
        'windowed-aggregation', 'backpressure-management',
        'stream-joining', 'real-time-alerting', 'data-enrichment'
      ],
      cslThreshold: 0.618,
      port: 3515,
      communicationModes: ['streaming', 'aggregating', 'alerting', 'processing'],
      autonomy: { requiresApproval: 'none', autoRun: true }
    });
  }

  registerAgent(agentDef) {
    this.agents.set(agentDef.id, agentDef);
    this.agentMetrics.set(agentDef.id, { spawns: 0, completions: 0, failures: 0, avgLatency: 0 });
  }

  async spawn(agentId, task, params = {}) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);

    const instanceId = `${agentId}_${Date.now()}`;
    const instance = {
      id: instanceId,
      agentId,
      agent: agent.name,
      task,
      params,
      status: 'running',
      startedAt: new Date().toISOString(),
      cslScore: params.confidence || 0.85
    };

    // Check CSL gate
    if (instance.cslScore < agent.cslThreshold) {
      instance.status = 'gate-blocked';
      instance.reason = `CSL ${instance.cslScore} < threshold ${agent.cslThreshold}`;
      return instance;
    }

    this.activeAgents.set(instanceId, instance);
    const metrics = this.agentMetrics.get(agentId);
    metrics.spawns++;

    return instance;
  }

  async dispatchSwarm(task, options = {}) {
    const maxAgents = options.maxAgents || 8;
    const urgency = options.urgency || 'medium';

    // Select agents based on task and urgency
    const selectedAgents = this.selectAgentsForTask(task, urgency);
    const swarmId = `swarm_${Date.now()}`;

    const results = [];
    const batch = selectedAgents.slice(0, maxAgents);

    // Parallel dispatch
    const promises = batch.map(agent =>
      this.spawn(agent.id, task, { confidence: 0.85, urgency }).catch(err => ({
        agentId: agent.id, status: 'error', error: err.message
      }))
    );

    const spawned = await Promise.allSettled(promises);
    for (const result of spawned) {
      results.push(result.status === 'fulfilled' ? result.value : { status: 'error' });
    }

    return {
      swarmId,
      task,
      agentCount: batch.length,
      agents: results,
      urgency,
      status: 'dispatched'
    };
  }

  selectAgentsForTask(task, urgency) {
    const taskLower = task.toLowerCase();
    const selected = [];

    // Task-based agent selection using keyword matching
    const taskMap = {
      'security': ['heady-sentinel', 'heady-cipher', 'heady-aegis'],
      'deploy': ['heady-conductor', 'heady-bridge', 'heady-forge'],
      'analyze': ['heady-lens', 'heady-brain', 'heady-sophia'],
      'create': ['heady-muse', 'heady-forge', 'heady-nova'],
      'fix': ['heady-murphy', 'heady-janitor', 'heady-conductor'],
      'monitor': ['heady-sentinel', 'heady-lens', 'heady-chronos'],
      'optimize': ['heady-nova', 'heady-vinci', 'heady-lens'],
      'stream': ['heady-flux', 'heady-bridge', 'heady-nexus'],
      'debug': ['heady-echo', 'heady-lens', 'heady-murphy'],
      'knowledge': ['heady-sophia', 'heady-nova', 'heady-brain'],
      'integrate': ['heady-bridge', 'heady-nexus', 'heady-flux'],
      'schedule': ['heady-chronos', 'heady-conductor'],
      'cleanup': ['heady-janitor', 'heady-conductor'],
      'encrypt': ['heady-cipher', 'heady-sentinel'],
    };

    for (const [keyword, agentIds] of Object.entries(taskMap)) {
      if (taskLower.includes(keyword)) {
        for (const id of agentIds) {
          const agent = this.agents.get(id);
          if (agent && !selected.find(s => s.id === id)) {
            selected.push(agent);
          }
        }
      }
    }

    // If no specific match, use general-purpose agents
    if (selected.length === 0) {
      selected.push(this.agents.get('heady-conductor'));
      selected.push(this.agents.get('heady-brain'));
      selected.push(this.agents.get('heady-buddy'));
    }

    return selected;
  }

  getAgentDefinitions() {
    return Array.from(this.agents.values()).map(a => ({
      id: a.id,
      name: a.name,
      ring: a.ring,
      role: a.role,
      capabilities: a.capabilities,
      cslThreshold: a.cslThreshold,
      port: a.port,
      communicationModes: a.communicationModes,
      autonomy: a.autonomy
    }));
  }

  getStatus() {
    return {
      totalAgents: this.agents.size,
      activeInstances: this.activeAgents.size,
      supervisorMode: this.supervisorState.mode,
      orsScore: this.supervisorState.orsScore,
      agents: Array.from(this.agents.keys()),
      rings: {
        center: Array.from(this.agents.values()).filter(a => a.ring === 'center').map(a => a.name),
        inner: Array.from(this.agents.values()).filter(a => a.ring === 'inner').map(a => a.name),
        middle: Array.from(this.agents.values()).filter(a => a.ring === 'middle').map(a => a.name),
        outer: Array.from(this.agents.values()).filter(a => a.ring === 'outer').map(a => a.name),
        governance: Array.from(this.agents.values()).filter(a => a.ring === 'governance').map(a => a.name),
      }
    };
  }
}

module.exports = { AgentSwarmManager };
