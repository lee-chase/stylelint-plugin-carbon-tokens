# Migration Guide: V4 to V5

This guide helps you migrate from stylelint-plugin-carbon-tokens v4 to v5.

## Overview

V5 is a complete rewrite focused on:

- Carbon v11+ only (no v10 support)
- TypeScript implementation
- Simplified configuration
- Modern PostCSS parsing

## Breaking Changes

### 1. Carbon v10 Support Removed

**V4:**

```js
{
  'carbon/theme-use': [true, {
    carbonPath: 'node_modules/@carbon',
    carbonModulePostfix: '-10'
  }]
}
```

**V5:** Carbon v10 is not supported. You must upgrade to Carbon v11 before using
V5.

### 2. Scope Options Removed

**V4:**

```js
{
  'carbon/theme-use': [true, {
    acceptScopes: ['theme', 'vars'],
    enforceScopes: true
  }]
}
```

**V5:** Scope validation has been removed. These options are no longer
available.

### 3. Custom Carbon Paths Removed

**V4:**

```js
{
  'carbon/theme-use': [true, {
    carbonPath: 'packages/proj1/node_modules/@carbon',
    carbonModulePostfix: '-custom'
  }]
}
```

**V5:** Custom Carbon paths are not supported. The plugin expects standard npm
package locations.

### 4. V10-to-V11 Auto-Migration Removed

**V4:** The plugin could automatically fix v10 tokens to v11 tokens.

**V5:** This functionality has been removed. Complete your v10-to-v11 migration
before upgrading to V5.

### 5. IBM Color Tokens Removed

**V4:**

```js
{
  'carbon/theme-use': [true, {
    acceptIBMColorTokensCarbonV10Only: true
  }]
}
```

**V5:** IBM color tokens (deprecated) are no longer supported.

### 6. Theme-Specific Fixes Changed

**V4:**

```js
{
  'carbon/theme-use': [true, {
    experimentalFixTheme: 'g10'
  }]
}
```

**V5:** The `experimentalFixTheme` option is still available but works
differently:

- V4: Automatically replaced theme-specific values during validation
- V5: Opt-in auto-fix feature that suggests token replacements for hard-coded
  colors

```js
{
  'carbon/theme-use': [true, {
    experimentalFixTheme: 'white'  // or 'g10', 'g90', 'g100'
  }]
}
```

**⚠️ Important**: In V5, this option only enables auto-fix for color values.
Without it, color auto-fix is disabled (safer default). See the
[Auto-Fix Support](#auto-fix-support) section in README.md for details.

### 7. Mini-Units Function Removed

**V4:**

```js
{
  'carbon/layout-use': [true, {
    acceptCarbonMiniUnitsFunction: true
  }]
}
```

**V5:** The v10 `carbon--mini-units()` function is no longer supported.

## Configuration Changes

### Simplified Options

**V4:**

```js
{
  'carbon/theme-use': [true, {
    includeProps: ['color', 'background-color'],
    acceptValues: ['transparent', 'inherit'],
    acceptScopes: ['theme'],
    enforceScopes: false,
    acceptCarbonColorTokens: false,
    acceptIBMColorTokensCarbonV10Only: false,
    acceptUndefinedVariables: false,
    carbonPath: undefined,
    carbonModulePostfix: undefined,
    experimentalFixTheme: undefined,
    acceptCarbonCustomProp: false,
    carbonPrefix: 'cds'
  }]
}
```

**V5:**

```js
{
  'carbon/theme-use': [true, {
    includeProps: ['color', 'background-color'],
    acceptValues: ['transparent', 'inherit'],
    acceptUndefinedVariables: false,
    acceptCarbonCustomProp: false,
    carbonPrefix: 'cds'
  }]
}
```

### Remaining Options

These options are still available in V5:

- `includeProps` - Properties to validate
- `acceptValues` - Values to accept without validation
- `acceptUndefinedVariables` - Allow user-defined variables
- `acceptCarbonCustomProp` - Allow Carbon CSS custom properties
- `carbonPrefix` - Custom Carbon prefix for CSS custom properties
- `trackFileVariables` - Track and resolve file-level SCSS variables (new in v5,
  default: `true`)
- `validateVariables` - Accept component-specific variables (new in v5)

### New Options in V5

**`experimentalFixTheme`** (theme-use rule only):

- Type: `'white' | 'g10' | 'g90' | 'g100'`
- Default: `undefined` (color auto-fix disabled)
- Purpose: Enables auto-fix for hard-coded color values to Carbon theme tokens
- Example:
  ```js
  {
    'carbon/theme-use': [true, {
      experimentalFixTheme: 'white'
    }]
  }
  ```
- **Warning**: Color auto-fix is experimental because the same color may be used
  by multiple tokens. Always review the suggested replacements.

**`trackFileVariables`** (all rules):

- Type: `boolean`
- Default: `true` (for v4 compatibility)
- Purpose: Tracks and resolves file-level SCSS variable declarations
- Example:
  ```js
  {
    'carbon/layout-use': [true, {
      trackFileVariables: true  // Resolve local variables
    }]
  }
  ```
- When enabled, resolves local SCSS variables to their Carbon token values
- When disabled, validates variables as-is without resolution
- Useful for projects that use local variable abstractions over Carbon tokens

**`validateVariables`** (all rules):

- Type: `string[]`
- Default: `[]`
- Purpose: Accept component-specific SCSS variables and CSS custom properties
- Example:
  ```js
  {
    'carbon/layout-use': [true, {
      validateVariables: [
        '$c4p-spacing-01',      // Exact match
        '/^\\$c4p-/',           // SCSS variables with prefix
        '/^--my-component-/'    // CSS custom properties with prefix
      ]
    }]
  }
  ```
- Validates AND accepts specific variable patterns
- Different from `acceptUndefinedVariables` which accepts ALL undefined
  variables
- Useful for Carbon for IBM Products variables or custom component libraries

## Migration Steps

### Step 1: Upgrade Carbon to v11

Ensure all Carbon packages are v11+:

```bash
npm install @carbon/themes@^11 @carbon/colors@^11 @carbon/layout@^11 @carbon/type@^11 @carbon/motion@^11
```

### Step 2: Remove V10-Specific Code

Remove any v10 token usage from your codebase:

- `$carbon--` prefixed variables → `$` prefixed
- `$layout-0x` tokens → `$spacing-0x` tokens
- IBM color tokens → Carbon theme tokens

### Step 3: Update Configuration

Remove unsupported options from your stylelint config:

```diff
{
  'carbon/theme-use': [true, {
    includeProps: ['color'],
-   acceptScopes: ['theme'],
-   enforceScopes: false,
-   carbonPath: 'node_modules/@carbon',
-   carbonModulePostfix: '-10',
    acceptUndefinedVariables: false,
  }]
}
```

### Step 4: Install V5

```bash
npm install stylelint-plugin-carbon-tokens@alpha
```

### Step 5: Test

Run stylelint to identify any issues:

```bash
npx stylelint "**/*.{css,scss}"
```

## Auto-Fix Enhancements in V5

V5 includes significantly improved auto-fix capabilities compared to V4:

### Always Enabled (No Configuration Required)

- **Layout tokens**: Automatically fixes both `px` and `rem` values
  - `16px` → `$spacing-05`
  - `1rem` → `$spacing-05`

- **Motion duration tokens**: Automatically fixes millisecond values
  - `110ms` → `$duration-fast-02`

- **Motion easing tokens**: Automatically fixes cubic-bezier functions
  - `cubic-bezier(0.2, 0, 0.38, 0.9)` → `$easing-standard-productive`

### Opt-in (Requires Configuration)

- **Theme color tokens**: Requires `experimentalFixTheme` option
  - `#0f62fe` → `$background-brand` (when `experimentalFixTheme: 'white'`)

See the [Auto-Fix Support](./README.md#auto-fix-support) section in README.md
for complete examples and usage details.

## Getting Help

- For V4 documentation: See [V4-README.md](./V4-README.md)
- For V5 documentation: See [README.md](./README.md)
- For issues:
  https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/issues

## Rollback

If you need to rollback to V4:

```bash
npm install stylelint-plugin-carbon-tokens@^4
```

Your V4 configuration will work as before.
