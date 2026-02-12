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

describe('motion-easing-use rule', () => {
  it('should report error for non-standard easing values', async () => {
    const result = await stylelint.lint({
      code: '.test { transition-timing-function: cubic-bezier(0.5, 0, 0.5, 1); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-easing-use': true,
        },
      },
    });

    // cubic-bezier is NOT allowed - use motion() function or Carbon tokens instead
    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings[0].text.includes('cubic-bezier'));
  });

  it('should accept Carbon SCSS easing variables', async () => {
    const result = await stylelint.lint({
      code: '.test { transition-timing-function: $easing-standard-productive; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-easing-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept Carbon CSS custom properties', async () => {
    const result = await stylelint.lint({
      code: '.test { animation-timing-function: var(--cds-easing-standard-productive); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-easing-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should accept standard easing keywords', async () => {
    const result = await stylelint.lint({
      code: '.test { transition-timing-function: ease-in-out; }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-easing-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, false);
  });

  it('should reject cubic-bezier functions', async () => {
    const result = await stylelint.lint({
      code: '.test { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-easing-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings[0].text.includes('cubic-bezier'));
  });

  it('should reject steps functions', async () => {
    const result = await stylelint.lint({
      code: '.test { animation-timing-function: steps(4, end); }',
      config: {
        plugins: [configPath],
        rules: {
          'carbon/motion-easing-use': true,
        },
      },
    });

    assert.strictEqual(result.errored, true);
    assert.ok(result.results[0].warnings[0].text.includes('steps'));
  });
});
