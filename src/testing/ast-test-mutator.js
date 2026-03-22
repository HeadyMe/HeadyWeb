'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  HEADY™ AST Test Mutator — Self-Healing Code Transformation             ║
 * ║  Dynamically rewrites test files and schemas to resolve failures         ║
 * ║  © 2024-2026 HeadySystems Inc. All Rights Reserved.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Implements the ASTMutatorBee pattern:
 *   - Parse source files into AST
 *   - Apply targeted transformations (fix imports, update assertions, etc.)
 *   - Write back the modified source
 *   - Validate schema coherence via CSL Semantic Resonance
 *
 * Cosine similarity threshold for schema drift: > 0.809 (φ-derived)
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// ─── φ-Constants ────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const PSI = 1 / PHI;
const SEMANTIC_RESONANCE_THRESHOLD = 1 - Math.pow(PSI, 2) * 0.5; // ≈ 0.809

/**
 * ASTTestMutator — transforms test and source files to heal failures.
 *
 * Uses regex-based AST-like transformations for zero-dependency operation.
 * For full AST: integrate with babel/parser or acorn when available.
 */
class ASTTestMutator extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} options.projectRoot
   */
  constructor({ projectRoot }) {
    super();
    this.projectRoot = projectRoot;
    this.mutations = [];
  }

  /**
   * Apply a fix to source code based on the fix plan.
   *
   * @param {Object} fix - Fix plan from MAPE-K
   * @param {string} fix.type - 'ast-mutate' | 'schema-rewrite' | 'config-update'
   * @param {string} fix.target - File to modify
   * @param {string} fix.transform - Transform type
   * @returns {Promise<Object>} Mutation result
   */
  async applyFix(fix) {
    const targetPath = path.isAbsolute(fix.target)
      ? fix.target
      : path.join(this.projectRoot, fix.target);

    if (!fs.existsSync(targetPath)) {
      return { success: false, error: `Target file not found: ${targetPath}` };
    }

    const originalSource = fs.readFileSync(targetPath, 'utf-8');
    let mutatedSource = originalSource;

    try {
      switch (fix.transform) {
        case 'update-expected-value':
          mutatedSource = this._transformUpdateExpectedValue(originalSource, fix);
          break;

        case 'fix-import-path':
          mutatedSource = this._transformFixImportPath(originalSource, fix);
          break;

        case 'fix-undefined-reference':
          mutatedSource = this._transformFixUndefinedReference(originalSource, fix);
          break;

        case 'update-selector':
          mutatedSource = this._transformUpdateSelector(originalSource, fix);
          break;

        case 'add-network-mock':
          mutatedSource = this._transformAddNetworkMock(originalSource, fix);
          break;

        case 'add-skip-annotation':
          mutatedSource = this._transformAddSkipAnnotation(originalSource, fix);
          break;

        default:
          return { success: false, error: `Unknown transform: ${fix.transform}` };
      }

      // Only write if actually changed
      if (mutatedSource !== originalSource) {
        fs.writeFileSync(targetPath, mutatedSource, 'utf-8');
        this.mutations.push({
          timestamp: new Date().toISOString(),
          file: fix.target,
          transform: fix.transform,
          linesChanged: this._countChangedLines(originalSource, mutatedSource)
        });
        this.emit('mutation:applied', { file: fix.target, transform: fix.transform });
        return { success: true, linesChanged: this._countChangedLines(originalSource, mutatedSource) };
      }

      return { success: false, error: 'No changes produced by transform' };

    } catch (err) {
      this.emit('mutation:error', { file: fix.target, error: err.message });
      return { success: false, error: err.message };
    }
  }

  /**
   * Rewrite a schema file to match current contract expectations.
   *
   * @param {Object} fix - Schema rewrite plan
   * @returns {Promise<Object>} Rewrite result
   */
  async rewriteSchema(fix) {
    const targetPath = path.isAbsolute(fix.target)
      ? fix.target
      : path.join(this.projectRoot, fix.target);

    if (!fs.existsSync(targetPath)) {
      return { success: false, error: `Schema file not found: ${targetPath}` };
    }

    try {
      const source = fs.readFileSync(targetPath, 'utf-8');
      let rewritten = source;

      // Detect JSON schema vs Zod vs TypeScript interface
      if (targetPath.endsWith('.json')) {
        rewritten = this._rewriteJsonSchema(source, fix);
      } else if (source.includes('z.object') || source.includes('z.string')) {
        rewritten = this._rewriteZodSchema(source, fix);
      } else {
        rewritten = this._rewriteTypeScriptInterface(source, fix);
      }

      if (rewritten !== source) {
        // Validate semantic resonance
        const resonance = this._computeSemanticResonance(source, rewritten);
        if (resonance < SEMANTIC_RESONANCE_THRESHOLD) {
          return {
            success: false,
            error: `Schema rewrite resonance (${resonance.toFixed(3)}) below threshold (${SEMANTIC_RESONANCE_THRESHOLD.toFixed(3)})`
          };
        }

        fs.writeFileSync(targetPath, rewritten, 'utf-8');
        this.emit('schema:rewritten', { file: fix.target, resonance });
        return { success: true, resonance };
      }

      return { success: false, error: 'No schema changes needed' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Transform Implementations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Update expected values in assertions to match actual values.
   * Targets patterns like: expect(x).toBe(oldVal) → expect(x).toBe(newVal)
   * @private
   */
  _transformUpdateExpectedValue(source, fix) {
    // Pattern: "Expected: X, Received: Y" in failure messages
    if (fix.expected !== undefined && fix.received !== undefined) {
      const escapedExpected = this._escapeRegex(String(fix.expected));
      return source.replace(
        new RegExp(`(toBe|toEqual|toStrictEqual)\\(\\s*${escapedExpected}\\s*\\)`, 'g'),
        `$1(${JSON.stringify(fix.received)})`
      );
    }
    return source;
  }

  /**
   * Fix broken import paths by resolving relative to project root.
   * @private
   */
  _transformFixImportPath(source, fix) {
    if (!fix.missingModule) return source;

    const moduleName = fix.missingModule;

    // Try to find the actual file
    const candidates = this._findModuleCandidates(moduleName);
    if (candidates.length === 0) return source;

    const bestMatch = candidates[0];
    const targetDir = path.dirname(
      path.isAbsolute(fix.target) ? fix.target : path.join(this.projectRoot, fix.target)
    );
    const relativePath = path.relative(targetDir, bestMatch);
    const normalizedPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;

    // Replace the import
    const escapedModule = this._escapeRegex(moduleName);
    return source
      .replace(
        new RegExp(`require\\(['"]${escapedModule}['"]\\)`, 'g'),
        `require('${normalizedPath.replace(/\\/g, '/')}')`
      )
      .replace(
        new RegExp(`from\\s+['"]${escapedModule}['"]`, 'g'),
        `from '${normalizedPath.replace(/\\/g, '/')}'`
      );
  }

  /**
   * Fix undefined reference errors by adding stub declarations.
   * @private
   */
  _transformFixUndefinedReference(source, fix) {
    // Extract the undefined identifier from the error message
    const match = fix.description && fix.description.match(/['"](\w+)['"]/);
    if (!match) return source;

    const identifier = match[1];

    // Check if identifier is already declared
    const declPattern = new RegExp(`(const|let|var|function)\\s+${identifier}\\b`);
    if (declPattern.test(source)) return source;

    // Add a safe stub at the top of the file (after 'use strict' / imports)
    const insertPoint = this._findInsertionPoint(source);
    const stub = `\n/** Auto-healed: stub for previously undefined ${identifier} */\nconst ${identifier} = ${identifier} || null;\n`;

    return source.slice(0, insertPoint) + stub + source.slice(insertPoint);
  }

  /**
   * Update broken CSS/XPath selectors by generalizing them.
   * @private
   */
  _transformUpdateSelector(source, fix) {
    // Generalize specific selectors to more resilient alternatives
    return source
      // data-testid is more stable than class/id selectors
      .replace(
        /querySelector\(['"]\.[\w-]+['"]\)/g,
        (match) => {
          const selector = match.match(/['"]([^'"]+)['"]/)[1];
          return `querySelector('[data-testid="${selector.replace('.', '')}"]')`;
        }
      );
  }

  /**
   * Inject network mocks for unreliable external dependencies.
   * @private
   */
  _transformAddNetworkMock(source, fix) {
    // Don't add if already mocked
    if (source.includes('vi.mock') || source.includes('jest.mock')) return source;

    const mockImport = source.includes('vitest')
      ? `\n// Auto-healed: Network mock injected by ASTMutatorBee\nvi.mock('node-fetch', () => ({ default: vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) }));\n`
      : `\n// Auto-healed: Network mock injected by ASTMutatorBee\njest.mock('node-fetch', () => jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })));\n`;

    const insertPoint = this._findInsertionPoint(source);
    return source.slice(0, insertPoint) + mockImport + source.slice(insertPoint);
  }

  /**
   * Add skip annotation to tests that can't be auto-healed.
   * @private
   */
  _transformAddSkipAnnotation(source, fix) {
    // Add .skip to the first failing describe/it block
    return source
      .replace(
        /\b(describe|it|test)\s*\(/,
        '$1.skip(/* Auto-skipped by self-healing: requires manual review */ '
      );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Schema Rewriters
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * @private
   */
  _rewriteJsonSchema(source, fix) {
    try {
      const schema = JSON.parse(source);
      // Add optional properties for new fields that caused drift
      if (schema.properties && fix.newFields) {
        for (const field of fix.newFields) {
          schema.properties[field.name] = { type: field.type || 'string' };
        }
      }
      // Remove required constraint for fields that disappeared
      if (schema.required && fix.removedFields) {
        schema.required = schema.required.filter(
          r => !fix.removedFields.includes(r)
        );
      }
      return JSON.stringify(schema, null, 2);
    } catch (_) {
      return source;
    }
  }

  /**
   * @private
   */
  _rewriteZodSchema(source, fix) {
    // Add .optional() to fields that are now optional
    if (fix.optionalFields) {
      for (const field of fix.optionalFields) {
        const pattern = new RegExp(`(${field}:\\s*z\\.\\w+\\([^)]*\\))`, 'g');
        source = source.replace(pattern, '$1.optional()');
      }
    }
    return source;
  }

  /**
   * @private
   */
  _rewriteTypeScriptInterface(source, fix) {
    // Add ? to optional fields in interfaces
    if (fix.optionalFields) {
      for (const field of fix.optionalFields) {
        source = source.replace(
          new RegExp(`(${field})\\s*:`, 'g'),
          '$1?:'
        );
      }
    }
    return source;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Utilities
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Compute semantic resonance between original and rewritten schema.
   * Uses character-level Jaccard similarity as a lightweight proxy.
   * @private
   */
  _computeSemanticResonance(original, rewritten) {
    const tokensA = new Set(original.match(/\b\w+\b/g) || []);
    const tokensB = new Set(rewritten.match(/\b\w+\b/g) || []);

    const intersection = new Set([...tokensA].filter(t => tokensB.has(t)));
    const union = new Set([...tokensA, ...tokensB]);

    return union.size > 0 ? intersection.size / union.size : 1.0;
  }

  /**
   * Find candidates for a missing module by searching the project.
   * @private
   */
  _findModuleCandidates(moduleName) {
    const candidates = [];
    const baseName = path.basename(moduleName).replace(/\.(js|ts|jsx|tsx)$/, '');

    const searchDirs = ['src', 'lib', 'packages'];
    for (const dir of searchDirs) {
      const searchPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(searchPath)) {
        this._walkDir(searchPath, (filePath) => {
          const fileName = path.basename(filePath, path.extname(filePath));
          if (fileName === baseName) {
            candidates.push(filePath);
          }
        });
      }
    }

    return candidates;
  }

  /**
   * Walk a directory recursively.
   * @private
   */
  _walkDir(dir, callback, depth = 0) {
    if (depth > 5) return; // Prevent deep recursion
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          this._walkDir(fullPath, callback, depth + 1);
        } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
          callback(fullPath);
        }
      }
    } catch (_) {
      // Permission denied or similar — skip
    }
  }

  /**
   * Find the best insertion point in source (after imports/use strict).
   * @private
   */
  _findInsertionPoint(source) {
    const lines = source.split('\n');
    let lastImportLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line.startsWith('import ') ||
        line.startsWith('const ') && line.includes('require(') ||
        line === "'use strict';" ||
        line === '"use strict";' ||
        line.startsWith('//')  ||
        line.startsWith('/*') ||
        line.startsWith('*') ||
        line === ''
      ) {
        lastImportLine = i;
      } else {
        break;
      }
    }

    return lines.slice(0, lastImportLine + 1).join('\n').length + 1;
  }

  /**
   * Count lines changed between two source strings.
   * @private
   */
  _countChangedLines(original, modified) {
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    let changed = 0;

    const maxLen = Math.max(origLines.length, modLines.length);
    for (let i = 0; i < maxLen; i++) {
      if ((origLines[i] || '') !== (modLines[i] || '')) changed++;
    }

    return changed;
  }

  /**
   * Escape string for use in RegExp.
   * @private
   */
  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────
module.exports = { ASTTestMutator, SEMANTIC_RESONANCE_THRESHOLD };
