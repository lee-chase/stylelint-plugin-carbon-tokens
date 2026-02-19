/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import stylelint from 'stylelint';

/**
 * Test a stylelint rule with given code
 */
export async function testRule(
  ruleName: string,
  config: unknown,
  code: string
): Promise<stylelint.LinterResult> {
  const result = await stylelint.lint({
    code,
    config: {
      plugins: ['./dist/index.js'],
      rules: {
        [ruleName]: config,
      },
    },
    formatter: 'string',
  });

  return result;
}

/**
 * Test auto-fix functionality
 */
export async function testFix(
  ruleName: string,
  config: unknown,
  code: string
): Promise<{ fixed: string; result: stylelint.LinterResult }> {
  const result = await stylelint.lint({
    code,
    config: {
      plugins: ['./dist/index.js'],
      rules: {
        [ruleName]: config,
      },
    },
    fix: true,
  });

  return {
    fixed: result.code || code,
    result,
  };
}

/**
 * Assert that code has no warnings
 */
export function assertNoWarnings(result: stylelint.LinterResult): void {
  if (result.results[0]?.warnings.length > 0) {
    const warnings = result.results[0].warnings
      .map((w: stylelint.Warning) => `  - ${w.text}`)
      .join('\n');
    throw new Error(`Expected no warnings but got:\n${warnings}`);
  }
}

/**
 * Assert that code has warnings
 */
export function assertHasWarnings(
  result: stylelint.LinterResult,
  count?: number
): void {
  const warningCount = result.results[0]?.warnings.length || 0;
  if (warningCount === 0) {
    throw new Error('Expected warnings but got none');
  }
  if (count !== undefined && warningCount !== count) {
    throw new Error(`Expected ${count} warnings but got ${warningCount}`);
  }
}

/**
 * Assert that code was fixed to expected output
 */
export function assertFixed(fixed: string, expected: string): void {
  if (fixed !== expected) {
    throw new Error(
      `Expected fixed code to be:\n${expected}\n\nBut got:\n${fixed}`
    );
  }
}
