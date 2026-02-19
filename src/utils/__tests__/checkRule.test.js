/**
 * Copyright IBM Corp. 2020, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import stylelint from 'stylelint';
import plugins from '../../index.js';

const plugin = plugins.find((thing) => thing.ruleName === 'carbon/theme-use');

describe('checkRule - circular reference handling', () => {
  it('Should not have circular references in warning objects', async () => {
    const result = await stylelint.lint({
      code: '.foo { color: #f4f4f4; }',
      config: {
        plugins: [plugin],
        rules: {
          'carbon/theme-use': true,
        },
      },
      customSyntax: 'postcss-scss',
    });

    // Verify we got the expected warning
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].warnings.length, 1);
    assert.match(
      result.results[0].warnings[0].text,
      /Expected carbon theme token.*color/
    );

    // The key test: warnings should be serializable (this is what VSCode extension needs)
    result.results[0].warnings.forEach((warning) => {
      assert.doesNotThrow(() => {
        JSON.stringify(warning);
      }, 'Each warning should be serializable without circular reference errors');
    });
  });

  it('Should handle multiple violations without circular references', async () => {
    const result = await stylelint.lint({
      code: '.foo { background-color: red; color: blue; border-color: green; }',
      config: {
        plugins: [plugin],
        rules: {
          'carbon/theme-use': true,
        },
      },
      customSyntax: 'postcss-scss',
    });

    // Should have multiple warnings
    assert.ok(result.results[0].warnings.length > 0);

    // All warnings should be serializable
    result.results[0].warnings.forEach((warning) => {
      assert.doesNotThrow(() => {
        JSON.stringify(warning);
      }, 'Each warning should be serializable without circular reference errors');
    });
  });
});
