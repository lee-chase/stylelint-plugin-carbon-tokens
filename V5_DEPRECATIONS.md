# V5 Deprecations

This document lists features that were available in V4 but are deprecated or
intentionally not supported in V5.

## Deprecated Configuration Options

The following configuration options from V4 are no longer supported in V5:

### 1. `acceptCarbonFontWeightFunction`

- **Status**: Deprecated
- **Reason**: V5 does not support V10 Carbon Sass functions (e.g.,
  `carbon--font-weight()`)
- **Migration**: V5 supports V11 Carbon functions: `font-weight()`,
  `font-family()`, `type-scale()`
- **Example**:

  ```scss
  // ❌ V10 function (not supported)
  font-weight: carbon--font-weight('semibold');

  // ✅ V11 function (supported)
  font-weight: font-weight('semibold');

  // ✅ Or use tokens directly
  font-weight: $font-weight-semibold;
  ```

### 2. `acceptCarbonTypeScaleFunction`

- **Status**: Deprecated
- **Reason**: V5 does not support V10 Carbon Sass functions (e.g.,
  `carbon--type-scale()`)
- **Migration**: V5 supports V11 Carbon function: `type-scale()`
- **Example**:

  ```scss
  // ❌ V10 function (not supported)
  font-size: carbon--type-scale(3);

  // ✅ V11 function (supported)
  font-size: type-scale(3);

  // ✅ Or use tokens directly
  font-size: $font-size-03;
  ```

### 3. `acceptCarbonFontFamilyFunction`

- **Status**: Deprecated
- **Reason**: V5 does not support V10 Carbon Sass functions (e.g.,
  `carbon--font-family()`)
- **Migration**: V5 supports V11 Carbon function: `font-family()`
- **Example**:

  ```scss
  // ❌ V10 function (not supported)
  font-family: carbon--font-family('sans');

  // ✅ V11 function (supported)
  font-family: font-family('sans');

  // ✅ Or use tokens directly
  font-family: $font-family-sans;
  ```

### 4. `acceptCarbonMotionFunction`

- **Status**: Deprecated
- **Reason**: V5 does not support V10 Carbon Sass functions (e.g.,
  `carbon--motion()`)
- **Migration**: V5 supports V11 Carbon function: `motion()`
- **Example**:

  ```scss
  // ❌ V10 function (not supported)
  transition-timing-function: carbon--motion('standard', 'productive');

  // ✅ V11 function (supported)
  transition-timing-function: motion('standard', 'productive');

  // ✅ Or use tokens directly
  transition-timing-function: $easing-standard-productive;
  ```

### 5. `acceptValues` (global configuration)

- **Status**: Deprecated
- **Reason**: Replaced with per-rule configuration
- **Migration**: Configure `acceptValues` individually for each rule:
  ```javascript
  {
    "carbon/theme-use": [true, { acceptValues: [...] }],
    "carbon/layout-use": [true, { acceptValues: [...] }],
    "carbon/type-use": [true, { acceptValues: [...] }],
    "carbon/motion-duration-use": [true, { acceptValues: [...] }],
    "carbon/motion-easing-use": [true, { acceptValues: [...] }]
  }
  ```

## Deprecated Syntax Features

### 1. Position-Specific Shorthand Syntax

- **Status**: Deprecated (not supported in V5)
- **V4 Syntax**: `transition<2>`, `animation<3>`, `margin<1 4>`,
  `box-shadow<-1>`
- **Reason**: V5's approach is superior - it validates entire shorthand values
  comprehensively rather than checking only specific positions
- **Why This Is Better**:
  - **More comprehensive**: V5 validates ALL relevant components in a shorthand,
    not just one position
  - **Catches more issues**: Detects problems in any part of the shorthand value
  - **Simpler configuration**: No need to specify positions - just include the
    property name
  - **Better auto-fix**: Can fix any component of the shorthand, not just the
    specified position

- **Migration Examples**:

  **Example 1: Transition Duration**

  ```scss
  // V4: Only validated position 2 (duration)
  // includeProps: ['transition<2>']
  transition: opacity 200ms ease-in; // Only checks "200ms"

  // V5: Validates ALL relevant components (better!)
  // includeProps: ['transition']
  transition: opacity 200ms ease-in; // ✅ Checks BOTH "200ms" AND "ease-in"
  ```

  **Example 2: Animation**

  ```scss
  // V4: Only validated position 3 (timing-function)
  // includeProps: ['animation<3>']
  animation: slide 300ms ease-out 100ms; // Only checks "ease-out"

  // V5: Validates ALL relevant components (better!)
  // includeProps: ['animation']
  animation: slide 300ms ease-out 100ms; // ✅ Checks "300ms", "ease-out", AND "100ms"
  ```

  **Example 3: Multi-value Properties**

  ```scss
  // V4: Only validated positions 1-4
  // includeProps: ['margin<1 4>']
  margin: 10px 20px 30px 40px; // Only checks these 4 values

  // V5: Validates ALL values (better!)
  // includeProps: ['margin']
  margin: 10px 20px 30px 40px; // ✅ Checks all values
  margin: 10px 20px; // ✅ Also works with 2 values
  ```

- **Summary**: V5's approach provides **better validation coverage** by checking
  all components instead of just specific positions. This catches more potential
  issues and provides more comprehensive Carbon token enforcement.

### 2. Function Filter Syntax

- **Status**: Deprecated (not supported in V5)
- **V4 Syntax**: `transform[/^translate/]` (only validate translate functions in
  transform property)
- **Reason**: V5's architecture is superior - it validates transform functions
  directly without needing filter syntax
- **Why This Is Better**:
  - **Simpler configuration**: No need for complex filter syntax
  - **More intuitive**: Transform functions are validated automatically
  - **Better architecture**: Direct function validation instead of
    property-based filtering
  - **Same result**: Achieves the same validation goal with cleaner code

- **Migration Example**:

  ```scss
  // V4: Required filter syntax to validate only translate functions
  // includeProps: ['transform[/^translate/]']
  transform: translateX(10px); // Only translate* functions validated
  transform: rotate(45deg); // Not validated (not a translate function)

  // V5: Direct function validation (no filter needed)
  // includeProps: [] // Not needed - transform functions validated automatically
  transform: translateX($spacing-05); // ✅ Automatically validated
  transform: translateY($spacing-03); // ✅ Automatically validated
  transform: rotate(45deg); // ✅ Not validated (not a spacing function)
  ```

- **Summary**: V5 validates transform functions directly in the validation
  logic, eliminating the need for property-based filtering. This is a cleaner,
  more maintainable approach that achieves the same result.

## Intentionally Unsupported Functions

The following CSS functions are intentionally not supported in V5:

### 1. `cubic-bezier()`

- **Status**: Not supported
- **Reason**: Carbon Design System provides standardized easing tokens
- **Alternative**: Use Carbon easing tokens (`$duration-fast-01`,
  `$duration-moderate-01`, etc.) or standard easing keywords (`ease`, `ease-in`,
  `ease-out`, `ease-in-out`, `linear`)
- **Example**:

  ```scss
  // ❌ Not supported
  transition: opacity cubic-bezier(0.4, 0, 0.2, 1) 200ms;

  // ✅ Use Carbon tokens
  transition: opacity $duration-fast-01 motion(standard, productive);
  ```

### 2. `steps()`

- **Status**: Not supported
- **Reason**: Carbon Design System provides standardized easing tokens
- **Alternative**: Use Carbon easing tokens or standard easing keywords
- **Example**:

  ```scss
  // ❌ Not supported
  animation: slide steps(4, end) 1s;

  // ✅ Use Carbon tokens
  animation: slide $duration-moderate-01 motion(standard, productive);
  ```

## Migration Guide

For detailed migration instructions from V4 to V5, see
[`MIGRATION_V4_TO_V5.md`](./MIGRATION_V4_TO_V5.md).
