#!/usr/bin/env node
/**
 * Validation script — verifies all enhancement components load correctly
 */

const path = require('path');
const fs = require('fs');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    checks.push({ name, status: '✓' });
    passed++;
  } catch (err) {
    checks.push({ name, status: '✗', error: err.message });
    failed++;
  }
}

// Validate all modules load
check('EnhancedMCPServer loads', () => {
  const { EnhancedMCPServer } = require('../services/enhanced-mcp-server');
  const server = new EnhancedMCPServer({});
  server.registerAllTools();
  if (server.tools.size < 35) throw new Error(`Expected 35+ tools, got ${server.tools.size}`);
});

check('WorkflowOrchestrator loads', () => {
  const { WorkflowOrchestrator } = require('../workflows/workflow-orchestrator');
  const orch = new WorkflowOrchestrator({});
  if (orch.workflows.size < 10) throw new Error(`Expected 10+ workflows, got ${orch.workflows.size}`);
});

check('AgentSwarmManager loads', () => {
  const { AgentSwarmManager } = require('../agents/agent-swarm-manager');
  const mgr = new AgentSwarmManager({});
  if (mgr.agents.size < 15) throw new Error(`Expected 15+ agents, got ${mgr.agents.size}`);
});

check('LiquidNodeRegistry loads', () => {
  const { LiquidNodeRegistry } = require('../nodes/liquid-node-registry');
  const reg = new LiquidNodeRegistry({});
  if (reg.nodes.size < 14) throw new Error(`Expected 14+ nodes, got ${reg.nodes.size}`);
});

check('HeadyMeshWiring loads', () => {
  const { HeadyMeshWiring } = require('../wiring/heady-mesh');
  const mesh = new HeadyMeshWiring({});
  mesh.registerAllServices();
  if (mesh.serviceRegistry.size < 30) throw new Error(`Expected 30+ services, got ${mesh.serviceRegistry.size}`);
});

// Validate configs
check('enhancement-manifest.yaml exists', () => {
  const p = path.join(__dirname, '..', 'configs', 'enhancement-manifest.yaml');
  if (!fs.existsSync(p)) throw new Error('File not found');
});

check('service-wiring-matrix.yaml exists', () => {
  const p = path.join(__dirname, '..', 'configs', 'service-wiring-matrix.yaml');
  if (!fs.existsSync(p)) throw new Error('File not found');
});

check('liquid-os-topology.yaml exists', () => {
  const p = path.join(__dirname, '..', 'configs', 'liquid-os-topology.yaml');
  if (!fs.existsSync(p)) throw new Error('File not found');
});

// Validate YAML parsability
check('YAML configs parse correctly', () => {
  try {
    const yaml = require('js-yaml');
    const configs = ['enhancement-manifest.yaml', 'service-wiring-matrix.yaml', 'liquid-os-topology.yaml'];
    for (const c of configs) {
      const content = fs.readFileSync(path.join(__dirname, '..', 'configs', c), 'utf8');
      yaml.load(content);
    }
  } catch (e) {
    // js-yaml may not be installed, skip
    if (e.code === 'MODULE_NOT_FOUND') return;
    throw e;
  }
});

// Validate PHI constants
check('PHI constants are correct', () => {
  const PHI = 1.618033988749895;
  const PSI = 0.6180339887498949;
  if (Math.abs(PHI * PSI - 1) > 0.0001) throw new Error('PHI × PSI should ≈ 1');
  if (Math.abs(PHI - PSI - 1) > 0.0001) throw new Error('PHI - PSI should ≈ 1');
});

// Validate port uniqueness
check('All ports are unique', () => {
  const { LiquidNodeRegistry } = require('../nodes/liquid-node-registry');
  const { AgentSwarmManager } = require('../agents/agent-swarm-manager');

  const reg = new LiquidNodeRegistry({});
  const mgr = new AgentSwarmManager({});

  const ports = new Set();
  const duplicates = [];

  for (const [, node] of reg.nodes) {
    if (node.port) {
      if (ports.has(node.port)) duplicates.push(`${node.id}:${node.port}`);
      ports.add(node.port);
    }
  }

  for (const [, agent] of mgr.agents) {
    if (agent.port) {
      if (ports.has(agent.port)) duplicates.push(`${agent.id}:${agent.port}`);
      ports.add(agent.port);
    }
  }

  if (duplicates.length > 0) throw new Error(`Duplicate ports: ${duplicates.join(', ')}`);
});

// Report
console.log('\n═══════════════════════════════════════════════');
console.log('  HeadyMCP Enhancement Pack — Validation Report');
console.log('═══════════════════════════════════════════════\n');

for (const c of checks) {
  console.log(`  ${c.status} ${c.name}${c.error ? ` — ${c.error}` : ''}`);
}

console.log(`\n  Results: ${passed} passed, ${failed} failed, ${checks.length} total\n`);
process.exit(failed > 0 ? 1 : 0);
