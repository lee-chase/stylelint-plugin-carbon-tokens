/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rule, { messages, ruleName } from '..';

testRule(rule, {
  ruleName,
  config: [true],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { transition: none; }',
      description: 'Accept reset using none',
    },
    {
      code: '.foo { transition: inherit; }',
      description: 'Accept reset using inherit',
    },
    {
      code: '.foo { transition: initial; }',
      description: 'Accept reset using initial',
    },
    {
      code: '.foo { transition: unset; }',
      description: 'Accept reset using unset',
    },
    {
      code: '.foo { transition: width $duration-fast-01 linear ease-in; }',
      description: 'Carbon motion token expected for transition.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 motion(exit, expressive) , opacity $duration-moderate-02 motion(exit, expressive); }',
      description: 'Carbon multiple motion token settings expected for transition.',
    },
    {
      code: '.foo { transition-duration: $duration-moderate-01; }',
      description: 'Carbon motion token expected for transition duration.',
    },
    {
      code: '.foo { transition: width $duration-fast-02 linear ease-in, height $duration-moderate-01 ease-out; }',
      description: 'Carbon motion token expected for split transitions.',
    },
    {
      code: '$my-value-accept: $duration-fast-01; .foo { transition-duration: $my-value-accept; }',
      description: 'Accept $variable declared before use with Carbon motion tokens.',
    },
    {
      code: '.foo { animation: test $duration-fast-01 linear ease-in myAnim; }',
      description: 'Carbon motion token expected for animation.',
    },
    {
      code: "$test: 'test'; .foo { animation: $test $duration-fast-01 linear ease-in myAnim; }",
      description: 'Carbon motion token expected for animation other token used a',
    },
    {
      code: '.foo { animation-duration: $duration-moderate-01; }',
      description: 'Carbon motion token expected for animation duration.',
    },
    {
      code: '--my-value-accept: $duration-moderate-01; .foo { animation-duration: var(--my-value-accept); }',
      description: 'Accept --variable declared before use for animation duration with Carbon motion tokens.',
    },
  ],

  reject: [
    {
      code: '.foo { transition: all $my-value-accept; }',
      description: 'Reject undeclared $variable by default in transition.',
      message: messages.rejectedUndefinedVariable,
    },
    {
      code: '.foo { transition: all var(--my-value-reject); }',
      description: 'Reject undeclared --variable by default.',
      message: messages.rejectedVariable,
    },
    {
      code: '.foo { animation: $my-value-accept myAnim; }',
      description: 'Reject undeclared $variable by default in animation.',
      message: messages.rejectedAnimation,
    },
    {
      code: '.foo { animation: test var(--my-value-accept) myAnim; }',
      description: 'Reject undeclared --variable by default for animation.',
      message: messages.rejectedVariable,
    },
    {
      code: '.foo { transition: $duration-fast-01; }',
      description: 'Carbon motion token used in non-standard order with transition.',
      message: messages.rejectedUndefinedRange,
    },
    {
      code: '.foo { animation: $duration-fast-01 test; }',
      description: 'Carbon motion token used in non-standard order with animation.',
      message: messages.rejectedAnimation,
    },
    {
      code: '.foo { transition: all 2s; }',
      description: 'Used non-token duration.',
      message: messages.rejectedTransition,
    },
    {
      code: '.foo { transition: width 99s linear ease-in, height $duration-fast-01 ease-out; }',
      description: 'Used non-token in first split property not Carbon motion tokens.',
      message: messages.rejectedTransition,
    },
    {
      code: '.foo { transition: width $duration-fast-01 linear ease-in, height 2s ease-out; }',
      description: 'Used non-token in non-first split property not Carbon motion tokens.',
      message: messages.rejectedTransition,
    },
  ],
});

// v10 test
testRule(rule, {
  ruleName,
  config: [true, { carbonPath: 'node_modules/@carbon', carbonModulePostfix: '-10' }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { transition: width $duration--fast-01 linear ease-in; }',
      description: 'Carbon motion token expected for transition v10.',
    },
    {
      code: '.foo { animation: test $duration--fast-01 linear ease-in myAnim; }',
      description: 'Carbon motion token expected for animation v10.',
    },
  ],
});

// verify rejection of undeclared variables
testRule(rule, {
  ruleName,
  config: [true],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '$my-value-accept: $duration-fast-01; .foo { transition-duration: $my-value-accept; }',
      description:
        'Accept $variable declared before use with Carbon motion tokens and acceptUndefinedVariables is false.',
    },
    {
      code: '--my-value-accept: $duration-moderate-01; .foo { transition-duration: var(--my-value-accept); }',
      description:
        'Accept --variable declared before use with Carbon motion tokens and acceptUndefinedVariables is false.',
    },
  ],

  reject: [
    // an ibm motion token
    {
      code: '.foo { transition: all $my-value-reject; }',
      description: 'Reject undeclared $variable for transition when acceptUndefinedVariables is false.',
      message: messages.rejectedVariable,
    },
    {
      code: '.foo { animation: $my-value-reject myAnim; }',
      description: 'Reject undeclared $variable for animation when acceptUndefinedVariables is false.',
      message: messages.rejectedAnimation,
    },
    {
      code: '.foo { transition-duration: var(--my-value-reject); }',
      description: 'Reject undeclared --variable for transition-duration when acceptUndefinedVariables is false.',
      message: messages.rejectedVariable,
    },
    {
      code: '.foo { animation-duration: var(--my-value-reject); }',
      description: 'Reject undeclared --variable for animation-duration when acceptUndefinedVariables is false.',
      message: messages.rejectedVariable,
    },
  ],
});

// testConfig(rule, {
//   ruleName,
//   description: "Check for invalid accept values",
//   message: messages.rejected,
// cspell:disable-next-line
//   config: ["always", { acceptValues: ["/wibble/"] }],
// });

// Scope tests
testRule(rule, {
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { animation-duration: motion.$duration-fast-01; }`,
      description: 'Accept motion scope.',
    },
  ],
  reject: [
    {
      code: `.foo { animation-duration: mo.$duration-fast-01; }`,
      description: "Reject scope 'mo' without acceptScopes setting.",
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ['mo'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { animation-duration: mo.$duration-fast-01; }`,
      description: "Accept scope 'mo' with acceptScopes setting.",
    },
  ],
  reject: [],
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ['mo', '*'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { animation-duration: mo.$duration-fast-01; }`,
      description: "Accept scope 'mo' with acceptScopes setting.",
    },
    {
      code: `.foo { animation-duration: motion.$duration-fast-01; }`,
      description: 'Accept motion scope with scope setting including default.',
    },
  ],
  reject: [
    {
      code: `.foo { animation-duration: reject.$duration-fast-01; }`,
      description: 'Reject scope not included in scope setting.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ['/^mo(tion)?$/'] }], // cspell:disable-line
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { animation-duration: mo.$duration-fast-01; }`,
      description: "Accept scope 'mo' with acceptScopes regex setting.",
    },
    {
      code: `.foo { animation-duration: motion.$duration-fast-01; }`,
      description: 'Accept motion scope with scope regex setting including default.',
    },
  ],
  reject: [
    {
      code: `.foo { animation-duration: reject.$duration-fast-01; }`,
      description: 'Reject scope not included in scope regex setting.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ['**'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { animation-duration: abc.$duration-fast-01; transition-duration: zyx.$duration-fast-01;}`,
      description: "All scopes ['**'].",
    },
  ],
});

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  fix: true,
  config: true,
  reject: [
    {
      code: `.foo { transition-duration: $duration--fast-01; }`,
      fixed: `.foo { transition-duration: $duration-fast-01; }`,
      description: `v11 reject and fix '$duration--' prefix and favor '$duration-' p motion tokens in transition-duration'`,
    },
    {
      code: `.foo { transition: all $duration--fast-01; }`,
      fixed: `.foo { transition: all $duration-fast-01; }`,
      description: `v11 reject and fix '$duration--' prefix and favor '$duration-' p fast motion tokens in transition'`,
    },
    {
      code: `.foo { transition: all $duration--fast-02; }`,
      fixed: `.foo { transition: all $duration-fast-02; }`,
      description: `v11 reject and fix '$duration--' prefix and favor '$duration-' p fast motion tokens in transition'`,
    },
    {
      code: `.foo { transition: all $duration--moderate-01; }`,
      fixed: `.foo { transition: all $duration-moderate-01; }`,
      description: `v11 reject and fix '$duration--' prefix and favor '$duration-' p moderate-01 motion tokens in transition'`,
    },
    {
      code: `.foo { transition: all $duration--moderate-02; }`,
      fixed: `.foo { transition: all $duration-moderate-02; }`,
      description: `v11 reject and fix '$duration--' prefix and favor '$duration-' p moderate-02 motion tokens in transition'`,
    },
    {
      code: `.foo { transition: all $duration--slow-01; }`,
      fixed: `.foo { transition: all $duration-slow-01; }`,
      description: `v11 reject and fix '$duration--' prefix and favor '$duration-' p slow-01 motion tokens in transition'`,
    },
    {
      code: `.foo { transition: all $duration--slow-02; }`,
      fixed: `.foo { transition: all $duration-slow-02; }`,
      description: `v11 reject and fix '$duration--' prefix and favor '$duration-' p slow-02 motion tokens in transition'`,
    },
    {
      code: `.foo { transition: all 70ms; }`,
      fixed: `.foo { transition: all $duration-fast-01; }`,
      description: "v11 reject and fix literal duration matching token '70ms'",
    },
    {
      code: `.foo { transition: all 110ms; }`,
      fixed: `.foo { transition: all $duration-fast-02; }`,
      description: "v11 reject and fix literal duration matching token '110ms'",
    },
    {
      code: `.foo { transition: all 150ms; }`,
      fixed: `.foo { transition: all $duration-moderate-01; }`,
      description: "v11 reject and fix literal duration matching token '150ms'",
    },
    {
      code: `.foo { transition: all 240ms; }`,
      fixed: `.foo { transition: all $duration-moderate-02; }`,
      description: "v11 reject and fix literal duration matching token '240ms'",
    },
    {
      code: `.foo { transition: all 400ms; }`,
      fixed: `.foo { transition: all $duration-slow-01; }`,
      description: "v11 reject and fix literal duration matching token '400ms'",
    },
    {
      code: `.foo { transition: all 700ms; }`,
      fixed: `.foo { transition: all $duration-slow-02; }`,
      description: "v11 reject and fix literal duration matching token '700ms'",
    },
  ],
});

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  fix: true,
  config: [true, { carbonPath: 'node_modules/@carbon', carbonModulePostfix: '-10' }],
  reject: [
    {
      code: `.foo { transition: all 70ms; }`,
      fixed: `.foo { transition: all $duration--fast-01; }`,
      description: "v11 reject and fix literal duration matching token '70ms'",
    },
    {
      code: `.foo { transition: all 110ms; }`,
      fixed: `.foo { transition: all $duration--fast-02; }`,
      description: "v11 reject and fix literal duration matching token '110ms'",
    },
    {
      code: `.foo { transition: all 150ms; }`,
      fixed: `.foo { transition: all $duration--moderate-01; }`,
      description: "v11 reject and fix literal duration matching token '150ms'",
    },
    {
      code: `.foo { transition: all 240ms; }`,
      fixed: `.foo { transition: all $duration--moderate-02; }`,
      description: "v11 reject and fix literal duration matching token '240ms'",
    },
    {
      code: `.foo { transition: all 400ms; }`,
      fixed: `.foo { transition: all $duration--slow-01; }`,
      description: "v11 reject and fix literal duration matching token '400ms'",
    },
    {
      code: `.foo { transition: all 700ms; }`,
      fixed: `.foo { transition: all $duration--slow-02; }`,
      description: "v11 reject and fix literal duration matching token '700ms'",
    },
  ],
});
