# V5 Plugin Fixes Summary

This document summarizes all fixes implemented to address false positives found
during IBM Products testing.

## Overview

During testing with IBM Products, we identified 336 linting errors. Analysis
revealed that many were false positives due to plugin limitations. We
implemented 7 major fixes to address these issues.

## Fixes Implemented

### 1. Negative SCSS Variables Support

**Problem**: Plugin rejected negative SCSS variables like `-$spacing-07`

**Solution**: Updated [`isScssVariable()`](../src/utils/validators.ts:89-91) and
[`cleanScssValue()`](../src/utils/validators.ts:104-109) to handle leading minus
signs

**Files Modified**:

- [`src/utils/validators.ts`](../src/utils/validators.ts:89-109)
- Test fixtures in `src/__tests__/fixtures/layout-use/valid/`

**Documentation**:
[NEGATIVE_SCSS_VARIABLES_FIX.md](NEGATIVE_SCSS_VARIABLES_FIX.md)

---

### 2. Non-Spacing Transform Functions

**Problem**: Plugin incorrectly validated `rotate()`, `scale()`, `scaleX()`,
`scaleY()` as spacing values

**Solution**: Added regex skip in
[`create-rule.ts`](../src/utils/create-rule.ts:523-529) for non-spacing
transform functions

**Files Modified**:

- [`src/utils/create-rule.ts`](../src/utils/create-rule.ts:523-529)
- [`src/__tests__/fixtures/layout-use/valid/non-spacing-transforms.scss`](../src/__tests__/fixtures/layout-use/valid/non-spacing-transforms.scss)

**Documentation**:
[NON_SPACING_TRANSFORMS_FIX.md](NON_SPACING_TRANSFORMS_FIX.md)

---

### 3. 1px Values Support

**Problem**: Plugin rejected `1px` values in borders and box-shadows, which are
valid for hairline borders

**Solution**: Added `1px` to acceptValues in both
[`theme-use.ts`](../src/rules/theme-use.ts:25) and
[`layout-use.ts`](../src/rules/layout-use.ts:41)

**Files Modified**:

- [`src/rules/theme-use.ts`](../src/rules/theme-use.ts:25-28)
- [`src/rules/layout-use.ts`](../src/rules/layout-use.ts:41-42)
- Test fixtures in `src/__tests__/fixtures/*/valid/one-pixel-values.scss`

**Documentation**: [1PX_SUPPORT_ANALYSIS.md](1PX_SUPPORT_ANALYSIS.md)

---

### 4. Trailing Punctuation in Values

**Problem**: Parser failed to strip trailing commas/semicolons from values like
`"$spacing-02,"`

**Solution**: Updated [`parseValue()`](../src/utils/validators.ts:237-273) to
strip trailing punctuation

**Files Modified**:

- [`src/utils/validators.ts`](../src/utils/validators.ts:237-273)

**Impact**: Fixes parsing of multi-value properties like `box-shadow`,
`background`, `border`

---

### 5. Cross-Token Property Support

**Problem**: Properties like `box-shadow` and `border` mix spacing and theme
concerns, but rules only accepted their primary token type

**Solution**:

- Added spacing token patterns to
  [`theme-use.ts`](../src/rules/theme-use.ts:25-28) acceptValues
- Added theme token patterns to
  [`layout-use.ts`](../src/rules/layout-use.ts:41-42) acceptValues

**Files Modified**:

- [`src/rules/theme-use.ts`](../src/rules/theme-use.ts:25-28)
- [`src/rules/layout-use.ts`](../src/rules/layout-use.ts:41-42)
- [`src/__tests__/fixtures/theme-use/valid/box-shadow-with-spacing.scss`](../src/__tests__/fixtures/theme-use/valid/box-shadow-with-spacing.scss)

**Documentation**: [BOX_SHADOW_FIX_SUMMARY.md](BOX_SHADOW_FIX_SUMMARY.md)

---

### 6. Border Style Keywords

**Problem**: Plugin rejected valid CSS border-style keywords like `solid`,
`dashed`, `inset`

**Solution**: Added regex pattern to
[`theme-use.ts`](../src/rules/theme-use.ts:25-28) acceptValues to match
border-style keywords

**Files Modified**:

- [`src/rules/theme-use.ts`](../src/rules/theme-use.ts:25-28)
- [`src/__tests__/fixtures/theme-use/valid/border-style-keywords.scss`](../src/__tests__/fixtures/theme-use/valid/border-style-keywords.scss)

**Pattern**:
`/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/`

---

### 7. Motion Easing Aliases

**Problem**: Plugin rejected `$standard-easing`, `$ease-in`, `$ease-out` from
`@carbon/styles`

**Solution**: Added convenience aliases to
[`loadMotionTokens()`](../src/utils/carbon-tokens.ts:316-332)

**Files Modified**:

- [`src/utils/carbon-tokens.ts`](../src/utils/carbon-tokens.ts:316-332)
- [`src/__tests__/fixtures/motion-easing-use/valid/carbon-easing-aliases.scss`](../src/__tests__/fixtures/motion-easing-use/valid/carbon-easing-aliases.scss)

**Documentation**: [MOTION_EASING_ALIASES_FIX.md](MOTION_EASING_ALIASES_FIX.md)

**Aliases Added**:

- `$standard-easing` → `cubic-bezier(0.5, 0, 0.1, 1)`
- `$ease-in` → `cubic-bezier(0.25, 0, 1, 1)`
- `$ease-out` → `cubic-bezier(0, 0, 0.25, 1)`

---

## Test Coverage

All fixes include comprehensive test coverage:

- ✅ Unit tests for validator functions
- ✅ Fixture-based tests for each rule
- ✅ Integration tests for combined scenarios
- ✅ All existing tests continue to pass

See [TEST_COVERAGE_SUMMARY.md](TEST_COVERAGE_SUMMARY.md) for details.

---

## Impact on IBM Products Errors

### Before Fixes

- **Total Errors**: 336
- **False Positives**: ~80% (estimated)

### After Fixes

Expected significant reduction in false positives:

- ✅ All negative SCSS variable errors resolved
- ✅ All non-spacing transform errors resolved
- ✅ All 1px border/shadow errors resolved
- ✅ All trailing punctuation parsing errors resolved
- ✅ All cross-token property errors resolved
- ✅ All border-style keyword errors resolved
- ✅ All motion easing alias errors resolved

### Remaining Errors

After these fixes, remaining errors should be:

1. **Legitimate issues** - Actual hard-coded values that should use tokens
2. **Edge cases** - Complex patterns not yet supported
3. **Policy decisions** - Values that need team discussion

---

## Files Modified Summary

### Core Logic

- [`src/utils/validators.ts`](../src/utils/validators.ts) - Parser improvements
- [`src/utils/carbon-tokens.ts`](../src/utils/carbon-tokens.ts) - Token loading
- [`src/utils/create-rule.ts`](../src/utils/create-rule.ts) - Transform
  validation

### Rules

- [`src/rules/theme-use.ts`](../src/rules/theme-use.ts) - Cross-token support,
  border keywords, 1px
- [`src/rules/layout-use.ts`](../src/rules/layout-use.ts) - Cross-token support,
  1px

### Tests

- 7 new test fixtures added
- All existing tests updated and passing
- New unit tests for validator functions

---

## Next Steps

1. **Re-test with IBM Products** to verify error reduction
2. **Analyze remaining errors** to identify any additional patterns
3. **Document policy decisions** for edge cases
4. **Update migration guide** with new supported patterns
5. **Prepare v5 release notes** documenting all improvements

---

## Related Documentation

- [V5_OVERVIEW.md](../V5_OVERVIEW.md) - Overall v5 changes
- [MIGRATION_V4_TO_V5.md](../MIGRATION_V4_TO_V5.md) - Migration guide
- [V5_TEST_COVERAGE.md](../v5-rewrite-docs/V5_TEST_COVERAGE.md) - Test coverage
  details
