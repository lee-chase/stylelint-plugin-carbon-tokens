# Remaining 223 Errors - Consolidated Summary

## Overview

After implementing v5 improvements, 223 errors remain in IBM Products. These are
**legitimate issues** requiring code changes to use Carbon tokens.

## Breakdown by Rule

### 1. carbon/layout-use (92 errors - 41%)

#### Negative Token Values (23 errors)

**Issue**: Negative SCSS variables not recognized as valid tokens **Pattern**:
`-$spacing-XX` **Examples**:

- `margin-inline-start: -$spacing-07`
- `inset-inline-end: -$spacing-05`
- `margin-block-start: -$spacing-01`

**Root Cause**: Plugin doesn't recognize negative SCSS variables as valid tokens

#### calc() with Multiple Tokens (15 errors)

**Issue**: calc() expressions with token addition/subtraction **Pattern**:
`calc($token + $token)` or `calc(-#{$token} + #{$token})` **Examples**:

- `calc($spacing-02 + $spacing-01)`
- `calc(-#{$spacing-07} + #{$spacing-01})`
- `calc(100% + #{$spacing-04} + #{$spacing-01})`

**Root Cause**: Policy decision - calc() only allows single token operations

#### Hard-Coded Pixel Values (18 errors)

**Issue**: Hard-coded spacing values instead of tokens **Pattern**: `XXpx`,
`XXrem` **Examples**:

- `margin-inline-start: 100px`
- `margin-inline-start: 18px`
- `padding: 6px`
- `margin-block-start: -14px`

**Action Required**: Replace with Carbon spacing tokens

#### Custom CSS Variables (12 errors)

**Issue**: Non-Carbon CSS custom properties **Pattern**: `var(--custom-name)`
**Examples**:

- `var(--grid-gap)`
- `var(--#{$block-class}--breadcrumb-top)`
- `var(--#{$block-class}--title-padding-right)`
- `var(--content-padding)`

**Action Required**: Replace with Carbon tokens or add to acceptValues

#### Non-Spacing Transform Functions (24 errors)

**Issue**: rotate() and scale() transforms flagged **Pattern**: `rotate(XXdeg)`,
`scale(X)`, `scaleX(X)`, `scaleY(X)` **Examples**:

- `rotate(0deg)`, `rotate(45deg)`, `rotate(180deg)`
- `scale(0.9)`, `scale(1.5)`
- `scaleX(-1)`, `scaleY(-1)`

**Root Cause**: These should NOT be validated (design decision made) **Status**:
⚠️ **FALSE POSITIVE** - Need to update plugin

---

### 2. carbon/theme-use (118 errors - 53%)

#### box-shadow Hard-Coded Values (85 errors)

**Issue**: Hard-coded pixel values in box-shadow **Pattern**: `XXpx` values in
shadows **Examples**:

- `box-shadow: 4px 8px rgba(0, 0, 0, 0.2)`
- `box-shadow: 1px 3px $text-inverse`
- `box-shadow: -80px 70px -65px $ai-inner-shadow`

**Action Required**: Use Carbon elevation tokens or add to acceptValues

#### rgba() with RGB Values (5 errors)

**Issue**: rgba() using numeric RGB instead of token **Pattern**:
`rgba(0, 0, 0, alpha)` **Examples**:

- `rgba(0, 0, 0, 0.2)`
- `rgba(0, 0, 0, 0.12)`

**Action Required**: Use `rgba($token, alpha)` format

#### Custom CSS Variables (10 errors)

**Issue**: Non-Carbon CSS custom properties **Pattern**:
`var(--custom-name, fallback)` **Examples**:

- `var(--cds-background, #ffffff)`
- `var(--cds-layer-accent-01, #e0e0e0)`
- `var(--overlay-color)`

**Action Required**: Remove fallback values or use Carbon tokens

#### SCSS Variables as Tokens (8 errors)

**Issue**: SCSS variables used in box-shadow **Pattern**: `$variable-name` in
shadow values **Examples**:

- `$spacing-01`, `$spacing-02` (in box-shadow)
- `$ai-inner-shadow`
- `$text-inverse`, `$button-tertiary`

**Root Cause**: Plugin suggests these are not theme tokens **Action Required**:
Verify if these are valid or need replacement

#### Hard-Coded Colors (5 errors)

**Issue**: Hex colors instead of tokens **Pattern**: `#XXXXXX` **Examples**:

- `background: #f0f0f0`

**Action Required**: Replace with Carbon color tokens

#### border with Custom Variables (5 errors)

**Issue**: Border using custom CSS variables **Pattern**:
`border: XXpx solid var(--custom)` **Examples**:

- `border: 10px solid var(--#{$block-class}--border-color)`

**Action Required**: Use Carbon tokens

---

### 3. carbon/motion-easing-use (3 errors - 1%)

#### SCSS Variables Not Recognized (3 errors)

**Issue**: SCSS easing variables not recognized **Pattern**: `$standard-easing`,
`motion.$standard-easing` **Examples**:

- `animation-timing-function: $standard-easing`
- `transition-timing-function: $standard-easing`

**Root Cause**: Plugin doesn't recognize these as valid easing tokens
**Status**: ⚠️ **FALSE POSITIVE** - Need to verify token names

---

### 4. carbon/motion-duration-use (3 errors - 1%)

#### Hard-Coded Durations (3 errors)

**Issue**: Hard-coded time values **Pattern**: `XXXms` **Examples**:

- `$duration: 1000ms`
- `animation-duration: 1ms`

**Action Required**: Replace with Carbon duration tokens

---

### 5. carbon/type-use (1 error - <1%)

#### Hard-Coded line-height (1 error)

**Issue**: Numeric line-height value **Pattern**: `X.X` **Examples**:

- `line-height: 1.4`

**Action Required**: Use Carbon type tokens or add to acceptValues

---

## Summary by Action Required

### Plugin Fixes Needed (27 errors - 12%)

1. **Non-spacing transforms** (24 errors): rotate(), scale() should not be
   validated
2. **SCSS easing variables** (3 errors): Recognize `$standard-easing` as valid

### IBM Products Code Changes (196 errors - 88%)

#### High Priority - Hard-Coded Values (46 errors)

- Pixel values in spacing: 18 errors
- Pixel values in box-shadow: 85 errors
- Hard-coded colors: 5 errors
- Hard-coded durations: 3 errors
- rgba() with RGB: 5 errors
- line-height: 1 error

#### Medium Priority - Token Issues (38 errors)

- Negative SCSS variables: 23 errors
- calc() with multiple tokens: 15 errors

#### Low Priority - Custom Variables (22 errors)

- Custom CSS variables in layout: 12 errors
- Custom CSS variables in theme: 10 errors

#### Needs Review (8 errors)

- SCSS variables in box-shadow: 8 errors (verify if valid tokens)

---

## Recommended Next Steps

### 1. Plugin Updates (Priority: High)

```typescript
// Update isSpacingTransformFunction() to be more restrictive
// Only validate translate* functions, skip rotate/scale/skew
```

### 2. IBM Products - Quick Wins (Priority: High)

- Replace hard-coded pixel values with Carbon spacing tokens
- Replace rgba(0,0,0,alpha) with rgba($token, alpha)
- Replace hard-coded colors with Carbon color tokens

### 3. IBM Products - Policy Decisions (Priority: Medium)

- Decide on negative token syntax: `-$spacing-XX` vs `calc(-1 * $spacing-XX)`
- Decide on calc() with multiple tokens: Allow or require single token?
- Decide on custom CSS variables: Add to acceptValues or replace?

### 4. IBM Products - Review (Priority: Low)

- Verify SCSS variables in box-shadow are valid theme tokens
- Consider if line-height: 1.4 should be allowed

---

## Error Distribution by File Type

- **Component Styles**: 156 errors (70%)
- **Storybook Styles**: 45 errors (20%)
- **Global/Utility Styles**: 22 errors (10%)

Most errors are in production component styles, indicating real issues that
should be addressed.
