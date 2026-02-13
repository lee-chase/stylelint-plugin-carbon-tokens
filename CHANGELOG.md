# Changelog

## 5.0.0-alpha.14 (2026-02-13)

### ✨ Features

- **Component-Specific Variables**: Added `validateVariables` option to accept
  project-specific design tokens
  - New option `validateVariables` allows specifying patterns for
    component-specific SCSS variables and CSS custom properties
  - Supports exact matches: `['$c4p-spacing-01', '--my-component-color']`
  - Supports regex patterns: `['/^\\$c4p-/', '/^--my-component-/']`
  - Different from `acceptUndefinedVariables`: validates AND accepts specific
    patterns instead of accepting all undefined variables
  - Useful for Carbon for IBM Products variables or custom component libraries

### 📝 Use Cases

Accept component library variables while still validating against Carbon tokens:

```scss
.component {
  // ✅ Accepted - matches validateVariables pattern
  margin: $c4p-spacing-01;
  padding: var(--my-component-spacing);

  // ❌ Rejected - doesn't match pattern
  margin: $other-spacing;
}
```

### 🔧 Configuration

```js
{
  'carbon/layout-use': [true, {
    validateVariables: [
      '/^\\$c4p-/',              // Carbon for IBM Products variables
      '/^--my-component-/'       // Custom component variables
    ]
  }]
}
```

## 5.0.0-alpha.13 (2026-02-13)

### ✨ Features

- **Local Variable Tracking**: Added `trackFileVariables` option to resolve
  file-level SCSS variable declarations
  - New option `trackFileVariables` (default: `true` for v4 compatibility)
    enables tracking and resolution of local SCSS variables
  - Supports simple variable declarations: `$indicator-width: $spacing-02;`
  - Supports variable chains (transitive resolution):
    `$base: $spacing-03; $derived: $base;`
  - Works with calc() expressions: `calc(-1 * $indicator-height)`
  - Works with negative variables: `-$indicator-width`
  - Works with multiple variables in one value: `$spacing-05 $indicator-width`
  - Variables must be declared before use (module-level only)
  - Variables are resolved when stored, enabling efficient lookups

### 📝 Use Cases

This feature is designed for projects that use local variable abstractions over
Carbon tokens:

```scss
@use '@carbon/styles/scss/spacing' as *;

// Declare local variables
$indicator-width: $spacing-02;
$indicator-height: $spacing-05;

.component {
  width: $indicator-width; // ✅ Resolves to $spacing-02
  height: $indicator-height; // ✅ Resolves to $spacing-05
  inset-block-end: calc(-1 * $indicator-height); // ✅ Works in calc()
  margin-inline: -$indicator-width; // ✅ Works with negatives
}
```

### 🔧 Configuration

**Enabled by default** for v4 compatibility. To disable:

```js
{
  'carbon/layout-use': [true, {
    trackFileVariables: false
  }]
}
```

**Note**: The `strict` preset disables `trackFileVariables` to enforce direct
Carbon token usage without local variable abstractions.

### 🐛 Bug Fixes

- **Transform Functions**: Fixed validation of negative SCSS variables in
  transform functions (e.g., `translateY(-$spacing-04)`)
  - `isValidSpacingValue()` now properly handles negative variables by stripping
    the leading `-` before token lookup
  - Affects `translateX()`, `translateY()`, `translate()`, and `translate3d()`
  - Added test coverage for negative variables in transform functions
  - This bug wasn't caught earlier because our fixture tests didn't include
    negative SCSS variables in transform functions

### 📊 Testing

- Added 7 new tests for `trackFileVariables` option
- All 304 tests passing
- Comprehensive coverage of variable resolution scenarios

## 5.0.0-alpha.12 (2026-02-13)

### 🐛 Bug Fixes

- **acceptCarbonCustomProp Behavior**: Fixed CSS custom property validation to
  only accept known Carbon tokens
  - Removed wildcard acceptance of any `--cds-*` CSS custom property
  - Now only accepts CSS custom properties that are in the loaded Carbon token
    list
  - When `acceptCarbonCustomProp: false`, all CSS custom properties are rejected
    (even known Carbon tokens)
  - When `acceptCarbonCustomProp: true`, only known Carbon CSS custom properties
    are accepted
  - Example: `var(--cds-spacing-05)` is accepted when
    `acceptCarbonCustomProp: true` because it's a known Carbon token
  - Example: `var(--cds-custom-value)` is rejected even when
    `acceptCarbonCustomProp: true` because it's not in the token list

### 📝 Impact

This fix ensures that `acceptCarbonCustomProp` properly gates access to CSS
custom properties, preventing arbitrary `--cds-*` properties from being accepted
when they're not actually Carbon tokens. This provides better validation and
catches typos or non-existent tokens.

## 5.0.0-alpha.11 (2026-02-13)

### 🐛 Bug Fixes

- **CSS Custom Property Fallbacks**: Fixed validation of CSS custom properties
  with fallback values
  - Updated regex in `isCarbonCustomProperty()` and `extractCssVarName()` to
    stop at comma (fallback separator)
  - Now correctly handles `var(--cds-background, #ffffff)` by extracting only
    `--cds-background`
  - Previously would incorrectly capture `--cds-background, #ffffff` as the
    variable name

### 📝 Impact

This fix resolves false positives for CSS custom properties that include
fallback values, which is a common and recommended pattern for providing
graceful degradation.

## 5.0.0-alpha.10 (2026-02-13)

### 🧹 Code Cleanup

- **Simplified acceptValues**: Removed redundant `1px` and `-1px` entries from
  theme-use rule
  - These are now covered by the more general regex pattern
    `/^-?\d+\.?\d*(px|rem|em)$/`
  - Cleaner, more maintainable configuration

## 5.0.0-alpha.9 (2026-02-13)

### 🐛 Bug Fixes

- **Box-Shadow Length Values**: Fixed incorrect validation of blur and spread
  radius in box-shadow
  - Added pattern `/^-?\d+\.?\d*(px|rem|em)$/` to theme-use acceptValues
  - Box-shadow syntax:
    `[inset?] <offset-x> <offset-y> <blur-radius>? <spread-radius>? <color>?`
  - Blur and spread radius are spacing values (px, rem, em) but were incorrectly
    flagged as needing theme tokens
  - Example: `box-shadow: 0 0 4px 1px $layer-accent-01` - the `4px` blur radius
    is now correctly accepted

### 📝 Impact

This fix resolves false positives for box-shadow declarations that use length
values for blur and spread radius. These are valid spacing values that don't
need to be Carbon tokens.

## 5.0.0-alpha.8 (2026-02-13)

### 🐛 Bug Fixes

- **Negative SCSS Variables**: Fixed recognition of negative SCSS variables like
  `-$spacing-07`
  - Updated `validateValue()` to check tokens without the negative sign
  - Resolves false positives for negative spacing values in positioning and
    margins
- **Negative 1px Values**: Added support for `-1px` values
  - Added to acceptValues in both `theme-use` and `layout-use` rules
  - Common for negative offsets in box-shadows and positioning
- **Non-Spacing Transform Functions**: Fixed incorrect validation of non-spacing
  transforms
  - Added skip logic for `rotate()`, `scale()`, `scaleX()`, `scaleY()` functions
  - These transforms don't use spacing tokens and should not be validated by
    layout-use rule
- **1px Values Support**: Added support for 1px values in borders and
  box-shadows
  - 1px is valid for hairline borders and should not require a token
  - Added to acceptValues in both `theme-use` and `layout-use` rules
- **Box-Shadow and Cross-Token Properties**: Fixed validation of properties that
  mix token types
  - Added spacing token patterns to `theme-use` acceptValues (for box-shadow
    offsets)
  - Added theme token patterns to `layout-use` acceptValues (for border colors
    in shorthand)
  - Fixed trailing punctuation parsing in multi-value properties
- **Border Style Keywords**: Added support for CSS border-style keywords
  - Keywords like `solid`, `dashed`, `inset`, `outset` are now accepted
  - Prevents false positives when using standard CSS border styles
- **Motion Easing Aliases**: Added support for `@carbon/styles` convenience
  aliases
  - `$standard-easing` → `cubic-bezier(0.5, 0, 0.1, 1)`
  - `$ease-in` → `cubic-bezier(0.25, 0, 1, 1)`
  - `$ease-out` → `cubic-bezier(0, 0, 0.25, 1)`
  - These aliases are defined in `@carbon/styles/scss/_motion.scss` for backward
    compatibility

### 📝 Impact

These fixes significantly reduce false positives when testing with IBM Products
and other Carbon-based projects. The changes address common patterns that are
valid but were incorrectly flagged by the plugin.

## 5.0.0-alpha.7 (2026-02-12)

### ✨ Features

- **Improved SCSS Validation**: Significantly reduced false positives in v5
  - Added `cleanScssValue()` to properly handle SCSS interpolation (`#{}`) and
    module namespaces
  - Added `isSpacingTransformFunction()` to only validate spacing-related
    transform functions (`translate*`)
  - Added `isGradientFunction()` to always permit gradient functions without
    validation
  - Extended `acceptValues` with CSS keywords (`inset`, `padding-box`,
    `border-box`)
  - Updated `validateCarbonMotionFunction()` to accept `motion(standard)`
    shorthand syntax

### 🧪 Testing

- Added comprehensive test coverage for new validation functions
  - 6 tests for `cleanScssValue()` covering interpolation and namespace
    stripping
  - 4 tests for `isSpacingTransformFunction()` covering transform detection
  - 6 tests for `isGradientFunction()` covering gradient pattern detection
  - Updated `validateCarbonMotionFunction()` tests to include shorthand syntax
  - All 289 tests passing

### 📝 Notes

This release focuses on reducing false positives by properly handling SCSS
syntax patterns, limiting transform validation to spacing-related functions, and
supporting common CSS patterns that don't require Carbon tokens.

## 5.0.0-alpha.6 (2026-02-12)

### ✨ Features

- **New `theme-layer-use` Rule**: Encourages contextual layer tokens over
  numbered tokens
  - Validates usage of layer tokens (`$layer-01`, `$layer-02`, etc.) vs
    contextual tokens (`$layer`, `$border-subtle`, etc.)
  - Contextual tokens automatically adapt to layer context when using Carbon's
    Layer component
  - Provides auto-fix to convert numbered tokens to contextual equivalents
  - Configured as warning in `recommended` config, error in `strict` config,
    disabled in `light-touch` config

- **New `strict` Configuration Preset**: Maximum enforcement of Carbon Design
  System best practices
  - All rules set to error severity (including `theme-layer-use`)
  - Use when you want strict enforcement of contextual layer tokens with the
    Layer component
  - Example: `extends: ['stylelint-plugin-carbon-tokens/strict']`

### 📚 Documentation

- Added comprehensive preset configurations section to README
- Documented all three configuration presets: `recommended`, `strict`, and
  `light-touch`
- Added guidance on when to use contextual vs numbered layer tokens based on
  Carbon MCP documentation

## 5.0.0-alpha.5 (2026-02-12)

### 🐛 Bug Fixes

- **Deprecation Warning**: Removed deprecated `context.fix` usage
  - Updated to use modern Stylelint fix callback approach
  - Fixes `[stylelint:005] DeprecationWarning: context.fix is being deprecated`
    warning
  - No functional changes to auto-fix behavior

## 5.0.0-alpha.4 (2026-02-12)

### ✨ Features

- **Enhanced Auto-Fix Support**: Comprehensive auto-fix implementation for all
  token types
  - **Layout tokens**: Auto-fix now supports both `px` and `rem` values
    - `16px` → `$spacing-05`
    - `1rem` → `$spacing-05`
  - **Motion duration tokens**: Auto-fix for millisecond values
    - `110ms` → `$duration-fast-02`
  - **Motion easing tokens**: Auto-fix for cubic-bezier functions
    - `cubic-bezier(0.2, 0, 0.38, 0.9)` → `$easing-standard-productive`
  - **Theme color tokens**: Opt-in auto-fix with `experimentalFixTheme` option
    - `#0f62fe` → `$background-brand` (when `experimentalFixTheme: 'white'`)
    - Requires explicit theme selection: `'white'`, `'g10'`, `'g90'`, or
      `'g100'`
    - Default behavior: no auto-fix for colors (safer)

### 🔧 Technical Changes

- **Token Value Loading**: Modified token loaders to store actual CSS values
  instead of token names
  - `loadLayoutTokens()`: Now loads actual rem/px values from `@carbon/layout`
  - `loadMotionTokens()`: Now loads actual ms values and cubic-bezier functions
    from `@carbon/motion`
  - `loadThemeTokens()`: Optionally loads actual color values from
    `@carbon/themes`
- **Bidirectional Mapping**: Created mappings for both rem and px equivalents
  - Both `1rem` and `16px` map to `$spacing-05`
- **Type Safety**: Updated TypeScript interfaces to support optional parameters
  in token loaders
- **Rule Configuration**: Extended `ThemeRuleOptions` with
  `experimentalFixTheme` parameter

### 📚 Documentation

- Updated README.md with comprehensive auto-fix examples and usage
- Updated MIGRATION_V4_TO_V5.md to document `experimentalFixTheme` behavior
  changes
- Added warnings about color auto-fix ambiguity (same color used by multiple
  tokens)

## 5.0.0-alpha.3 (2026-02-11)

### 🐛 Bug Fixes

- **Token Name Formatting**: Fixed token name formatting for theme tokens from
  `unstable_metadata`
  - Theme token names from `unstable_metadata` are already in kebab-case format
    and should not be reformatted
  - Prevents double-dash issues like `layer-hover--01` (incorrect) vs
    `layer-hover-01` (correct)
  - Ensures proper recognition of contextual layer tokens like `$layer`,
    `$layer-hover`, `$border-subtle`, etc.
- **Negative Proportional Values**: Improved validation for negative
  proportional spacing values
  - Negative percentages (e.g., `-100%`, `-50%`) are now properly accepted for
    positioning
  - Negative viewport units (e.g., `-100vh`, `-100vw`, `-50svh`) are correctly
    validated
  - Added `isValidSpacingValue()` check in rule validation to handle
    proportional units

## 5.0.0-alpha.2 (2026-02-11)

### 🐛 Bug Fixes

- **Token Name Formatting**: Fixed token name construction to properly convert
  camelCase to kebab-case
  - Tokens like `spacing01`, `durationFast01`, `fast01`, `body01` are now
    correctly formatted as `spacing-01`, `duration-fast-01`, `fast-01`,
    `body-01`
  - Updated `formatTokenName()` function to use proper regex pattern from v4
    implementation
  - This ensures SCSS variables (`$spacing-05`) and CSS custom properties
    (`--cds-spacing-05`) are correctly recognized

## 5.0.0-alpha.1 (2026-02-11)

### 🎉 Major Rewrite - Alpha Release

This is the first alpha release of v5, a complete rewrite of the plugin with
focus on Carbon v11+ support.

#### ✨ New Features

- **Complete TypeScript Rewrite**: Entire codebase rewritten in TypeScript for
  better type safety and developer experience
- **All 5 Carbon Token Categories Supported**:
  - `carbon/theme-use` - Color and theme tokens
  - `carbon/layout-use` - Spacing and layout tokens
  - `carbon/type-use` - Typography tokens (NEW)
  - `carbon/motion-duration-use` - Motion timing tokens (NEW)
  - `carbon/motion-easing-use` - Motion easing functions (NEW)
- **Shorthand Property Validation**: Full support for shorthand properties
  - `transition` - validates duration and timing function
  - `animation` - validates duration and timing function
  - `font` - validates size, family, weight, line-height
  - `border` - validates color
  - `outline` - validates color
- **Auto-Fix Support**: Automatically fix common violations
  - Hard-coded values → Carbon tokens (when 1:1 mapping exists)
  - Incorrect CSS custom property prefix
  - Invalid shorthand components
- **Dual Format Support**: Validates both SCSS variables (`$spacing-05`) and CSS
  custom properties (`var(--cds-spacing-05)`)
- **Enhanced Validation**:
  - `calc()` expressions with Carbon tokens
  - `rgba()` function with Carbon color tokens
  - Transform functions (`translateX`, `translateY`, `translate`, `translate3d`)
  - Carbon v11 functions: `motion()`, `type-scale()`, `font-family()`,
    `font-weight()`
- **Improved Error Messages**: Clear, actionable error messages with suggested
  fixes

#### 🔧 Configuration Improvements

All V4 configuration options have been migrated and enhanced:

- **`includeProps`**: Now supports advanced regex patterns
  - Exact match: `'color'`, `'margin'`
  - Regex: `'/^border-/'`, `'/^font-(?!style)/'` (including negative lookahead)
  - Multiple patterns: `['margin', '/^padding/']`
- **`acceptValues`**: Per-rule configuration (no longer global)
  - Supports exact values and regex patterns
  - Example: `['transparent', 'inherit', '/^0$/']`
- **`acceptUndefinedVariables`**: Allow custom SCSS/CSS variables
  - When `true`, allows any `$variable` or `var(--custom-prop)`
- **`acceptCarbonCustomProp`**: Allow Carbon CSS custom properties
  - When `true`, allows `var(--{carbonPrefix}-*)` patterns
- **`carbonPrefix`**: Custom prefix for CSS custom properties
  - Default: `'cds'`
  - Allows custom prefixes like `'custom'` for `var(--custom-*)`

#### 🚨 Breaking Changes

- **Carbon v10 Support Removed**: Only Carbon v11+ is supported
  - V10 functions (`carbon--font-weight()`, `carbon--type-scale()`, etc.) are
    not supported
  - Use V11 equivalents: `font-weight()`, `type-scale()`, `font-family()`,
    `motion()`
- **Node.js 20+ Required**: Minimum Node.js version increased from 18 to 20

- **Configuration Changes**:
  - `acceptValues` is now per-rule instead of global
  - Removed: `acceptCarbonFontWeightFunction`, `acceptCarbonTypeScaleFunction`,
    `acceptCarbonFontFamilyFunction`, `acceptCarbonMotionFunction`
  - Position-specific syntax removed (e.g., `transition<2>`, `margin<1 4>`)
  - Function filter syntax removed (e.g., `transform[/^translate/]`)

- **Simplified Architecture**:
  - SCSS namespace handling removed
  - Custom parser removed (uses standard PostCSS)
  - Scope enforcement removed

#### 📊 Test Coverage

- **263 tests** (100% passing)
- **84.34%** line coverage
- **95.17%** branch coverage
- **96.10%** function coverage
- All 5 rule files have 100% coverage
- Comprehensive test suite for all features

#### 📚 Documentation

- Complete migration guide from V4
  ([MIGRATION_V4_TO_V5.md](./MIGRATION_V4_TO_V5.md))
- Detailed V4/V5 comparison
  ([V5_V4_COMPARISON.md](./v5-rewrite-docs/V5_V4_COMPARISON.md))
- Deprecations guide
  ([V5_DEPRECATIONS.md](./v5-rewrite-docs/V5_DEPRECATIONS.md))
- Test coverage report
  ([V5_TEST_COVERAGE.md](./v5-rewrite-docs/V5_TEST_COVERAGE.md))
- Updated README with V5 examples
- API documentation for all rules

#### 🐛 Known Issues

- Stylelint deprecation warnings for `context.fix` (will be addressed in future
  release)
- Some edge cases in auto-fix for complex calc expressions

#### 🔗 Migration Path

See [MIGRATION_V4_TO_V5.md](./MIGRATION_V4_TO_V5.md) for detailed migration
instructions.

**Quick Migration Example**:

V4 Configuration:

```js
{
  "carbon/theme-use": [true, {
    acceptValues: ["transparent"]
  }]
}
```

V5 Configuration (same):

```js
{
  "carbon/theme-use": [true, {
    acceptValues: ["transparent"]
  }]
}
```

Most configurations work as-is, but check the migration guide for deprecated
options.

#### 📦 Installation

```bash
npm install stylelint-plugin-carbon-tokens@alpha
```

#### 🙏 Feedback Welcome

This is an alpha release - please test and provide feedback!

Report issues:
https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/issues

---

## 4.0.2

- Various minor dependency updates.

## 4.0.1

- f6aca05 - fix: remove package-lock, lock update, add js-yaml resolution
- a4d63d9 - chore: add renovate config

## 4.0.0

- BREAK: Updated Node.js version requirement from `>=18` to `>=20`
- BREAK: Updated major dependencies:
  - ESLint v9 (from v8.57.1)
  - cspell v9 (from v8.14.4)
  - eslint-config-prettier v10 (from v9.1.0)
  - npm-check-updates v19 (from v16.14.20)
- BREAK: Migrated from `.eslintrc` to the new `eslint.config.js` format required
  by ESLint v9
- Added `@eslint/js` as a dev dependency
- Migrated ignore patterns from `.eslintignore` to the `ignores` property in
  `eslint.config.js`
- Fixed plugin configuration to use the correct object format for the import
  plugin
- Added global definitions for `console` and `process` to fix linting errors
- Removed the old `.eslintrc` and `.eslintignore` files
- Updated minor version dependencies:
  - @ibm/telemetry-js (^1.6.1 → ^1.10.2)
  - eslint-plugin-import (^2.30.0 → ^2.32.0)
  - eslint-plugin-prettier (^5.2.1 → ^5.5.4)
  - prettier (^3.3.3 → ^3.6.2)
  - stylelint (^16.13.2 → ^16.25.0)
  - stylelint-test-rule-node (^0.3.0 → ^0.4.0)

## 3.2.3

- fix: endIndex deprecation warning

## 3.2.2

- chore: update endpoint and readme
- fix: use of spacing namespace

## 3.2.1

- fix: deprecation warnings caused by use of `content.fix` following
  https://stylelint.io/changelog/#1682.
