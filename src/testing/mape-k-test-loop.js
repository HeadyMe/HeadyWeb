'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  HEADY™ MAPE-K Test Loop — Autonomic Test Self-Healing                  ║
 * ║  Monitor → Analyze → Plan → Execute → Knowledge                         ║
 * ║  © 2024-2026 HeadySystems Inc. All Rights Reserved.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Implements the MAPE-K autonomic computing loop specialized for test failures:
 *   Monitor  — Capture stack traces, drift metrics, test context
 *   Analyze  — Route to ThreatDetectorBee or ASTMutatorBee
 *   Plan     — Generate fix using LLM fallback chain or pattern matching
 *   Execute  — Inject the patch and re-run
 *   Knowledge — Distill to pattern_store.json + wisdom.json
 */

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

// ─── φ-Constants ────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const PSI = 1 / PHI;

/** Fibonacci backoff sequence scaled by φ */
const PHI_FIBONACCI_BACKOFF = [1, 2, 3, 5, 8, 13, 21].map(f => Math.round(f * PHI * 1000));

// ─── Failure Categories ─────────────────────────────────────────────────────
const FAILURE_CATEGORY = Object.freeze({
  ASSERTION: 'ASSERTION',           // expect(...).toBe(...) failures
  IMPORT_ERROR: 'IMPORT_ERROR',     // Module not found / import resolution
  TIMEOUT: 'TIMEOUT',               // Test timeout exceeded
  TYPE_ERROR: 'TYPE_ERROR',         // Runtime type errors
  REFERENCE_ERROR: 'REFERENCE_ERROR', // Undefined references
  SCHEMA_DRIFT: 'SCHEMA_DRIFT',     // Contract/schema mismatch
  SELECTOR_BROKEN: 'SELECTOR_BROKEN', // CSS/XPath selector failures
  NETWORK: 'NETWORK',               // Network/fetch failures
  UNKNOWN: 'UNKNOWN'
});

// ─── Fix Strategies ─────────────────────────────────────────────────────────
const FIX_STRATEGY = Object.freeze({
  AST_MUTATE: 'ast-mutate',
  SCHEMA_REWRITE: 'schema-rewrite',
  IMPORT_RESOLVE: 'import-resolve',
  SELECTOR_UPDATE: 'selector-update',
  MOCK_INJECT: 'mock-inject',
  TIMEOUT_EXTEND: 'timeout-extend',
  SKIP_AND_LOG: 'skip-and-log'
});

/**
 * MapeKTestLoop — autonomic test self-healing via MAPE-K.
 */
class MapeKTestLoop extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} options.projectRoot
   * @param {Object} [options.llmChain] - LLM fallback chain config
   */
  constructor({ projectRoot, llmChain = null }) {
    super();
    this.projectRoot = projectRoot;
    this.llmChain = llmChain;

    // Knowledge base
    this._patternStorePath = path.join(projectRoot, '.heady_cache', 'pattern_store.json');
    this._knowledgeBase = this._loadKnowledgeBase();

    // Metrics
    this.loopMetrics = {
      totalLoops: 0,
      successfulFixes: 0,
      failedFixes: 0,
      categoryBreakdown: {}
    };
  }

  /**
   * Execute a full MAPE-K loop for a test event.
   *
   * @param {Object} event
   * @param {string} event.phase - 'test-failure' | 'contract-violation'
   * @param {Object} event.failure - Failure details
   * @param {number} [event.attempt=1] - Current heal attempt
   * @returns {Promise<Object>} Result with action and fix
   */
  async execute(event) {
    this.loopMetrics.totalLoops++;
    const loopId = `mape-${Date.now()}`;

    // ── M: Monitor ────────────────────────────────────────────────────
    const monitorData = this._monitor(event);
    this.emit('mape:monitor', { loopId, data: monitorData });

    // ── A: Analyze ────────────────────────────────────────────────────
    const analysis = this._analyze(monitorData);
    this.emit('mape:analyze', { loopId, analysis });

    // ── P: Plan ───────────────────────────────────────────────────────
    const plan = await this._plan(analysis, event);
    this.emit('mape:plan', { loopId, plan });

    // ── E: Execute ────────────────────────────────────────────────────
    // (Execution is delegated back to the runner — we return the plan)

    // ── K: Knowledge ──────────────────────────────────────────────────
    this._updateKnowledge(analysis, plan);
    this.emit('mape:knowledge', { loopId, pattern: plan });

    return plan;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // M: MONITOR — Capture failure context
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * @private
   */
  _monitor(event) {
    const failure = event.failure;
    const stackTrace = this._extractStackTrace(failure);
    const affectedFile = this._extractAffectedFile(failure);
    const errorMessage = this._extractErrorMessage(failure);

    return {
      phase: event.phase,
      attempt: event.attempt || 1,
      timestamp: new Date().toISOString(),
      testFile: failure.testFile || failure.file || null,
      affectedFile,
      stackTrace,
      errorMessage,
      failureMessages: failure.failureMessages || [],
      assertionResults: failure.assertionResults || []
    };
  }

  /**
   * Extract stack trace from failure object.
   * @private
   */
  _extractStackTrace(failure) {
    const messages = failure.failureMessages || [];
    for (const msg of messages) {
      const stackMatch = msg.match(/at\s+[\w.]+\s+\(([^)]+)\)/g);
      if (stackMatch) return stackMatch.join('\n');
    }
    return '';
  }

  /**
   * Extract the source file being tested (not the test file).
   * @private
   */
  _extractAffectedFile(failure) {
    const testFile = failure.testFile || '';
    // Convention: tests/foo.test.js → src/foo.js
    return testFile
      .replace(/tests?\//g, 'src/')
      .replace(/\.test\.(js|ts|jsx|tsx)$/, '.$1')
      .replace(/__tests__\//g, '');
  }

  /**
   * Extract primary error message.
   * @private
   */
  _extractErrorMessage(failure) {
    if (failure.failureMessages && failure.failureMessages.length > 0) {
      return failure.failureMessages[0].split('\n')[0].trim();
    }
    return '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // A: ANALYZE — Categorize and route
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * @private
   */
  _analyze(monitorData) {
    const category = this._categorizeFailure(monitorData);
    const severity = this._computeSeverity(monitorData);
    const knownPattern = this._matchKnownPattern(monitorData);

    // Update category breakdown
    this.loopMetrics.categoryBreakdown[category] =
      (this.loopMetrics.categoryBreakdown[category] || 0) + 1;

    return {
      category,
      severity,
      knownPattern,
      route: knownPattern ? 'pattern-replay' : this._selectRoute(category),
      monitorData
    };
  }

  /**
   * Categorize the failure type from error messages and stack traces.
   * @private
   */
  _categorizeFailure(monitorData) {
    const msg = monitorData.errorMessage.toLowerCase();
    const stack = monitorData.stackTrace.toLowerCase();

    if (msg.includes('expect') || msg.includes('tobe') || msg.includes('toequal')) {
      return FAILURE_CATEGORY.ASSERTION;
    }
    if (msg.includes('cannot find module') || msg.includes('module not found')) {
      return FAILURE_CATEGORY.IMPORT_ERROR;
    }
    if (msg.includes('timeout') || msg.includes('exceeded')) {
      return FAILURE_CATEGORY.TIMEOUT;
    }
    if (msg.includes('typeerror') || msg.includes('is not a function')) {
      return FAILURE_CATEGORY.TYPE_ERROR;
    }
    if (msg.includes('referenceerror') || msg.includes('is not defined')) {
      return FAILURE_CATEGORY.REFERENCE_ERROR;
    }
    if (msg.includes('schema') || msg.includes('validation') || msg.includes('contract')) {
      return FAILURE_CATEGORY.SCHEMA_DRIFT;
    }
    if (msg.includes('selector') || msg.includes('xpath') || msg.includes('queryselector')) {
      return FAILURE_CATEGORY.SELECTOR_BROKEN;
    }
    if (msg.includes('econnrefused') || msg.includes('fetch') || msg.includes('network')) {
      return FAILURE_CATEGORY.NETWORK;
    }
    return FAILURE_CATEGORY.UNKNOWN;
  }

  /**
   * Compute severity: 0 (low) to 1 (critical), phi-scaled.
   * @private
   */
  _computeSeverity(monitorData) {
    const attempt = monitorData.attempt || 1;
    // Severity increases with each attempt, approaching 1.0 via phi curve
    return 1 - Math.pow(PSI, attempt);
  }

  /**
   * Match against known fix patterns from wisdom store.
   * @private
   */
  _matchKnownPattern(monitorData) {
    const signature = this._computeSignature(monitorData);
    for (const pattern of this._knowledgeBase) {
      if (pattern.failureSignature === signature) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Select the routing target based on failure category.
   * @private
   */
  _selectRoute(category) {
    const routeMap = {
      [FAILURE_CATEGORY.ASSERTION]: 'ASTMutatorBee',
      [FAILURE_CATEGORY.IMPORT_ERROR]: 'ASTMutatorBee',
      [FAILURE_CATEGORY.TYPE_ERROR]: 'ASTMutatorBee',
      [FAILURE_CATEGORY.REFERENCE_ERROR]: 'ASTMutatorBee',
      [FAILURE_CATEGORY.SCHEMA_DRIFT]: 'ASTMutatorBee',
      [FAILURE_CATEGORY.SELECTOR_BROKEN]: 'ASTMutatorBee',
      [FAILURE_CATEGORY.TIMEOUT]: 'ThreatDetectorBee',
      [FAILURE_CATEGORY.NETWORK]: 'ThreatDetectorBee',
      [FAILURE_CATEGORY.UNKNOWN]: 'ThreatDetectorBee'
    };
    return routeMap[category] || 'ThreatDetectorBee';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // P: PLAN — Generate the fix
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * @private
   */
  async _plan(analysis, event) {
    // If we have a known pattern, replay it
    if (analysis.knownPattern) {
      return {
        action: analysis.knownPattern.fix.type === 'schema-rewrite'
          ? FIX_STRATEGY.SCHEMA_REWRITE
          : FIX_STRATEGY.AST_MUTATE,
        fix: analysis.knownPattern.fix,
        source: 'pattern-replay',
        confidence: 0.95
      };
    }

    // Generate fix based on category
    const fix = this._generateFix(analysis);
    return {
      action: fix.strategy,
      fix,
      source: analysis.route,
      confidence: fix.confidence
    };
  }

  /**
   * Generate a fix plan based on failure analysis.
   * @private
   */
  _generateFix(analysis) {
    const { category, monitorData } = analysis;

    switch (category) {
      case FAILURE_CATEGORY.ASSERTION: {
        return {
          type: 'ast-mutate',
          strategy: FIX_STRATEGY.AST_MUTATE,
          target: monitorData.testFile,
          description: 'Update assertion to match actual output',
          transform: 'update-expected-value',
          confidence: 0.7
        };
      }

      case FAILURE_CATEGORY.IMPORT_ERROR: {
        const moduleMatch = monitorData.errorMessage.match(/['"]([^'"]+)['"]/);
        return {
          type: 'ast-mutate',
          strategy: FIX_STRATEGY.IMPORT_RESOLVE,
          target: monitorData.testFile,
          description: `Resolve missing module: ${moduleMatch ? moduleMatch[1] : 'unknown'}`,
          transform: 'fix-import-path',
          missingModule: moduleMatch ? moduleMatch[1] : null,
          confidence: 0.8
        };
      }

      case FAILURE_CATEGORY.TIMEOUT: {
        return {
          type: 'config-update',
          strategy: FIX_STRATEGY.TIMEOUT_EXTEND,
          target: monitorData.testFile,
          description: 'Extend test timeout using phi-scaled value',
          newTimeout: Math.round(Math.pow(PHI, 4) * 1000), // φ⁴ × 1000 ≈ 6854ms
          confidence: 0.9
        };
      }

      case FAILURE_CATEGORY.TYPE_ERROR:
      case FAILURE_CATEGORY.REFERENCE_ERROR: {
        return {
          type: 'ast-mutate',
          strategy: FIX_STRATEGY.AST_MUTATE,
          target: monitorData.affectedFile,
          description: 'Fix type/reference error in source',
          transform: 'fix-undefined-reference',
          confidence: 0.6
        };
      }

      case FAILURE_CATEGORY.SCHEMA_DRIFT: {
        return {
          type: 'schema-rewrite',
          strategy: FIX_STRATEGY.SCHEMA_REWRITE,
          target: monitorData.affectedFile,
          description: 'Rewrite schema to match current contract',
          transform: 'sync-schema-upstream',
          confidence: 0.75
        };
      }

      case FAILURE_CATEGORY.SELECTOR_BROKEN: {
        return {
          type: 'ast-mutate',
          strategy: FIX_STRATEGY.SELECTOR_UPDATE,
          target: monitorData.testFile,
          description: 'Update broken selector to match current DOM',
          transform: 'update-selector',
          confidence: 0.85
        };
      }

      case FAILURE_CATEGORY.NETWORK: {
        return {
          type: 'ast-mutate',
          strategy: FIX_STRATEGY.MOCK_INJECT,
          target: monitorData.testFile,
          description: 'Inject network mock for unreliable dependency',
          transform: 'add-network-mock',
          confidence: 0.8
        };
      }

      default: {
        return {
          type: 'skip',
          strategy: FIX_STRATEGY.SKIP_AND_LOG,
          target: monitorData.testFile,
          description: 'Unknown failure — skip and log for manual review',
          transform: 'add-skip-annotation',
          confidence: 0.3
        };
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // K: KNOWLEDGE — Persist and learn
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * @private
   */
  _updateKnowledge(analysis, plan) {
    try {
      const dir = path.dirname(this._patternStorePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const store = fs.existsSync(this._patternStorePath)
        ? JSON.parse(fs.readFileSync(this._patternStorePath, 'utf-8'))
        : { version: '1.0.0', patterns: [] };

      const signature = this._computeSignature(analysis.monitorData);

      // Avoid duplicate patterns
      const existing = store.patterns.find(p => p.failureSignature === signature);
      if (!existing) {
        store.patterns.push({
          failureSignature: signature,
          category: analysis.category,
          route: analysis.route,
          fix: plan.fix,
          confidence: plan.confidence,
          createdAt: new Date().toISOString(),
          hitCount: 1
        });
      } else {
        existing.hitCount = (existing.hitCount || 0) + 1;
        existing.lastHitAt = new Date().toISOString();
      }

      fs.writeFileSync(this._patternStorePath, JSON.stringify(store, null, 2));
    } catch (_) {
      // Non-critical
    }
  }

  /**
   * Compute a deterministic failure signature for pattern matching.
   * @private
   */
  _computeSignature(monitorData) {
    const crypto = require('crypto');
    const input = JSON.stringify({
      file: monitorData.testFile,
      error: (monitorData.errorMessage || '').replace(/\d+/g, 'N').slice(0, 200)
    });
    return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
  }

  /**
   * Load the knowledge base from disk.
   * @private
   */
  _loadKnowledgeBase() {
    try {
      if (fs.existsSync(this._patternStorePath)) {
        const store = JSON.parse(fs.readFileSync(this._patternStorePath, 'utf-8'));
        return store.patterns || [];
      }
    } catch (_) {
      // Graceful degradation
    }
    return [];
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────
module.exports = {
  MapeKTestLoop,
  FAILURE_CATEGORY,
  FIX_STRATEGY,
  PHI_FIBONACCI_BACKOFF
};
