'use strict';

/**
 * HEADY™ Autonomous Self-Healing Testing Module
 *
 * Zero-intervention testing with MAPE-K integration, AST mutation,
 * contract validation gates, and Fibonacci chaos injection.
 *
 * @module @heady-ai/testing
 */

const { AutonomousSelfHealingRunner, RUNNER_STATE, PHI_CRITICAL_THRESHOLD, SEMANTIC_RESONANCE_MIN, CYCLE_INTERVAL_MS, MAX_HEAL_ATTEMPTS, PHI_BACKOFF } = require('./autonomous-self-healing-runner');
const { MapeKTestLoop, FAILURE_CATEGORY, FIX_STRATEGY, PHI_FIBONACCI_BACKOFF } = require('./mape-k-test-loop');
const { ASTTestMutator, SEMANTIC_RESONANCE_THRESHOLD } = require('./ast-test-mutator');
const { ContractValidationGate, BOUNDARY_TYPE, RESONANCE_THRESHOLD, STALENESS_MS } = require('./contract-validation-gate');
const { ChaosInjectionHarness, CHAOS_TYPE, DEFAULT_CHAOS_SEQUENCE, FIB } = require('./chaos-injection-harness');

module.exports = {
  // Runner
  AutonomousSelfHealingRunner,
  RUNNER_STATE,
  PHI_CRITICAL_THRESHOLD,
  SEMANTIC_RESONANCE_MIN,
  CYCLE_INTERVAL_MS,
  MAX_HEAL_ATTEMPTS,
  PHI_BACKOFF,

  // MAPE-K
  MapeKTestLoop,
  FAILURE_CATEGORY,
  FIX_STRATEGY,
  PHI_FIBONACCI_BACKOFF,

  // AST Mutator
  ASTTestMutator,
  SEMANTIC_RESONANCE_THRESHOLD,

  // Contract Gate
  ContractValidationGate,
  BOUNDARY_TYPE,
  RESONANCE_THRESHOLD,
  STALENESS_MS,

  // Chaos Harness
  ChaosInjectionHarness,
  CHAOS_TYPE,
  DEFAULT_CHAOS_SEQUENCE,
  FIB
};
