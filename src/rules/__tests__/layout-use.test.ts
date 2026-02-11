/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import stylelint from 'stylelint';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, '../../../dist/index.js');

describe('layout-use rule', () => {
  it('should report error for hard-coded spacing values', async () => {
    const result = await stylelint.lint({
      code: '.test { margin: 16px; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/layout-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings.length > 0);
    assert.ok(result.results[0].warnings[0].text.includes('margin'));
  });

  it('should accept Carbon SCSS spacing variables', async () => {
    const result = await stylelint.lint({
      code: '.test { margin: $spacing-05; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/layout-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept Carbon CSS custom properties', async () => {
    const result = await stylelint.lint({
      code: '.test { padding: var(--cds-spacing-05); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/layout-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept 0 values', async () => {
    const result = await stylelint.lint({
      code: '.test { margin: 0; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/layout-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should validate padding property', async () => {
    const result = await stylelint.lint({
      code: '.test { padding: 24px; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/layout-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
  });

  it('should validate gap property', async () => {
    const result = await stylelint.lint({
      code: '.test { gap: 8px; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/layout-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
  });
});
