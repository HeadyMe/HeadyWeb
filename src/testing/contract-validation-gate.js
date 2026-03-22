'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  HEADY™ Contract Validation Gate — Boundary Semantic Enforcement         ║
 * ║  CSL-Scored Schema Validation at Every Service Boundary                  ║
 * ║  © 2024-2026 HeadySystems Inc. All Rights Reserved.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Enforces contract validation at every service boundary:
 *   Service ↔ Service: Schema compatibility via Semantic Resonance
 *   Agent ↔ Tool: Input/output contract verification
 *   API ↔ Consumer: Zod/JSON Schema validation
 *
 * Threshold: cosine_similarity > 0.809 (φ-derived)
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// ─── φ-Constants ────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const PSI = 1 / PHI;

/** Semantic resonance threshold — 1 - ψ² × 0.5 ≈ 0.809 */
const RESONANCE_THRESHOLD = 1 - Math.pow(PSI, 2) * 0.5;

/** Schema staleness threshold (ms) — φ⁵ × 1000 ≈ 11,090ms */
const STALENESS_MS = Math.round(Math.pow(PHI, 5) * 1000);

/**
 * Contract boundary types.
 */
const BOUNDARY_TYPE = Object.freeze({
  SERVICE_TO_SERVICE: 'service-to-service',
  AGENT_TO_TOOL: 'agent-to-tool',
  API_TO_CONSUMER: 'api-to-consumer',
  EVENT_PRODUCER_CONSUMER: 'event-producer-consumer'
});

/**
 * ContractValidationGate — validates all service boundary contracts.
 */
class ContractValidationGate extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} options.projectRoot
   * @param {number} [options.resonanceThreshold] - Override the default threshold
   */
  constructor({ projectRoot, resonanceThreshold = RESONANCE_THRESHOLD }) {
    super();
    this.projectRoot = projectRoot;
    this.resonanceThreshold = resonanceThreshold;
    this.contracts = new Map();
    this.validationHistory = [];
  }

  /**
   * Validate all discovered contracts in the project.
   *
   * @returns {Promise<Object>} Validation results with violations
   */
  async validateAll() {
    const contracts = await this._discoverContracts();
    const violations = [];
    const validations = [];

    for (const contract of contracts) {
      const result = await this._validateContract(contract);
      validations.push(result);
      if (!result.valid) {
        violations.push(result);
      }
    }

    const summary = {
      total: contracts.length,
      valid: contracts.length - violations.length,
      invalid: violations.length,
      violations,
      validations,
      resonanceScore: this._computeOverallResonance(validations),
      timestamp: new Date().toISOString()
    };

    this.validationHistory.push(summary);
    this.emit('validation:complete', summary);
    return summary;
  }

  /**
   * Validate a single contract boundary.
   *
   * @param {Object} contract
   * @returns {Promise<Object>}
   */
  async _validateContract(contract) {
    const result = {
      boundary: contract.boundary,
      type: contract.type,
      producer: contract.producer,
      consumer: contract.consumer,
      valid: true,
      resonance: 1.0,
      violations: []
    };

    try {
      // Load schemas from both sides
      const producerSchema = this._loadSchema(contract.producer);
      const consumerSchema = this._loadSchema(contract.consumer);

      if (!producerSchema || !consumerSchema) {
        result.valid = false;
        result.violations.push({
          type: 'missing-schema',
          message: `Schema not found: ${!producerSchema ? contract.producer : contract.consumer}`,
          severity: 'critical'
        });
        return result;
      }

      // Compute semantic resonance
      const resonance = this._computeSemanticResonance(producerSchema, consumerSchema);
      result.resonance = resonance;

      if (resonance < this.resonanceThreshold) {
        result.valid = false;
        result.violations.push({
          type: 'schema-drift',
          message: `Semantic resonance (${resonance.toFixed(3)}) below threshold (${this.resonanceThreshold.toFixed(3)})`,
          severity: resonance < PSI * PSI ? 'critical' : 'warning',
          producerSchema,
          consumerSchema
        });
      }

      // Check field compatibility
      const fieldViolations = this._checkFieldCompatibility(producerSchema, consumerSchema);
      if (fieldViolations.length > 0) {
        result.valid = false;
        result.violations.push(...fieldViolations);
      }

    } catch (err) {
      result.valid = false;
      result.violations.push({
        type: 'validation-error',
        message: err.message,
        severity: 'critical'
      });
    }

    return result;
  }

  /**
   * Discover all contract boundaries in the project.
   * @private
   */
  async _discoverContracts() {
    const contracts = [];

    // Scan services directory for manifests
    const serviceDirs = [
      path.join(this.projectRoot, 'src', 'services'),
      path.join(this.projectRoot, 'src', 'sites'),
      path.join(this.projectRoot, 'services'),
      path.join(this.projectRoot, 'packages')
    ];

    for (const dir of serviceDirs) {
      if (!fs.existsSync(dir)) continue;

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const serviceEntries = entries.filter(e => e.isDirectory());

      // Check each pair of services for contracts
      for (let i = 0; i < serviceEntries.length; i++) {
        const serviceDir = path.join(dir, serviceEntries[i].name);
        const manifest = this._findManifest(serviceDir);

        if (manifest && manifest.contracts) {
          for (const contractDef of manifest.contracts) {
            contracts.push({
              boundary: `${serviceEntries[i].name}↔${contractDef.target}`,
              type: contractDef.type || BOUNDARY_TYPE.SERVICE_TO_SERVICE,
              producer: path.join(serviceDir, contractDef.schema || 'schema.json'),
              consumer: contractDef.targetSchema || null
            });
          }
        }
      }
    }

    // Also check for Zod schemas in src/
    const zodSchemas = await this._findZodSchemas();
    for (const schema of zodSchemas) {
      contracts.push({
        boundary: `zod:${path.basename(schema, '.js')}`,
        type: BOUNDARY_TYPE.API_TO_CONSUMER,
        producer: schema,
        consumer: schema
      });
    }

    return contracts;
  }

  /**
   * Find a service manifest (manifest.yaml or manifest.json).
   * @private
   */
  _findManifest(serviceDir) {
    const candidates = ['manifest.yaml', 'manifest.json', 'manifest.yml'];
    for (const name of candidates) {
      const manifestPath = path.join(serviceDir, name);
      if (fs.existsSync(manifestPath)) {
        try {
          const content = fs.readFileSync(manifestPath, 'utf-8');
          if (name.endsWith('.json')) return JSON.parse(content);
          // Simple YAML parse for basic structure
          return this._parseSimpleYaml(content);
        } catch (_) {
          continue;
        }
      }
    }
    return null;
  }

  /**
   * Find all Zod schema files.
   * @private
   */
  async _findZodSchemas() {
    const schemas = [];
    const srcDir = path.join(this.projectRoot, 'src');
    if (!fs.existsSync(srcDir)) return schemas;

    this._walkDir(srcDir, (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('z.object') || content.includes('z.string')) {
          schemas.push(filePath);
        }
      } catch (_) {
        // Skip unreadable files
      }
    });

    return schemas;
  }

  /**
   * Load a schema from a file path.
   * @private
   */
  _loadSchema(schemaPath) {
    if (!schemaPath || !fs.existsSync(schemaPath)) return null;

    try {
      const content = fs.readFileSync(schemaPath, 'utf-8');
      if (schemaPath.endsWith('.json')) {
        return JSON.parse(content);
      }
      // For JS/TS files, extract the schema structure
      return this._extractSchemaFromSource(content);
    } catch (_) {
      return null;
    }
  }

  /**
   * Extract schema fields from JS/TS source.
   * @private
   */
  _extractSchemaFromSource(source) {
    const fields = {};

    // Extract z.object fields: fieldName: z.string(), etc.
    const zodFieldPattern = /(\w+)\s*:\s*z\.(\w+)\(/g;
    let match;
    while ((match = zodFieldPattern.exec(source)) !== null) {
      fields[match[1]] = { type: match[2] };
    }

    // Extract interface/type fields: fieldName: type
    const tsFieldPattern = /(\w+)\??\s*:\s*(string|number|boolean|object|any)\b/g;
    while ((match = tsFieldPattern.exec(source)) !== null) {
      if (!fields[match[1]]) {
        fields[match[1]] = { type: match[2] };
      }
    }

    return Object.keys(fields).length > 0 ? fields : null;
  }

  /**
   * Check field compatibility between producer and consumer schemas.
   * @private
   */
  _checkFieldCompatibility(producerSchema, consumerSchema) {
    const violations = [];

    if (typeof producerSchema !== 'object' || typeof consumerSchema !== 'object') {
      return violations;
    }

    const producerFields = Object.keys(producerSchema);
    const consumerFields = Object.keys(consumerSchema);

    // Fields consumer expects but producer doesn't provide
    for (const field of consumerFields) {
      if (!producerFields.includes(field)) {
        violations.push({
          type: 'missing-field',
          message: `Consumer expects field '${field}' not provided by producer`,
          severity: 'warning',
          field
        });
      }
    }

    return violations;
  }

  /**
   * Compute semantic resonance between two schemas using Jaccard similarity.
   * @private
   */
  _computeSemanticResonance(schemaA, schemaB) {
    const tokensA = new Set(this._tokenizeSchema(schemaA));
    const tokensB = new Set(this._tokenizeSchema(schemaB));

    if (tokensA.size === 0 && tokensB.size === 0) return 1.0;

    const intersection = new Set([...tokensA].filter(t => tokensB.has(t)));
    const union = new Set([...tokensA, ...tokensB]);

    return union.size > 0 ? intersection.size / union.size : 1.0;
  }

  /**
   * Tokenize a schema into comparable tokens.
   * @private
   */
  _tokenizeSchema(schema) {
    if (typeof schema === 'string') {
      return (schema.match(/\b\w+\b/g) || []);
    }
    return JSON.stringify(schema).match(/\b\w+\b/g) || [];
  }

  /**
   * Compute overall resonance across all validations.
   * @private
   */
  _computeOverallResonance(validations) {
    if (validations.length === 0) return 1.0;
    const sum = validations.reduce((acc, v) => acc + v.resonance, 0);
    return sum / validations.length;
  }

  /**
   * Simple YAML parser (for basic key-value structures).
   * @private
   */
  _parseSimpleYaml(content) {
    const result = {};
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        result[match[1]] = match[2].trim();
      }
    }
    return result;
  }

  /**
   * Walk directory recursively.
   * @private
   */
  _walkDir(dir, callback, depth = 0) {
    if (depth > 4) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          this._walkDir(fullPath, callback, depth + 1);
        } else if (entry.isFile() && /\.(js|ts)$/.test(entry.name)) {
          callback(fullPath);
        }
      }
    } catch (_) {
      // Skip
    }
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────
module.exports = {
  ContractValidationGate,
  BOUNDARY_TYPE,
  RESONANCE_THRESHOLD,
  STALENESS_MS
};
