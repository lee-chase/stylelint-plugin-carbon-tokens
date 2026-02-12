# IBM Products Stylelint Error Analysis

## Error Categorization by Type

### Category 1: SCSS Variable Interpolation (#{$token})

**Count: ~15 errors** **Rule: layout-use, theme-use**

```scss
// Examples:
inset-block-end: #{$spacing-06}
--overlay-color: #{$overlay}
--overlay-color: #{$ai-overlay}
```

**Analysis**: These use SCSS interpolation syntax `#{$variable}` where
`$variable` IS a Carbon token. The validator sees the interpolated string, not
the original variable.

**Status**: **FALSE POSITIVE** - These ARE Carbon tokens, just interpolated.

---

### Category 2: SCSS Namespace Variables (module.$token)

**Count: ~25 errors** **Rule: layout-use, theme-use, type-use**

```scss
// Examples:
Value "spacing.$spacing-04" should use a Carbon token
Value "theme.$layer" should use a Carbon token
Value "theme.$text-primary" should use a Carbon token
Value "motion.$duration-slow-01" should use a Carbon token
Value "motion.$standard-easing" should use a Carbon token
```

**Analysis**: These use SCSS module syntax `namespace.$token` where the token IS
from Carbon. The validator doesn't recognize the namespace prefix.

**Status**: **FALSE POSITIVE** - These ARE Carbon tokens with module namespace.

---

### Category 3: Transform Functions (rotate, scale, scaleX, scaleY)

**Count: ~30 errors** **Rule: layout-use**

```scss
// Examples:
transform: rotate(0deg)
transform: rotate(90deg)
transform: rotate(180deg)
transform: rotate(-180deg)
transform: scale(0.9)
transform: scale(1.5)
transform: scaleX(-1)
transform: scaleY(-1)
```

**Analysis**: These are rotation/scaling transforms that don't use spacing. The
layout-use rule validates transform but these functions aren't spacing-related.

**Status**: **POLICY DECISION** - Should rotation/scaling transforms require
tokens? Probably not.

---

### Category 4: Transform Translate with Variables

**Count: ~10 errors** **Rule: layout-use**

```scss
// Examples:
transform: translateY(-$spacing-04)
transform: translateY(var(--#{$block-class}--breadcrumb-title-top))
transform: translateX(var(--#{$block-class}--displaced))
```

**Analysis**: These use SCSS variables or CSS custom properties in translate
functions. The validator may not recognize them as valid.

**Status**: **NEEDS INVESTIGATION** - May be false positives if variables are
Carbon tokens.

---

### Category 5: calc() with Token Arithmetic

**Count: ~20 errors** **Rule: layout-use**

```scss
// Examples:
calc(-1 * $indicator-height)
calc(-1 * $indicator-width)
calc($spacing-02 + $spacing-01)
calc($spacing-01 + $spacing-03)
calc(100% + #{$spacing-04} + #{$spacing-01})
calc(-#{$spacing-07} + #{$spacing-01})
```

**Analysis**: V5 expects pattern `calc(P O token)` or `calc(-1 * token)`. These
use token arithmetic which is valid SCSS but doesn't match the strict pattern.

**Status**: **FALSE POSITIVE** - Valid Carbon token usage, just not matching
strict pattern.

---

### Category 6: Hard-coded Spacing Values

**Count: ~40 errors** **Rule: layout-use**

```scss
// Examples:
margin-inline-start: 100px
margin-inline-start: 18px
margin-inline-start: -1px
padding: 6px
padding: 10px
inset-block-start: 7px
inset-inline-start: 7px
```

**Analysis**: These are hard-coded pixel values that should use Carbon spacing
tokens.

**Status**: **LEGITIMATE ISSUE** - Should be fixed to use Carbon tokens.

---

### Category 7: Hard-coded box-shadow Values

**Count: ~60 errors** **Rule: theme-use**

```scss
// Examples:
box-shadow: 4px 8px rgba(0, 0, 0, 0.2)
box-shadow: 1px 4px 8px -3px $overlay
box-shadow: inset -80px 70px -65px $ai-inner-shadow
box-shadow: 6px 6px rgba(0, 0, 0, 0.2)
```

**Analysis**: Box-shadow with hard-coded pixel offsets and blur values. Some
also use Carbon tokens mixed with hard-coded values.

**Status**: **LEGITIMATE ISSUE** - Hard-coded values should use tokens. Mixed
usage needs review.

---

### Category 8: rgba() with RGB Values

**Count: ~10 errors** **Rule: theme-use**

```scss
// Examples:
rgba(0, 0, 0, 0.2)
rgba(255, 255, 255, 0)
```

**Analysis**: Using RGB values instead of Carbon color tokens in rgba().

**Status**: **LEGITIMATE ISSUE** - Should use `rgba($carbon-token, alpha)`.

---

### Category 9: motion() Function Invalid Parameters

**Count: ~15 errors** **Rule: motion-easing-use**

```scss
// Examples:
motion(standard)
animation: ... motion(standard)
transition: ... motion(standard)
```

**Analysis**: V5 expects
`motion('standard'|'entrance'|'exit', 'productive'|'expressive')` with quotes
and both parameters. These use shorthand.

**Status**: **POLICY DECISION** - Should shorthand `motion(standard)` be
allowed?

---

### Category 10: CSS Custom Properties with Fallbacks

**Count: ~15 errors** **Rule: theme-use**

```scss
// Examples:
var(--cds-background, #ffffff)
var(--cds-text-primary, #161616)
var(--cds-layer-accent-01, #e0e0e0)
var(--#{$block-class}--border-color)
```

**Analysis**: CSS custom properties with fallback values or SCSS interpolation
in var().

**Status**: **NEEDS INVESTIGATION** - May need special handling for fallbacks.

---

### Category 11: Linear Gradients

**Count: ~10 errors** **Rule: theme-use**

```scss
// Examples:
linear-gradient(90deg, $blue-90 0%, $purple-70 100%)
linear-gradient(to bottom, $purple-80 40%, $purple-70)
linear-gradient(to right, rgba(255, 255, 255, 0), $layer-01)
```

**Analysis**: Gradients using Carbon tokens but flagged because of the gradient
syntax.

**Status**: **FALSE POSITIVE** - Using Carbon tokens correctly in gradients.

---

### Category 12: Shorthand Values (inset, padding-box, border-box)

**Count: ~8 errors** **Rule: theme-use, layout-use**

```scss
// Examples:
box-shadow: inset ...
background: padding-box, border-box
inset: logical
```

**Analysis**: CSS keywords used in shorthand properties.

**Status**: **FALSE POSITIVE** - These are valid CSS keywords, not token values.

---

### Category 13: Perspective and Other Transform Values

**Count: ~5 errors** **Rule: layout-use**

```scss
// Examples:
transform: perspective(convert.to-rem(144px));
```

**Analysis**: Perspective transform with unit conversion function.

**Status**: **NEEDS INVESTIGATION** - May be legitimate if hard-coded value.

---

### Category 14: Animation Duration Edge Cases

**Count: ~3 errors** **Rule: motion-duration-use**

```scss
// Examples:
animation-duration: 1ms
$duration: 1000ms
```

**Analysis**: Very short or specific durations that may not have Carbon token
equivalents.

**Status**: **NEEDS INVESTIGATION** - May need to be accepted values.

---

### Category 15: Grid Gap with Variables

**Count: ~5 errors** **Rule: layout-use**

```scss
// Examples:
grid-gap: var(--grid-gap)
grid-gap: spacing.$spacing-04
grid-gap: 2rem
```

**Analysis**: Grid gap using variables or rem values.

**Status**: **MIXED** - CSS var may be false positive, 2rem is hard-coded.

---

## Summary Statistics

| Category                      | Count   | Status              |
| ----------------------------- | ------- | ------------------- |
| SCSS Interpolation #{$token}  | 15      | FALSE POSITIVE      |
| SCSS Namespace module.$token  | 25      | FALSE POSITIVE      |
| Transform rotate/scale        | 30      | POLICY DECISION     |
| Transform translate with vars | 10      | NEEDS INVESTIGATION |
| calc() token arithmetic       | 20      | FALSE POSITIVE      |
| Hard-coded spacing            | 40      | LEGITIMATE ISSUE    |
| Hard-coded box-shadow         | 60      | LEGITIMATE ISSUE    |
| rgba() with RGB               | 10      | LEGITIMATE ISSUE    |
| motion() invalid params       | 15      | POLICY DECISION     |
| CSS custom props              | 15      | NEEDS INVESTIGATION |
| Linear gradients              | 10      | FALSE POSITIVE      |
| Shorthand keywords            | 8       | FALSE POSITIVE      |
| Perspective transforms        | 5       | NEEDS INVESTIGATION |
| Animation duration edge       | 3       | NEEDS INVESTIGATION |
| Grid gap mixed                | 5       | MIXED               |
| **TOTAL**                     | **336** |                     |

### Breakdown by Status:

- **FALSE POSITIVE**: ~113 errors (34%)
- **LEGITIMATE ISSUE**: ~110 errors (33%)
- **POLICY DECISION**: ~45 errors (13%)
- **NEEDS INVESTIGATION**: ~48 errors (14%)
- **MIXED**: ~20 errors (6%)

## Next Steps

1. **Fix False Positives in Plugin** (~113 errors)
   - Support SCSS interpolation `#{$token}`
   - Support SCSS module syntax `namespace.$token`
   - Support calc() with token arithmetic
   - Support gradients with tokens
   - Exclude CSS keywords from validation

2. **Fix Legitimate Issues in IBM Products** (~110 errors)
   - Replace hard-coded spacing values
   - Replace hard-coded box-shadow values
   - Use `rgba($token, alpha)` instead of RGB values

3. **Make Policy Decisions** (~45 errors)
   - Should rotate/scale transforms require tokens?
   - Should `motion(standard)` shorthand be allowed?

4. **Investigate Edge Cases** (~48 errors)
   - Transform translate with variables
   - CSS custom properties with fallbacks
   - Perspective transforms
   - Animation duration edge cases
