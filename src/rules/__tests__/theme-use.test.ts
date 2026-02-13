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

describe('theme-use rule', () => {
  it('should report error for hard-coded color values', async () => {
    const result = await stylelint.lint({
      code: '.test { color: #ffffff; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings.length > 0);
    assert.ok(result.results[0].warnings[0].text.includes('color'));
  });

  it('should accept Carbon SCSS variables', async () => {
    const result = await stylelint.lint({
      code: '.test { color: $background; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept Carbon CSS custom properties', async () => {
    const result = await stylelint.lint({
      code: '.test { color: var(--cds-background); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-use': [true, { acceptCarbonCustomProp: true }],
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept values in acceptValues option', async () => {
    const result = await stylelint.lint({
      code: '.test { color: red; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-use': [true, { acceptValues: ['red'] }],
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should validate background-color property', async () => {
    const result = await stylelint.lint({
      code: '.test { background-color: #000000; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
  });
});
