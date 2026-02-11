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

describe('motion-duration-use rule', () => {
  it('should report error for hard-coded duration values', async () => {
    const result = await stylelint.lint({
      code: '.test { transition-duration: 300ms; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-duration-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings.length > 0);
    assert.ok(
      result.results[0].warnings[0].text.includes('transition-duration')
    );
  });

  it('should accept Carbon SCSS duration variables', async () => {
    const result = await stylelint.lint({
      code: '.test { transition-duration: $duration-fast-01; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-duration-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept Carbon CSS custom properties', async () => {
    const result = await stylelint.lint({
      code: '.test { animation-duration: var(--cds-duration-fast-01); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-duration-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept 0 values', async () => {
    const result = await stylelint.lint({
      code: '.test { transition-duration: 0s; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-duration-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should validate animation-duration property', async () => {
    const result = await stylelint.lint({
      code: '.test { animation-duration: 500ms; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-duration-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
  });
});
