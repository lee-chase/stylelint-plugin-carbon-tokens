/**
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { testRule } from 'stylelint-test-rule-node';
import plugins from '../../../index.js';
const plugin = plugins.find((thing) => thing.ruleName === 'carbon/theme-use');

const {
  rule: { messages, ruleName },
} = plugin;

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      acceptValues: ['/((--)|[$])my-value-accept/', '*'],
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { color: none; }',
      description: 'Accept reset using none',
    },
    {
      code: '.foo { color: inherit; }',
      description: 'Accept reset using inherit',
    },
    {
      code: '.foo { color: initial; }',
      description: 'Accept reset using initial',
    },
    {
      code: '.foo { color: unset; }',
      description: 'Accept reset using unset',
    },
    {
      code: '.foo { color: transparent; }',
      description: 'Accept using transparent',
    },
    {
      code: '.foo { color: $layer-01; }',
      description: 'Carbon theme token accepted.',
    },
    {
      code: '.foo { box-shadow: 0 0 5px $layer-01, 0 0 10px $layer-01; }',
      description: 'All color tokens in split are Carbon theme tokens.',
    },
    {
      code: '$my-value-accept: $layer-01; .foo { color: $my-value-accept; }',
      description:
        'Accept $variable declared before use with Carbon theme tokens.',
    },
    {
      code: ':root {--my-value-accept: $layer-01;} .foo { color: var(--my-value-accept); }',
      description:
        'Accept --variable declared before use with Carbon theme tokens.',
    },
    {
      code: "$block: 'block'; :root {--block-value-accept: $layer-01;} .foo { color: var(--#{$block}-value-accept); }",
      description:
        'Accept --#{block}-variable declared before use with Carbon theme tokens. Cheats on custom property declaration',
    },
    // {
    //   // TODO: fix this - fails to even get into
    //   code: "$block: 'block'; :root {--#{$block}__value-accept: $layer-01;} .foo { color: var(--#{$block}__value-accept); }",
    //   description:
    //     "Accept --#{block}-variable declared before use with Carbon theme tokens."
    // },
    {
      code: '.foo { box-shadow: $layout-01 $layout-01 $layer-01; }',
      description:
        'Position one and two can can be non color variables three of three matches',
    },
    {
      code: '.foo { box-shadow: 0 0 $layout-01 $layer-01; }',
      description:
        'Position three of four can can be non color variables four of four matches',
    },
    {
      code: '.foo { color: $my-value-accept; }',
      description: 'Accept undeclared $variable of defined format',
    },
    {
      code: '.foo { color: var(--my-value-accept); }',
      description: 'Reject undeclared --variable by of defined format.',
    },
  ],

  reject: [
    {
      code: '.foo { background-color: #f4f4f4; }',
      description: 'Used #color instead of Carbon theme token expected.',
      message: messages.rejected('background-color', '#f4f4f4'),
    },
    {
      code: '.foo { box-shadow: 0 0 5px $layer-01, 0 0 10px #fefefe; }',
      description: 'Used #color in a split property not Carbon theme tokens.',
      message: messages.rejected(
        'box-shadow',
        '0 0 5px $layer-01, 0 0 10px #fefefe'
      ),
    },
    {
      code: '.foo { border: 1px solid my-value-fun($layer-01); }',
      description: 'Other functions should fail my-value-fn fails',
      message: messages.rejected('border', '1px solid my-value-fun($layer-01)'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      acceptCarbonColorTokens: true,
      acceptIBMColorTokensCarbonV10Only: true,
    },
  ],
  accept: [],
  reject: [
    {
      code: '.foo { background-color: $carbon--blue-90; }',
      description:
        'Reject using a carbon color token without v10 testOnlyVersion',
      message: messages.rejectedVariable(
        'background-color',
        '$carbon--blue-90',
        'an unknown, undefined or unrecognized value'
      ),
    },
    {
      code: '.foo { background-color: $ibm-color__blue-90; }',
      description: 'Reject using a ibm color token without v10 testOnlyVersion',
      message: messages.rejectedVariable(
        'background-color',
        '$ibm-color__blue-90',
        'an unknown, undefined or unrecognized value'
      ),
    },
  ],
});

// // verify use of v10 carbon color tokens
testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      acceptCarbonColorTokens: true,
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { background-color: $carbon--blue-90; }',
      description: 'Accept using a carbon color token',
    },
    {
      code: '.foo { background-color: $hover-selected-ui; }',
      description: 'Accept using a carbon hoverSelectedUI token',
    },
  ],
  reject: [
    {
      code: '.foo { background-color: $ibm-color__blue-80; }',
      description: 'Reject using a ibm color token',
      message: messages.rejectedVariable(
        'background-color',
        '$ibm-color__blue-80',
        'an unknown, undefined or unrecognized value'
      ),
    },
  ],
});

// verify use of v10 carbon color tokens
testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      acceptIBMColorTokensCarbonV10Only: true,
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { background-color: $ibm-color__blue-90; }',
      description: 'Accept using a ibm color token',
    },
  ],
  reject: [
    // an ibm color token
    {
      code: '.foo { background-color: $carbon--blue-90; }',
      description: 'Reject using a carbon color token',
      message: messages.rejectedVariable(
        'background-color',
        '$carbon--blue-90',
        'an unknown, undefined or unrecognized value'
      ),
    },
  ],
});

// verify use of v10 theme tokens
testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      acceptIBMColorTokensCarbonV10Only: true,
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { background-color: $ui-01; }',
      description: 'Accept v10 theme token in v10 test',
    },
  ],
  reject: [
    // an ibm color token
    {
      code: '.foo { background-color: $layer-01; }',
      description: 'Reject v11 theme token in v10 test',
      message: messages.rejectedVariable(
        'background-color',
        '$layer-01',
        'an unknown, undefined or unrecognized value'
      ),
    },
  ],
});

// verify rejection of undeclared variables
testRule({
  plugins: [plugin],
  ruleName,
  config: [true],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '$my-value-accept: $layer-01; .foo { color: $my-value-accept; }',
      description:
        'Accept $variable declared before use when acceptUndefinedVariables is false.',
    },
    {
      code: '--my-value-accept: $layer-01; .foo { color: var(--my-value-accept); }',
      description:
        'Accept --variable declared before use when acceptUndefinedVariables is false.',
    },
  ],

  reject: [
    // an ibm color token
    {
      code: '.foo { color: $my-value-reject; }',
      description:
        'Reject undeclared $variable when acceptUndefinedVariables is false.',
      message: messages.rejectedUndefinedVariable(
        'color',
        '$my-value-reject',
        'an unknown, undefined or unrecognized value'
      ),
    },
    {
      code: '.foo { color: var(--my-value-reject); }',
      description:
        'Reject undeclared --variable when acceptUndefinedVariables is false.',
      message: messages.rejectedUndefinedVariable(
        'color',
        'var(--my-value-reject)',
        'an unknown, undefined or unrecognized value'
      ),
    },
  ],
});

// verify use of rgba with carbon theme token
testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { background-color: rgba($layer-01, 0.5); }',
      description: 'Accept using a carbon theme token with rgba()',
    },
  ],

  reject: [
    // an ibm color token
    {
      code: '.foo { background-color: rgba(100, 100, 255, 0.5); }',
      description: 'Reject using a non-carbon theme token with rgba()',
      message: messages.rejected(
        'background-color',
        'rgba(100, 100, 255, 0.5)'
      ),
    },
  ],
});

// verify use of full and stroke with carbon theme token
testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { fill: $layer-01; }',
      description: 'Accept carbon theme token for fill property by default',
    },
    {
      code: '.foo { stroke: $layer-01; }',
      description: 'Accept carbon theme token for stroke property by default',
    },
  ],
  reject: [
    {
      code: '.foo { fill: #fefefe; }',
      description: 'Reject non-carbon theme token for fill property by default',
      message: messages.rejected('fill', '#fefefe'),
    },
    {
      code: '.foo { stroke: red; }',
      description:
        'Reject non-carbon theme token for stroke property by default',
      message: messages.rejected('stroke', 'red'),
    },
  ],
});

// accept currentColor can be used as a value
testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.foo { fill: currentColor; }',
      description: 'Accept currentColor on the assumption color is valid',
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      includeProps: ['/\\$.*do-check.*$/', '*'],
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '$do-check-me: $layer-01;',
      description: "Should check '$do-check-me' using a carbon theme token",
    },
    {
      code: '$also-do-check-me-too: $layer-01;',
      description:
        "Should check '$also-do-check-me-too' using a carbon theme token",
    },
    {
      code: '$do-not-check-me-too: $layer-01;',
      description:
        "Should ignore '$do-not-check-me' using a carbon theme token",
    },
  ],
  reject: [
    {
      code: '$do-check-me: red;',
      description:
        "Should check '$do-check-me` not using a carbon theme token'",
      message: messages.rejected('$do-check-me', 'red'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      acceptValues: ['/((--)|[$])my-value-accept/', '*'],
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `
@use '@carbon/theme';

.foo {
  background-color: theme.$layer-01;
};
`,
      description: 'Should accept scoped theme token',
    },
    {
      code: `
@use '@carbon/theme' as my_scope;

.foo {
  background-color: my_scope.$layer-01;
};
`,
      description: 'Should accept named scoped theme token',
    },
    {
      code: `
@use 'carbon-components/scss/globals/scss/_vars.scss';

.foo {
  background-color: vars.$layer-01;
};
`,
      description: 'Should accept named scoped theme token from vars',
    },
    {
      code: `
@use 'carbon-components/scss/globals/scss/_vars.scss' as carbon_vars;

.foo {
  background-color: carbon_vars.$layer-01;
};
`,
      description: 'Should accept named scoped theme token from vars',
    },
    {
      code: "@use '@carbon/theme' as *; background-color: $layer-03;",
      description: 'Should accept global scope with @use',
    },
  ],
  reject: [
    {
      code: 'background-color: other.$layer-01;',
      description: 'Should reject unrecognized scoped theme token',
      message: messages.rejectedUndefinedVariable(
        'background-color',
        'other.$layer-01'
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
      code: `.foo { color: theme.$layer-01; }`,
      description: 'Accept theme scope.',
    },
  ],
  reject: [
    {
      code: `.foo { color: th.$layer-01; }`,
      description: "Reject scope 'th' without acceptScopes setting.",
      message: messages.rejectedUndefinedVariable('color', 'th.$layer-01'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptScopes: ['th'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { color: th.$layer-01; }`,
      description: "Accept scope 'th' with acceptScopes setting.",
    },
  ],
  reject: [
    {
      code: `.foo { color: theme.$layer-01; }`,
      description: 'Reject theme scope with scope setting.',
      message: messages.rejectedUndefinedVariable('color', 'theme.$layer-01'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptScopes: ['th', '*'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { color: th.$layer-01; }`,
      description: "Accept scope 'th' with acceptScopes setting.",
    },
    {
      code: `.foo { color: theme.$layer-01; }`,
      description: 'Accept theme scope with scope setting including default.',
    },
  ],
  reject: [
    {
      code: `.foo { color: reject.$layer-01; }`,
      description: 'Reject scope not included in scope setting.',
      message: messages.rejectedUndefinedVariable('color', 'reject.$layer-01'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptScopes: ['/^th(eme)?$/'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { color: th.$layer-01; }`,
      description: "Accept scope 'th' with acceptScopes regex setting.",
    },
    {
      code: `.foo { color: theme.$layer-01; }`,
      description:
        'Accept theme scope with scope regex setting including default.',
    },
  ],
  reject: [
    {
      code: `.foo { color: reject.$layer-01; }`,
      description: 'Reject scope not included in scope regex setting.',
      message: messages.rejectedUndefinedVariable('color', 'reject.$layer-01'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptScopes: ['**'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { color: abc.$layer-01; border-color: zyx.$layer-01; }`,
      description: "All scopes ['**'].",
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
      code: `.foo { color: $button-danger-primary; }`,
      description: 'Accept theme token button danger primary.',
    },
    {
      code: `.foo { color: theme.$button-danger-primary; }`,
      description: 'Accept theme token button danger primary with theme.',
    },
  ],
});

// test v10 to 11 updated fixes
testRule({
  plugins: [plugin],
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  fix: true,
  reject: [
    // {
    //   code: ".foo { color: $active-danger; }",
    //   description: "Reject v10 theme token $active-danger",
    //   fixed: ".foo { color: $button-danger-active; }"
    // },
    {
      code: '.foo { color: $danger; }',
      description: 'Reject v10 theme token $danger',
      message: messages.rejectedUndefinedVariable('color', '$danger'),
      fixed: '.foo { color: $button-danger-primary; }',
    },
    {
      code: '.foo { color: $hover-row; }',
      description: 'Reject v10 theme token $hover-row',
      message: messages.rejectedUndefinedVariable('color', '$hover-row'),
      fixed: '.foo { color: $layer-hover-01; }',
    },
    {
      code: '.foo { border-color: $decorative-01; }',
      description: 'Reject v10 theme token $decorative-01',
      message: messages.rejectedUndefinedVariable(
        'border-color',
        '$decorative-01'
      ),
      fixed: '.foo { border-color: $border-subtle-02; }',
    },
    {
      code: '.foo { color: $active-ui; }',
      description: 'Reject v10 theme token $active-ui and fix color',
      message: messages.rejectedUndefinedVariable('color', '$active-ui'),
      fixed: '.foo { color: $layer-active-01; }',
    },
    {
      code: '.foo { background-color: $active-ui; }',
      description: 'Reject v10 theme token $active-ui and fix background-color',
      message: messages.rejectedUndefinedVariable(
        'background-color',
        '$active-ui'
      ),
      fixed: '.foo { background-color: $background-active; }',
    },
    {
      code: '.foo { color: $disabled-02; }',
      description: 'Reject v10 theme token $disabled-02 and fix color',
      message: messages.rejectedUndefinedVariable('color', '$disabled-02'),
      fixed: '.foo { color: $text-disabled; }',
    },
    {
      code: '.foo { box-shadow: 2px 2px 10px 10px $disabled-02; }',
      description: 'Reject v10 theme token $disabled-02 and fix box-shadow',
      message: messages.rejectedUndefinedVariable('box-shadow', '$disabled-02'),
      fixed: '.foo { box-shadow: 2px 2px 10px 10px $border-disabled; }',
    },
    {
      code: '.foo { border: 2px 2px 10px 10px solid $disabled-02; }',
      description: 'Reject v10 theme token $disabled-02 and fix border',
      message: messages.rejectedUndefinedVariable('border', '$disabled-02'),
      fixed: '.foo { border: 2px 2px 10px 10px solid $border-disabled; }',
    },
    {
      code: '.foo { outline: 2px $disabled-02; }',
      description: 'Reject v10 theme token $disabled-02 and fix outline',
      message: messages.rejectedUndefinedVariable('outline', '$disabled-02'),
      fixed: '.foo { outline: 2px $border-disabled; }',
    },
    // {
    //   code: "@use '@carbon/theme'; .foo { color: $active-danger; }",
    //   description: "Reject v10 theme token $active-danger but fix with scope",
    //   fixed:
    //     "@use '@carbon/theme'; .foo { color: theme.$button-danger-active; }"
    // },
    // {
    //   code: "@use '@carbon/theme' as carbon_theme; .foo { color: $active-danger; }",
    //   description:
    //     "Reject v10 theme token $active-danger but fix with carbon_theme scope",
    //   fixed:
    //     "@use '@carbon/theme' as carbon_theme; .foo { color: carbon_theme.$button-danger-active; }"
    // },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { enforceScopes: true }],
  customSyntax: 'postcss-scss',
  fix: true,
  reject: [
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as carbon_theme; .foo { background-color: $active-danger; }",
      description:
        'Reject v10 theme token $active-danger but fix with carbon_theme scope ignoring other scopes',
      message: messages.rejectedUndefinedVariable(
        'background-color',
        '$active-danger'
      ),
      fixed:
        "@use '@carbon/layout'; @use '@carbon/theme' as carbon_theme; .foo { background-color: carbon_theme.$button-danger-active; }",
    },
  ],
});

// tests that only pass in v10
testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-10',
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: ".foo { border: 1px solid get-light-value('layer-01'); }",
      description: 'Permitted function get-light-value passes',
    },
  ],
});

// test v10 to 11 updated fixes preferring context
// NOTE: Does not appear to currently be exported or well defined
// ^^^^^
// testRule({
//   plugins: [plugin],ruleName,
//   config: [true, { preferContextFixes: true }],
//   customSyntax: "postcss-scss",
//   fix: true,
//   reject: [
//     {
//       code: ".foo { border-color: $decorative-01; }",
//       description: "Reject v10 theme token $decorative-01 preferring context",
//       fixed: ".foo { border-color: $border-subtle; }"
//     }
//   ]
// });

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      carbonPath: 'node_modules/@carbon',
      carbonModulePostfix: '-11-4',
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { color: $button-danger-primary; }`,
      description:
        'Accept theme token button danger primary in 11-4 pre unstable_metadata.',
    },
    {
      code: `.foo { color: theme.$button-danger-primary; }`,
      description:
        'Accept theme token button danger primary with theme. in 11-4 pre unstable_metadata.',
    },
  ],
});

// enforceScopes test
testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      enforceScopes: true,
      acceptScopes: ['theme'],
    },
  ],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: "@use '@carbon/theme' as *; background-color: $layer-03;",
      description: 'Should accept * when @use enforced',
    },
    {
      code: "@use '@carbon/theme' as rename_theme; background-color: rename_theme.$layer-03;",
      description: 'Should accept renamed scope when @use enforced',
    },
  ],
  reject: [
    {
      code: 'background-color: $layer-03;',
      description: 'Should reject global scope without when @use enforced',
      message: messages.rejectedUndefinedVariable(
        'background-color',
        '$layer-03'
      ),
    },
  ],
});

/* tests not specific to rule */
testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true],
  accept: [
    {
      code: "@use '@from-else-where/theme' as *; background-color: $layer-03;",
      description:
        'Should accept theme * scope that matches acceptScopes from elsewhere when not enforced',
    },
    {
      code: "@use '@from-else-where/theme' as *; background-color: theme.$layer-03;",
      description:
        'Should accept theme scope that is from elsewhere when not enforced',
    },
    {
      code: "@use '@from-else-where/themez' as *; background-color: $layer-03;",
      description:
        'Should reject themez * scope that does not match acceptScopes from elsewhere when not enforced',
    },
  ],
  reject: [
    {
      code: "@use '@from-else-where/themez' as *; background-color: themez.$layer-03;",
      description:
        'Should reject themez scope that does not match acceptScopes from elsewhere when not enforced',
      message: messages.rejectedUndefinedVariable(
        'background-color',
        'themez.$layer-03'
      ),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true, { enforceScopes: true }],
  reject: [
    {
      code: "@use '@from-else-where/theme' as *; background-color: $layer-03;",
      description:
        'Should reject theme * scope that is from elsewhere when enforced',
      message: messages.rejectedUndefinedVariable(
        'background-color',
        '$layer-03'
      ),
    },
    {
      code: "@use '@from-else-where/theme'; background-color: theme.$layer-03;",
      description:
        'Should reject theme scope that is from elsewhere when enforced',
      message: messages.rejectedUndefinedVariable(
        'background-color',
        'theme.$layer-03'
      ),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      acceptValues: ['banana'],
      experimentalFixTheme: 'g10',
    },
  ],
  customSyntax: 'postcss-scss',
  fix: true,
  accept: [
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: $background /* hello */ ; }",
      description: 'Copes with closed comments',
    },
    {
      code: `@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: $background /* hello
      */ ;
    }
      `,
      description: 'Copes with comments not closed on the same line',
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true],
  customSyntax: 'postcss-scss',
  reject: [
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: #f4f4f4; }",
      description: 'Reject raw color value carbon background',
      message: messages.rejected('background-color', '#f4f4f4'),
    },
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: #0f62fe; }",
      description: 'Reject raw color value carbon background-brand token',
      message: messages.rejected('background-color', '#0f62fe'),
    },
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: #0f62fe; }",
      description: 'Reject raw color value carbon button token',
      message: messages.rejected('background-color', '#0f62fe'),
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      experimentalFixTheme: 'g10',
    },
  ],
  customSyntax: 'postcss-scss',
  fix: true,
  reject: [
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: #f4f4f4; }",
      description:
        'Reject to fix raw color value and try to fix with carbon token',
      message: messages.rejected('background-color', '#f4f4f4'),
      fixed:
        "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: $background /* fix: see notes */; }",
    },
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: #0f62fe; }",
      description:
        'Reject to fix raw color value and try to fix with carbon background-brand token',
      message: messages.rejected('background-color', '#0f62fe'),
      fixed:
        "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: $background-brand /* fix: see notes */; }",
    },
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: #002d9c; }",
      description:
        'Reject raw color value and try to fix with carbon button token',
      message: messages.rejected('background-color', '#002d9c'),
      fixed:
        "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: $button-primary-active /* fix: see notes */; }",
    },
    {
      code: "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: #bae6ff; }",
      description:
        'Reject raw color value and try to fix with carbon tag theme teal token',
      message: messages.rejected('background-color', '#bae6ff'),
      fixed:
        "@use '@carbon/layout'; @use '@carbon/theme' as *; .foo { background-color: $tag-background-cyan; }",
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { acceptCarbonCustomProp: true }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: '.test { background: var(--cds-layer-01); }',
      description: 'Accept cds custom property',
    },
    {
      code: `$my-prefix: 'cds'; .test { background: var(--#{$my-prefix}-layer-01); }`,
      description: 'Accept cds custom property with a prefix',
    },
    {
      code: `@use @carbon/config as *; .test { background: var(--#{$prefix}-layer-01); }`,
      description: 'Accept $prefix custom property with a prefix',
    },
    {
      code: `.test { background: var(--#{config.$prefix}-layer-01); }`,
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
      code: `.test { background: var(--test-layer-01); }`,
      description: 'Accept test as prefix for custom property',
    },
    {
      code: `$my-prefix: 'test'; .test { background: var(--#{$my-prefix}-layer-01); }`,
      description: 'Accept test as prefix for custom property with a prefix',
    },
  ],
});
