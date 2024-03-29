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
      code: '.foo {   transition: background-color $duration-slow-02 $ease-in; }',
      description: 'Carbon motion easing token settings expected for transition.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 $ease-out, opacity $duration-moderate-02 $standard-easing; }',
      description: 'Carbon multiple motion easing token settings expected for transition.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 motion(exit, expressive); }',
      description: 'Carbon motion easing function settings expected for transition.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 motion(exit, expressive) , opacity $duration-moderate-02 motion(exit, expressive); }',
      description: 'Carbon multiple motion easing function settings expected for transition.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 motion.$ease-in; }',
      description: 'Carbon scoped motion easing token settings expected for transition.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 motion.$ease-out, opacity $duration-moderate-02 motion.$standard-easing; }',
      description: 'Carbon multiple scoped motion easing token settings expected for transition.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 motion.motion(exit, expressive); }',
      description: 'Carbon scoped motion easing function settings expected for transition.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 motion.motion(exit, expressive) , opacity $duration-moderate-02 motion.motion(exit, expressive); }',
      description: 'Carbon multiple scoped motion easing function settings expected for transition.',
    },
    {
      code: '.foo { transition-timing-function: $ease-in; }',
      description: 'Carbon motion easing token settings expected for transition-timing-function.',
    },
    {
      code: '.foo { animation: wiggle  $duration-slow-02 $ease-in; }',
      description: 'Carbon motion easing token settings expected for animation.',
    },
    {
      code: '.foo { animation-timing-function: $ease-in; }',
      description: 'Carbon motion easing token settings expected for animation-timing-function.',
    },
  ],
  reject: [
    {
      code: '.foo {   transition: $ease-in; }',
      description: 'Reject easing when other values are missing missing.',
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02; }',
      description: 'Reject no easing for transition when value is missing.',
    },
    {
      code: '.foo { transition: width $duration-fast-01 ease-in, height 2s ease-out; }',
      description: 'Reject non Carbon ease token or function',
      message: messages.rejectedTransition,
    },
    {
      code: '.foo { transition: width $duration-fast-01 motion(standard, productive), height 2s ease-out; }',
      description: 'Reject one of many non Carbon ease function non-Carbon ease token or function',
      message: messages.rejectedTransition,
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 mo.$ease-in; }',
      description: "Unexpected scope 'mo' motion easing token settings expected for transition.",
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 mo.motion(exit, expressive); }',
      description: "Unexpected scope 'mo' motion easing function settings expected for transition.",
    },
    {
      code: '.foo { transition-timing-function: ease-in; }',
      description: 'Reject non easing token for transition-timing-function.',
    },
    {
      code: '.foo { animation: wiggle  $duration-slow-02 ease-out; }',
      description: 'Reject non easing token for animation.',
    },
    {
      code: '.foo { animation-timing-function: ease-in-out; }',
      description: 'Reject non easing token for animation-timing-function.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [true, { carbonPath: 'node_modules/@carbon', carbonModulePostfix: '-10' }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo {   transition: background-color $duration-slow-02 carbon--motion(standard, productive); }',
      description: 'Accept carbon--motion function in v10.',
    },
    {
      code: '.foo { transition-timing-function: carbon--motion($name: standard); }',
      description: 'Accept carbon--motion function in v10 for timing function.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ['mo'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo {   transition: background-color $duration-slow-02 mo.$ease-in; }',
      description: "Expected scope 'mo' motion easing token settings expected for transition.",
    },
    {
      code: '.foo {   transition: background-color $duration-slow-02 mo.motion(exit, expressive); }',
      description: "Expected scope 'mo' motion easing function settings expected for transition.",
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ['**'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo {   transition: background-color $duration-slow-02 abc.$ease-in; } .bar {   transition: background-color $duration-slow-02 zyx.$ease-in; }',
      description: "All scopes ['**'].",
    },
  ],
});

testRule(rule, {
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `@use '@carbon/react' with (
  $css--default-type: true,
  $css--reset: true
);`,
      description: 'A use statement should not generate a warning',
    },
  ],
});
