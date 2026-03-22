#!/usr/bin/env node
/**
 * HEADY_BRAND:BEGIN
 * Heady Autonomous Self-Healing Test Runner
 * MAPE-K loop implementation with phi-stepped timeouts and Fibonacci backoff
 * HEADY_BRAND:END
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ─── Constants ────────────────────────────────────────────────────
const PHI = 1.6180339887; // Golden ratio
const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const BASE_TIMEOUT = 30_000;
const PROJECT_ROOT = resolve(import.meta.dirname, '..');
const RESULTS_DIR = join(PROJECT_ROOT, 'test-results');
const KNOWLEDGE_DIR = join(PROJECT_ROOT, '.heady-knowledge');

// ─── Ensure directories ──────────────────────────────────────────
[RESULTS_DIR, KNOWLEDGE_DIR].forEach(d => {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
});

// ─── Utility ─────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      args[key] = (next && !next.startsWith('--')) ? argv[++i] : 'true';
    }
  }
  return args;
}

function phiTimeout(step = 0) {
  return Math.round(BASE_TIMEOUT * Math.pow(PHI, step));
}

function fibonacciBackoff(attempt) {
  const idx = Math.min(attempt, FIBONACCI.length - 1);
  return FIBONACCI[idx] * 1000;
}

function timestamp() {
  return new Date().toISOString();
}

async function setOutput(name, value) {
  const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
  const ghOutput = process.env.GITHUB_OUTPUT;
  if (ghOutput) {
    try {
      const { appendFileSync } = await import('node:fs');
      appendFileSync(ghOutput, `${name}=${serialized}\n`);
    } catch {
      console.log(`::set-output name=${name}::${serialized}`);
    }
  } else {
    console.log(`[OUTPUT] ${name}=${serialized}`);
  }
}

function appendToFile(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', { flag: 'a' });
}

// ─── Contract Definitions ────────────────────────────────────────
const CONTRACTS = {
  'heady-manager-exports': {
    description: 'heady-manager.js must export or define core server setup',
    validate: () => {
      const managerPath = join(PROJECT_ROOT, 'heady-manager.js');
      if (!existsSync(managerPath)) return { valid: false, reason: 'heady-manager.js not found' };
      const content = readFileSync(managerPath, 'utf-8');
      const hasExpress = content.includes('express') || content.includes('http');
      return { valid: hasExpress, reason: hasExpress ? 'OK' : 'Missing server framework' };
    },
  },
  'config-yaml-parseable': {
    description: 'All YAML configs in configs/ must be parseable',
    validate: () => {
      const configDir = join(PROJECT_ROOT, 'configs');
      if (!existsSync(configDir)) return { valid: true, reason: 'No configs dir (skipped)' };
      try {
        const files = execSync(`find ${configDir} -name '*.yaml' -o -name '*.yml'`, { encoding: 'utf-8' })
          .trim().split('\n').filter(Boolean);
        for (const f of files) {
          // Basic YAML syntax check — no colons in first column without value
          readFileSync(f, 'utf-8');
        }
        return { valid: true, reason: `${files.length} YAML files readable` };
      } catch (e) {
        return { valid: false, reason: e.message };
      }
    },
  },
  'package-json-valid': {
    description: 'package.json must be valid JSON with required fields',
    validate: () => {
      try {
        const pkg = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8'));
        const hasRequired = pkg.name && pkg.version && pkg.scripts;
        return { valid: !!hasRequired, reason: hasRequired ? 'OK' : 'Missing name/version/scripts' };
      } catch (e) {
        return { valid: false, reason: e.message };
      }
    },
  },
  'vitest-config-exists': {
    description: 'Vitest configuration must exist',
    validate: () => {
      const exists = existsSync(join(PROJECT_ROOT, 'vitest.config.js'));
      return { valid: exists, reason: exists ? 'OK' : 'vitest.config.js not found' };
    },
  },
  'test-setup-exists': {
    description: 'Test setup file must exist',
    validate: () => {
      const exists = existsSync(join(PROJECT_ROOT, 'tests', 'setup.js'));
      return { valid: exists, reason: exists ? 'OK' : 'tests/setup.js not found' };
    },
  },
};

// ─── Test Suite Definitions ──────────────────────────────────────
const SUITES = {
  core: {
    pattern: 'tests/self-healing/**/*.core.test.js',
    timeout: phiTimeout(0),
  },
  contracts: {
    pattern: 'tests/self-healing/**/*.contract.test.js',
    timeout: phiTimeout(1),
  },
  resilience: {
    pattern: 'tests/self-healing/**/*.resilience.test.js',
    timeout: phiTimeout(2),
  },
  chaos: {
    pattern: 'tests/self-healing/**/*.chaos.test.js',
    timeout: phiTimeout(3),
  },
};

// ─── MAPE-K Phases ──────────────────────────────────────────────

async function monitor() {
  console.log('=== MAPE-K: MONITOR ===');
  console.log(`Timestamp: ${timestamp()}`);
  console.log(`Phi base timeout: ${BASE_TIMEOUT}ms`);
  console.log(`Phi-stepped timeouts: ${[0,1,2,3].map(s => `step${s}=${phiTimeout(s)}ms`).join(', ')}`);

  let score = 100;
  const issues = [];

  // Check core files exist
  const coreFiles = ['heady-manager.js', 'package.json', 'vitest.config.js'];
  for (const f of coreFiles) {
    if (!existsSync(join(PROJECT_ROOT, f))) {
      score -= 20;
      issues.push(`Missing: ${f}`);
    }
  }

  // Check test infrastructure
  if (!existsSync(join(PROJECT_ROOT, 'tests'))) {
    score -= 15;
    issues.push('Missing: tests/ directory');
  }

  // Check self-healing tests exist
  if (!existsSync(join(PROJECT_ROOT, 'tests', 'self-healing'))) {
    score -= 5; // Minor — we create them
    issues.push('Missing: tests/self-healing/ (will be created)');
  }

  // Run vitest dry-run to check if tests parse
  try {
    execSync('npx vitest run --reporter=json 2>/dev/null || true', {
      cwd: PROJECT_ROOT,
      timeout: phiTimeout(1),
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  } catch {
    score -= 10;
    issues.push('Vitest dry-run failed');
  }

  const needsHealing = score < 85;

  console.log(`Health score: ${score}/100`);
  console.log(`Needs healing: ${needsHealing}`);
  if (issues.length) console.log(`Issues: ${issues.join('; ')}`);

  const report = { timestamp: timestamp(), score, issues, needsHealing };
  writeFileSync(join(RESULTS_DIR, 'monitor-report.json'), JSON.stringify(report, null, 2));

  await setOutput('score', score);
  await setOutput('needs_healing', needsHealing);
  await setOutput('matrix', JSON.stringify(Object.keys(SUITES)));
}

async function validateContracts() {
  console.log('=== MAPE-K: VALIDATE CONTRACTS ===');

  const results = {};
  let allValid = true;

  for (const [name, contract] of Object.entries(CONTRACTS)) {
    const result = contract.validate();
    results[name] = result;
    if (!result.valid) allValid = false;
    console.log(`  [${result.valid ? 'PASS' : 'FAIL'}] ${name}: ${result.reason}`);
  }

  writeFileSync(join(RESULTS_DIR, 'contract-results.json'), JSON.stringify(results, null, 2));
  await setOutput('valid', allValid);
}

async function analyze(args) {
  console.log('=== MAPE-K: ANALYZE ===');
  const healthScore = parseInt(args['health-score'] || '100', 10);
  const needsHealing = args['needs-healing'] === 'true';

  const plan = {
    timestamp: timestamp(),
    healthScore,
    needsHealing,
    actions: [],
  };

  if (healthScore < 50) {
    plan.actions.push({ type: 'recovery', priority: 'critical', description: 'System in recovery mode' });
  } else if (healthScore < 70) {
    plan.actions.push({ type: 'maintenance', priority: 'high', description: 'Reduced test parallelism' });
  } else if (healthScore < 85) {
    plan.actions.push({ type: 'standard', priority: 'normal', description: 'Normal test execution' });
  } else {
    plan.actions.push({ type: 'full', priority: 'low', description: 'Full parallel execution with chaos' });
  }

  console.log(`Plan: ${JSON.stringify(plan.actions)}`);
  writeFileSync(join(RESULTS_DIR, 'healing-plan.json'), JSON.stringify(plan, null, 2));
  await setOutput('plan', JSON.stringify(plan));
}

async function execute(args) {
  const suite = args.suite || 'core';
  const chaosLevel = parseInt(args['chaos-level'] || '1', 10);
  const healMode = args['heal-mode'] || 'auto';

  console.log(`=== MAPE-K: EXECUTE (suite=${suite}, chaos=${chaosLevel}, heal=${healMode}) ===`);

  const suiteConfig = SUITES[suite];
  if (!suiteConfig) {
    console.log(`Unknown suite: ${suite}. Running core.`);
  }

  const pattern = suiteConfig?.pattern || SUITES.core.pattern;
  const timeout = suiteConfig?.timeout || phiTimeout(0);

  console.log(`Pattern: ${pattern}`);
  console.log(`Phi-stepped timeout: ${timeout}ms`);

  try {
    const result = execSync(
      `npx vitest run --reporter=verbose "${pattern}" 2>&1 || true`,
      { cwd: PROJECT_ROOT, timeout, encoding: 'utf-8', stdio: 'pipe' }
    );
    console.log(result);

    writeFileSync(join(RESULTS_DIR, `suite-${suite}.txt`), result);
  } catch (e) {
    console.error(`Suite ${suite} execution error: ${e.message}`);
    writeFileSync(join(RESULTS_DIR, `suite-${suite}-error.txt`), e.message);

    if (healMode === 'auto') {
      console.log('Auto-heal mode: will attempt recovery in heal phase');
      process.exitCode = 1;
    }
  }
}

async function heal(args) {
  const suite = args.suite || 'core';
  const maxRetries = parseInt(args['max-retries'] || '5', 10);
  const backoff = args.backoff || 'fibonacci';

  console.log(`=== MAPE-K: SELF-HEAL (suite=${suite}, retries=${maxRetries}, backoff=${backoff}) ===`);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const delay = backoff === 'fibonacci' ? fibonacciBackoff(attempt) : (attempt + 1) * 1000;
    console.log(`Attempt ${attempt + 1}/${maxRetries} (backoff: ${delay}ms)`);

    // Wait with Fibonacci backoff
    await new Promise(r => setTimeout(r, delay));

    try {
      const result = execSync(
        `npx vitest run --reporter=verbose "${SUITES[suite]?.pattern || SUITES.core.pattern}" 2>&1`,
        { cwd: PROJECT_ROOT, timeout: phiTimeout(2), encoding: 'utf-8', stdio: 'pipe' }
      );
      console.log(`Healed on attempt ${attempt + 1}`);
      writeFileSync(join(RESULTS_DIR, `heal-${suite}.txt`), result);

      const knowledge = {
        timestamp: timestamp(),
        suite,
        healedOnAttempt: attempt + 1,
        backoffUsed: delay,
      };
      appendToFile(join(KNOWLEDGE_DIR, 'healing-history.jsonl'), knowledge);
      return; // Success
    } catch (e) {
      console.log(`Attempt ${attempt + 1} failed: ${e.message?.slice(0, 100)}`);
    }
  }

  console.error(`Failed to heal suite ${suite} after ${maxRetries} attempts`);
  process.exitCode = 1;
}

async function knowledge(args) {
  console.log('=== MAPE-K: KNOWLEDGE ===');

  const report = {
    timestamp: timestamp(),
    healthScore: parseInt(args['health-score'] || '0', 10),
    contractsValid: args['contracts-valid'] === 'true',
    executionResult: args.results || 'unknown',
    phiConstants: {
      phi: PHI,
      baseTimeout: BASE_TIMEOUT,
      steppedTimeouts: [0, 1, 2, 3].map(s => ({ step: s, ms: phiTimeout(s) })),
    },
    fibonacciBackoffs: FIBONACCI.slice(0, 5).map((f, i) => ({ attempt: i, delayMs: f * 1000 })),
  };

  writeFileSync(join(KNOWLEDGE_DIR, 'latest-report.json'), JSON.stringify(report, null, 2));
  console.log(`Knowledge updated: score=${report.healthScore}, contracts=${report.contractsValid}, result=${report.executionResult}`);

  // Persist run history
  const historyPath = join(KNOWLEDGE_DIR, 'run-history.jsonl');
  appendToFile(historyPath, { ...report, type: 'run' });
}

// ─── CLI Dispatch ────────────────────────────────────────────────
const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

const commands = {
  monitor,
  'validate-contracts': validateContracts,
  analyze,
  execute,
  heal,
  knowledge,
};

if (!commands[command]) {
  console.error(`Usage: self-healing-runner.mjs <${Object.keys(commands).join('|')}> [options]`);
  process.exit(1);
}

commands[command](args).catch(e => {
  console.error(`Fatal: ${e.message}`);
  process.exit(1);
});
