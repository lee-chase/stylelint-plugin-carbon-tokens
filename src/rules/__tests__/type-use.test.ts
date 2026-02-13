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

describe('type-use rule', () => {
  it('should report error for hard-coded font-size values', async () => {
    const result = await stylelint.lint({
      code: '.test { font-size: 16px; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/type-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings.length > 0);
    assert.ok(result.results[0].warnings[0].text.includes('font-size'));
  });

  it('should accept Carbon SCSS type variables', async () => {
    const result = await stylelint.lint({
      code: '.test { font-size: $body-01; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/type-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept Carbon CSS custom properties', async () => {
    const result = await stylelint.lint({
      code: '.test { font-size: var(--cds-body-01); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/type-use': [true, { acceptCarbonCustomProp: true }],
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept standard font-weight values', async () => {
    const result = await stylelint.lint({
      code: '.test { font-weight: bold; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/type-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should validate font-family property', async () => {
    const result = await stylelint.lint({
      code: '.test { font-family: Arial; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/type-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
  });

  it('should validate line-height property', async () => {
    const result = await stylelint.lint({
      code: '.test { line-height: 1.5; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/type-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
  });
});
