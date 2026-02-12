# Final Implementation Plan - Based on Team Decisions

## Policy Decisions Made

Based on feedback, the following decisions have been made:

### ✅ APPROVED FIXES

1. **SCSS Namespaces** - Strip namespaces before validation
   - `spacing.$spacing-04` → validate as `$spacing-04`
   - Same approach as `#{}` interpolation

2. **SCSS Interpolation** - Strip `#{}` before validation
   - `#{$spacing-06}` → validate as `$spacing-06`

3. **Transform Functions** - Only validate spacing-related transforms
   - ✅ Validate: `translate()`, `translateX()`, `translateY()`, `translate3d()`
   - ❌ Skip: `rotate()`, `scale()`, `scaleX()`, `scaleY()`, `skew()`,
     `matrix()`, etc.

4. **Gradients** - Always permit gradient functions
   - `linear-gradient()`, `radial-gradient()`, `conic-gradient()` accepted

5. **CSS Keywords** - Add to default acceptValues
   - `inset`, `outset`, `padding-box`, `border-box`, `content-box`, `logical`

### ❌ REJECTED PATTERNS

1. **calc() Multiple Tokens** - NOT allowed
   - ❌ `calc($token1 + $token2)` - Multiple tokens rejected
   - ❌ `calc(100% + #{$spacing-04} + #{$spacing-01})` - Multiple tokens
     rejected
   - ✅ `calc(100% + $spacing-04)` - Proportional ± single token allowed
   - ✅ `calc($spacing-04 + 100%)` - Token ± proportional allowed
   - ✅ `calc(100vw - $spacing-04)` - Proportional ± single token allowed
   - ✅ `calc(-1 * $spacing-04)` - Negation allowed

### ✅ APPROVED (Additional)

1. **motion() Shorthand** - Allowed
   - ✅ `motion(standard)` - SCSS processes as string, shorthand permitted
   - ✅ `motion('standard', 'productive')` - Full syntax also permitted

---

## Implementation Tasks

### Task 1: Strip SCSS Namespaces and Interpolation

**File**: `src/utils/validators.ts`

**Changes**:

```typescript
/**
 * Clean SCSS value by removing interpolation and namespaces
 * Examples:
 *   #{$spacing-04} → $spacing-04
 *   spacing.$spacing-04 → $spacing-04
 *   theme.$layer → $layer
 */
function cleanScssValue(value: string): string {
  let cleaned = value.trim();

  // Remove interpolation: #{$token} → $token
  cleaned = cleaned.replace(/^#\{|\}$/g, '');

  // Remove namespace: module.$token → $token
  // Match: word.$token → $token
  cleaned = cleaned.replace(/^[a-zA-Z_][\w-]*\.\$/, '$');

  return cleaned;
}

// Update validateValue function (line 89):
export function validateValue(
  value: string,
  tokens: CarbonToken[],
  options = {}
): ValidationResult {
  // ... existing code ...

  // NEW: Clean SCSS value before validation
  const cleanValue = cleanScssValue(value);

  // Check if it's a SCSS variable (after cleaning)
  if (isScssVariable(cleanValue)) {
    const isCarbon = tokens.some(
      (token) => token.type === 'scss' && token.name === cleanValue
    );
    if (isCarbon) {
      return { isValid: true };
    }
    // ... rest of validation
  }

  // ... rest of function
}
```

**Also update**:

- `validateProportionalCalc()` - line 246
- `validateNegationCalc()` - line 293
- `isValidSpacingValue()` - line 438

**Tests to add**:

```typescript
// Test SCSS interpolation
expect(validateValue('#{$spacing-04}', tokens)).toEqual({ isValid: true });

// Test SCSS namespaces
expect(validateValue('spacing.$spacing-04', tokens)).toEqual({ isValid: true });
expect(validateValue('theme.$layer', tokens)).toEqual({ isValid: true });
expect(validateValue('motion.$duration-slow-01', tokens)).toEqual({
  isValid: true,
});
```

**Errors Fixed**: ~40 errors (interpolation + namespaces)

---

### Task 2: Filter Transform Functions

**File**: `src/utils/create-rule.ts`

**Changes**:

```typescript
/**
 * Check if a transform function should be validated for spacing
 * Only translate functions use spacing values
 */
function isSpacingTransformFunction(value: string): boolean {
  return /^translate(X|Y|3d)?\s*\(/.test(value.trim());
}

// Update validateDeclaration function to filter transforms:
function validateDeclaration(
  decl: Declaration,
  ruleName: string,
  tokens: CarbonToken[],
  options: BaseRuleOptions
): void {
  // ... existing code ...

  // For transform property, only validate spacing-related functions
  if (prop === 'transform' && ruleName === 'carbon/layout-use') {
    const values = parseValue(value);

    for (const val of values) {
      // Skip non-spacing transform functions
      if (!isSpacingTransformFunction(val)) {
        continue; // Don't validate rotate, scale, etc.
      }

      // Validate translate functions
      if (isTransformFunction(val)) {
        const validation = validateTransformFunction(val, tokens);
        if (!validation.isValid) {
          // ... report error
        }
      }
    }
    return; // Done with transform
  }

  // ... rest of validation
}
```

**Tests to add**:

```typescript
// Should NOT flag non-spacing transforms
expect(validateValue('rotate(90deg)', tokens)).toEqual({ isValid: true });
expect(validateValue('scale(0.9)', tokens)).toEqual({ isValid: true });
expect(validateValue('scaleX(-1)', tokens)).toEqual({ isValid: true });

// Should still validate translate functions
expect(validateValue('translateX(100px)', tokens)).toEqual({
  isValid: false,
  message: expect.stringContaining('Carbon spacing token'),
});
```

**Errors Fixed**: ~30 errors (rotate, scale transforms)

---

### Task 3: Always Permit Gradients

**File**: `src/utils/validators.ts`

**Changes**:

```typescript
/**
 * Check if value is a gradient function
 */
export function isGradientFunction(value: string): boolean {
  return /^(linear|radial|conic)-gradient\s*\(/.test(value.trim());
}

// Update validateValue function:
export function validateValue(
  value: string,
  tokens: CarbonToken[],
  options = {}
): ValidationResult {
  // ... existing code ...

  // NEW: Always accept gradient functions
  if (isGradientFunction(value)) {
    return { isValid: true };
  }

  // ... rest of validation
}
```

**Tests to add**:

```typescript
// Gradients should always be valid
expect(
  validateValue('linear-gradient(90deg, $blue-90 0%, $purple-70 100%)', tokens)
).toEqual({ isValid: true });
expect(
  validateValue(
    'linear-gradient(to right, rgba(255, 255, 255, 0), $layer-01)',
    tokens
  )
).toEqual({ isValid: true });
```

**Errors Fixed**: ~10 errors (gradients)

---

### Task 4: Add CSS Keywords to Default Accept Values

**Files**:

- `src/rules/theme-use.ts`
- `src/rules/layout-use.ts`

**Changes**:

```typescript
// In theme-use.ts (line 27):
const defaultOptions: ThemeRuleOptions = {
  includeProps: [
    // ... existing
  ],
  acceptValues: [
    '/inherit|initial|none|unset/',
    '/^0$/',
    '/currentColor|transparent/',
    // NEW: Add CSS keywords
    '/inset|outset/', // box-shadow keywords
    '/padding-box|border-box|content-box/', // background-clip keywords
  ],
  // ... rest
};

// In layout-use.ts (line 36):
const defaultOptions: LayoutRuleOptions = {
  includeProps: [
    // ... existing
  ],
  acceptValues: [
    '/inherit|initial|none|unset|auto/',
    '/^0$/',
    '/^100%$/',
    // NEW: Add CSS keywords
    '/logical/', // inset keyword
  ],
  // ... rest
};
```

**Tests to add**:

```typescript
// CSS keywords should be accepted
expect(
  validateValue('inset', tokens, { acceptValues: defaultOptions.acceptValues })
).toEqual({ isValid: true });
expect(
  validateValue('padding-box', tokens, {
    acceptValues: defaultOptions.acceptValues,
  })
).toEqual({ isValid: true });
```

**Errors Fixed**: ~8 errors (CSS keywords)

---

### Task 5: Verify calc() Validation (No Changes Needed)

**Current behavior is CORRECT** - only allows:

1. `calc(P O token)` - Proportional + single token
2. `calc(-1 * token)` - Negation

**Explicitly REJECTS**:

- `calc($token1 + $token2)` - Multiple tokens ❌
- `calc(100% + $token1 + $token2)` - Multiple tokens ❌

**No code changes needed** - current validation is correct per policy.

**Errors that will remain**: ~20 errors (these are legitimate issues in IBM
Products)

---

### Task 6: Allow motion() Shorthand

**Decision**: SCSS processes `motion(standard)` as a string, so shorthand is
permitted.

**File**: `src/utils/validators.ts`

**Changes**:

```typescript
export function validateCarbonMotionFunction(value: string): ValidationResult {
  if (!isCarbonMotionFunction(value)) {
    return { isValid: false, message: 'Not a Carbon motion function' };
  }

  // Match full syntax: motion('standard', 'productive') with optional quotes
  const fullMatch = value.match(
    /\bmotion\s*\(\s*['"]?(standard|entrance|exit)['"]?\s*,\s*['"]?(productive|expressive)['"]?\s*\)/
  );

  if (fullMatch) {
    return { isValid: true };
  }

  // NEW: Allow shorthand syntax: motion(standard) without quotes
  // SCSS processes this as a string
  const shorthandMatch = value.match(
    /\bmotion\s*\(\s*(standard|entrance|exit)\s*\)/
  );

  if (shorthandMatch) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message:
      "Invalid motion() parameters. Expected: motion('standard'|'entrance'|'exit', 'productive'|'expressive') or motion(standard|entrance|exit)",
  };
}
```

**Tests to add**:

```typescript
// Shorthand should be valid
expect(validateCarbonMotionFunction('motion(standard)')).toEqual({
  isValid: true,
});
expect(validateCarbonMotionFunction('motion(entrance)')).toEqual({
  isValid: true,
});
expect(validateCarbonMotionFunction('motion(exit)')).toEqual({ isValid: true });

// Full syntax should still be valid
expect(
  validateCarbonMotionFunction("motion('standard', 'productive')")
).toEqual({ isValid: true });
```

**Errors Fixed**: ~15 errors (motion shorthand)

---

## Summary of Changes

| Task                              | File(s)                     | Complexity | Errors Fixed | Priority |
| --------------------------------- | --------------------------- | ---------- | ------------ | -------- |
| 1. Strip namespaces/interpolation | validators.ts               | Medium     | ~40          | HIGH     |
| 2. Filter transform functions     | create-rule.ts              | Low        | ~30          | HIGH     |
| 3. Permit gradients               | validators.ts               | Low        | ~10          | HIGH     |
| 4. Add CSS keywords               | theme-use.ts, layout-use.ts | Low        | ~8           | HIGH     |
| 5. Verify calc()                  | -                           | None       | 0            | -        |
| 6. Allow motion() shorthand       | validators.ts               | Low        | ~15          | HIGH     |

**Total False Positives Fixed**: ~103 errors (31% of total)

**Remaining Errors**:

- ~110 legitimate issues in IBM Products (need token adoption)
- ~20 calc() with multiple tokens (legitimate issues)
- ~103 other edge cases

---

## Testing Strategy

### Unit Tests

Add tests for each new pattern:

```typescript
describe('SCSS cleaning', () => {
  it('strips interpolation', () => {
    expect(cleanScssValue('#{$spacing-04}')).toBe('$spacing-04');
  });

  it('strips namespaces', () => {
    expect(cleanScssValue('spacing.$spacing-04')).toBe('$spacing-04');
    expect(cleanScssValue('theme.$layer')).toBe('$layer');
  });
});

describe('Transform filtering', () => {
  it('skips non-spacing transforms', () => {
    expect(isSpacingTransformFunction('rotate(90deg)')).toBe(false);
    expect(isSpacingTransformFunction('scale(0.9)')).toBe(false);
  });

  it('validates spacing transforms', () => {
    expect(isSpacingTransformFunction('translateX(10px)')).toBe(true);
  });
});

describe('Gradients', () => {
  it('always permits gradients', () => {
    expect(isGradientFunction('linear-gradient(...)')).toBe(true);
  });
});
```

### Integration Tests

Test with IBM Products error cases:

```scss
// Should pass after fixes
.test {
  padding: spacing.$spacing-04; // ✅ Namespace stripped
  margin: #{$spacing-06}; // ✅ Interpolation stripped
  transform: rotate(90deg); // ✅ Non-spacing transform skipped
  background: linear-gradient(...); // ✅ Gradient permitted
  box-shadow: inset 0 1px 0 $border; // ✅ CSS keyword accepted
}

// Should still fail (legitimate issues)
.test {
  padding: 10px; // ❌ Hard-coded value
  box-shadow: 4px 8px rgba(0, 0, 0, 0.2); // ❌ Hard-coded values
  margin: calc($spacing-01 + $spacing-02); // ❌ Multiple tokens
}
```

---

## Implementation Timeline

### Week 1: Core Fixes

- Day 1-2: Implement Task 1 (SCSS cleaning)
- Day 3: Implement Task 2 (Transform filtering)
- Day 4: Implement Tasks 3 & 4 (Gradients, CSS keywords)
- Day 5: Unit tests

### Week 2: Research & Polish

- Day 1: Research motion() function
- Day 2: Implement motion() fix if needed
- Day 3-4: Integration testing with IBM Products
- Day 5: Documentation updates

### Week 3: IBM Products Fixes

- IBM Products team implements fixes for legitimate issues
- Visual regression testing
- Review and iterate

---

## Success Criteria

1. ✅ False positives reduced by ~88 errors (26%)
2. ✅ All approved patterns work correctly
3. ✅ Rejected patterns still fail appropriately
4. ✅ Tests pass with 95%+ coverage
5. ✅ IBM Products can run lint without false positives
6. ✅ Documentation updated with new patterns

---

## Rollout Plan

1. **Alpha Release**: Plugin fixes only
   - Test with IBM Products
   - Gather feedback
   - Iterate if needed

2. **Beta Release**: Plugin + IBM Products fixes
   - Full integration testing
   - Visual regression testing
   - Performance testing

3. **GA Release**: Production ready
   - Documentation complete
   - Migration guide updated
   - Announcement and training

---

## Next Steps

1. ✅ Get approval on this plan
2. Create GitHub issues for each task
3. Assign tasks to developers
4. Begin implementation
5. Regular check-ins on progress
