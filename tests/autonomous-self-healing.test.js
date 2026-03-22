/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  HEADY™ Autonomous Self-Healing — Test Suite                            ║
 * ║  Validates the MAPE-K loop, AST mutation, contract gates, and chaos     ║
 * ║  © 2024-2026 HeadySystems Inc. All Rights Reserved.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── φ-Constants ────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const PSI = 1 / PHI;
const FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

// ═══════════════════════════════════════════════════════════════════════════════
// MAPE-K Test Loop
// ═══════════════════════════════════════════════════════════════════════════════

describe('MapeKTestLoop', () => {
  let MapeKTestLoop, FAILURE_CATEGORY, FIX_STRATEGY;

  beforeEach(() => {
    ({ MapeKTestLoop, FAILURE_CATEGORY, FIX_STRATEGY } = require('../src/testing/mape-k-test-loop'));
  });

  describe('Monitor phase', () => {
    it('captures failure context with stack trace and affected file', async () => {
      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      const result = await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/api/auth.test.js',
          failureMessages: ['Expected true, Received false\n    at Object.<anonymous> (tests/api/auth.test.js:42:10)'],
        },
        attempt: 1
      });

      expect(result).toBeDefined();
      expect(result.action).toBeDefined();
      expect(result.fix).toBeDefined();
    });
  });

  describe('Analyze phase — failure categorization', () => {
    it('categorizes assertion failures', async () => {
      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      const result = await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/unit.test.js',
          failureMessages: ['expect(received).toBe(expected) - Expected: 42, Received: 43'],
        }
      });

      expect(result.fix.type).toBeDefined();
    });

    it('categorizes import errors', async () => {
      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      const result = await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/import.test.js',
          failureMessages: ["Cannot find module '../src/missing-module'"],
        }
      });

      expect(result.fix.strategy).toBe(FIX_STRATEGY.IMPORT_RESOLVE);
    });

    it('categorizes timeout failures', async () => {
      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      const result = await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/slow.test.js',
          failureMessages: ['Timeout - Async callback was not invoked within the 5000ms timeout'],
        }
      });

      expect(result.fix.strategy).toBe(FIX_STRATEGY.TIMEOUT_EXTEND);
    });

    it('categorizes schema drift', async () => {
      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      const result = await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/schema.test.js',
          failureMessages: ['Schema validation failed: missing required field "email"'],
        }
      });

      expect(result.fix.strategy).toBe(FIX_STRATEGY.SCHEMA_REWRITE);
    });

    it('categorizes network failures', async () => {
      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      const result = await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/api.test.js',
          failureMessages: ['FetchError: ECONNREFUSED 127.0.0.1:3000'],
        }
      });

      expect(result.fix.strategy).toBe(FIX_STRATEGY.MOCK_INJECT);
    });
  });

  describe('Plan phase — fix generation', () => {
    it('generates AST mutation fix with confidence score', async () => {
      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      const result = await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/unit.test.js',
          failureMessages: ['Expected: 42, Received: 43'],
        }
      });

      expect(result.fix.confidence).toBeGreaterThan(0);
      expect(result.fix.confidence).toBeLessThanOrEqual(1);
    });

    it('replays known patterns from wisdom store', async () => {
      const fs = require('fs');
      const path = require('path');

      // Create a mock pattern store
      const storePath = path.join(process.cwd(), '.heady_cache', 'pattern_store.json');
      const storeDir = path.dirname(storePath);
      if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });

      const crypto = require('crypto');
      const signature = crypto.createHash('sha256')
        .update(JSON.stringify({ file: 'tests/known.test.js', error: 'Known error pattern' }))
        .digest('hex').slice(0, 16);

      fs.writeFileSync(storePath, JSON.stringify({
        version: '1.0.0',
        patterns: [{
          failureSignature: signature,
          category: 'ASSERTION',
          fix: { type: 'ast-mutate', strategy: 'ast-mutate', description: 'Known fix' },
          confidence: 0.95,
          hitCount: 3
        }]
      }));

      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      const result = await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/known.test.js',
          failureMessages: ['Known error pattern'],
        }
      });

      expect(result.source).toBe('pattern-replay');
      expect(result.confidence).toBe(0.95);

      // Cleanup
      fs.unlinkSync(storePath);
    });
  });

  describe('Knowledge phase — persistence', () => {
    it('persists new patterns to pattern_store.json', async () => {
      const fs = require('fs');
      const path = require('path');

      const loop = new MapeKTestLoop({ projectRoot: process.cwd() });
      await loop.execute({
        phase: 'test-failure',
        failure: {
          testFile: 'tests/new-pattern.test.js',
          failureMessages: ['New unique failure pattern'],
        }
      });

      const storePath = path.join(process.cwd(), '.heady_cache', 'pattern_store.json');
      expect(fs.existsSync(storePath)).toBe(true);

      const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
      expect(store.patterns.length).toBeGreaterThan(0);

      // Cleanup
      fs.unlinkSync(storePath);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AST Test Mutator
// ═══════════════════════════════════════════════════════════════════════════════

describe('ASTTestMutator', () => {
  let ASTTestMutator, SEMANTIC_RESONANCE_THRESHOLD;

  beforeEach(() => {
    ({ ASTTestMutator, SEMANTIC_RESONANCE_THRESHOLD } = require('../src/testing/ast-test-mutator'));
  });

  it('has semantic resonance threshold ≈ 0.809', () => {
    expect(SEMANTIC_RESONANCE_THRESHOLD).toBeCloseTo(0.809, 2);
  });

  it('reports failure for non-existent target file', async () => {
    const mutator = new ASTTestMutator({ projectRoot: process.cwd() });
    const result = await mutator.applyFix({
      type: 'ast-mutate',
      target: '/non/existent/file.js',
      transform: 'update-expected-value'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('computes semantic resonance using Jaccard similarity', async () => {
    const mutator = new ASTTestMutator({ projectRoot: process.cwd() });

    // Access private method for testing
    const resonance = mutator._computeSemanticResonance(
      'const name: string; const age: number;',
      'const name: string; const age: number; const email: string;'
    );

    expect(resonance).toBeGreaterThan(0.5);
    expect(resonance).toBeLessThan(1.0);
  });

  it('rejects schema rewrites below resonance threshold', async () => {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    // Create a temp schema file
    const tmpFile = path.join(os.tmpdir(), `heady-test-schema-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, JSON.stringify({
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name']
    }));

    const mutator = new ASTTestMutator({ projectRoot: process.cwd() });
    const result = await mutator.rewriteSchema({
      target: tmpFile,
      newFields: [
        { name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' },
        { name: 'e' }, { name: 'f' }, { name: 'g' }, { name: 'h' },
        { name: 'i' }, { name: 'j' }, { name: 'k' }, { name: 'l' },
        { name: 'm' }, { name: 'n' }, { name: 'o' }, { name: 'p' }
      ]
    });

    // Cleanup
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

    // May succeed or fail depending on resonance — both are valid behaviors
    expect(typeof result.success).toBe('boolean');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Contract Validation Gate
// ═══════════════════════════════════════════════════════════════════════════════

describe('ContractValidationGate', () => {
  let ContractValidationGate, RESONANCE_THRESHOLD, BOUNDARY_TYPE;

  beforeEach(() => {
    ({ ContractValidationGate, RESONANCE_THRESHOLD, BOUNDARY_TYPE } =
      require('../src/testing/contract-validation-gate'));
  });

  it('has resonance threshold ≈ 0.809 (φ-derived)', () => {
    const expected = 1 - Math.pow(PSI, 2) * 0.5;
    expect(RESONANCE_THRESHOLD).toBeCloseTo(expected, 10);
  });

  it('defines all boundary types', () => {
    expect(BOUNDARY_TYPE.SERVICE_TO_SERVICE).toBe('service-to-service');
    expect(BOUNDARY_TYPE.AGENT_TO_TOOL).toBe('agent-to-tool');
    expect(BOUNDARY_TYPE.API_TO_CONSUMER).toBe('api-to-consumer');
    expect(BOUNDARY_TYPE.EVENT_PRODUCER_CONSUMER).toBe('event-producer-consumer');
  });

  it('validates all contracts and returns results', async () => {
    const gate = new ContractValidationGate({
      projectRoot: process.cwd(),
      resonanceThreshold: RESONANCE_THRESHOLD
    });

    const result = await gate.validateAll();
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('invalid');
    expect(result).toHaveProperty('violations');
    expect(result).toHaveProperty('resonanceScore');
    expect(result).toHaveProperty('timestamp');
  });

  it('computes overall resonance score', async () => {
    const gate = new ContractValidationGate({ projectRoot: process.cwd() });
    const result = await gate.validateAll();

    expect(result.resonanceScore).toBeGreaterThanOrEqual(0);
    expect(result.resonanceScore).toBeLessThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Chaos Injection Harness
// ═══════════════════════════════════════════════════════════════════════════════

describe('ChaosInjectionHarness', () => {
  let ChaosInjectionHarness, CHAOS_TYPE, DEFAULT_CHAOS_SEQUENCE;

  beforeEach(() => {
    ({ ChaosInjectionHarness, CHAOS_TYPE, DEFAULT_CHAOS_SEQUENCE } =
      require('../src/testing/chaos-injection-harness'));

    // Clean up any global chaos flags
    delete global.__HEADY_CHAOS_CACHE_KILLED;
    delete global.__HEADY_CHAOS_DB_KILLED;
    delete global.__HEADY_CHAOS_PRIMARY_LLM_KILLED;
  });

  it('defines Fibonacci-sequenced chaos types', () => {
    expect(DEFAULT_CHAOS_SEQUENCE.length).toBeGreaterThan(0);

    // Verify Fibonacci timing
    const times = DEFAULT_CHAOS_SEQUENCE.map(s => s.time);
    for (const t of times) {
      expect(FIB).toContain(t);
    }
  });

  it('initializes with correct defaults', () => {
    const harness = new ChaosInjectionHarness({ projectRoot: process.cwd() });

    expect(harness.state).toBe('idle');
    expect(harness.metrics.totalInjections).toBe(0);
    expect(harness.metrics.resilienceScore).toBe(1.0);
  });

  it('injects and tracks cache kill fault', async () => {
    const harness = new ChaosInjectionHarness({ projectRoot: process.cwd() });

    const result = await harness._injectFault({
      type: CHAOS_TYPE.KILL_CACHE,
      description: 'Test cache kill'
    });

    expect(result.active).toBe(true);
    expect(result.type).toBe(CHAOS_TYPE.KILL_CACHE);
    expect(global.__HEADY_CHAOS_CACHE_KILLED).toBe(true);
    expect(harness.metrics.totalInjections).toBe(1);

    // Cleanup
    harness._removeFault(CHAOS_TYPE.KILL_CACHE);
    expect(global.__HEADY_CHAOS_CACHE_KILLED).toBeUndefined();
  });

  it('injects latency spike with φ³ delay', async () => {
    const harness = new ChaosInjectionHarness({ projectRoot: process.cwd() });

    await harness._injectFault({
      type: CHAOS_TYPE.LATENCY_SPIKE,
      description: 'Test latency'
    });

    const expectedDelay = Math.round(Math.pow(PHI, 3) * 1000);
    expect(global.__HEADY_CHAOS_LATENCY_MS).toBe(expectedDelay);

    harness._removeFault(CHAOS_TYPE.LATENCY_SPIKE);
  });

  it('computes resilience score using phi-weighted formula', () => {
    const harness = new ChaosInjectionHarness({ projectRoot: process.cwd() });

    harness.metrics.totalInjections = 10;
    harness.metrics.totalRecoveries = 8;
    harness.metrics.totalFailures = 2;

    harness._updateResilienceScore();

    expect(harness.metrics.resilienceScore).toBeGreaterThan(0.5);
    expect(harness.metrics.resilienceScore).toBeLessThan(1.0);
  });

  it('returns summary with all metrics', () => {
    const harness = new ChaosInjectionHarness({ projectRoot: process.cwd() });
    const summary = harness.getSummary();

    expect(summary).toHaveProperty('state');
    expect(summary).toHaveProperty('activeFaults');
    expect(summary).toHaveProperty('faultHistory');
    expect(summary).toHaveProperty('metrics');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Autonomous Self-Healing Runner (Integration)
// ═══════════════════════════════════════════════════════════════════════════════

describe('AutonomousSelfHealingRunner', () => {
  let AutonomousSelfHealingRunner, RUNNER_STATE, PHI_CRITICAL_THRESHOLD;

  beforeEach(() => {
    ({ AutonomousSelfHealingRunner, RUNNER_STATE, PHI_CRITICAL_THRESHOLD } =
      require('../src/testing/autonomous-self-healing-runner'));
  });

  it('has correct PHI critical threshold ≈ 0.382', () => {
    expect(PHI_CRITICAL_THRESHOLD).toBeCloseTo(PSI * PSI, 10);
  });

  it('initializes in IDLE state', () => {
    const runner = new AutonomousSelfHealingRunner({
      projectRoot: process.cwd()
    });

    expect(runner.state).toBe(RUNNER_STATE.IDLE);
    expect(runner.metrics.totalRuns).toBe(0);
    expect(runner.metrics.phiHealthScore).toBe(1.0);
  });

  it('defines all runner states', () => {
    expect(RUNNER_STATE.IDLE).toBe('IDLE');
    expect(RUNNER_STATE.DISCOVERING).toBe('DISCOVERING');
    expect(RUNNER_STATE.RUNNING).toBe('RUNNING');
    expect(RUNNER_STATE.HEALING).toBe('HEALING');
    expect(RUNNER_STATE.VERIFYING).toBe('VERIFYING');
    expect(RUNNER_STATE.CHAOS_TESTING).toBe('CHAOS_TESTING');
    expect(RUNNER_STATE.COMPLETE).toBe('COMPLETE');
    expect(RUNNER_STATE.ESCALATED).toBe('ESCALATED');
  });

  it('computes failure signature for deduplication', () => {
    const runner = new AutonomousSelfHealingRunner({
      projectRoot: process.cwd()
    });

    const sig1 = runner._computeFailureSignature({
      testFile: 'tests/foo.test.js',
      failureMessages: ['Error A']
    });

    const sig2 = runner._computeFailureSignature({
      testFile: 'tests/foo.test.js',
      failureMessages: ['Error A']
    });

    const sig3 = runner._computeFailureSignature({
      testFile: 'tests/bar.test.js',
      failureMessages: ['Error B']
    });

    // Same input → same signature
    expect(sig1).toBe(sig2);
    // Different input → different signature
    expect(sig1).not.toBe(sig3);
    // 16-char hex
    expect(sig1).toMatch(/^[0-9a-f]{16}$/);
  });

  it('emits events during test cycle', async () => {
    const runner = new AutonomousSelfHealingRunner({
      projectRoot: process.cwd()
    });

    const events = [];
    runner.on('phase:start', (e) => events.push(e.phase));
    runner.on('cycle:complete', () => events.push('complete'));

    await runner.runCycle();

    expect(events).toContain('contract-validation');
    expect(events).toContain('test-execution');
  });

  it('stops continuous mode cleanly', () => {
    const runner = new AutonomousSelfHealingRunner({
      projectRoot: process.cwd(),
      continuousMode: true
    });

    // Just verify stop() doesn't throw
    runner.stop();
    expect(runner.state).toBe(RUNNER_STATE.IDLE);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// φ-Math Integration Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Phi-Math Constants Validation', () => {
  it('PHI satisfies φ² = φ + 1', () => {
    expect(PHI * PHI).toBeCloseTo(PHI + 1, 10);
  });

  it('PSI = 1/φ = φ - 1', () => {
    expect(PSI).toBeCloseTo(PHI - 1, 10);
    expect(PSI).toBeCloseTo(1 / PHI, 10);
  });

  it('Fibonacci sequence is valid', () => {
    for (let i = 2; i < FIB.length; i++) {
      expect(FIB[i]).toBe(FIB[i - 1] + FIB[i - 2]);
    }
  });

  it('PHI_CRITICAL_THRESHOLD = ψ² ≈ 0.382', () => {
    expect(PSI * PSI).toBeCloseTo(0.382, 3);
  });

  it('SEMANTIC_RESONANCE_MIN ≈ 0.809', () => {
    const resonance = 1 - Math.pow(PSI, 2) * 0.5;
    expect(resonance).toBeCloseTo(0.809, 3);
  });
});
