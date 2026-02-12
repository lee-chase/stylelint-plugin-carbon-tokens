# Plugin Fix Recommendations for False Positives

Based on code analysis, here are the confirmed false positives and recommended
fixes:

## 1. SCSS Variable Interpolation `#{$token}` - CONFIRMED FALSE POSITIVE

**Issue**: Lines 260-261 in validators.ts handle `#{$token}` in calc(), but NOT
in regular property values.

```typescript
// In validateProportionalCalc() - line 261:
const cleanToken = tokenPart.replace(/^#\{|\}$/g, '').trim();
```

**Problem**: The main `validateValue()` function (line 89-172) doesn't strip
`#{}` before checking SCSS variables.

**Fix Required**: Update `validateValue()` to handle interpolation:

```typescript
export function validateValue(
  value: string,
  tokens: CarbonToken[],
  options = {}
) {
  // ... existing code ...

  // NEW: Handle SCSS interpolation
  const cleanValue = value.replace(/^#\{|\}$/g, '').trim();

  // Check if it's a SCSS variable (after removing interpolation)
  if (isScssVariable(cleanValue)) {
    const isCarbon = tokens.some(
      (token) => token.type === 'scss' && token.name === cleanValue
    );
    if (isCarbon) {
      return { isValid: true };
    }
    // ... rest of validation
  }
}
```

**Affected Errors**: ~15 errors like:

- `inset-block-end: #{$spacing-06}`
- `--overlay-color: #{$overlay}`

---

## 2. SCSS Module Namespace `module.$token` - CONFIRMED FALSE POSITIVE

**Issue**: The validator only checks for `$token` format (line 14), not
`module.$token`.

```typescript
export function isScssVariable(value: string): boolean {
  return value.startsWith('$'); // ❌ Doesn't handle namespace
}
```

**Problem**: Carbon v11 uses `@use` with namespaces like `spacing.$spacing-04`,
`theme.$layer`.

**Fix Required**: Update token loading to include namespaced tokens:

```typescript
// In carbon-tokens.ts, add namespaced versions:
export function loadLayoutTokens(): CarbonToken[] {
  const tokens: CarbonToken[] = [];

  // Existing token loading...

  // NEW: Add common namespace variations
  const namespaces = ['spacing', 'layout', 'theme', 'motion', 'type'];
  const existingTokens = [...tokens];

  for (const namespace of namespaces) {
    for (const token of existingTokens) {
      if (token.type === 'scss' && token.name.startsWith('$')) {
        // Add namespaced version: spacing.$spacing-01
        tokens.push({
          ...token,
          name: `${namespace}.${token.name}`,
        });
      }
    }
  }

  return tokens;
}
```

**Affected Errors**: ~25 errors like:

- `spacing.$spacing-04`
- `theme.$layer`
- `motion.$duration-slow-01`

---

## 3. Transform Functions (rotate, scale) - POLICY DECISION NEEDED

**Issue**: Lines 384-559 validate transform functions, but only `translate*`
functions are spacing-related.

**Current Behavior**: The validator checks ALL transform values against layout
tokens.

**Problem**: `rotate()`, `scale()`, `scaleX()`, `scaleY()` are NOT
spacing-related and shouldn't require Carbon tokens.

**Fix Option A - Exclude Non-Spacing Transforms** (RECOMMENDED):

```typescript
// In create-rule.ts, update property validation:
function shouldValidateTransformValue(value: string): boolean {
  // Only validate translate functions for layout-use
  return isTransformFunction(value); // translate, translateX, translateY, translate3d
  // Don't validate: rotate, scale, scaleX, scaleY, skew, matrix, etc.
}
```

**Fix Option B - Add Configuration Option**:

```typescript
// Allow users to opt-in to strict transform validation
interface LayoutRuleOptions {
  // ... existing options
  validateAllTransforms?: boolean; // default: false
}
```

**Affected Errors**: ~30 errors like:

- `transform: rotate(0deg)`
- `transform: scale(0.9)`
- `transform: scaleY(-1)`

**Recommendation**: Use Option A - these transforms are not spacing-related.

---

## 4. calc() Token Arithmetic - CONFIRMED FALSE POSITIVE

**Issue**: Lines 246-287 validate calc() but reject valid token arithmetic.

**Current Pattern**: Only accepts `calc(P O token)` or `calc(-1 * token)`

**Problem**: Rejects valid patterns like:

- `calc($spacing-02 + $spacing-01)` - Adding two tokens
- `calc(100% + #{$spacing-04} + #{$spacing-01})` - Multiple operations

**Fix Required**: Expand calc() validation to accept token arithmetic:

```typescript
function validateTokenArithmeticCalc(
  contents: string,
  tokens: CarbonToken[]
): ValidationResult {
  // Pattern: $token1 + $token2 or #{$token1} + #{$token2}
  const arithmeticPattern = /^(.+?)\s*([+\-*/])\s*(.+)$/;
  const match = contents.match(arithmeticPattern);

  if (!match) return { isValid: false };

  const [, left, operator, right] = match;

  // Clean and validate both sides
  const cleanLeft = left.replace(/^#\{|\}$/g, '').trim();
  const cleanRight = right.replace(/^#\{|\}$/g, '').trim();

  // Both sides should be Carbon tokens or valid spacing values
  const leftValid =
    isScssVariable(cleanLeft) &&
    tokens.some((t) => t.type === 'scss' && t.name === cleanLeft);
  const rightValid =
    isScssVariable(cleanRight) &&
    tokens.some((t) => t.type === 'scss' && t.name === cleanRight);

  if (leftValid && rightValid) {
    return { isValid: true };
  }

  return { isValid: false };
}

// Update validateCalcExpression to try this pattern:
export function validateCalcExpression(
  value: string,
  tokens: CarbonToken[]
): ValidationResult {
  // ... existing patterns ...

  // NEW: Try token arithmetic validation
  const arithmeticResult = validateTokenArithmeticCalc(contents, tokens);
  if (arithmeticResult.isValid) {
    return arithmeticResult;
  }

  // ... existing error return
}
```

**Affected Errors**: ~20 errors like:

- `calc($spacing-02 + $spacing-01)`
- `calc(-1 * $indicator-height)`
- `calc(100% + #{$spacing-04} + #{$spacing-01})`

---

## 5. Linear Gradients with Tokens - CONFIRMED FALSE POSITIVE

**Issue**: Gradients using Carbon tokens are flagged because the entire gradient
string is validated.

**Problem**: `linear-gradient(90deg, $blue-90 0%, $purple-70 100%)` is parsed as
a single value.

**Fix Required**: Parse gradient functions and validate individual color stops:

```typescript
function isGradientFunction(value: string): boolean {
  return /^(linear|radial|conic)-gradient\s*\(/.test(value.trim());
}

function validateGradientFunction(
  value: string,
  tokens: CarbonToken[]
): ValidationResult {
  // Extract gradient parameters
  const parsed = extractFunctionParams(value);
  if (!parsed) return { isValid: false };

  // For gradients, we only validate color values, not positions/angles
  // Colors should be Carbon tokens or accepted values
  // Positions (0%, 100%) and angles (90deg) are allowed

  // This is complex - for now, accept gradients that contain Carbon tokens
  const hasTokens = parsed.params.some(
    (param) =>
      isScssVariable(param) &&
      tokens.some((t) => t.type === 'scss' && t.name === param)
  );

  if (hasTokens) {
    return { isValid: true }; // If using Carbon tokens, accept the gradient
  }

  return { isValid: false };
}
```

**Affected Errors**: ~10 errors like:

- `linear-gradient(90deg, $blue-90 0%, $purple-70 100%)`
- `linear-gradient(to right, rgba(255, 255, 255, 0), $layer-01)`

---

## 6. CSS Keywords in Shorthand - CONFIRMED FALSE POSITIVE

**Issue**: CSS keywords like `inset`, `padding-box`, `border-box` are validated
as token values.

**Fix Required**: Add CSS keywords to default acceptValues:

```typescript
// In theme-use.ts and layout-use.ts:
const defaultOptions = {
  acceptValues: [
    '/inherit|initial|none|unset|auto/',
    '/^0$/',
    // NEW: Add common CSS keywords
    '/inset|outset/', // box-shadow keywords
    '/padding-box|border-box|content-box/', // background-clip keywords
    '/logical/', // inset keyword
  ],
};
```

**Affected Errors**: ~8 errors like:

- `box-shadow: inset ...`
- `background: padding-box, border-box`
- `inset: logical`

---

## 7. motion() Function Shorthand - POLICY DECISION NEEDED

**Issue**: Lines 681-700 require both parameters with quotes:
`motion('standard', 'productive')`

**Current Behavior**: Rejects `motion(standard)` shorthand.

**Problem**: Users may expect shorthand to work.

**Fix Option A - Allow Shorthand** (RECOMMENDED):

```typescript
export function validateCarbonMotionFunction(value: string): ValidationResult {
  // Match with both parameters (with or without quotes)
  const fullMatch = value.match(
    /\bmotion\s*\(\s*['"]?(standard|entrance|exit)['"]?\s*,\s*['"]?(productive|expressive)['"]?\s*\)/
  );

  if (fullMatch) {
    return { isValid: true };
  }

  // NEW: Allow shorthand with just easing type (defaults to productive)
  const shorthandMatch = value.match(
    /\bmotion\s*\(\s*['"]?(standard|entrance|exit)['"]?\s*\)/
  );

  if (shorthandMatch) {
    return { isValid: true }; // Accept shorthand
  }

  return {
    isValid: false,
    message:
      "Invalid motion() parameters. Expected: motion('standard'|'entrance'|'exit', 'productive'|'expressive') or motion('standard'|'entrance'|'exit')",
  };
}
```

**Fix Option B - Keep Strict** (Document clearly):

Keep current behavior but improve error message to explain why shorthand isn't
allowed.

**Affected Errors**: ~15 errors like:

- `motion(standard)`
- `animation: ... motion(standard)`

**Recommendation**: Check Carbon documentation - if shorthand is valid, use
Option A.

---

## 8. CSS Custom Properties with Fallbacks - NEEDS INVESTIGATION

**Issue**: `var(--cds-background, #ffffff)` is flagged.

**Problem**: The fallback value `#ffffff` is validated separately and fails.

**Fix Required**: Parse var() with fallbacks correctly:

```typescript
export function extractCssVarName(value: string): string | null {
  // Updated to handle fallbacks: var(--token, fallback)
  const match = value.match(/var\(--([^,)]+)/);
  return match ? `--${match[1].trim()}` : null;
}

// In validateValue, accept var() with Carbon tokens regardless of fallback:
if (isCssCustomProperty(value)) {
  const varName = extractCssVarName(value);
  if (!varName) return { isValid: false };

  const isCarbon = tokens.some(
    (token) => token.type === 'css-custom-prop' && token.name === varName
  );

  if (isCarbon) {
    return { isValid: true }; // Accept regardless of fallback
  }

  // ... rest of validation
}
```

**Affected Errors**: ~15 errors like:

- `var(--cds-background, #ffffff)`
- `var(--cds-text-primary, #161616)`

---

## Summary of Required Fixes

| Fix                       | Priority | Complexity | Errors Fixed |
| ------------------------- | -------- | ---------- | ------------ |
| 1. SCSS Interpolation #{} | HIGH     | Low        | ~15          |
| 2. SCSS Namespaces        | HIGH     | Medium     | ~25          |
| 3. Transform rotate/scale | HIGH     | Low        | ~30          |
| 4. calc() Arithmetic      | HIGH     | Medium     | ~20          |
| 5. Gradients              | MEDIUM   | Medium     | ~10          |
| 6. CSS Keywords           | HIGH     | Low        | ~8           |
| 7. motion() Shorthand     | MEDIUM   | Low        | ~15          |
| 8. var() Fallbacks        | MEDIUM   | Low        | ~15          |

**Total False Positives Fixed**: ~138 errors (41% of total)

## Implementation Priority

1. **Quick Wins** (Low complexity, high impact):
   - Fix #1: SCSS Interpolation
   - Fix #3: Exclude rotate/scale transforms
   - Fix #6: Add CSS keywords to acceptValues

2. **Medium Priority** (Medium complexity, good impact):
   - Fix #2: SCSS Namespaces
   - Fix #4: calc() Arithmetic
   - Fix #8: var() Fallbacks

3. **Lower Priority** (Can be documented as limitations):
   - Fix #5: Gradients
   - Fix #7: motion() Shorthand (if not in Carbon spec)
