# validateVariables Option - Feature Summary

## Overview

The `validateVariables` option allows you to specify component-specific SCSS
variables and CSS custom properties that should be validated and accepted as
valid values. This is useful for projects that use component libraries (like
Carbon for IBM Products) or custom design tokens alongside Carbon Design System
tokens.

## Key Differences

### validateVariables vs acceptUndefinedVariables

- **`validateVariables`**: Accepts specific variable patterns (validates AND
  accepts them)
  - Use when you want to accept specific component library variables
  - Supports exact matches and regex patterns
  - Variables must match the specified patterns to be accepted

- **`acceptUndefinedVariables`**: Accepts ALL undefined variables without
  validation
  - Use when you want to accept any custom variable
  - No pattern matching - accepts everything
  - Less strict, more permissive

### validateVariables vs includeProps

- **`validateVariables`**: Specifies which **variable names** to validate and
  accept
  - Filters which SCSS variables and CSS custom properties are valid **values**
  - Example: `['$c4p-spacing-01', '/^--my-component-/']`

- **`includeProps`**: Specifies which **CSS properties** to validate
  - Filters which CSS properties are checked by the rule
  - Example: `['color', 'background', '/^border-/']`

## Implementation Details

### Added to Types

```typescript
export interface BaseRuleOptions {
  // ... other options
  validateVariables?: string[];
}
```

### Added to Schema Validation

The option is now recognized by stylelint's validation system in
`create-rule.ts`:

```typescript
possible: {
  includeProps: [() => true],
  acceptValues: [() => true],
  // ... other options
  validateVariables: [() => true],
}
```

### Validation Logic

In `validators.ts`, the `validateValue` function checks if a variable matches
the `validateVariables` patterns:

```typescript
// For SCSS variables
if (shouldValidateProperty(cleanValue, validateVariables)) {
  return { isValid: true };
}

// For CSS custom properties
if (!isCarbon && shouldValidateProperty(varName, validateVariables)) {
  return { isValid: true };
}
```

## Usage Examples

### Basic Usage

```js
{
  'carbon/layout-use': [true, {
    validateVariables: [
      '$c4p-spacing-01',           // Exact match
      '/^\\$c4p-/',                // SCSS variables with prefix
      '/^--my-component-/'         // CSS custom properties with prefix
    ]
  }]
}
```

### SCSS Example

```scss
.component {
  // ✅ Accepted - matches pattern
  margin: $c4p-spacing-01;
  padding: $c4p-spacing-02;

  // ❌ Rejected - doesn't match pattern
  margin: $other-spacing;
}
```

### CSS Custom Properties Example

```css
.component {
  /* ✅ Accepted - matches pattern */
  color: var(--my-component-color);
  background: var(--my-component-bg);

  /* ❌ Rejected - doesn't match pattern */
  color: var(--other-color);
}
```

## Test Coverage

Added comprehensive tests in `configuration-options.test.ts`:

1. **should accept component-specific SCSS variables** - Tests exact SCSS
   variable matching
2. **should accept component-specific CSS custom properties** - Tests exact CSS
   custom property matching
3. **should support regex patterns for variables** - Tests SCSS variable regex
   patterns
4. **should support regex patterns for CSS custom properties** - Tests CSS
   custom property regex patterns
5. **should reject variables not matching patterns** - Tests that non-matching
   variables are rejected

All tests pass (309/309).

## Version

- **Added in**: v5.0.0-alpha.14
- **Release Date**: 2026-02-13

## Related Options

- `includeProps`: Filter which CSS properties to validate
- `acceptValues`: Accept specific literal values
- `acceptUndefinedVariables`: Accept all undefined variables
- `trackFileVariables`: Resolve local SCSS variable declarations

## Use Cases

1. **Carbon for IBM Products**: Accept C4P component variables

   ```js
   validateVariables: ['/^\\$c4p-/'];
   ```

2. **Custom Component Library**: Accept your own design tokens

   ```js
   validateVariables: ['/^\\$my-lib-/', '/^--my-lib-/'];
   ```

3. **Mixed Approach**: Accept specific variables from multiple sources
   ```js
   validateVariables: [
     '/^\\$c4p-/', // Carbon for IBM Products
     '/^\\$custom-/', // Custom tokens
     '/^--component-/', // Component-specific CSS vars
   ];
   ```

## Notes

- Patterns are matched using the `shouldValidateProperty` function
- Supports both exact matches and regex patterns (enclosed in `/`)
- For SCSS variables, include the `$` prefix in the pattern
- For CSS custom properties, include the `--` prefix in the pattern
- Works with all rules: `theme-use`, `layout-use`, `type-use`,
  `motion-duration-use`, `motion-easing-use`
