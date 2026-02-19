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

describe('theme-layer-use rule', () => {
  it('should suggest contextual token for numbered layer token', async () => {
    const result = await stylelint.lint({
      code: '.test { background-color: $layer-01; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-layer-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings.length > 0);
    assert.ok(result.results[0].warnings[0].text.includes('$layer'));
    assert.ok(result.results[0].warnings[0].text.includes('contextual'));
  });

  it('should suggest contextual token for CSS custom property', async () => {
    const result = await stylelint.lint({
      code: '.test { background-color: var(--cds-layer-02); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-layer-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings.length > 0);
    assert.ok(result.results[0].warnings[0].text.includes('--cds-layer'));
  });

  it('should accept contextual layer tokens', async () => {
    const result = await stylelint.lint({
      code: '.test { background-color: $layer; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-layer-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept contextual CSS custom properties', async () => {
    const result = await stylelint.lint({
      code: '.test { background-color: var(--cds-layer); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-layer-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should suggest contextual token for border-subtle', async () => {
    const result = await stylelint.lint({
      code: '.test { border-color: $border-subtle-02; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-layer-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings[0].text.includes('$border-subtle'));
  });

  it('should suggest contextual token for field tokens', async () => {
    const result = await stylelint.lint({
      code: '.test { background-color: $field-01; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-layer-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings[0].text.includes('$field'));
  });

  it('should not report non-layer tokens', async () => {
    const result = await stylelint.lint({
      code: '.test { color: $text-primary; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-layer-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should provide auto-fix for numbered tokens', async () => {
    const result = await stylelint.lint({
      code: '.test { background-color: $layer-01; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/theme-layer-use': true,
        },
      },
      fix: true,
    });

    assert.ok(result.code?.includes('$layer'));
    assert.ok(!result.code?.includes('$layer-01'));
  });
});
