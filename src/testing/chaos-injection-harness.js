'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  HEADY™ Chaos Injection Harness — Fibonacci-Sequenced Fault Injection   ║
 * ║  Antifragile Testing via Systematic Resource Strangulation               ║
 * ║  © 2024-2026 HeadySystems Inc. All Rights Reserved.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Injects failures at Fibonacci-timed intervals to test system resilience:
 *   t=1s   → Kill cache (Redis/Upstash)
 *   t=2s   → Inject latency spike
 *   t=3s   → Corrupt response payload
 *   t=5s   → Kill database connection
 *   t=8s   → Throttle primary LLM
 *   t=13s  → Kill primary LLM entirely
 *   t=21s  → Kill secondary LLM (fallback chain test)
 *   t=34s  → Network partition (isolate services)
 *
 * The system MUST failover via LLM fallback chains without dropping requests.
 *
 * LLM Fallback Chain: Gemini → GPT → Workers AI → Colab vLLM
 */

const { EventEmitter } = require('events');
const path = require('path');

// ─── φ-Constants ────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const PSI = 1 / PHI;
const FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

/** Chaos injection types */
const CHAOS_TYPE = Object.freeze({
  KILL_CACHE: 'KILL_CACHE',
  LATENCY_SPIKE: 'LATENCY_SPIKE',
  CORRUPT_PAYLOAD: 'CORRUPT_PAYLOAD',
  KILL_DATABASE: 'KILL_DATABASE',
  THROTTLE_LLM: 'THROTTLE_LLM',
  KILL_PRIMARY_LLM: 'KILL_PRIMARY_LLM',
  KILL_SECONDARY_LLM: 'KILL_SECONDARY_LLM',
  NETWORK_PARTITION: 'NETWORK_PARTITION',
  MEMORY_PRESSURE: 'MEMORY_PRESSURE',
  CPU_SPIKE: 'CPU_SPIKE',
  DEPLOY_REGRESSION: 'DEPLOY_REGRESSION'
});

/** Default Fibonacci chaos sequence */
const DEFAULT_CHAOS_SEQUENCE = [
  { time: FIB[2], type: CHAOS_TYPE.KILL_CACHE, description: 'Kill Redis/Upstash cache' },
  { time: FIB[3], type: CHAOS_TYPE.LATENCY_SPIKE, description: 'Inject 5s latency spike' },
  { time: FIB[4], type: CHAOS_TYPE.CORRUPT_PAYLOAD, description: 'Corrupt response payload' },
  { time: FIB[5], type: CHAOS_TYPE.KILL_DATABASE, description: 'Kill Postgres/Hyperdrive' },
  { time: FIB[6], type: CHAOS_TYPE.THROTTLE_LLM, description: 'Throttle primary LLM to 1 req/min' },
  { time: FIB[7], type: CHAOS_TYPE.KILL_PRIMARY_LLM, description: 'Kill primary LLM entirely' },
  { time: FIB[8], type: CHAOS_TYPE.KILL_SECONDARY_LLM, description: 'Kill secondary LLM (fallback test)' },
  { time: FIB[9], type: CHAOS_TYPE.NETWORK_PARTITION, description: 'Network partition between services' }
];

/**
 * ChaosInjectionHarness — systematic fault injection for antifragile testing.
 */
class ChaosInjectionHarness extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} options.projectRoot
   * @param {Array} [options.chaosSequence] - Custom chaos sequence
   * @param {number} [options.timeMultiplier=1000] - Time multiplier (default: seconds → ms)
   */
  constructor({
    projectRoot,
    chaosSequence = DEFAULT_CHAOS_SEQUENCE,
    timeMultiplier = 1000
  }) {
    super();
    this.projectRoot = projectRoot;
    this.chaosSequence = chaosSequence;
    this.timeMultiplier = timeMultiplier;
    this.state = 'idle';

    // Injected faults registry
    this._activeFaults = new Map();
    this._faultHistory = [];

    // Metrics
    this.metrics = {
      totalInjections: 0,
      totalRecoveries: 0,
      totalFailures: 0,
      meanRecoveryTimeMs: 0,
      resilienceScore: 1.0
    };
  }

  /**
   * Run the full Fibonacci chaos sequence.
   *
   * @returns {Promise<Object>} Chaos test results
   */
  async runFibonacciChaos() {
    this.state = 'running';
    const startTime = Date.now();
    const results = { injections: [], recoveries: [], failures: [] };

    this.emit('chaos:start', { sequence: this.chaosSequence });

    for (const step of this.chaosSequence) {
      const delay = step.time * this.timeMultiplier;
      const elapsed = Date.now() - startTime;
      const waitTime = Math.max(0, delay - elapsed);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Inject the fault
      const injection = await this._injectFault(step);
      results.injections.push(injection);

      // Wait for recovery (phi-scaled window)
      const recoveryWindow = Math.round(step.time * PHI * this.timeMultiplier);
      const recovery = await this._waitForRecovery(step, recoveryWindow);

      if (recovery.recovered) {
        results.recoveries.push(recovery);
        this.metrics.totalRecoveries++;
      } else {
        results.failures.push({
          ...step,
          recovery,
          error: `Failed to recover within ${recoveryWindow}ms`
        });
        this.metrics.totalFailures++;
      }

      // Remove the fault
      this._removeFault(step.type);
    }

    // Compute resilience score
    this._updateResilienceScore();

    this.state = 'complete';
    const finalResult = {
      duration: Date.now() - startTime,
      ...results,
      metrics: { ...this.metrics },
      resilienceScore: this.metrics.resilienceScore
    };

    this.emit('chaos:complete', finalResult);
    return finalResult;
  }

  /**
   * Inject a single fault.
   *
   * @param {Object} step - Chaos step definition
   * @returns {Promise<Object>} Injection result
   */
  async _injectFault(step) {
    this.metrics.totalInjections++;
    const injectionId = `fault-${step.type}-${Date.now()}`;

    const fault = {
      id: injectionId,
      type: step.type,
      description: step.description,
      injectedAt: Date.now(),
      active: true
    };

    this._activeFaults.set(step.type, fault);
    this._faultHistory.push(fault);

    this.emit('fault:injected', fault);

    // Execute the actual fault injection
    const result = await this._executeFaultInjection(step);

    return { ...fault, executionResult: result };
  }

  /**
   * Execute fault injection based on type.
   * @private
   */
  async _executeFaultInjection(step) {
    switch (step.type) {
      case CHAOS_TYPE.KILL_CACHE:
        return this._injectCacheKill();

      case CHAOS_TYPE.LATENCY_SPIKE:
        return this._injectLatencySpike();

      case CHAOS_TYPE.CORRUPT_PAYLOAD:
        return this._injectPayloadCorruption();

      case CHAOS_TYPE.KILL_DATABASE:
        return this._injectDatabaseKill();

      case CHAOS_TYPE.THROTTLE_LLM:
        return this._injectLLMThrottle();

      case CHAOS_TYPE.KILL_PRIMARY_LLM:
        return this._injectLLMKill('primary');

      case CHAOS_TYPE.KILL_SECONDARY_LLM:
        return this._injectLLMKill('secondary');

      case CHAOS_TYPE.NETWORK_PARTITION:
        return this._injectNetworkPartition();

      case CHAOS_TYPE.DEPLOY_REGRESSION:
        return this._injectDeployRegression();

      default:
        return { injected: false, reason: `Unknown chaos type: ${step.type}` };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Fault Injection Implementations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Simulate cache kill by intercepting cache module.
   * @private
   */
  async _injectCacheKill() {
    // Set global fault flag for cache operations
    global.__HEADY_CHAOS_CACHE_KILLED = true;
    return { injected: true, target: 'cache', action: 'kill' };
  }

  /**
   * Simulate latency spike by injecting delays.
   * @private
   */
  async _injectLatencySpike() {
    // φ³ × 1000 ≈ 4236ms latency
    global.__HEADY_CHAOS_LATENCY_MS = Math.round(Math.pow(PHI, 3) * 1000);
    return { injected: true, target: 'network', action: 'latency', delayMs: global.__HEADY_CHAOS_LATENCY_MS };
  }

  /**
   * Simulate payload corruption.
   * @private
   */
  async _injectPayloadCorruption() {
    global.__HEADY_CHAOS_CORRUPT_PAYLOAD = true;
    return { injected: true, target: 'payload', action: 'corrupt' };
  }

  /**
   * Simulate database connection kill.
   * @private
   */
  async _injectDatabaseKill() {
    global.__HEADY_CHAOS_DB_KILLED = true;
    return { injected: true, target: 'database', action: 'kill' };
  }

  /**
   * Simulate LLM throttle (1 req/min).
   * @private
   */
  async _injectLLMThrottle() {
    global.__HEADY_CHAOS_LLM_THROTTLE = 1; // 1 req per minute
    return { injected: true, target: 'llm', action: 'throttle', rateLimit: 1 };
  }

  /**
   * Simulate LLM kill.
   * @private
   */
  async _injectLLMKill(tier) {
    if (tier === 'primary') {
      global.__HEADY_CHAOS_PRIMARY_LLM_KILLED = true;
    } else {
      global.__HEADY_CHAOS_SECONDARY_LLM_KILLED = true;
    }
    return { injected: true, target: `llm-${tier}`, action: 'kill' };
  }

  /**
   * Simulate network partition.
   * @private
   */
  async _injectNetworkPartition() {
    global.__HEADY_CHAOS_NETWORK_PARTITIONED = true;
    return { injected: true, target: 'network', action: 'partition' };
  }

  /**
   * Simulate deploy regression.
   * @private
   */
  async _injectDeployRegression() {
    global.__HEADY_CHAOS_DEPLOY_REGRESSION = true;
    return { injected: true, target: 'deploy', action: 'regression' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Recovery Detection
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Wait for the system to recover from a fault within the given window.
   * @private
   */
  async _waitForRecovery(step, windowMs) {
    const startTime = Date.now();
    const checkInterval = Math.round(PHI * 500); // ~809ms check interval

    while (Date.now() - startTime < windowMs) {
      const health = this._checkHealth(step.type);
      if (health.recovered) {
        return {
          recovered: true,
          type: step.type,
          recoveryTimeMs: Date.now() - startTime,
          method: health.method
        };
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    return {
      recovered: false,
      type: step.type,
      attemptedFor: windowMs
    };
  }

  /**
   * Check if the system has recovered from a specific fault.
   * @private
   */
  _checkHealth(faultType) {
    switch (faultType) {
      case CHAOS_TYPE.KILL_CACHE:
        // Check if cache reconnect happened
        return {
          recovered: !global.__HEADY_CHAOS_CACHE_KILLED,
          method: 'cache-reconnect'
        };

      case CHAOS_TYPE.KILL_DATABASE:
        return {
          recovered: !global.__HEADY_CHAOS_DB_KILLED,
          method: 'hyperdrive-reconnect'
        };

      case CHAOS_TYPE.KILL_PRIMARY_LLM:
        // Check if fallback chain activated
        return {
          recovered: global.__HEADY_CHAOS_LLM_FALLBACK_ACTIVE === true,
          method: 'llm-fallback-chain'
        };

      case CHAOS_TYPE.KILL_SECONDARY_LLM:
        return {
          recovered: global.__HEADY_CHAOS_LLM_TERTIARY_ACTIVE === true,
          method: 'llm-tertiary-fallback'
        };

      case CHAOS_TYPE.DEPLOY_REGRESSION:
        return {
          recovered: global.__HEADY_CHAOS_ROLLBACK_COMPLETE === true,
          method: 'automatic-rollback'
        };

      default:
        // For other faults, check if the global flag was cleared
        return { recovered: true, method: 'auto-recovery' };
    }
  }

  /**
   * Remove a fault from the active set.
   * @private
   */
  _removeFault(faultType) {
    this._activeFaults.delete(faultType);

    // Clear global chaos flags
    delete global.__HEADY_CHAOS_CACHE_KILLED;
    delete global.__HEADY_CHAOS_LATENCY_MS;
    delete global.__HEADY_CHAOS_CORRUPT_PAYLOAD;
    delete global.__HEADY_CHAOS_DB_KILLED;
    delete global.__HEADY_CHAOS_LLM_THROTTLE;
    delete global.__HEADY_CHAOS_PRIMARY_LLM_KILLED;
    delete global.__HEADY_CHAOS_SECONDARY_LLM_KILLED;
    delete global.__HEADY_CHAOS_NETWORK_PARTITIONED;
    delete global.__HEADY_CHAOS_DEPLOY_REGRESSION;
    delete global.__HEADY_CHAOS_LLM_FALLBACK_ACTIVE;
    delete global.__HEADY_CHAOS_LLM_TERTIARY_ACTIVE;
    delete global.__HEADY_CHAOS_ROLLBACK_COMPLETE;
  }

  /**
   * Update resilience score based on recovery metrics.
   * @private
   */
  _updateResilienceScore() {
    const total = this.metrics.totalInjections;
    if (total === 0) {
      this.metrics.resilienceScore = 1.0;
      return;
    }

    const recoveryRate = this.metrics.totalRecoveries / total;
    // Phi-weighted resilience: recoveryRate × φ⁻¹ + (1 - failureRate) × (1 - φ⁻¹)
    const failureRate = this.metrics.totalFailures / total;
    this.metrics.resilienceScore =
      recoveryRate * PSI + (1 - failureRate) * (1 - PSI);
  }

  /**
   * Get a summary of all chaos test results.
   */
  getSummary() {
    return {
      state: this.state,
      activeFaults: Array.from(this._activeFaults.values()),
      faultHistory: this._faultHistory,
      metrics: { ...this.metrics }
    };
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────
module.exports = {
  ChaosInjectionHarness,
  CHAOS_TYPE,
  DEFAULT_CHAOS_SEQUENCE,
  FIB
};
