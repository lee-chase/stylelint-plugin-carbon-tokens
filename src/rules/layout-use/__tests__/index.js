/**
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { testRule } from 'stylelint-test-rule-node';
import plugins from '../../../index.js';
const plugin = plugins.find((thing) => thing.ruleName === 'carbon/layout-use');

const {
  rule: { messages, ruleName },
} = plugin;

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    {
      acceptValues: ['/((--)|[$])my-value-accept/', '*'],
    },
  ],
  accept: [
    {
      code: '.foo { margin: $spacing-01; }',
      description: 'A margin using tokens "$spacing-01" is accepted',
    },
    {
      code: '.foo { margin: $spacing-01 -$spacing-01; }',
      description:
        'A margin using tokens "$spacing-01 -$spacing-01" is accepted',
    },
    {
      code: '.foo { margin: $spacing-01 -$spacing-01 $spacing-01; }',
      description:
        'A margin using tokens "$spacing-01 -$spacing-01 $spacing-01" is accepted',
    },
    {
      code: '.foo { margin: $spacing-01 -$spacing-01 $spacing-01 -100%; }',
      description:
        'A margin using tokens "$spacing-01 -$spacing-01 $spacing-01 -100%" is accepted',
    },
    {
      code: '.foo { margin: -$spacing-01; }',
      description: 'A margin using tokens "-$spacing-01" is accepted',
    },
    {
      code: '.foo { margin: -$spacing-01 $spacing-01; }',
      description:
        'A margin using tokens "-$spacing-01 $spacing-01" is accepted',
    },
    {
      code: '.foo { margin: -$spacing-01 $spacing-01 -100%; }',
      description:
        'A margin using tokens "-$spacing-01 $spacing-01 -100%" is accepted',
    },
    {
      code: '.foo { margin: -$spacing-01 $spacing-01 -100% 100%; }',
      description:
        'A margin using tokens "-$spacing-01 $spacing-01 -100% 100%" is accepted',
    },
    {
      code: '.foo { margin: $spacing-01; }',
      description: 'A margin using tokens "$spacing-01" is accepted',
    },
    {
      code: '.foo { margin: $spacing-01 -100%; }',
      description: 'A margin using tokens "$spacing-01 -100%" is accepted',
    },
    {
      code: '.foo { margin: $spacing-01 -100% 100%; }',
      description: 'A margin using tokens "$spacing-01 -100% 100%" is accepted',
    },
    {
      code: '.foo { margin: $spacing-01 -100% 100% 50%; }',
      description:
        'A margin using tokens "$spacing-01 -100% 100% 50%" is accepted',
    },
    {
      code: '.foo { margin: -100%; }',
      description: 'A margin using tokens "-100%" is accepted',
    },
    {
      code: '.foo { margin: -100% 100%; }',
      description: 'A margin using tokens "-100% 100%" is accepted',
    },
    {
      code: '.foo { margin: -100% 100% 50%; }',
      description: 'A margin using tokens "-100% 100% 50%" is accepted',
    },
    {
      code: '.foo { margin: -100% 100% 50% -100vw; }',
      description: 'A margin using tokens "-100% 100% 50% -100vw" is accepted',
    },
    {
      code: '.foo { margin: 100%; }',
      description: 'A margin using tokens "100%" is accepted',
    },
    {
      code: '.foo { margin: 100% 50%; }',
      description: 'A margin using tokens "100% 50%" is accepted',
    },
    {
      code: '.foo { margin: 100% 50% -100vw; }',
      description: 'A margin using tokens "100% 50% -100vw" is accepted',
    },
    {
      code: '.foo { margin: 100% 50% -100vw 100vw; }',
      description: 'A margin using tokens "100% 50% -100vw 100vw" is accepted',
    },
    {
      code: '.foo { margin: 50%; }',
      description: 'A margin using tokens "50%" is accepted',
    },
    {
      code: '.foo { margin: 50% -100vw; }',
      description: 'A margin using tokens "50% -100vw" is accepted',
    },
    {
      code: '.foo { margin: 50% -100vw 100vw; }',
      description: 'A margin using tokens "50% -100vw 100vw" is accepted',
    },
    {
      code: '.foo { margin: 50% -100vw 100vw 50vw; }',
      description: 'A margin using tokens "50% -100vw 100vw 50vw" is accepted',
    },
    {
      code: '.foo { margin: -100vw; }',
      description: 'A margin using tokens "-100vw" is accepted',
    },
    {
      code: '.foo { margin: -100vw 100vw; }',
      description: 'A margin using tokens "-100vw 100vw" is accepted',
    },
    {
      code: '.foo { margin: -100vw 100vw 50vw; }',
      description: 'A margin using tokens "-100vw 100vw 50vw" is accepted',
    },
    {
      code: '.foo { margin: -100vw 100vw 50vw -100vh; }',
      description:
        'A margin using tokens "-100vw 100vw 50vw -100vh" is accepted',
    },
    {
      code: '.foo { margin: 100vw; }',
      description: 'A margin using tokens "100vw" is accepted',
    },
    {
      code: '.foo { margin: 100vw 50vw; }',
      description: 'A margin using tokens "100vw 50vw" is accepted',
    },
    {
      code: '.foo { margin: 100vw 50vw -100vh; }',
      description: 'A margin using tokens "100vw 50vw -100vh" is accepted',
    },
    {
      code: '.foo { margin: 100vw 50vw -100vh 100vh; }',
      description:
        'A margin using tokens "100vw 50vw -100vh 100vh" is accepted',
    },
    {
      code: '.foo { margin: 50vw; }',
      description: 'A margin using tokens "50vw" is accepted',
    },
    {
      code: '.foo { margin: 50vw -100vh; }',
      description: 'A margin using tokens "50vw -100vh" is accepted',
    },
    {
      code: '.foo { margin: 50vw -100vh 100vh; }',
      description: 'A margin using tokens "50vw -100vh 100vh" is accepted',
    },
    {
      code: '.foo { margin: 50vw -100vh 100vh 50vh; }',
      description: 'A margin using tokens "50vw -100vh 100vh 50vh" is accepted',
    },
    {
      code: '.foo { margin: -100vh; }',
      description: 'A margin using tokens "-100vh" is accepted',
    },
    {
      code: '.foo { margin: -100vh 100vh; }',
      description: 'A margin using tokens "-100vh 100vh" is accepted',
    },
    {
      code: '.foo { margin: -100vh 100vh 50vh; }',
      description: 'A margin using tokens "-100vh 100vh 50vh" is accepted',
    },
    {
      code: '.foo { margin: -100vh 100vh 50vh 0xxx; }',
      description: 'A margin using tokens "-100vh 100vh 50vh 0xxx" is accepted',
    },
    {
      code: '.foo { margin: 100vh; }',
      description: 'A margin using tokens "100vh" is accepted',
    },
    {
      code: '.foo { margin: 100vh 50vh; }',
      description: 'A margin using tokens "100vh 50vh" is accepted',
    },
    {
      code: '.foo { margin: 100vh 50vh 0xxx; }',
      description: 'A margin using tokens "100vh 50vh 0xxx" is accepted',
    },
    {
      code: '.foo { margin: 100vh 50vh 0xxx $my-value-accept; }',
      description:
        'A margin using tokens "100vh 50vh 0xxx $my-value-accept" is accepted',
    },
    {
      code: '.foo { left: $spacing-01; }',
      description: 'A left using a token "$spacing-01" is accepted.',
    },
    {
      code: '.foo { top: $spacing-01; }',
      description: 'A top using a token "$spacing-01" is accepted.',
    },
    {
      code: '.foo { bottom: $spacing-01; }',
      description: 'A bottom using a token "$spacing-01" is accepted.',
    },
    {
      code: '.foo { right: $spacing-01; }',
      description: 'A right using a token "$spacing-01" is accepted.',
    },
    {
      code: '.foo { margin: $container-01; }',
      description: 'A margin using token(s) "$container-01" is accepted',
    },
    {
      code: '.foo { margin: $container-01 $fluid-spacing-01; }',
      description:
        'A margin using token(s) "$container-01 $fluid-spacing-01" is accepted',
    },
    {
      code: '.foo { margin: $container-01 $fluid-spacing-01 $icon-size-01; }',
      description:
        'A margin using token(s) "$container-01 $fluid-spacing-01 $icon-size-01" is accepted',
    },
    {
      code: '.foo { margin: $container-01 $fluid-spacing-01 $icon-size-01 $container-01; }',
      description:
        'A margin using token(s) "$container-01 $fluid-spacing-01 $icon-size-01 $container-01" is accepted',
    },
  ],
  reject: [
    {
      code: '.foo { margin: 199px; }',
      description: 'A margin using non-token(s) "199px" is rejected',
      message: messages.rejected('margin', '199px'),
    },
    {
      code: '.foo { margin: 199px 299px; }',
      description: 'A margin using non-token(s) "199px 299px" is rejected',
      warnings: [
        { message: messages.rejected('margin', '199px 299px') },
        { message: messages.rejected('margin', '199px 299px') },
      ],
    },
    {
      code: '.foo { margin: 199px 299px 399px; }',
      description:
        'A margin using non-token(s) "199px 299px 399px" is rejected',
      warnings: [
        { message: messages.rejected('margin', '199px 299px 399px') },
        { message: messages.rejected('margin', '199px 299px 399px') },
        { message: messages.rejected('margin', '199px 299px 399px') },
      ],
    },
    {
      code: '.foo { margin: 199px 299px 399px 499px; }',
      description:
        'A margin using non-token(s) "199px 299px 399px 499px" is rejected',
      warnings: [
        { message: messages.rejected('margin', '199px 299px 399px 499px') },
        { message: messages.rejected('margin', '199px 299px 399px 499px') },
        { message: messages.rejected('margin', '199px 299px 399px 499px') },
        { message: messages.rejected('margin', '199px 299px 399px 499px') },
      ],
    },
    {
      code: '.foo { margin: 299px; }',
      description: 'A margin using non-token(s) "299px" is rejected',
      message: messages.rejected('margin', '299px'),
    },
    {
      code: '.foo { margin: 299px 399px; }',
      description: 'A margin using non-token(s) "299px 399px" is rejected',
      warnings: [
        { message: messages.rejected('margin', '299px 399px') },
        { message: messages.rejected('margin', '299px 399px') },
      ],
    },
    {
      code: '.foo { margin: 299px 399px 499px; }',
      description:
        'A margin using non-token(s) "299px 399px 499px" is rejected',
      warnings: [
        { message: messages.rejected('margin', '299px 399px 499px') },
        { message: messages.rejected('margin', '299px 399px 499px') },
        { message: messages.rejected('margin', '299px 399px 499px') },
      ],
    },
    {
      code: '.foo { margin: 299px 399px 499px $my-value-reject; }',
      description:
        'A margin using non-token(s) "299px 399px 499px $my-value-reject" is rejected',
      warnings: [
        {
          message: messages.rejected(
            'margin',
            '299px 399px 499px $my-value-reject'
          ),
        },
        {
          message: messages.rejected(
            'margin',
            '299px 399px 499px $my-value-reject'
          ),
        },
        {
          message: messages.rejected(
            'margin',
            '299px 399px 499px $my-value-reject'
          ),
        },
        {
          message: messages.rejectedUndefinedVariable(
            'margin',
            '$my-value-reject'
          ),
        },
      ],
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true],
  accept: [
    {
      code: `.foo { left: $container-01; }`,
      description: `Accept $container tokens`,
    },
  ],
  reject: [],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true],

  accept: [
    {
      code: `.foo { left: $icon-size-01; }`,
      description: `Accept $icon-size tokens`,
    },
  ],
  reject: [],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true],

  accept: [
    {
      code: `.foo { left: $fluid-spacing-01; }`,
      description: `Accept $fluid-spacing tokens`,
    },
  ],
  reject: [],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true, { acceptCarbonMiniUnitsFunction: true }],

  reject: [
    {
      code: `.foo { left: mini-units(4); }`,
      description: `Reject mini-units in v11`,
      message: messages.rejected('left', 'mini-units(4)'),
    },
    {
      code: `.foo { padding: carbon--mini-units(2) }`,
      description: `Reject Carbon--mini-units in v11.`,
      message: messages.rejected('padding', 'carbon--mini-units(2)'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    {
      acceptCarbonMiniUnitsFunction: true,
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],

  accept: [
    {
      code: `.foo { left: mini-units(4); }`,
      description: `A left using a mini-units is accepted with option.`,
    },
    {
      code: `.foo { padding: carbon--mini-units(2) }`,
      description: `Accepts carbon--mini-units function with option.`,
    },
  ],
  reject: [],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    { carbonPath: 'node_modules/@carbon', carbonModulePostfix: '-10' },
  ],
  accept: [
    {
      code: `.foo { left: $carbon--spacing-04; }`,
      description: `v10 test: Accept 'carbon--' prefix.`,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  fix: true,
  config: [true],
  reject: [
    {
      code: `.foo { left: $carbon--layout-04; }`,
      message: messages.rejectedUndefinedVariable('left', '$carbon--layout-04'),
      fixed: `.foo { left: $spacing-09; }`,
      description: `v11 reject and fix 'layout' in favor of 'spacing'`,
    },
    {
      code: `.foo { left: $carbon--spacing-04; }`,
      message: messages.rejectedUndefinedVariable(
        'left',
        '$carbon--spacing-04'
      ),
      fixed: `.foo { left: $spacing-04; }`,
      description: `v11 reject and fix 'carbon--' prefix for spacing.`,
    },
    {
      code: `.foo { left: $carbon--icon-size-02; }`,
      message: messages.rejectedUndefinedVariable(
        'left',
        '$carbon--icon-size-02'
      ),
      fixed: `.foo { left: $icon-size-02; }`,
      description: `v11 reject and fix 'carbon--' prefix for icon-size.`,
    },
    {
      code: `.foo { left: $carbon--fluid-spacing-04; }`,
      message: messages.rejectedUndefinedVariable(
        'left',
        '$carbon--fluid-spacing-04'
      ),
      fixed: `.foo { left: $fluid-spacing-04; }`,
      description: `v11 reject and fix 'carbon--' prefix for fluid-spacing.`,
    },
    {
      code: `.foo { left: $carbon--container-04; }`,
      message: messages.rejectedUndefinedVariable(
        'left',
        '$carbon--container-04'
      ),
      fixed: `.foo { left: $container-04; }`,
      description: `v11 reject and fix 'carbon--' prefix for container.`,
    },
    {
      code: `.foo { left: $carbon--size-small; }`,
      message: messages.rejectedUndefinedVariable(
        'left',
        '$carbon--size-small'
      ),
      fixed: `.foo { left: $size-small; }`,
      description: `v11 reject and fix 'carbon--' prefix for size.`,
    },
    {
      code: `.foo { left: 0.125rem; }`,
      message: messages.rejected('left', '0.125rem'),
      fixed: `.foo { left: $spacing-01; }`,
      description: `Reject and fix 0.125rem in favour of $spacing-01.`,
    },
    {
      code: `.foo { left: 2px; }`,
      message: messages.rejected('left', '2px'),
      fixed: `.foo { left: $spacing-01; }`,
      description: `Reject and fix 2px in favour of $spacing-01.`,
    },
    {
      code: `.foo { left: 0.25rem; }`,
      message: messages.rejected('left', '0.25rem'),
      fixed: `.foo { left: $spacing-02; }`,
      description: `Reject and fix 0.25rem in favour of $spacing-02.`,
    },
    {
      code: `.foo { left: 4px; }`,
      message: messages.rejected('left', '4px'),
      fixed: `.foo { left: $spacing-02; }`,
      description: `Reject and fix 4px in favour of $spacing-02.`,
    },
    {
      code: `.foo { left: 0.5rem; }`,
      message: messages.rejected('left', '0.5rem'),
      fixed: `.foo { left: $spacing-03; }`,
      description: `Reject and fix 0.5rem in favour of $spacing-03.`,
    },
    {
      code: `.foo { left: 8px; }`,
      message: messages.rejected('left', '8px'),
      fixed: `.foo { left: $spacing-03; }`,
      description: `Reject and fix 8px in favour of $spacing-03.`,
    },
    {
      code: `.foo { left: 0.75rem; }`,
      message: messages.rejected('left', '0.75rem'),
      fixed: `.foo { left: $spacing-04; }`,
      description: `Reject and fix 0.75rem in favour of $spacing-04.`,
    },
    {
      code: `.foo { left: 12px; }`,
      message: messages.rejected('left', '12px'),
      fixed: `.foo { left: $spacing-04; }`,
      description: `Reject and fix 12px in favour of $spacing-04.`,
    },
    {
      code: `.foo { left: 1rem; }`,
      message: messages.rejected('left', '1rem'),
      fixed: `.foo { left: $spacing-05; }`,
      description: `Reject and fix 1rem in favour of $spacing-05.`,
    },
    {
      code: `.foo { left: 16px; }`,
      message: messages.rejected('left', '16px'),
      fixed: `.foo { left: $spacing-05; }`,
      description: `Reject and fix 16px in favour of $spacing-05.`,
    },
    {
      code: `.foo { left: 1.5rem; }`,
      message: messages.rejected('left', '1.5rem'),
      fixed: `.foo { left: $spacing-06; }`,
      description: `Reject and fix 1.5rem in favour of $spacing-06.`,
    },
    {
      code: `.foo { left: 24px; }`,
      message: messages.rejected('left', '24px'),
      fixed: `.foo { left: $spacing-06; }`,
      description: `Reject and fix 24px in favour of $spacing-06.`,
    },
    {
      code: `.foo { left: 2rem; }`,
      message: messages.rejected('left', '2rem'),
      fixed: `.foo { left: $spacing-07; }`,
      description: `Reject and fix 2rem in favour of $spacing-07.`,
    },
    {
      code: `.foo { left: 32px; }`,
      message: messages.rejected('left', '32px'),
      fixed: `.foo { left: $spacing-07; }`,
      description: `Reject and fix 32px in favour of $spacing-07.`,
    },
    {
      code: `.foo { left: 2.5rem; }`,
      message: messages.rejected('left', '2.5rem'),
      fixed: `.foo { left: $spacing-08; }`,
      description: `Reject and fix 2.5rem in favour of $spacing-08.`,
    },
    {
      code: `.foo { left: 40px; }`,
      message: messages.rejected('left', '40px'),
      fixed: `.foo { left: $spacing-08; }`,
      description: `Reject and fix 40px in favour of $spacing-08.`,
    },
    {
      code: `.foo { left: 3rem; }`,
      message: messages.rejected('left', '3rem'),
      fixed: `.foo { left: $spacing-09; }`,
      description: `Reject and fix 3rem in favour of $spacing-09.`,
    },
    {
      code: `.foo { left: 48px; }`,
      message: messages.rejected('left', '48px'),
      fixed: `.foo { left: $spacing-09; }`,
      description: `Reject and fix 48px in favour of $spacing-09.`,
    },
    {
      code: `.foo { left: 4rem; }`,
      message: messages.rejected('left', '4rem'),
      fixed: `.foo { left: $spacing-10; }`,
      description: `Reject and fix 4rem in favour of $spacing-10.`,
    },
    {
      code: `.foo { left: 64px; }`,
      message: messages.rejected('left', '64px'),
      fixed: `.foo { left: $spacing-10; }`,
      description: `Reject and fix 64px in favour of $spacing-10.`,
    },
    {
      code: `.foo { left: 5rem; }`,
      message: messages.rejected('left', '5rem'),
      fixed: `.foo { left: $spacing-11; }`,
      description: `Reject and fix 5rem in favour of $spacing-11.`,
    },
    {
      code: `.foo { left: 80px; }`,
      message: messages.rejected('left', '80px'),
      fixed: `.foo { left: $spacing-11; }`,
      description: `Reject and fix 80px in favour of $spacing-11.`,
    },
    {
      code: `.foo { left: 6rem; }`,
      message: messages.rejected('left', '6rem'),
      fixed: `.foo { left: $spacing-12; }`,
      description: `Reject and fix 6rem in favour of $spacing-12.`,
    },
    {
      code: `.foo { left: 96px; }`,
      message: messages.rejected('left', '96px'),
      fixed: `.foo { left: $spacing-12; }`,
      description: `Reject and fix 96px in favour of $spacing-12.`,
    },
    {
      code: `.foo { left: 10rem; }`,
      message: messages.rejected('left', '10rem'),
      fixed: `.foo { left: $spacing-13; }`,
      description: `Reject and fix 10rem in favour of $spacing-13.`,
    },
    {
      code: `.foo { left: 160px; }`,
      message: messages.rejected('left', '160px'),
      fixed: `.foo { left: $spacing-13; }`,
      description: `Reject and fix 160px in favour of $spacing-13.`,
    },
    {
      code: `.foo { margin: 160px 10rem 4px 2rem; }`,
      warnings: [
        { message: messages.rejected('margin', '160px 10rem 4px 2rem') },
        { message: messages.rejected('margin', '160px 10rem 4px 2rem') },
        { message: messages.rejected('margin', '160px 10rem 4px 2rem') },
        { message: messages.rejected('margin', '160px 10rem 4px 2rem') },
      ],
      fixed: `.foo { margin: $spacing-13 $spacing-13 $spacing-02 $spacing-07; }`,
      description: `Reject and fix multiple literal sizes and fix matches.`,
    },
    {
      code: `.foo { margin: 160px $carbon--spacing-13 4px 2rem; }`,
      warnings: [
        {
          message: messages.rejected(
            'margin',
            '160px $carbon--spacing-13 4px 2rem'
          ),
        },
        {
          message: messages.rejectedUndefinedVariable(
            'margin',
            '$carbon--spacing-13'
          ),
        },
        {
          message: messages.rejected(
            'margin',
            '160px $carbon--spacing-13 4px 2rem'
          ),
        },
        {
          message: messages.rejected(
            'margin',
            '160px $carbon--spacing-13 4px 2rem'
          ),
        },
      ],
      fixed: `.foo { margin: $spacing-13 $spacing-13 $spacing-02 $spacing-07; }`,
      description: `Reject and fix different cases.`,
    },
    {
      code: `.foo { margin: 160px $carbon--spacing-13 2rem 2rem; }`,
      warnings: [
        {
          message: messages.rejected(
            'margin',
            '160px $carbon--spacing-13 2rem 2rem'
          ),
        },
        {
          message: messages.rejectedUndefinedVariable(
            'margin',
            '$carbon--spacing-13'
          ),
        },
        {
          message: messages.rejected(
            'margin',
            '160px $carbon--spacing-13 2rem 2rem'
          ),
        },
        {
          message: messages.rejected(
            'margin',
            '160px $carbon--spacing-13 2rem 2rem'
          ),
        },
      ],
      fixed: `.foo { margin: $spacing-13 $spacing-13 $spacing-07 $spacing-07; }`,
      description: `Reject and fix different cases again.`,
    },
    // stylelint 16 simply rejects failed fixes, so this test cannot be run
    // {
    //   code: `.foo { margin: 160px $not-a-token 4px 2rem; }`,
    //   warnings: [
    //     { message: messages.rejected("margin", "160px $not-a-token 4px 2rem") },
    //     {
    //       message: messages.rejectedUndefinedVariable("margin", "$not-a-token")
    //     },
    //     { message: messages.rejected("margin", "160px $not-a-token 4px 2rem") },
    //     { message: messages.rejected("margin", "160px $not-a-token 4px 2rem") }
    //   ],
    //   fixed: `.foo { margin: 160px $not-a-token 4px 2rem; }`,
    //   description: `Reject partial fixes literal sizes and fix matches.`
    // }
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    {
      acceptCarbonMiniUnitsFunction: true,
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],
  accept: [
    {
      code: `.foo { left: mini-units(4); }`,
      description: `v10 test: A left using a mini-units is accepted with option.`,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    { carbonPath: 'node_modules/@carbon', carbonModulePostfix: '-10' },
  ],
  reject: [
    {
      code: `.foo { left: mini-units(4); }`,
      description: `v10 test: A left using a mini-units is rejected without option "acceptCarbonMiniUnitsFunction`,
      message: messages.rejected('left', 'mini-units(4)'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: true,

  accept: [
    {
      code: '.foo { transform: none; }',
      description: 'Accept reset using none',
    },
    {
      code: '.foo { transform: inherit; }',
      description: 'Accept reset using inherit',
    },
    {
      code: '.foo { transform: initial; }',
      description: 'Accept reset using initial',
    },
    {
      code: '.foo { transform: unset; }',
      description: 'Accept reset using unset',
    },
    {
      code: `.foo { transform: translate(49%, 49%); }`,
      description: `Accept translate using relative values`,
    },
    {
      code: `.foo { transform: translate(-48%, -48%); }`,
      description: `Accept translate using negative relative values`,
    },
    {
      code: `.foo { transform: translate(-20vw, $spacing-06); }`,
      description: `Accept translate using relative value`,
    },
    {
      code: `.foo { transform: translate($spacing-06, -20vh); }`,
      description: `Accept translate using relative value`,
    },
    {
      code: `.foo { transform: translateX(-20%); }`,
      description: `Accept translateX using relative value`,
    },
    {
      code: `.foo { transform: translateY(-20%); }`,
      description: `Accept translateY using relative value`,
    },
    {
      code: `.foo { transform: translateX(calc(-1 * $spacing-05)); }`,
      description: `Accept translateX using a calc(-1 * $)`,
    },
    {
      code: `.foo { transform: translateY(calc(-1 * $spacing-05)); }`,
      description: `Accept translateY using calc(-1 * $)`,
    },
    {
      code: `.foo { transform: translateX(calc(-1 * #{$spacing-05})); }`,
      description: `Accept translateX using calc(-1 * #{$})`,
    },
    {
      code: `.foo { transform: translateY(calc(-1 * #{$spacing-05})); }`,
      description: `Accept translateY using  calc(-1 * #{$})`,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: true,
  reject: [
    {
      code: `.foo { transform: translate(-20px, -1em); }`,
      description: `Reject translate not using layout tokens`,
      message: messages.rejected('transform', 'translate(-20px, -1em)'),
    },
    {
      code: `.foo { transform: translate(-20px, $spacing-06); }`,
      description: `Reject translate not using layout tokens for first param`,
      message: messages.rejected('transform', 'translate(-20px, $spacing-06)'),
    },
    {
      code: `.foo { transform: translate($spacing-06, -20px); }`,
      description: `Reject translate not using layout tokens for second param`,
      message: messages.rejected('transform', 'translate($spacing-06, -20px)'),
    },
    {
      code: `.foo { transform: translateX(-20px); }`,
      description: `Reject translateX not using layout tokens`,
      message: messages.rejected('transform', 'translateX(-20px)'),
    },
    {
      code: `.foo { transform: translateY(-20px); }`,
      description: `Reject translateY not using layout tokens`,
      message: messages.rejected('transform', 'translateY(-20px)'),
    },
  ],
});

// Normal maths
testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { right: calc(100vw - #{$spacing-01}) }`,
      description: `Accept calc(vw - $)`,
    },
    {
      code: `.foo { right: calc(100% + #{$spacing-01}) }`,
      description: `Accept calc(% + $)`,
    },
    {
      code: `.foo { right: calc(100vh - #{$spacing-01}) }`,
      description: `Accept calc(vh - $)`,
    },
    {
      code: `.foo { right: calc(#{$spacing-01} / -1) }`,
      description: `Accept calc(#{$} / -1)`,
    },
    {
      code: `.foo { right: calc($spacing-01 / -1) }`,
      description: `Accept calc($ / -1)`,
    },
    {
      code: `.foo { right: $spacing-01 / -1 }`,
      description: `Accept $ / -1`,
    },
    {
      code: `.foo { right: calc(-1 * #{$spacing-04}) }`,
      description: `Accept calc(-1 * #{$})`,
    },
    // {
    //   code: `.foo { right: calc(-1 * $spacing-04)`,
    //   description: `Accept calc(-1 * $)`
    // },
    {
      code: `.foo { right: -1 * $spacing-04 }`,
      description: `Accept -1 * $`,
    },
    {
      code: `.foo { right: -$spacing-04 }`,
      description: `Accept -#{$}`,
    },
    {
      code: `.foo { right: -(#{$spacing-04}) }`,
      description: `Accept -1(#{$})`,
    },
    {
      code: `.foo { right: calc(#{$spacing-04} * -1) }`,
      description: `calc(#{$} * -1)`,
    },
    // {
    //   code: `.foo { right: calc($spacing-04 * -1) }`,
    //   description: `Accept calc($ * -1)`
    // },
    {
      code: `.foo { right: $spacing-04 * -1 }`,
      description: `Accept $ * -1`,
    },
  ],
  reject: [
    {
      code: `.foo { right: calc(100px - #{$spacing-01}); }`,
      description: `Reject calc(px - $)`,
      message: messages.rejectedMaths('right', 'calc(100px - #{$spacing-01})'),
    },
    {
      code: `.foo { right: calc(100px + #{$spacing-01}); }`,
      description: `Reject calc(px + $)`,
      message: messages.rejectedMaths('right', 'calc(100px + #{$spacing-01})'),
    },
    {
      code: `.foo { right: calc(100px + 100px); }`,
      description: `Reject calc(px - px)`,
      message: messages.rejectedMaths('right', 'calc(100px + 100px)'),
    },
    {
      code: `.foo { right: calc(#{$spacing-01} + #{$spacing-01}); }`,
      description: `Reject calc($ - $)`,
      message: messages.rejectedMaths(
        'right',
        'calc(#{$spacing-01} + #{$spacing-01})'
      ),
    },
    {
      // This test case is not supported as it would otherwise allow any value to be created from a token
      code: `.foo { right: calc(#{$spacing-01} * 1.5); }`,
      description: `Reject calc($ * number)`,
      message: messages.rejectedMaths('right', 'calc(#{$spacing-01} * 1.5)'),
    },
    {
      code: `.foo { right: calc(50% - 8px); }`,
      description: `Reject calc(% - px)`,
      message: messages.rejectedMaths('right', 'calc(50% - 8px)'),
    },
    {
      code: `.foo { $arbitrary-pixel-size: 3.14159265; left: calc(#{$arbitrary-pixel-size} * #{$spacing-01} / 2) }`,
      description: 'Reject calc(N * $ / N)',
      message: messages.rejectedMaths(
        'left',
        'calc(#{$arbitrary-pixel-size} * #{$spacing-01} / 2)'
      ),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true],
  accept: [
    {
      code: `$block-class: 'test'; --test--breadcrumb-title-top: $spacing-02; .foo { top: var(--#{$block-class}--breadcrumb-title-top); }`,
      description: `Accept CSS custom prop with preprocessor in name`,
    },
  ],
  reject: [
    {
      code: `$block-class: 'test'; .foo { top: var(--#{$block-class}--breadcrumb-title-top); }`,
      description: `Reject undefined SCSS var constructed with a CSS custom prop with preprocessor in name if undeclared and undefined variables is off`,
      message: messages.rejectedUndefinedVariable(
        'top',
        'var(--#{$block-class}--breadcrumb-title-top)'
      ),
    },
    {
      code: `--test--breadcrumb-title-top: $spacing-02; .foo { top: var(--#{$block-class}--breadcrumb-title-top); }`,
      description: `Reject undefined SCSS var constructing a CSS custom prop with preprocessor in name if undeclared and undefined variables is off`,
      message: messages.rejectedUndefinedVariable(
        'top',
        'var(--#{$block-class}--breadcrumb-title-top)'
      ),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `$block-class: 'test'; --test--breadcrumb-title-top: $spacing-02; .foo { top: var(--#{$block-class}--breadcrumb-title-top); }`,
      description: `Accept CSS custom prop with preprocessor in name`,
    },
  ],
  reject: [
    {
      code: `$block-class: 'test'; .foo { top: var(--#{$block-class}--breadcrumb-title-top); }`,
      description: `Reject undefined SCSS var constructed with a CSS custom prop with preprocessor in name if undeclared and undefined variables is on`,
      message: messages.rejectedUndefinedVariable(
        'top',
        'var(--#{$block-class}--breadcrumb-title-top)'
      ),
    },
    {
      code: `--test--breadcrumb-title-top: $spacing-02; .foo { top: var(--#{$block-class}--breadcrumb-title-top); }`,
      description: `Reject undefined SCSS var constructing a CSS custom prop with preprocessor in name if undeclared and undefined variables is on`,
      message: messages.rejectedUndefinedVariable(
        'top',
        'var(--#{$block-class}--breadcrumb-title-top)'
      ),
    },
  ],
});

// Odd maths checks
testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { margin: - 10% $spacing-05}`,
      description: `Accept unconnected operator - with %`,
    },
    {
      code: `.foo { margin: + 10% $spacing-05}`,
      description: `Accept unconnected operator + with %`,
    },
    {
      code: `.foo { margin: - - - 10% $spacing-05}`,
      description: `Accept multiple unconnected operator with %`,
    },
    {
      code: `.foo { margin: - + - + - 10% $spacing-05}`,
      description: `Accept five unconnected operators with %`,
    },
    {
      code: `.foo { margin: * 10% $spacing-05}`,
      description: `Warn when unconnected operator * with %. Console message shown on test.`,
      expectWarnings: true,
    },
    {
      code: `.foo { margin: / 10% $spacing-05}`,
      description: `Warn when unconnected operator / with %. Console message shown on test.`,
      expectWarnings: true,
    },
  ],
});

// Additional  test for reported issue
// top: -($body--height - $spacing-05);
testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: true,
  reject: [
    {
      code: `.foo { $body--height: 400px; top: -($body--height - $spacing-05); }`,
      description: `Reject non-supported maths of form $x: 1px; -($x - $token)`,
      message: messages.rejected('top', '-($body--height - $spacing-05)'),
    },
    {
      code: `.foo { top: -($body--height - $spacing-05); }`,
      description: `Reject non-supported maths of form -($unknown - $token)`,
      message: messages.rejected('top', '-($body--height - $spacing-05)'),
    },
    {
      code: `.foo { $body--height: 400px; top: ($body--height - $spacing-05); }`,
      description: `Reject non-supported maths of form $x: 1px; ($x - $token)`,
      message: messages.rejected('top', '($body--height - $spacing-05)'),
    },
    {
      code: `.foo { top: ($body--height - $spacing-05); }`,
      description: `Reject non-supported maths of form ($unknown - $token)`,
      message: messages.rejected('top', '($body--height - $spacing-05)'),
    },
    {
      code: `.foo { $body--height: 400px; top: $body--height - $spacing-05; }`,
      description: `Reject non-supported maths of form $x: 1px; $x - $token`,
      message: messages.rejected('top', '$body--height - $spacing-05'),
    },
    {
      code: `.foo { top: $body--height - $spacing-05; }`,
      description: `Reject non-supported maths of form $unknown - $token`,
      message: messages.rejected('top', '$body--height - $spacing-05'),
    },
    {
      code: `.foo {margin-top: 1 + map-get($map: (key: 1rem), $key: key);}`,
      description: 'Reject 1 + map-get',
      message: messages.rejected(
        'margin-top',
        '1 + map-get($map: (key: 1rem), $key: key)'
      ),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { transform: translate3d($spacing-04, $spacing-04, 100px)}`,
      description:
        'Accept translate3d with first two parameters as carbon tokens.',
      message: messages.rejected(
        'transform',
        'translate3d($spacing-04, $spacing-04, 100px)'
      ),
    },
  ],
  reject: [
    {
      code: `.foo { transform: translate3d(100px, $spacing-04, 100px)}`,
      description:
        'Reject translate3d with first parameter not a carbon token.',
      message: messages.rejected(
        'transform',
        'translate3d(100px, $spacing-04, 100px)'
      ),
    },
    {
      code: `.foo { transform: translate3d($spacing-04, 100px, 100px)}`,
      description:
        'Reject translate3d with second parameter not a carbon token.',
      message: messages.rejected(
        'transform',
        'translate3d($spacing-04, 100px, 100px)'
      ),
    },
    {
      code: `.foo { transform: translate3d(100px, 100px, 100px)}`,
      description:
        'Reject translate3d with neither first two parameters carbon tokens.',
      message: messages.rejected(
        'transform',
        'translate3d(100px, 100px, 100px)'
      ),
    },
  ],
});

// Scope tests
testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { left: layout.$spacing-05; }`,
      description: 'Accept layout scope.',
    },
    {
      code: `.foo { transform: translate3d(layout.$spacing-04, layout.$spacing-04, layout.$spacing-04)}`,
      description: 'Accept layout scope in function.',
    },
  ],
  reject: [
    {
      code: `.foo { left: la.$spacing-05; }`,
      description: "Reject scope 'la' without acceptScopes setting.",
      message: messages.rejectedUndefinedVariable('left', 'la.$spacing-05'),
    },
    {
      code: `.foo { transform: translate3d(la.$spacing-04, la.$spacing-04, layout.$spacing-04)}`,
      description:
        "Reject scope 'la' without acceptScopes setting in translation.",
      message: messages.rejected(
        'transform',
        'translate3d(la.$spacing-04, la.$spacing-04, layout.$spacing-04)'
      ),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptScopes: ['la'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { left: la.$spacing-05; }`,
      description: "Accept scope 'la' with acceptScopes setting.",
    },
    {
      code: `.foo { transform: translate3d(la.$spacing-04, la.$spacing-04, layout.$spacing-04)}`,
      description:
        "Accept scope 'la' with acceptScopes setting in translation.",
    },
  ],
  reject: [
    {
      code: `.foo { left: layout.$spacing-05; }`,
      description: 'Reject layout scope with scope setting.',
      message: messages.rejectedUndefinedVariable('left', 'layout.$spacing-05'),
    },
    {
      code: `.foo { transform: translate3d(layout.$spacing-04, layout.$spacing-04, layout.$spacing-04)}`,
      description: 'Reject layout scope in function with scope setting.',
      message: messages.rejected(
        'transform',
        'translate3d(layout.$spacing-04, layout.$spacing-04, layout.$spacing-04)'
      ),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptScopes: ['la', '*'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { left: la.$spacing-05; }`,
      description: "Accept scope 'la' with acceptScopes setting.",
    },
    {
      code: `.foo { transform: translate3d(la.$spacing-04, la.$spacing-04, layout.$spacing-04)}`,
      description:
        "Accept scope 'la' with acceptScopes setting in translation.",
    },
    {
      code: `.foo { left: layout.$spacing-05; }`,
      description: 'Accept layout scope with scope setting including default.',
    },
    {
      code: `.foo { transform: translate3d(layout.$spacing-04, layout.$spacing-04, layout.$spacing-04)}`,
      description:
        'Accept layout scope in function with scope setting including default.',
    },
  ],
  reject: [
    {
      code: `.foo { left: reject.$spacing-05; }`,
      description: 'Reject scope not included in scope setting.',
      message: messages.rejectedUndefinedVariable('left', 'reject.$spacing-05'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  // cspell: disable-next-line
  config: [true, { acceptScopes: ['/^la(yout)?$/'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { left: la.$spacing-05; }`,
      description: "Accept scope 'la' with acceptScopes regex setting.",
    },
    {
      code: `.foo { transform: translate3d(la.$spacing-04, la.$spacing-04, layout.$spacing-04)}`,
      description:
        "Accept scope 'la' with acceptScopes regex setting in translation.",
    },
    {
      code: `.foo { left: layout.$spacing-05; }`,
      description:
        'Accept layout scope with scope regex setting including default.',
    },
    {
      code: `.foo { transform: translate3d(layout.$spacing-04, layout.$spacing-04, layout.$spacing-04)}`,
      description:
        'Accept layout scope in function with scope regex setting including default.',
    },
  ],
  reject: [
    {
      code: `.foo { left: reject.$spacing-05; }`,
      description: 'Reject scope not included in scope regex setting.',
      message: messages.rejectedUndefinedVariable('left', 'reject.$spacing-05'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptScopes: ['**'] }],
  configSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { left: abcd.$spacing-05; right: zyx.$spacing-05;}`,
      description: "All scopes ['**'].",
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true],
  configSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { inset: $spacing-01 $spacing-01 $spacing-01 $spacing-01 }`,
      description: 'inset using tokens',
    },
    {
      code: `.foo { inset-block: $spacing-01 $spacing-01 }`,
      description: 'inset-block using tokens',
    },
    {
      code: `.foo { inset-inline: $spacing-01 $spacing-01 }`,
      description: 'inset-inline using tokens',
    },
    {
      code: `.foo { inset-inline-start: $spacing-01 }`,
      description: 'inset-inline-start using tokens',
    },
    {
      code: `.foo { inset-inline-end: $spacing-01 }`,
      description: 'inset-inline-end using tokens',
    },
    {
      code: `.foo { inset-block-start: $spacing-01 }`,
      description: 'inset-block-start using tokens',
    },
    {
      code: `.foo { inset-block-end: $spacing-01 }`,
      description: 'inset-block-end using tokens',
    },
    {
      code: `.foo { margin-block: $spacing-01 $spacing-01 }`,
      description: 'margin-block using tokens',
    },
    {
      code: `.foo { margin-inline: $spacing-01 $spacing-01 }`,
      description: 'margin-inline using tokens',
    },
    {
      code: `.foo { margin-inline-start: $spacing-01 }`,
      description: 'margin-inline-start using tokens',
    },
    {
      code: `.foo { margin-inline-end: $spacing-01 }`,
      description: 'margin-inline-end using tokens',
    },
    {
      code: `.foo { margin-block-start: $spacing-01 }`,
      description: 'margin-block-start using tokens',
    },
    {
      code: `.foo { margin-block-end: $spacing-01 }`,
      description: 'margin-block-end using tokens',
    },
    {
      code: `.foo { padding-block: $spacing-01 $spacing-01 }`,
      description: 'padding-block using tokens',
    },
    {
      code: `.foo { padding-inline: $spacing-01 $spacing-01 }`,
      description: 'padding-inline using tokens',
    },
    {
      code: `.foo { padding-inline-start: $spacing-01 }`,
      description: 'padding-inline-start using tokens',
    },
    {
      code: `.foo { padding-inline-end: $spacing-01 }`,
      description: 'padding-inline-end using tokens',
    },
    {
      code: `.foo { padding-block-start: $spacing-01 }`,
      description: 'padding-block-start using tokens',
    },
    {
      code: `.foo { padding-block-end: $spacing-01 }`,
      description: 'padding-block-end using tokens',
    },
  ],
  reject: [
    {
      code: `.foo { inset: $spacing-01 10px $spacing-01 $spacing-01 }`,
      description: 'inset using tokens',
      message: messages.rejected(
        'inset',
        '$spacing-01 10px $spacing-01 $spacing-01'
      ),
    },
    {
      code: `.foo { inset-block: 10px $spacing-01 }`,
      description: 'inset-block using tokens',
      message: messages.rejected('inset-block', '10px $spacing-01'),
    },
    {
      code: `.foo { inset-inline: $spacing-01 10px }`,
      description: 'inset-inline using tokens',
      message: messages.rejected('inset-inline', '$spacing-01 10px'),
    },
    {
      code: `.foo { inset-inline-start: 10px }`,
      description: 'inset-inline-start using tokens',
      message: messages.rejected('inset-inline-start', '10px'),
    },
    {
      code: `.foo { inset-inline-end: 10px }`,
      description: 'inset-inline-end using tokens',
      message: messages.rejected('inset-inline-end', '10px'),
    },
    {
      code: `.foo { inset-block-start: 10px }`,
      description: 'inset-block-start using tokens',
      message: messages.rejected('inset-block-start', '10px'),
    },
    {
      code: `.foo { inset-block-end: 10px }`,
      description: 'inset-block-end using tokens',
      message: messages.rejected('inset-block-end', '10px'),
    },
    {
      code: `.foo { margin-block: 10px $spacing-01 }`,
      description: 'margin-block using tokens',
      message: messages.rejected('margin-block', '10px $spacing-01'),
    },
    {
      code: `.foo { margin-inline: $spacing-01 10px }`,
      description: 'margin-inline using tokens',
      message: messages.rejected('margin-inline', '$spacing-01 10px'),
    },
    {
      code: `.foo { margin-inline-start: 10px }`,
      description: 'margin-inline-start using tokens',
      message: messages.rejected('margin-inline-start', '10px'),
    },
    {
      code: `.foo { margin-inline-end: 10px }`,
      description: 'margin-inline-end using tokens',
      message: messages.rejected('margin-inline-end', '10px'),
    },
    {
      code: `.foo { margin-block-start: 10px }`,
      description: 'margin-block-start using tokens',
      message: messages.rejected('margin-block-start', '10px'),
    },
    {
      code: `.foo { margin-block-end: 10px }`,
      description: 'margin-block-end using tokens',
      message: messages.rejected('margin-block-end', '10px'),
    },
    {
      code: `.foo { padding-block: $spacing-01 10px }`,
      description: 'padding-block using tokens',
      message: messages.rejected('padding-block', '$spacing-01 10px'),
    },
    {
      code: `.foo { padding-inline: 10px $spacing-01 }`,
      description: 'padding-inline using tokens',
      message: messages.rejected('padding-inline', '10px $spacing-01'),
    },
    {
      code: `.foo { padding-inline-start: 10px }`,
      description: 'padding-inline-start using tokens',
      message: messages.rejected('padding-inline-start', '10px'),
    },
    {
      code: `.foo { padding-inline-end: 10px }`,
      description: 'padding-inline-end using tokens',
      message: messages.rejected('padding-inline-end', '10px'),
    },
    {
      code: `.foo { padding-block-start: 10px }`,
      description: 'padding-block-start using tokens',
      message: messages.rejected('padding-block-start', '10px'),
    },
    {
      code: `.foo { padding-block-end: 10px }`,
      description: 'padding-block-end using tokens',
      message: messages.rejected('padding-block-end', '10px'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true],
  configSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { gap: $spacing-01 $spacing-01 }`,
      description: 'gap using tokens',
    },
    {
      code: `.foo { gap: $spacing-01}`,
      description: 'gap using single token',
    },
  ],
  reject: [
    {
      code: `.foo { gap: 10px $spacing-01 }`,
      description: 'gap not using token in list',
      message: messages.rejected('gap', '10px $spacing-01'),
    },
    {
      code: `.foo { gap: 10px }`,
      description: 'gap not using a token',
      message: messages.rejected('gap', '10px'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  fix: true,
  config: true,
  reject: [
    {
      code: `@use "@carbon/type" as type; .foo { padding-left: 16px; }`,
      fixed: `@use "@carbon/type" as type; .foo { padding-left: $spacing-05; }`,
      description: `v11 reject and fix 'layout' but and add no prefix`,
      message: messages.rejected('padding-left', '16px'),
    },
    {
      code: `@use "@carbon/layout" as layout; .foo { padding-left: 16px; }`,
      fixed: `@use "@carbon/layout" as layout; .foo { padding-left: $spacing-05; }`,
      description: `v11 reject and fix 'layout' but and add no prefix`,
      message: messages.rejected('padding-left', '16px'),
    },
  ],
});

// testRule({
//   plugins: [plugin],
//   ruleName,
//   customSyntax: 'postcss-scss',
//   fix: true,
//   config: [
//     true,
//     {
//       enforceScopes: true,
//     },
//   ],
//   enforceScopes: true,
//   reject: [
// {
//   code: `@use "@carbon/layout" as layout; .foo { padding-left: 16px; }`,
//   fixed: `@use "@carbon/layout" as layout; .foo { padding-left: $spacing-05; }`,
//   description: `v11 reject and fix 'layout' and enforce prefix`,
//   message: messages.rejected('padding-left', '16px'),
// },
//   ],
// });

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptCarbonCustomProp: true }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.test { padding: var(--cds-spacing-04); }',
      description: 'Accept cds custom property',
    },
    {
      code: `$my-prefix: 'cds'; .test { padding: var(--#{$my-prefix}-spacing-04); }`,
      description: 'Accept cds custom property with a prefix',
    },
    {
      code: `@use @carbon/config as *; .test { padding: var(--#{$prefix}-spacing-04); }`,
      description: 'Accept $prefix custom property with a prefix',
    },
    {
      code: `.test { padding: var(--#{config.$prefix}-spacing-04); }`,
      description: 'Accept config.$prefix custom property with a prefix',
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptCarbonCustomProp: true, carbonPrefix: 'test' }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.test { padding: var(--test-spacing-04); }`,
      description: 'Accept test as prefix for custom property',
    },
    {
      code: `$my-prefix: 'test'; .test { padding: var(--#{$my-prefix}-spacing-04); }`,
      description: 'Accept test as prefix for custom property with a prefix',
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    { acceptCarbonCustomProp: true, acceptValues: ['/^var\\(--abc-other.*/'] },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.test { padding: var(--abc-other-one); }`,
      description: 'Accept non-Carbon custom properties in acceptValues',
    },
  ],
});
