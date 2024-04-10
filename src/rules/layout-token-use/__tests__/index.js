/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rule, { ruleName } from '../index.js';

const generatedTests = () => {
  const accept = [];
  const reject = [];
  const props = ['margin'];
  const good = [
    '$spacing-01',
    '-$spacing-01',
    '$spacing-01',
    '-100%',
    '100%',
    '50%',
    '-100vw',
    '100vw',
    '50vw',
    '-100vh',
    '100vh',
    '50vh',
    '0xxx',
    '$my-value-accept',
    'var(--my-value-accept)',
  ];
  const bad = [
    '$container-01', // only bad for default options
    '$fluid-spacing-01',
    '$icon-size-01',
    '$container-01',
    '$fluid-spacing-01',
    '$icon-size-01',
    '199px',
    '299px',
    '399px',
    '499px',
    '$my-value-reject',
    'var(--my-value-reject)',
  ];

  for (const prop of props) {
    for (let g = 0; g < good.length - 4; g++) {
      // good tokens
      for (let n = 1; n < 5; n++) {
        const tokens = `${good.slice(g, g + n).join(' ')}`;

        // number of values
        accept.push({
          code: `.foo { ${prop}: ${tokens}; }`,
          description: `A ${prop} using tokens "${tokens}" is accepted`,
        });
      }
    }

    for (let b = 0; b < bad.length - 4; b++) {
      // bad tokens
      for (let n = 1; n < 5; n++) {
        const tokens = `${bad.slice(b, b + n).join(' ')}`;

        // number of values
        reject.push({
          code: `.foo { ${prop}: ${tokens}; }`,
          description: `A ${prop} using non-token(s) "${tokens}" is rejected`,
        });
      }
    }
  }

  const moreProps = ['left', 'top', 'bottom', 'right'];

  for (const prop of moreProps) {
    accept.push({
      code: `.foo { ${prop}: ${good[0]}; }`,
      description: `A ${prop} using a token "${good[0]}" is accepted.`,
    });
    reject.push({
      code: `.foo { ${prop}: ${bad[0]}; }`,
      description: `A ${prop} using a non-token "${bad[0]}" is rejected.`,
    });
  }

  return { accept, reject };
};

const theGeneratedTests = generatedTests();

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    {
      acceptValues: ['/((--)|[$])my-value-accept/', '*'],
    },
  ],

  accept: theGeneratedTests.accept,
  reject: theGeneratedTests.reject,
});

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    {
      acceptContainerTokens: true,
    },
  ],
  accept: [
    {
      code: `.foo { left: $container-01; }`,
      description: `Accept $container tokens with acceptContainerTokens: true.`,
    },
    {
      code: `.foo { left: $container-01; }`,
      description: `Accept $container tokens with acceptContainerTokens: true.`,
    },
  ],
  reject: [],
});

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    {
      acceptIconSizeTokens: true,
    },
  ],

  accept: [
    {
      code: `.foo { left: $icon-size-01; }`,
      description: `Accept $icon-size tokens with acceptIconSizeTokens: true.`,
    },
    {
      code: `.foo { left: $icon-size-01; }`,
      description: `Accept $icon-size tokens with acceptIconSizeTokens: true.`,
    },
  ],
  reject: [],
});

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: [
    true,
    {
      acceptFluidSpacingTokens: true,
    },
  ],

  accept: [
    {
      code: `.foo { left: $fluid-spacing-01; }`,
      description: `Accept $fluid-spacing tokens with acceptFluidSpacingTokens: true.`,
    },
    {
      code: `.foo { left: $fluid-spacing-01; }`,
      description: `Accept $fluid-spacing tokens with acceptFluidSpacingTokens: true.`,
    },
  ],
  reject: [],
});

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true, { acceptCarbonMiniUnitsFunction: true }],

  reject: [
    {
      code: `.foo { left: mini-units(4); }`,
      description: `Reject mini-units in v11`,
    },
    {
      code: `.foo { padding: carbon--mini-units(2) }`,
      description: `Reject Carbon-mini-units in v11.`,
    },
  ],
});

testRule(rule, {
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

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true, { carbonPath: 'node_modules/@carbon', carbonModulePostfix: '-10' }],
  accept: [
    {
      code: `.foo { left: $carbon--spacing-04; }`,
      description: `v10 test: Accept 'carbon--' prefix.`,
    },
  ],
});

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  fix: true,
  config: [
    true,
    {
      acceptContainerTokens: true,
      acceptFluidSpacingTokens: true,
      acceptIconSizeTokens: true,
    },
  ],
  reject: [
    {
      code: `.foo { left: $carbon--layout-04; }`,
      fixed: `.foo { left: $spacing-09; }`,
      description: `v11 reject and fix 'layout' in favor of 'spacing'`,
    },
    {
      code: `.foo { left: $carbon--spacing-04; }`,
      fixed: `.foo { left: $spacing-04; }`,
      description: `v11 reject and fix 'carbon--' prefix for spacing.`,
    },
    {
      code: `.foo { left: $carbon--icon-size-02; }`,
      fixed: `.foo { left: $icon-size-02; }`,
      description: `v11 reject and fix 'carbon--' prefix for icon-size.`,
    },
    {
      code: `.foo { left: $carbon--fluid-spacing-04; }`,
      fixed: `.foo { left: $fluid-spacing-04; }`,
      description: `v11 reject and fix 'carbon--' prefix for fluid-spacing.`,
    },
    {
      code: `.foo { left: $carbon--container-04; }`,
      fixed: `.foo { left: $container-04; }`,
      description: `v11 reject and fix 'carbon--' prefix for container.`,
    },
    {
      code: `.foo { left: $carbon--size-small; }`,
      fixed: `.foo { left: $size-small; }`,
      description: `v11 reject and fix 'carbon--' prefix for size.`,
    },
    {
      code: `.foo { left: 0.125rem; }`,
      fixed: `.foo { left: $spacing-01; }`,
      description: `Reject and fix 0.125rem in favour of $spacing-01.`,
    },
    {
      code: `.foo { left: 2px; }`,
      fixed: `.foo { left: $spacing-01; }`,
      description: `Reject and fix 2px in favour of $spacing-01.`,
    },
    {
      code: `.foo { left: 0.25rem; }`,
      fixed: `.foo { left: $spacing-02; }`,
      description: `Reject and fix 0.25rem in favour of $spacing-02.`,
    },
    {
      code: `.foo { left: 4px; }`,
      fixed: `.foo { left: $spacing-02; }`,
      description: `Reject and fix 4px in favour of $spacing-02.`,
    },
    {
      code: `.foo { left: 0.5rem; }`,
      fixed: `.foo { left: $spacing-03; }`,
      description: `Reject and fix 0.5rem in favour of $spacing-03.`,
    },
    {
      code: `.foo { left: 8px; }`,
      fixed: `.foo { left: $spacing-03; }`,
      description: `Reject and fix 8px in favour of $spacing-03.`,
    },
    {
      code: `.foo { left: 0.75rem; }`,
      fixed: `.foo { left: $spacing-04; }`,
      description: `Reject and fix 0.75rem in favour of $spacing-04.`,
    },
    {
      code: `.foo { left: 12px; }`,
      fixed: `.foo { left: $spacing-04; }`,
      description: `Reject and fix 12px in favour of $spacing-04.`,
    },
    {
      code: `.foo { left: 1rem; }`,
      fixed: `.foo { left: $spacing-05; }`,
      description: `Reject and fix 1rem in favour of $spacing-05.`,
    },
    {
      code: `.foo { left: 16px; }`,
      fixed: `.foo { left: $spacing-05; }`,
      description: `Reject and fix 16px in favour of $spacing-05.`,
    },
    {
      code: `.foo { left: 1.5rem; }`,
      fixed: `.foo { left: $spacing-06; }`,
      description: `Reject and fix 1.5rem in favour of $spacing-06.`,
    },
    {
      code: `.foo { left: 24px; }`,
      fixed: `.foo { left: $spacing-06; }`,
      description: `Reject and fix 24px in favour of $spacing-06.`,
    },
    {
      code: `.foo { left: 2rem; }`,
      fixed: `.foo { left: $spacing-07; }`,
      description: `Reject and fix 2rem in favour of $spacing-07.`,
    },
    {
      code: `.foo { left: 32px; }`,
      fixed: `.foo { left: $spacing-07; }`,
      description: `Reject and fix 32px in favour of $spacing-07.`,
    },
    {
      code: `.foo { left: 2.5rem; }`,
      fixed: `.foo { left: $spacing-08; }`,
      description: `Reject and fix 2.5rem in favour of $spacing-08.`,
    },
    {
      code: `.foo { left: 40px; }`,
      fixed: `.foo { left: $spacing-08; }`,
      description: `Reject and fix 40px in favour of $spacing-08.`,
    },
    {
      code: `.foo { left: 3rem; }`,
      fixed: `.foo { left: $spacing-09; }`,
      description: `Reject and fix 3rem in favour of $spacing-09.`,
    },
    {
      code: `.foo { left: 48px; }`,
      fixed: `.foo { left: $spacing-09; }`,
      description: `Reject and fix 48px in favour of $spacing-09.`,
    },
    {
      code: `.foo { left: 4rem; }`,
      fixed: `.foo { left: $spacing-10; }`,
      description: `Reject and fix 4rem in favour of $spacing-10.`,
    },
    {
      code: `.foo { left: 64px; }`,
      fixed: `.foo { left: $spacing-10; }`,
      description: `Reject and fix 64px in favour of $spacing-10.`,
    },
    {
      code: `.foo { left: 5rem; }`,
      fixed: `.foo { left: $spacing-11; }`,
      description: `Reject and fix 5rem in favour of $spacing-11.`,
    },
    {
      code: `.foo { left: 80px; }`,
      fixed: `.foo { left: $spacing-11; }`,
      description: `Reject and fix 80px in favour of $spacing-11.`,
    },
    {
      code: `.foo { left: 6rem; }`,
      fixed: `.foo { left: $spacing-12; }`,
      description: `Reject and fix 6rem in favour of $spacing-12.`,
    },
    {
      code: `.foo { left: 96px; }`,
      fixed: `.foo { left: $spacing-12; }`,
      description: `Reject and fix 96px in favour of $spacing-12.`,
    },
    {
      code: `.foo { left: 10rem; }`,
      fixed: `.foo { left: $spacing-13; }`,
      description: `Reject and fix 10rem in favour of $spacing-13.`,
    },
    {
      code: `.foo { left: 160px; }`,
      fixed: `.foo { left: $spacing-13; }`,
      description: `Reject and fix 160px in favour of $spacing-13.`,
    },
    {
      code: `.foo { margin: 160px 10rem 4px 2rem; }`,
      fixed: `.foo { margin: $spacing-13 $spacing-13 $spacing-02 $spacing-07; }`,
      description: `Reject and fix multiple literal sizes and fix matches.`,
    },
    {
      code: `.foo { margin: 160px $carbon--spacing-13 4px 2rem; }`,
      fixed: `.foo { margin: $spacing-13 $spacing-13 $spacing-02 $spacing-07; }`,
      description: `Reject and fix different cases.`,
    },
    {
      code: `.foo { margin: 160px $carbon--spacing-13 2rem 2rem; }`,
      fixed: `.foo { margin: $spacing-13 $spacing-13 $spacing-07 $spacing-07; }`,
      description: `Reject and fix different cases again.`,
    },
    {
      code: `.foo { margin: 160px $not-a-token 4px 2rem; }`,
      fixed: `.foo { margin: 160px $not-a-token 4px 2rem; }`,
      description: `Reject partial fixes literal sizes and fix matches.`,
    },
  ],
});

testRule(rule, {
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
    {
      code: `.foo { left: mini-units(4); }`,
      description: `v10 test: A left using a mini-units is accepted with option.`,
    },
  ],
});

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: [true, { carbonPath: 'node_modules/@carbon', carbonModulePostfix: '-10' }],
  reject: [
    {
      code: `.foo { left: mini-units(4); }`,
      description: `v10 test: A left using a mini-units is rejected without option "acceptCaronMiniUnitsFunction`,
    },
    {
      code: `.foo { left: mini-units(4); }`,
      description: `v10 test: A left using a mini-units is rejected without option "acceptCaronMiniUnitsFunction`,
    },
  ],
});

testRule(rule, {
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

testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: true,
  reject: [
    {
      code: `.foo { transform: translate(-20px, -1em); }`,
      description: `Reject translate not using layout tokens`,
    },
    {
      code: `.foo { transform: translate(-20px, $spacing-06); }`,
      description: `Reject translate not using layout tokens for first param`,
    },
    {
      code: `.foo { transform: translate($spacing-06, -20px); }`,
      description: `Reject translate not using layout tokens for second param`,
    },
    {
      code: `.foo { transform: translateX(-20px); }`,
      description: `Reject translateX not using layout tokens`,
    },
    {
      code: `.foo { transform: translateY(-20px); }`,
      description: `Reject translateY not using layout tokens`,
    },
  ],
});

// Normal maths
testRule(rule, {
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
    },
    {
      code: `.foo { right: calc(100px + #{$spacing-01}); }`,
      description: `Reject calc(px + $)`,
    },
    {
      code: `.foo { right: calc(100px + 100px); }`,
      description: `Reject calc(px - px)`,
    },
    {
      code: `.foo { right: calc(#{$spacing-01} + #{$spacing-01}); }`,
      description: `Reject calc($ - $)`,
    },
    {
      // This test case is not supported as it would otherwise allow any value to be created from a token
      code: `.foo { right: calc(#{$spacing-01} * 1.5); }`,
      description: `Reject calc($ * number)`,
    },
    {
      code: `.foo { right: calc(50% - 8px); }`,
      description: `Reject calc(% - px)`,
    },
    {
      code: `.foo { $arbitrary-pixel-size: 3.14159265; left: calc(#{$arbitrary-pixel-size} * #{$spacing-01} / 2) }`,
      description: 'Reject calc(N * $ / N)',
    },
  ],
});

testRule(rule, {
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
    },
    {
      code: `--test--breadcrumb-title-top: $spacing-02; .foo { top: var(--#{$block-class}--breadcrumb-title-top); }`,
      description: `Reject undefined SCSS var constructing a CSS custom prop with preprocessor in name if undeclared and undefined variables is off`,
    },
  ],
});

testRule(rule, {
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
    },
    {
      code: `--test--breadcrumb-title-top: $spacing-02; .foo { top: var(--#{$block-class}--breadcrumb-title-top); }`,
      description: `Reject undefined SCSS var constructing a CSS custom prop with preprocessor in name if undeclared and undefined variables is on`,
    },
  ],
});

// Odd maths checks
testRule(rule, {
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
testRule(rule, {
  ruleName,
  customSyntax: 'postcss-scss',
  config: true,
  reject: [
    {
      code: `.foo { $body--height: 400px; top: -($body--height - $spacing-05); }`,
      description: `Reject non-supported maths of form $x: 1px; -($x - $token)`,
    },
    {
      code: `.foo { top: -($body--height - $spacing-05); }`,
      description: `Reject non-supported maths of form -($unknown - $token)`,
    },
    {
      code: `.foo { $body--height: 400px; top: ($body--height - $spacing-05); }`,
      description: `Reject non-supported maths of form $x: 1px; ($x - $token)`,
    },
    {
      code: `.foo { top: ($body--height - $spacing-05); }`,
      description: `Reject non-supported maths of form ($unknown - $token)`,
    },
    {
      code: `.foo { $body--height: 400px; top: $body--height - $spacing-05; }`,
      description: `Reject non-supported maths of form $x: 1px; $x - $token`,
    },
    {
      code: `.foo { top: $body--height - $spacing-05; }`,
      description: `Reject non-supported maths of form $unknown - $token`,
    },
    {
      code: `.foo {margin-top: 1 + map-get($map: (key: 1rem), $key: key);}`,
      description: 'Reject 1 + map-get',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: true,
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { transform: translate3d($spacing-04, $spacing-04, 100px)}`,
      description: 'Accept translate3d with first two parameters as carbon tokens.',
    },
  ],
  reject: [
    {
      code: `.foo { transform: translate3d(100px, $spacing-04, 100px)}`,
      description: 'Reject translate3d with first parameter not a carbon token.',
    },
    {
      code: `.foo { transform: translate3d($spacing-04, 100px, 100px)}`,
      description: 'Reject translate3d with second parameter not a carbon token.',
    },
    {
      code: `.foo { transform: translate3d(100px, 100px, 100px)}`,
      description: 'Reject translate3d with neither first two parameters carbon tokens.',
    },
  ],
});

// Scope tests
testRule(rule, {
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
    },
    {
      code: `.foo { transform: translate3d(la.$spacing-04, la.$spacing-04, layout.$spacing-04)}`,
      description: "Reject scope 'la' without acceptScopes setting in translation.",
    },
  ],
});

testRule(rule, {
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
      description: "Accept scope 'la' with acceptScopes setting in translation.",
    },
  ],
  reject: [
    {
      code: `.foo { left: layout.$spacing-05; }`,
      description: 'Reject layout scope with scope setting.',
    },
    {
      code: `.foo { transform: translate3d(layout.$spacing-04, layout.$spacing-04, layout.$spacing-04)}`,
      description: 'Reject layout scope in function with scope setting.',
    },
  ],
});

testRule(rule, {
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
      description: "Accept scope 'la' with acceptScopes setting in translatio.n",
    },
    {
      code: `.foo { left: layout.$spacing-05; }`,
      description: 'Accept layout scope with scope setting including default.',
    },
    {
      code: `.foo { transform: translate3d(layout.$spacing-04, layout.$spacing-04, layout.$spacing-04)}`,
      description: 'Accept layout scope in function with scope setting including default.',
    },
  ],
  reject: [
    {
      code: `.foo { left: reject.$spacing-05; }`,
      description: 'Reject scope not included in scope setting.',
    },
  ],
});

testRule(rule, {
  ruleName,
  config: [true, { acceptScopes: ['/^la(yout)?$/'] }],
  customSyntax: 'postcss-scss',
  accept: [
    {
      code: `.foo { left: la.$spacing-05; }`,
      description: "Accept scope 'la' with acceptScopes regex setting.",
    },
    {
      code: `.foo { transform: translate3d(la.$spacing-04, la.$spacing-04, layout.$spacing-04)}`,
      description: "Accept scope 'la' with acceptScopes regex setting in translation.",
    },
    {
      code: `.foo { left: layout.$spacing-05; }`,
      description: 'Accept layout scope with scope regex setting including default.',
    },
    {
      code: `.foo { transform: translate3d(layout.$spacing-04, layout.$spacing-04, layout.$spacing-04)}`,
      description: 'Accept layout scope in function with scope regex setting including default.',
    },
  ],
  reject: [
    {
      code: `.foo { left: reject.$spacing-05; }`,
      description: 'Reject scope not included in scope regex setting.',
    },
  ],
});

testRule(rule, {
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
