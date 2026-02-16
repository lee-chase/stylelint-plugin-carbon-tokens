# stylelint-plugin-carbon-tokens v5 (Alpha)

> **⚠️ This is an alpha release of v5 - a complete rewrite focused on Carbon
> v11+**

A stylelint plugin to enforce the use of Carbon Design System tokens in CSS and
SCSS files.

## What's New in V5

- **TypeScript**: Complete rewrite in TypeScript for better type safety
- **Carbon v11 Only**: Simplified to support only Carbon v11+ (no v10
  compatibility)
- **All 5 Token Categories**: Complete support for theme, layout, type, and
  motion tokens
- **Shorthand Properties**: Full validation of transition, animation, font,
  border, and outline
- **Auto-Fix Support**: Automatically fix common violations
- **Dual Format Support**: Validates both SCSS variables (`$spacing-05`) and CSS
  custom properties (`var(--cds-spacing-05)`)
- **Enhanced Validation**: Support for calc(), rgba(), transform functions, and
  Carbon v11 functions
- **Improved Configuration**: Advanced regex patterns, per-rule options, better
  error messages

## Installation

```bash
npm install stylelint-plugin-carbon-tokens@alpha
```

## Quick Start

Add to your stylelint configuration:

```js
export default {
  plugins: ['stylelint-plugin-carbon-tokens'],
  rules: {
    'carbon/theme-use': true,
    'carbon/theme-layer-use': true,
    'carbon/layout-use': true,
    'carbon/type-use': true,
    'carbon/motion-duration-use': true,
    'carbon/motion-easing-use': true,
  },
};
```

Or use one of the preset configurations:

```js
// Recommended (balanced strictness)
export default {
  extends: ['stylelint-plugin-carbon-tokens/recommended'],
};

// Strict (enforces all rules including contextual layer tokens)
export default {
  extends: ['stylelint-plugin-carbon-tokens/strict'],
};

// Light-touch (minimal enforcement)
export default {
  extends: ['stylelint-plugin-carbon-tokens/light-touch'],
};
```

## Available Rules

All rules are fully implemented and production-ready:

### carbon/theme-use

Validates color and theme tokens.

**Properties validated** (default):

- `color`, `background-color`, `border-color`, `outline-color`
- `fill`, `stroke`
- Shorthand: `border`, `outline`

**Example violations**:

```css
/* ❌ Hard-coded color */
.button {
  color: #0f62fe;
}

/* ✅ Carbon token */
.button {
  color: $link-primary;
}
.button {
  color: var(--cds-link-primary);
}
```

### carbon/theme-layer-use

Encourages contextual layer tokens over numbered tokens when using Carbon's
Layer component.

**Properties validated** (default):

- `color`, `background-color`, `border-color`, `outline-color`
- `fill`, `stroke`
- Shorthand: `border`, `outline`

**Example violations**:

```css
/* ❌ Numbered layer token */
.component {
  background-color: $layer-01;
  border: 1px solid $border-subtle-02;
}

/* ✅ Contextual layer token (preferred with Layer component) */
.component {
  background-color: $layer;
  border: 1px solid $border-subtle;
}
```

**Rationale**: Contextual tokens automatically adapt to the layer context
provided by Carbon's Layer component, making components more flexible and
maintainable. The Carbon Design System documentation explicitly marks these
tokens as "automatically matches contextual layer background."

**Severity**: Warning in `recommended` config, error in `strict` config,
disabled in `light-touch` config.

**When to disable**: If you need explicit layer control or aren't using the
Layer component, disable this rule or use the light-touch configuration.

### carbon/layout-use

Validates spacing and layout tokens.

**Properties validated** (default):

- `margin`, `margin-*`, `padding`, `padding-*`
- `gap`, `row-gap`, `column-gap`
- `top`, `right`, `bottom`, `left`, `inset`
- `width`, `height`, `min-width`, `max-width`, etc.

**Example violations**:

```css
/* ❌ Hard-coded spacing */
.container {
  margin: 16px;
}

/* ✅ Carbon token */
.container {
  margin: $spacing-05;
}
.container {
  margin: var(--cds-spacing-05);
}
```

### carbon/type-use

Validates typography tokens.

**Properties validated** (default):

- `font-size`, `font-family`, `font-weight`, `line-height`
- Shorthand: `font`

**Example violations**:

```css
/* ❌ Hard-coded typography */
.heading {
  font-size: 32px;
}

/* ✅ Carbon token */
.heading {
  font-size: $heading-03;
}
.heading {
  font-size: var(--cds-heading-03);
}

/* ✅ Carbon v11 function */
.heading {
  font-size: type-scale(7);
}
```

### carbon/motion-duration-use

Validates motion timing tokens.

**Properties validated** (default):

- `transition-duration`, `animation-duration`
- Shorthand: `transition`, `animation`

**Example violations**:

```css
/* ❌ Hard-coded duration */
.fade {
  transition: opacity 300ms;
}

/* ✅ Carbon token */
.fade {
  transition: opacity $duration-fast-02;
}
.fade {
  transition: opacity var(--cds-duration-fast-02);
}
```

### carbon/motion-easing-use

Validates motion easing functions.

**Properties validated** (default):

- `transition-timing-function`, `animation-timing-function`
- Shorthand: `transition`, `animation`

**Example violations**:

```css
/* ❌ Custom cubic-bezier */
.slide {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ✅ Carbon token */
.slide {
  transition: transform 300ms $easing-standard-productive;
}
.slide {
  transition: transform 300ms var(--cds-easing-standard-productive);
}

/* ✅ Carbon v11 function */
.slide {
  transition: transform 300ms motion(standard, productive);
}
```

## Preset Configurations

The plugin provides three preset configurations to suit different project needs:

### Recommended (Default)

Balanced approach with most rules as errors and `theme-layer-use` as a warning:

```js
export default {
  extends: ['stylelint-plugin-carbon-tokens/recommended'],
};
```

**Rule severities:**

- `theme-use`: error
- `theme-layer-use`: **warning** (encourages contextual tokens)
- `layout-use`: error
- `type-use`: error
- `motion-duration-use`: error
- `motion-easing-use`: error

### Strict

Enforces all rules including contextual layer tokens as errors:

```js
export default {
  extends: ['stylelint-plugin-carbon-tokens/strict'],
};
```

**Rule severities:**

- All rules: **error** (including `theme-layer-use`)
- `trackFileVariables`: **disabled** (enforces direct Carbon token usage)

Use this configuration when you want maximum enforcement of Carbon Design System
best practices, including the use of contextual layer tokens with the Layer
component. This config disables local variable tracking to ensure all values use
direct Carbon tokens.

### Light-touch

Minimal enforcement for gradual adoption:

```js
export default {
  extends: ['stylelint-plugin-carbon-tokens/light-touch'],
};
```

**Rule severities:**

- Most rules: warning
- `theme-layer-use`: **disabled**

Use this configuration when migrating existing projects or when you need more
flexibility.

## Configuration Options

Each rule supports these options:

```js
{
  'carbon/theme-use': [
    true,
    {
      // Properties to validate (supports regex)
      includeProps: [
        'color',
        'background-color',
        '/^border-color/',  // Regex pattern
        '/^font-(?!style)/' // Negative lookahead
      ],

      // Values to accept without validation (supports regex)
      acceptValues: [
        'transparent',
        'inherit',
        'currentColor',
        '/^0$/'  // Regex: exactly "0"
      ],

      // Allow user-defined SCSS/CSS variables
      acceptUndefinedVariables: false,

      // Allow known Carbon CSS custom properties
      // When true: accepts CSS custom properties that are in the loaded Carbon token list
      // When false: rejects all CSS custom properties (even known Carbon tokens)
      acceptCarbonCustomProp: false,

      // Custom Carbon prefix for CSS custom properties
      carbonPrefix: 'cds',  // default

      // Track and resolve file-level SCSS variable declarations
      // When true: resolves local variables to their Carbon token values
      // When false: validates variables as-is without resolution
      trackFileVariables: true,  // default (v4 compatibility)

      // Component-specific variables to validate and accept
      // Useful for accepting project-specific design tokens
      validateVariables: [
        '$c4p-spacing-01',           // Exact match
        '/^\\$c4p-/',                // SCSS variables with prefix
        '/^--my-component-/'         // CSS custom properties with prefix
      ],
    },
  ],
}
```

### Configuration Examples

#### Allow Custom Variables

```js
{
  'carbon/theme-use': [true, {
    acceptUndefinedVariables: true
  }]
}
```

Now accepts any SCSS variable or CSS custom property:

```css
.custom {
  color: $my-custom-color;
}
.custom {
  color: var(--my-custom-color);
}
```

#### Allow Carbon CSS Custom Properties

```js
{
  'carbon/theme-use': [true, {
    acceptCarbonCustomProp: true
  }]
}
```

Now accepts known Carbon CSS custom properties:

```css
.component {
  /* ✅ Accepted - known Carbon token */
  color: var(--cds-link-primary);
  background: var(--cds-background);
}

.component {
  /* ❌ Rejected - not in Carbon token list */
  color: var(--cds-custom-color);
}
```

**Note**: `acceptCarbonCustomProp` only accepts CSS custom properties that are
in the loaded Carbon token list. It does NOT accept arbitrary `--cds-*`
properties.

#### Custom Property Patterns

```js
{
  'carbon/layout-use': [true, {
    includeProps: [
      'margin',
      '/^padding/',  // All padding-* properties
      '/^gap/'       // gap, row-gap, column-gap
    ]
  }]
}
```

#### Accept Specific Values

```js
{
  'carbon/theme-use': [true, {
    acceptValues: [
      'transparent',
      'inherit',
      'currentColor',
      '/^#[0-9a-f]{6}$/i'  // Any 6-digit hex color
    ]
  }]
}
```

#### Accept Component-Specific Variables

Use `validateVariables` to accept project-specific design tokens or component
library variables. This option both validates variable declarations and accepts
their usage:

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

Validates variable declarations and accepts their usage:

```scss
// ✅ Accepted - Carbon token assigned to validated variable
$c4p-spacing-01: $spacing-05;
--my-component-spacing: var(--cds-spacing-05);

// ❌ Rejected - hard-coded value assigned to validated variable
$c4p-spacing-01: 16px;
--my-component-spacing: 16px;

.component {
  /* ✅ Accepted - validated variable used in property */
  margin: $c4p-spacing-01;
  padding: var(--my-component-spacing);
}

.component {
  /* ❌ Rejected - doesn't match validateVariables pattern */
  margin: $other-spacing;
}
```

**Note**: `validateVariables` is different from `acceptUndefinedVariables`:

- `validateVariables`: Validates variable declarations AND accepts their usage
  for specific patterns
- `acceptUndefinedVariables`: Accepts ALL undefined variables without any
  validation

**Configuration**: This option is not included in the pre-canned configs
(`recommended`, `strict`, `light-touch`) because variable patterns are
project-specific. Add it to your custom configuration as needed.

#### Track File-Level Variables (Enabled by Default)

File-level variable tracking is **enabled by default** for v4 compatibility.
This allows local SCSS variable declarations that resolve to Carbon tokens:

```scss
@use '@carbon/styles/scss/spacing' as *;

// Declare local variables
$indicator-width: $spacing-02;
$indicator-height: $spacing-05;

.component {
  /* ✅ Accepted - resolves to $spacing-02 */
  width: $indicator-width;

  /* ✅ Accepted - resolves to $spacing-05 */
  height: $indicator-height;

  /* ✅ Accepted - resolves in calc() */
  inset-block-end: calc(-1 * $indicator-height);

  /* ✅ Accepted - resolves negative variables */
  margin-inline: -$indicator-width;
}

// Variable chains work too
$base-spacing: $spacing-03;
$derived-spacing: $base-spacing;

.container {
  /* ✅ Accepted - resolves through chain to $spacing-03 */
  padding: $derived-spacing;
}
```

**How it works:**

- Variables must be declared before use (module-level only)
- Supports transitive resolution (variable chains)
- Works with calc(), negative values, and multiple variables
- Variables are resolved when stored, enabling efficient lookups

**When to use:**

- Projects with local variable abstractions over Carbon tokens
- Migrating codebases that use intermediate variable names
- Teams that prefer semantic variable names (e.g., `$indicator-width` instead of
  `$spacing-02`)

**To disable** (not recommended):

```js
{
  'carbon/layout-use': [true, {
    trackFileVariables: false
  }]
}
```

When disabled, only direct Carbon token references are accepted:

```scss
.component {
  /* ✅ Accepted - direct Carbon token */
  width: $spacing-02;

  /* ❌ Rejected - local variable not resolved */
  width: $indicator-width;
}
```

## Shorthand Property Support

V5 fully validates shorthand properties:

### Transition

```css
/* ❌ Invalid */
.fade {
  transition: opacity 300ms ease-in;
}

/* ✅ Valid */
.fade {
  transition: opacity $duration-fast-02 $easing-standard-productive;
}
```

### Animation

```css
/* ❌ Invalid */
.spin {
  animation: rotate 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* ✅ Valid */
.spin {
  animation: rotate $duration-slow-01 motion(standard, productive) infinite;
}
```

### Font

```css
/* ❌ Invalid */
.text {
  font: 16px/1.5 Arial;
}

/* ✅ Valid */
.text {
  font: type-scale(3) / 1.5 font-family(sans);
}
```

### Border & Outline

```css
/* ❌ Invalid */
.box {
  border: 1px solid #0f62fe;
}

/* ✅ Valid */
.box {
  border: 1px solid $border-interactive;
}
```

## Auto-Fix Support

V5 includes comprehensive auto-fix capabilities for hard-coded values:

```bash
stylelint --fix "**/*.{css,scss}"
```

**Note**: Auto-fixes can be applied applied in a number of ways:

- via the CLI
- "Fix all auto-fixable problems" command (VSCode or clone only).
- on save (VSCode or clone only) with the following settings.

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": "explicit"
  }
}
```

### Always Enabled (Safe)

These auto-fixes work automatically with no configuration needed:

**Layout tokens** - Spacing values in both px and rem:

```css
/* Before */
.container {
  margin: 16px;
  padding: 1rem;
}

/* After auto-fix */
.container {
  margin: $spacing-05;
  padding: $spacing-05;
}
```

**Motion duration tokens** - Millisecond values:

```css
/* Before */
.fade {
  transition: opacity 110ms;
}

/* After auto-fix */
.fade {
  transition: opacity $duration-fast-02;
}
```

**Motion easing tokens** - cubic-bezier functions:

```css
/* Before */
.slide {
  transition: transform 300ms cubic-bezier(0.2, 0, 0.38, 0.9);
}

/* After auto-fix */
.slide {
  transition: transform 300ms $easing-standard-productive;
}
```

### Opt-in (Experimental)

**Theme color tokens** - Requires `experimentalFixTheme` option:

```javascript
{
  'carbon/theme-use': [
    true,
    {
      experimentalFixTheme: 'white'  // or 'g10', 'g90', 'g100'
    }
  ]
}
```

```css
/* Before */
.button {
  color: #0f62fe;
  background: #ffffff;
}

/* After auto-fix */
.button {
  color: $background-brand;
  background: $ai-popover-background;
}
```

**⚠️ Warning**: Color auto-fix is experimental because colors can be ambiguous
(same color used by multiple tokens). Use with caution and review the suggested
tokens.

### Complete Example

```css
/* Before */
.card {
  color: #0f62fe;
  margin: 16px 24px;
  padding: 1rem;
  transition: all 110ms cubic-bezier(0.2, 0, 0.38, 0.9);
}

/* After auto-fix (with experimentalFixTheme: 'white') */
.card {
  color: $background-brand;
  margin: $spacing-05 $spacing-06;
  padding: $spacing-05;
  transition: all $duration-fast-02 $easing-standard-productive;
}
```

## Advanced Features

### calc() Expressions

```css
/* ✅ Proportional math */
.container {
  width: calc(100vw - $spacing-05);
}

/* ✅ Token negation */
.offset {
  margin-left: calc(-1 * $spacing-05);
}
```

### rgba() Function

```css
/* ✅ Carbon color with custom alpha */
.overlay {
  background: rgba($background, 0.8);
}
```

### Transform Functions

```css
/* ✅ Spacing tokens in transforms */
.slide {
  transform: translateX($spacing-05);
}
```

### Carbon v11 Functions

```css
/* ✅ Type functions */
.heading {
  font-size: type-scale(7);
  font-family: font-family(sans);
  font-weight: font-weight(semibold);
}

/* ✅ Motion function */
.fade {
  transition: opacity 300ms motion(standard, productive);
}
```

## Migration from V4

See [MIGRATION_V4_TO_V5.md](./MIGRATION_V4_TO_V5.md) for detailed migration
instructions.

### Key Changes

**Breaking Changes**:

- Carbon v10 support removed (use v11+)
- Node.js 20+ required
- V10 functions not supported (use V11 equivalents)
- Configuration options restructured

**Most configurations work as-is**, but check the migration guide for:

- Deprecated options
- New configuration patterns
- V10 → V11 function migration

### Quick Migration

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

## Documentation

### User Documentation

- **[V5 Overview](./V5_OVERVIEW.md)** - Why V5? Complete feature comparison and
  rationale
- **[Migration Guide](./MIGRATION_V4_TO_V5.md)** - Detailed V4 → V5 migration
  instructions
- **[V5 Deprecations](./V5_DEPRECATIONS.md)** - Deprecated features and
  alternatives
- **[V4/V5 Comparison](./V5_V4_COMPARISON.md)** - Detailed feature parity
  analysis

### Technical Documentation

- [Implementation Status](./v5-rewrite-docs/V5_IMPLEMENTATION_STATUS.md) -
  Current progress and roadmap
- [Test Coverage](./v5-rewrite-docs/V5_TEST_COVERAGE.md) - Test coverage report
- [V5 Plan](./v5-rewrite-docs/V5_PLAN.md) - Original V5 vision and architecture
- [Shorthand Strategy](./v5-rewrite-docs/V5_SHORTHAND_IMPLEMENTATION_STRATEGY.md) -
  Shorthand property implementation
- [Not Yet Supported](./v5-rewrite-docs/V5_NOT_YET_SUPPORTED.md) - Future
  enhancements

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Statistics**:

- 263 tests (100% passing)
- 84.34% line coverage
- 95.17% branch coverage
- 96.10% function coverage

## Contributing

Contributions welcome! Please:

1. Check existing issues
2. Create a new issue for discussion
3. Submit PR with tests
4. Follow existing code style

## License

MIT

## Support

- **Issues**:
  https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/issues
- **Carbon Design System**: https://carbondesignsystem.com
- **Stylelint**: https://stylelint.io

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

---

**Note**: This is an alpha release. Please test thoroughly and report any
issues!
