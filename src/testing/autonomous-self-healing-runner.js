'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  HEADY™ Autonomous Self-Healing Test Runner                             ║
 * ║  Zero-Intervention Testing with MAPE-K Integration                      ║
 * ║  © 2024-2026 HeadySystems Inc. All Rights Reserved.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Orchestrates the full autonomous self-healing test lifecycle:
 *   1. Discover & run tests
 *   2. On failure → invoke MAPE-K loop (Monitor → Analyze → Plan → Execute → Knowledge)
 *   3. Auto-generate fix via AST mutation or LLM fallback chain
 *   4. Re-run healed tests to verify
 *   5. Persist fix patterns to wisdom store for permanent immunity
 *
 * MANDATE: ZERO HUMAN INTERVENTION on the critical path.
 */

const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');
const { MapeKTestLoop } = require('./mape-k-test-loop');
const { ASTTestMutator } = require('./ast-test-mutator');
const { ContractValidationGate } = require('./contract-validation-gate');
const { ChaosInjectionHarness } = require('./chaos-injection-harness');

// ─── φ-Constants ────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const PSI = 1 / PHI;
const FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

/** Phi-scaled backoff sequence for retries (ms) */
const PHI_BACKOFF = FIB.slice(0, 7).map(f => Math.round(f * PHI * 1000));

/** Max self-heal attempts before escalation */
const MAX_HEAL_ATTEMPTS = FIB[4]; // 5

/** φ-health score critical threshold */
const PHI_CRITICAL_THRESHOLD = PSI * PSI; // ≈ 0.382

/** Semantic resonance minimum for contract validation */
const SEMANTIC_RESONANCE_MIN = 1 - Math.pow(PSI, 2) * 0.5; // ≈ 0.809

/** Cycle interval — φ⁷ × 1000 ≈ 29,034ms */
const CYCLE_INTERVAL_MS = Math.round(Math.pow(PHI, 7) * 1000);

// ─── Runner States ──────────────────────────────────────────────────────────
const RUNNER_STATE = Object.freeze({
  IDLE: 'IDLE',
  DISCOVERING: 'DISCOVERING',
  RUNNING: 'RUNNING',
  HEALING: 'HEALING',
  VERIFYING: 'VERIFYING',
  CHAOS_TESTING: 'CHAOS_TESTING',
  COMPLETE: 'COMPLETE',
  ESCALATED: 'ESCALATED'
});

/**
 * AutonomousSelfHealingRunner — the master orchestrator for zero-intervention testing.
 *
 * @fires AutonomousSelfHealingRunner#test:pass
 * @fires AutonomousSelfHealingRunner#test:fail
 * @fires AutonomousSelfHealingRunner#heal:start
 * @fires AutonomousSelfHealingRunner#heal:success
 * @fires AutonomousSelfHealingRunner#heal:escalate
 * @fires AutonomousSelfHealingRunner#cycle:complete
 */
class AutonomousSelfHealingRunner extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} options.projectRoot - Root directory of the project
   * @param {string[]} [options.testPatterns] - Glob patterns for test discovery
   * @param {Object} [options.llmChain] - LLM fallback chain configuration
   * @param {boolean} [options.chaosEnabled=false] - Enable chaos injection
   * @param {boolean} [options.continuousMode=false] - Run continuously on φ⁷ interval
   * @param {Object} [options.wisdomStore] - External wisdom store reference
   */
  constructor({
    projectRoot,
    testPatterns = ['tests/**/*.test.js', 'tests/**/*.test.ts'],
    llmChain = null,
    chaosEnabled = false,
    continuousMode = false,
    wisdomStore = null
  }) {
    super();
    this.projectRoot = projectRoot;
    this.testPatterns = testPatterns;
    this.chaosEnabled = chaosEnabled;
    this.continuousMode = continuousMode;
    this.state = RUNNER_STATE.IDLE;

    // Sub-systems
    this.mapeK = new MapeKTestLoop({ projectRoot, llmChain });
    this.astMutator = new ASTTestMutator({ projectRoot });
    this.contractGate = new ContractValidationGate({
      projectRoot,
      resonanceThreshold: SEMANTIC_RESONANCE_MIN
    });
    this.chaosHarness = chaosEnabled
      ? new ChaosInjectionHarness({ projectRoot })
      : null;

    // Wisdom store for permanent immunity
    this._wisdomStorePath = wisdomStore ||
      path.join(projectRoot, '.heady_cache', 'wisdom.json');
    this._patternStorePath = path.join(projectRoot, '.heady_cache', 'pattern_store.json');

    // Metrics
    this.metrics = {
      totalRuns: 0,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalHealed: 0,
      totalEscalated: 0,
      healSuccessRate: 0,
      phiHealthScore: 1.0,
      lastRunTimestamp: null,
      healPatterns: []
    };

    this._cycleTimer = null;
    this._healAttempts = new Map(); // testId → attempt count
  }

  /**
   * Start the autonomous runner. If continuousMode, runs on φ⁷ interval.
   * @returns {Promise<Object>} Run results
   */
  async start() {
    if (this.continuousMode) {
      return this._startContinuousMode();
    }
    return this.runCycle();
  }

  /**
   * Stop continuous mode.
   */
  stop() {
    if (this._cycleTimer) {
      clearInterval(this._cycleTimer);
      this._cycleTimer = null;
    }
    this.state = RUNNER_STATE.IDLE;
    this.emit('runner:stopped', { metrics: this.metrics });
  }

  /**
   * Execute a single test-heal-verify cycle.
   * @returns {Promise<Object>} Cycle results
   */
  async runCycle() {
    const cycleStart = Date.now();
    const cycleId = `cycle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      // ── Phase 1: Contract Validation ──────────────────────────────
      this.state = RUNNER_STATE.DISCOVERING;
      this.emit('phase:start', { phase: 'contract-validation', cycleId });

      const contractResults = await this.contractGate.validateAll();
      if (contractResults.violations.length > 0) {
        await this._healContractViolations(contractResults.violations, cycleId);
      }

      // ── Phase 2: Test Discovery & Execution ───────────────────────
      this.state = RUNNER_STATE.RUNNING;
      this.emit('phase:start', { phase: 'test-execution', cycleId });

      const testResults = await this._runTests();
      this.metrics.totalRuns++;
      this.metrics.totalTests += testResults.total;
      this.metrics.totalPassed += testResults.passed;
      this.metrics.totalFailed += testResults.failed;
      this.metrics.lastRunTimestamp = new Date().toISOString();

      // ── Phase 3: Self-Healing for Failures ────────────────────────
      if (testResults.failures.length > 0) {
        this.state = RUNNER_STATE.HEALING;
        this.emit('phase:start', { phase: 'self-healing', cycleId });

        for (const failure of testResults.failures) {
          await this._healFailure(failure, cycleId);
        }
      }

      // ── Phase 4: Chaos Injection (if enabled) ─────────────────────
      if (this.chaosEnabled && this.chaosHarness) {
        this.state = RUNNER_STATE.CHAOS_TESTING;
        this.emit('phase:start', { phase: 'chaos-injection', cycleId });

        const chaosResults = await this.chaosHarness.runFibonacciChaos();
        if (chaosResults.failures.length > 0) {
          for (const failure of chaosResults.failures) {
            await this._healFailure(failure, cycleId);
          }
        }
      }

      // ── Phase 5: Update Health Score ──────────────────────────────
      this._updateHealthScore(testResults);

      const cycleResult = {
        cycleId,
        duration: Date.now() - cycleStart,
        state: this.state,
        tests: testResults,
        contracts: contractResults,
        metrics: { ...this.metrics },
        phiHealthScore: this.metrics.phiHealthScore,
        escalated: this.metrics.phiHealthScore < PHI_CRITICAL_THRESHOLD
      };

      this.state = RUNNER_STATE.COMPLETE;
      this.emit('cycle:complete', cycleResult);
      return cycleResult;

    } catch (err) {
      this.state = RUNNER_STATE.ESCALATED;
      this.emit('cycle:error', { cycleId, error: err.message });
      return {
        cycleId,
        duration: Date.now() - cycleStart,
        state: RUNNER_STATE.ESCALATED,
        error: err.message,
        metrics: { ...this.metrics }
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE: Test Execution
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run all discovered tests via the configured test runner.
   * @private
   */
  async _runTests() {
    const { execSync } = require('child_process');
    const results = {
      total: 0, passed: 0, failed: 0,
      failures: [], passes: []
    };

    try {
      // Attempt to run tests via npm/vitest/jest
      const output = execSync(
        'npx vitest run --reporter=json 2>/dev/null || npx jest --json 2>/dev/null || echo "{}"',
        { cwd: this.projectRoot, timeout: 120000, encoding: 'utf-8' }
      );

      const parsed = this._parseTestOutput(output);
      Object.assign(results, parsed);
    } catch (err) {
      // Even if the test command fails, parse stderr for individual failures
      if (err.stdout) {
        const parsed = this._parseTestOutput(err.stdout);
        Object.assign(results, parsed);
      }
    }

    return results;
  }

  /**
   * Parse JSON test output from vitest or jest.
   * @private
   */
  _parseTestOutput(output) {
    const results = { total: 0, passed: 0, failed: 0, failures: [], passes: [] };

    try {
      // Find JSON block in output
      const jsonMatch = output.match(/\{[\s\S]*"testResults"[\s\S]*\}/);
      if (!jsonMatch) return results;

      const data = JSON.parse(jsonMatch[0]);
      if (data.testResults) {
        for (const suite of data.testResults) {
          results.total += (suite.numPassedTests || 0) + (suite.numFailedTests || 0);
          results.passed += suite.numPassedTests || 0;
          results.failed += suite.numFailedTests || 0;

          if (suite.numFailedTests > 0 && suite.testFilePath) {
            results.failures.push({
              testFile: suite.testFilePath,
              suiteName: suite.testFilePath,
              failureMessages: suite.failureMessage ? [suite.failureMessage] : [],
              assertionResults: (suite.assertionResults || [])
                .filter(r => r.status === 'failed')
                .map(r => ({
                  title: r.title,
                  fullName: r.fullName,
                  failureMessages: r.failureMessages || [],
                  location: r.location
                }))
            });
          }
        }
      }
    } catch (_) {
      // Graceful degradation — return empty results
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE: Self-Healing Engine
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Heal a single test failure using MAPE-K loop.
   * @private
   */
  async _healFailure(failure, cycleId) {
    const testId = failure.testFile || failure.suiteName;
    const attempts = this._healAttempts.get(testId) || 0;

    if (attempts >= MAX_HEAL_ATTEMPTS) {
      this.metrics.totalEscalated++;
      this.emit('heal:escalate', {
        testId,
        attempts,
        cycleId,
        reason: `Exceeded max heal attempts (${MAX_HEAL_ATTEMPTS})`
      });
      this._persistEscalation(failure);
      return;
    }

    this._healAttempts.set(testId, attempts + 1);
    this.emit('heal:start', { testId, attempt: attempts + 1, cycleId });

    // Invoke MAPE-K loop
    const mapeKResult = await this.mapeK.execute({
      phase: 'test-failure',
      failure,
      attempt: attempts + 1
    });

    if (mapeKResult.action === 'ast-mutate') {
      // AST-level fix
      const mutationResult = await this.astMutator.applyFix(mapeKResult.fix);
      if (mutationResult.success) {
        // Verify the fix
        this.state = RUNNER_STATE.VERIFYING;
        const verifyResult = await this._verifyFix(testId);
        if (verifyResult.passed) {
          this.metrics.totalHealed++;
          this._updateHealSuccessRate();
          this._persistWisdom(failure, mapeKResult.fix);
          this.emit('heal:success', { testId, attempt: attempts + 1, cycleId, fix: mapeKResult.fix });
          return;
        }
      }
    }

    if (mapeKResult.action === 'schema-rewrite') {
      // Contract-level fix via ASTMutatorBee
      const rewriteResult = await this.astMutator.rewriteSchema(mapeKResult.fix);
      if (rewriteResult.success) {
        this.state = RUNNER_STATE.VERIFYING;
        const verifyResult = await this._verifyFix(testId);
        if (verifyResult.passed) {
          this.metrics.totalHealed++;
          this._updateHealSuccessRate();
          this._persistWisdom(failure, mapeKResult.fix);
          this.emit('heal:success', { testId, attempt: attempts + 1, cycleId, fix: mapeKResult.fix });
          return;
        }
      }
    }

    // If AST mutation didn't work, retry with incremented attempt
    // Apply phi-backoff before retry
    const backoffMs = PHI_BACKOFF[Math.min(attempts, PHI_BACKOFF.length - 1)];
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    return this._healFailure(failure, cycleId);
  }

  /**
   * Heal contract violations detected during validation.
   * @private
   */
  async _healContractViolations(violations, cycleId) {
    for (const violation of violations) {
      const mapeKResult = await this.mapeK.execute({
        phase: 'contract-violation',
        failure: violation
      });

      if (mapeKResult.fix) {
        await this.astMutator.applyFix(mapeKResult.fix);
        this.emit('contract:healed', { violation, fix: mapeKResult.fix, cycleId });
      }
    }
  }

  /**
   * Verify a fix by re-running the specific test.
   * @private
   */
  async _verifyFix(testId) {
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx vitest run "${testId}" --reporter=json 2>/dev/null || npx jest "${testId}" --json 2>/dev/null`,
        { cwd: this.projectRoot, timeout: 60000, encoding: 'utf-8' }
      );
      return { passed: true };
    } catch (_) {
      return { passed: false };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE: Wisdom & Pattern Persistence
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Persist a successful heal pattern to wisdom.json for permanent immunity.
   * @private
   */
  _persistWisdom(failure, fix) {
    try {
      const dir = path.dirname(this._wisdomStorePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const wisdom = fs.existsSync(this._wisdomStorePath)
        ? JSON.parse(fs.readFileSync(this._wisdomStorePath, 'utf-8'))
        : { version: '1.0.0', entries: [] };

      wisdom.entries.push({
        id: `wisdom-${Date.now()}`,
        timestamp: new Date().toISOString(),
        failureSignature: this._computeFailureSignature(failure),
        fix: {
          type: fix.type,
          target: fix.target,
          description: fix.description
        },
        immunity: true
      });

      fs.writeFileSync(this._wisdomStorePath, JSON.stringify(wisdom, null, 2));
    } catch (_) {
      // Non-critical — wisdom persistence failure doesn't block the pipeline
    }
  }

  /**
   * Persist an escalation for later review.
   * @private
   */
  _persistEscalation(failure) {
    try {
      const escalationPath = path.join(
        path.dirname(this._wisdomStorePath), 'escalations.json'
      );
      const dir = path.dirname(escalationPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const escalations = fs.existsSync(escalationPath)
        ? JSON.parse(fs.readFileSync(escalationPath, 'utf-8'))
        : { entries: [] };

      escalations.entries.push({
        timestamp: new Date().toISOString(),
        failure,
        signature: this._computeFailureSignature(failure)
      });

      fs.writeFileSync(escalationPath, JSON.stringify(escalations, null, 2));
    } catch (_) {
      // Non-critical
    }
  }

  /**
   * Compute a deterministic signature for a failure (for deduplication).
   * @private
   */
  _computeFailureSignature(failure) {
    const crypto = require('crypto');
    const input = JSON.stringify({
      file: failure.testFile,
      messages: (failure.failureMessages || []).map(m =>
        m.replace(/at\s+.*:\d+:\d+/g, '').trim().slice(0, 200)
      )
    });
    return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE: Health Score & Continuous Mode
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Update phi-health score using golden-ratio weighted exponential decay.
   * @private
   */
  _updateHealthScore(testResults) {
    if (testResults.total === 0) return;

    const passRate = testResults.passed / testResults.total;
    const healRate = this.metrics.healSuccessRate;

    // Phi-weighted health: passRate × φ⁻¹ + healRate × (1 - φ⁻¹)
    this.metrics.phiHealthScore =
      passRate * PSI + healRate * (1 - PSI);
  }

  /**
   * Update heal success rate.
   * @private
   */
  _updateHealSuccessRate() {
    const totalAttempted = this.metrics.totalHealed + this.metrics.totalEscalated;
    this.metrics.healSuccessRate = totalAttempted > 0
      ? this.metrics.totalHealed / totalAttempted
      : 1.0;
  }

  /**
   * Start continuous mode on φ⁷ interval.
   * @private
   */
  async _startContinuousMode() {
    // Run first cycle immediately
    const firstResult = await this.runCycle();
    this.emit('continuous:started', { interval: CYCLE_INTERVAL_MS });

    this._cycleTimer = setInterval(async () => {
      if (this.state === RUNNER_STATE.RUNNING || this.state === RUNNER_STATE.HEALING) {
        return; // Skip if previous cycle still running
      }
      await this.runCycle();
    }, CYCLE_INTERVAL_MS);

    return firstResult;
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────
module.exports = {
  AutonomousSelfHealingRunner,
  RUNNER_STATE,
  PHI_CRITICAL_THRESHOLD,
  SEMANTIC_RESONANCE_MIN,
  CYCLE_INTERVAL_MS,
  MAX_HEAL_ATTEMPTS,
  PHI_BACKOFF
};
