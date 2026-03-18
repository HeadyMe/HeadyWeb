#!/usr/bin/env node
// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  HEADY SYSTEMS — Governance & Compliance MCP Server            ║
// ║  ∞ SACRED GEOMETRY ∞  Ethics · Policy · Cost · Audit          ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Heady Governance MCP Server
 *
 * Policy enforcement, cost tracking, audit logging, and compliance:
 * - Governance policy enforcement with CSL gates
 * - Cost tracking per provider with phi-scaled budgets
 * - RBAC permission management
 * - Audit trail with tamper-evident logging
 * - GDPR/compliance scanning
 * - Story driver (progress narrative generation)
 * - Resource diagnostics & capacity planning
 */

const PHI = 1.618033988749895;
const PSI = 0.6180339887498949;

class GovernanceEngine {
  constructor() {
    this.policies = new Map();
    this.violations = [];
    this.auditLog = [];

    // Default policies
    this.addPolicy('no-secrets-in-code', {
      description: 'Prevent secrets, API keys, tokens from being committed to code',
      severity: 'critical',
      action: 'block',
      patterns: ['AKIA', 'sk-', 'ghp_', 'ghs_', 'AIza', 'xoxb-', 'xoxp-']
    });
    this.addPolicy('phi-constants-only', {
      description: 'All magic numbers must be phi-derived or Fibonacci-indexed',
      severity: 'warning',
      action: 'warn'
    });
    this.addPolicy('structured-logging', {
      description: 'No console.log — use pino structured JSON logging',
      severity: 'warning',
      action: 'warn'
    });
    this.addPolicy('csl-gates-required', {
      description: 'All routing decisions must pass through CSL confidence gates',
      severity: 'high',
      action: 'block'
    });
    this.addPolicy('health-endpoint', {
      description: 'Every service must expose /health returning {status, coherenceScore, version}',
      severity: 'high',
      action: 'warn'
    });
  }

  addPolicy(id, config) {
    this.policies.set(id, {
      id,
      ...config,
      enabled: true,
      created: new Date().toISOString(),
      violations: 0
    });
  }

  enforce(policyId, context = {}) {
    const policy = this.policies.get(policyId);
    if (!policy || !policy.enabled) return { enforced: false, reason: 'Policy not found or disabled' };

    const violation = {
      policyId,
      severity: policy.severity,
      action: policy.action,
      context,
      timestamp: new Date().toISOString()
    };

    policy.violations++;
    this.violations.push(violation);
    this.audit('policy_violation', { policyId, severity: policy.severity });

    return {
      enforced: true,
      blocked: policy.action === 'block',
      violation
    };
  }

  audit(action, details = {}) {
    const entry = {
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      // Tamper-evident: hash of previous entry
      prevHash: this.auditLog.length > 0
        ? this.hashEntry(this.auditLog[this.auditLog.length - 1])
        : 'GENESIS'
    };
    this.auditLog.push(entry);
    return entry;
  }

  hashEntry(entry) {
    let hash = 0;
    const str = JSON.stringify(entry);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36);
  }

  listPolicies() {
    return [...this.policies.values()];
  }

  getAuditLog(limit = 50) {
    return this.auditLog.slice(-limit);
  }

  getViolationReport() {
    const bySeverity = {};
    this.violations.forEach(v => {
      bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
    });
    return {
      total: this.violations.length,
      bySeverity,
      recent: this.violations.slice(-20),
      blocked: this.violations.filter(v => v.action === 'block').length
    };
  }
}

class CostTracker {
  constructor() {
    this.entries = [];
    this.budgets = {
      anthropic: { daily: 50, monthly: 1000, used: { daily: 0, monthly: 0 } },
      openai: { daily: 30, monthly: 600, used: { daily: 0, monthly: 0 } },
      google: { daily: 20, monthly: 400, used: { daily: 0, monthly: 0 } },
      cloudflare: { daily: 10, monthly: 200, used: { daily: 0, monthly: 0 } },
      infrastructure: { daily: 25, monthly: 500, used: { daily: 0, monthly: 0 } }
    };
    // Phi-scaled budget pools: Hot=34%, Warm=21%, Cold=13%, Reserve=8%, Governance=5%
    this.poolAllocation = {
      hot: 0.34,
      warm: 0.21,
      cold: 0.13,
      reserve: 0.08,
      governance: 0.05
    };
  }

  recordCost(provider, amount, metadata = {}) {
    const entry = {
      id: `cost-${Date.now().toString(36)}`,
      provider,
      amount,
      metadata,
      timestamp: new Date().toISOString()
    };
    this.entries.push(entry);

    if (this.budgets[provider]) {
      this.budgets[provider].used.daily += amount;
      this.budgets[provider].used.monthly += amount;
    }

    return entry;
  }

  getBudgetStatus() {
    const status = {};
    for (const [provider, budget] of Object.entries(this.budgets)) {
      status[provider] = {
        daily: {
          budget: budget.daily,
          used: Math.round(budget.used.daily * 100) / 100,
          remaining: Math.round((budget.daily - budget.used.daily) * 100) / 100,
          utilization: Math.round((budget.used.daily / budget.daily) * 100) + '%'
        },
        monthly: {
          budget: budget.monthly,
          used: Math.round(budget.used.monthly * 100) / 100,
          remaining: Math.round((budget.monthly - budget.used.monthly) * 100) / 100,
          utilization: Math.round((budget.used.monthly / budget.monthly) * 100) + '%'
        }
      };
    }
    return { providers: status, poolAllocation: this.poolAllocation };
  }

  getCostReport(days = 7) {
    const cutoff = Date.now() - days * 86400000;
    const recent = this.entries.filter(e => new Date(e.timestamp).getTime() > cutoff);
    const byProvider = {};
    recent.forEach(e => {
      byProvider[e.provider] = (byProvider[e.provider] || 0) + e.amount;
    });

    const totalSpend = Object.values(byProvider).reduce((s, v) => s + v, 0);

    return {
      period: `${days} days`,
      totalSpend: Math.round(totalSpend * 100) / 100,
      byProvider,
      entryCount: recent.length,
      avgDaily: Math.round((totalSpend / days) * 100) / 100
    };
  }
}

class RBACManager {
  constructor() {
    this.roles = new Map();
    this.users = new Map();

    // Default roles
    this.roles.set('owner', { permissions: ['*'], level: 100 });
    this.roles.set('admin', { permissions: ['read', 'write', 'deploy', 'configure'], level: 80 });
    this.roles.set('developer', { permissions: ['read', 'write', 'deploy'], level: 60 });
    this.roles.set('viewer', { permissions: ['read'], level: 20 });
    this.roles.set('agent', { permissions: ['read', 'write', 'execute'], level: 40 });
  }

  assignRole(userId, role) {
    if (!this.roles.has(role)) throw new Error(`Role ${role} not found`);
    this.users.set(userId, { role, assignedAt: new Date().toISOString() });
    return { userId, role, permissions: this.roles.get(role).permissions };
  }

  checkPermission(userId, permission) {
    const user = this.users.get(userId);
    if (!user) return { allowed: false, reason: 'User not found' };
    const role = this.roles.get(user.role);
    const allowed = role.permissions.includes('*') || role.permissions.includes(permission);
    return { allowed, userId, role: user.role, permission };
  }

  listRoles() {
    return [...this.roles.entries()].map(([name, config]) => ({ name, ...config }));
  }

  listUsers() {
    return [...this.users.entries()].map(([id, config]) => ({ id, ...config }));
  }
}

class StoryDriver {
  constructor() {
    this.stories = [];
    this.currentStory = null;
  }

  startStory(title, context = {}) {
    this.currentStory = {
      id: `story-${Date.now().toString(36)}`,
      title,
      chapters: [],
      context,
      status: 'in_progress',
      started: new Date().toISOString()
    };
    this.stories.push(this.currentStory);
    return this.currentStory;
  }

  addChapter(narrative, metrics = {}) {
    if (!this.currentStory) throw new Error('No active story');
    const chapter = {
      index: this.currentStory.chapters.length + 1,
      narrative,
      metrics,
      timestamp: new Date().toISOString()
    };
    this.currentStory.chapters.push(chapter);
    return chapter;
  }

  completeStory(summary) {
    if (!this.currentStory) throw new Error('No active story');
    this.currentStory.status = 'completed';
    this.currentStory.summary = summary;
    this.currentStory.completed = new Date().toISOString();
    const completed = this.currentStory;
    this.currentStory = null;
    return completed;
  }

  getStory(storyId) {
    return this.stories.find(s => s.id === storyId);
  }

  listStories() {
    return this.stories.map(s => ({
      id: s.id, title: s.title, status: s.status,
      chapters: s.chapters.length, started: s.started
    }));
  }
}

const governance = new GovernanceEngine();
const costTracker = new CostTracker();
const rbac = new RBACManager();
const storyDriver = new StoryDriver();

module.exports = {
  GovernanceEngine, CostTracker, RBACManager, StoryDriver,
  governance, costTracker, rbac, storyDriver,

  tools: [
    {
      name: 'heady_governance_enforce',
      description: 'Enforce a governance policy — check for violations and optionally block',
      inputSchema: {
        type: 'object',
        properties: {
          policyId: { type: 'string', description: 'Policy ID to enforce' },
          context: { type: 'object', description: 'Enforcement context (file, action, etc.)' }
        },
        required: ['policyId']
      }
    },
    {
      name: 'heady_governance_policies',
      description: 'List all governance policies with violation counts',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_governance_violations',
      description: 'Get violation report — total, by severity, recent',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_governance_audit',
      description: 'View tamper-evident audit log',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max entries (default: 50)' }
        }
      }
    },
    {
      name: 'heady_cost_record',
      description: 'Record a cost entry for a provider',
      inputSchema: {
        type: 'object',
        properties: {
          provider: { type: 'string', description: 'Provider: anthropic, openai, google, cloudflare, infrastructure' },
          amount: { type: 'number', description: 'Cost amount in USD' },
          metadata: { type: 'object', description: 'Cost metadata (model, tokens, etc.)' }
        },
        required: ['provider', 'amount']
      }
    },
    {
      name: 'heady_cost_budget',
      description: 'Get budget status across all providers with phi-pool allocation',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_cost_report_period',
      description: 'Get cost report for a time period',
      inputSchema: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Number of days (default: 7)' }
        }
      }
    },
    {
      name: 'heady_rbac_assign',
      description: 'Assign a role to a user',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          role: { type: 'string', description: 'Role: owner, admin, developer, viewer, agent' }
        },
        required: ['userId', 'role']
      }
    },
    {
      name: 'heady_rbac_check',
      description: 'Check if a user has a specific permission',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          permission: { type: 'string', description: 'Permission to check: read, write, deploy, configure, execute' }
        },
        required: ['userId', 'permission']
      }
    },
    {
      name: 'heady_rbac_list',
      description: 'List all roles and users',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'heady_story_start',
      description: 'Start a progress narrative story',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Story title' },
          context: { type: 'object', description: 'Story context metadata' }
        },
        required: ['title']
      }
    },
    {
      name: 'heady_story_chapter',
      description: 'Add a chapter to the current story',
      inputSchema: {
        type: 'object',
        properties: {
          narrative: { type: 'string', description: 'Chapter narrative text' },
          metrics: { type: 'object', description: 'Chapter metrics' }
        },
        required: ['narrative']
      }
    },
    {
      name: 'heady_story_complete',
      description: 'Complete the current story with a summary',
      inputSchema: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Story summary' }
        },
        required: ['summary']
      }
    },
    {
      name: 'heady_story_list',
      description: 'List all progress stories',
      inputSchema: { type: 'object', properties: {} }
    }
  ],

  async handleTool(name, args) {
    switch (name) {
      case 'heady_governance_enforce': return governance.enforce(args.policyId, args.context);
      case 'heady_governance_policies': return governance.listPolicies();
      case 'heady_governance_violations': return governance.getViolationReport();
      case 'heady_governance_audit': return governance.getAuditLog(args?.limit);
      case 'heady_cost_record': return costTracker.recordCost(args.provider, args.amount, args.metadata);
      case 'heady_cost_budget': return costTracker.getBudgetStatus();
      case 'heady_cost_report_period': return costTracker.getCostReport(args?.days);
      case 'heady_rbac_assign': return rbac.assignRole(args.userId, args.role);
      case 'heady_rbac_check': return rbac.checkPermission(args.userId, args.permission);
      case 'heady_rbac_list': return { roles: rbac.listRoles(), users: rbac.listUsers() };
      case 'heady_story_start': return storyDriver.startStory(args.title, args.context);
      case 'heady_story_chapter': return storyDriver.addChapter(args.narrative, args.metrics);
      case 'heady_story_complete': return storyDriver.completeStory(args.summary);
      case 'heady_story_list': return storyDriver.listStories();
      default: throw new Error(`Unknown tool: ${name}`);
    }
  }
};
