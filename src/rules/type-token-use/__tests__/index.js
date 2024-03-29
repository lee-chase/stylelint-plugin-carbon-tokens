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
      code: '.foo { font-style: none; }',
      description: 'Accept reset using none',
    },
    {
      code: '.foo { font-style: inherit; }',
      description: 'Accept reset using inherit',
    },
    {
      code: '.foo { font-style: initial; }',
      description: 'Accept reset using initial',
    },
    {
      code: '.foo { font-style: unset; }',
      description: 'Accept reset using unset',
    },
  ], // there are not type tokens used directly
  reject: [
    {
      code: '.foo { font-style: italic; }',
      description: 'Reject directly setting font-style',
      message: messages.rejected,
    },
    {
      code: '.foo { font-variant: small-caps; }',
      description: 'Reject directly setting font-weight',
      message: messages.rejected,
    },
    {
      code: '.foo { font-weight: 5px; }',
      description: 'Reject directly setting font-weight',
      message: messages.rejected,
    },
    {
      code: '.foo { font-size: 32px; }',
      description: 'Reject directly setting font-size',
      message: messages.rejected,
    },
    {
      code: '.foo { line-height: 32px; }',
      description: 'Reject directly setting line-height',
      message: messages.rejected,
    },
    {
      code: `.foo { font-family: "Times New Roman", Times, serif; }`,
      description: 'Reject directly setting font-family',
      message: messages.rejected,
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonTypeScaleFunction: true,
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { font-size: type-scale(1); }',
      description: 'Permit Carbon type scale function.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonFontFamilyFunction: true,
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { font-family: font-family(1); }',
      description: 'Permit Carbon font family function.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonFontWeightFunction: true,
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: ".foo { font-weight: font-weight('bold'); }",
      description: 'Permit Carbon font weight function.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonTypeScaleFunction: true,
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { font-size: carbon--type-scale(1); }',
      description: 'Permit Carbon v10 type scale function.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonFontFamilyFunction: true,
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { font-family: carbon--font-family(1); }',
      description: 'Permit v10 Carbon font family function.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonFontWeightFunction: true,
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: ".foo { font-weight: carbon--font-weight('bold'); }",
      description: 'Permit v10 Carbon font weight function.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [true, {}],
  customSyntax: 'postcss-scss',
  accept: [],
  reject: [
    {
      code: ".foo { font-weight: carbon--font-weight('light'); }",
      description: 'Reject v10 Carbon font weight function.',
      message: messages.rejected,
    },
    {
      code: ".foo { font-weight: carbon--font-weight('light'); }",
      description: 'Reject v10 Carbon font weight function.',
      message: messages.rejected,
    },
    {
      code: ".foo { font-weight: carbon--font-weight('light'); }",
      description: 'Reject v10 Carbon font weight function.',
      message: messages.rejected,
    },
    {
      code: ".foo { font-weight: font-weight('light'); }",
      description: 'Reject Carbon font weight function.',
      message: messages.rejected,
    },
    {
      code: ".foo { font-weight: font-weight('light'); }",
      description: 'Reject Carbon font weight function.',
      message: messages.rejected,
    },
    {
      code: ".foo { font-weight: font-weight('light'); }",
      description: 'Reject Carbon font weight function.',
      message: messages.rejected,
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [
    true,
    {
      acceptCarbonFontFamilyFunction: true,
      acceptCarbonFontWeightFunction: true,
      acceptCarbonTypeScaleFunction: true,
    },
  ],
  customSyntax: 'postcss-scss',
  fix: true,
  accept: [],
  reject: [
    {
      code: ".foo { font-weight: carbon--font-weight('light'); }",
      fixed: ".foo { font-weight: font-weight('light'); }",
      description: 'Reject v10 Carbon font weight function.',
      message: messages.rejected,
    },
    {
      code: ".foo { font-weight: carbon--font-weight('light'); }",
      fixed: ".foo { font-weight: font-weight('light'); }",
      description: 'Reject v10 Carbon font weight function.',
      message: messages.rejected,
    },
    {
      code: ".foo { font-weight: carbon--font-weight('light'); }",
      fixed: ".foo { font-weight: font-weight('light'); }",
      description: 'Reject v10 Carbon font weight function.',
      message: messages.rejected,
    },
  ],
});
