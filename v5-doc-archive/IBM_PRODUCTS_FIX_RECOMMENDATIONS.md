# IBM Products Fix Recommendations for Legitimate Issues

Based on the error analysis, here are the legitimate issues that should be fixed
in IBM Products.

## Summary Statistics

**Total Legitimate Issues**: ~110 errors (33% of total 336 errors)

### Breakdown by Type:

- Hard-coded spacing values: ~40 errors
- Hard-coded box-shadow values: ~60 errors
- rgba() with RGB values: ~10 errors

---

## 1. Hard-coded Spacing Values (~40 errors)

### Issue

Using hard-coded pixel values instead of Carbon spacing tokens.

### Examples from Error Log

```scss
// ❌ WRONG - Hard-coded values
margin-inline-start: 100px
margin-inline-start: 18px
margin-inline-start: -1px
padding: 6px
padding: 10px
inset-block-start: 7px
inset-inline-start: 7px
margin-block-start: -14px
```

### Fix Strategy

Replace with appropriate Carbon spacing tokens:

```scss
// ✅ CORRECT - Carbon tokens
margin-inline-start: $spacing-13  // 100px ≈ 6.25rem
margin-inline-start: $spacing-05  // 18px ≈ 1.125rem (closest)
margin-inline-start: -$spacing-01 // -1px (negative token)
padding: $spacing-03              // 6px ≈ 0.375rem (closest)
padding: $spacing-04              // 10px ≈ 0.625rem (closest)
inset-block-start: $spacing-03    // 7px ≈ 0.4375rem (closest)
inset-inline-start: $spacing-03   // 7px
margin-block-start: -$spacing-05  // -14px (negative)
```

### Carbon Spacing Scale Reference

| Token       | Value    | Rem      | Pixels |
| ----------- | -------- | -------- | ------ |
| $spacing-01 | 0.125rem | 0.125rem | 2px    |
| $spacing-02 | 0.25rem  | 0.25rem  | 4px    |
| $spacing-03 | 0.5rem   | 0.5rem   | 8px    |
| $spacing-04 | 0.75rem  | 0.75rem  | 12px   |
| $spacing-05 | 1rem     | 1rem     | 16px   |
| $spacing-06 | 1.5rem   | 1.5rem   | 24px   |
| $spacing-07 | 2rem     | 2rem     | 32px   |
| $spacing-08 | 2.5rem   | 2.5rem   | 40px   |
| $spacing-09 | 3rem     | 3rem     | 48px   |
| $spacing-10 | 4rem     | 4rem     | 64px   |
| $spacing-11 | 5rem     | 5rem     | 80px   |
| $spacing-12 | 6rem     | 6rem     | 96px   |
| $spacing-13 | 10rem    | 10rem    | 160px  |

### Affected Files

```
packages/ibm-products/src/components/Coachmark/_storybook-styles.scss
  22:3  margin-inline-start: 100px → $spacing-13

packages/ibm-products/src/patterns/CoachmarkFixed/example/index.scss
  32:3  margin-inline-start: 18px → $spacing-05

packages/ibm-products-styles/src/components/Tearsheet/_tearsheet_next.scss
  231:5  margin-block-start: -14px → -$spacing-05

packages/ibm-products-web-components/src/components/coachmark/coachmark-beacon/coachmark-beacon.scss
  53:9  inset-block-start: 7px → $spacing-03
  54:9  inset-inline-start: 7px → $spacing-03

packages/ibm-products/src/global/js/utils/makeDraggable/_storybook-styles.scss
  26:3  padding: 6px → $spacing-03
  44:3  padding-block: 10px → $spacing-04

packages/ibm-products-styles/src/components/PageHeader/_page-header.scss
  246:3  margin-inline-start: -1px → -$spacing-01
```

---

## 2. Hard-coded box-shadow Values (~60 errors)

### Issue

Using hard-coded pixel values for box-shadow offsets and blur radius instead of
Carbon tokens.

### Examples from Error Log

```scss
// ❌ WRONG - Hard-coded box-shadow
box-shadow: 4px 8px rgba(0, 0, 0, 0.2);
box-shadow: 1px 4px 8px -3px $overlay;
box-shadow: inset -80px 70px -65px $ai-inner-shadow;
box-shadow: 6px 6px rgba(0, 0, 0, 0.2);
box-shadow: 0 1px 0 0 $layer-accent-01;
```

### Fix Strategy

Box-shadows are complex. Options:

#### Option A: Use Carbon Elevation Tokens (RECOMMENDED)

Carbon provides elevation tokens that include proper shadows:

```scss
// ✅ CORRECT - Use Carbon elevation
@use '@carbon/styles/scss/theme' as *;

.component {
  box-shadow: $shadow; // Default shadow
  // or specific elevation levels if available
}
```

#### Option B: Use Spacing Tokens for Offsets

If custom shadows are required, use spacing tokens for offsets:

```scss
// ✅ BETTER - Use spacing tokens for offsets
box-shadow: $spacing-02 $spacing-03 $spacing-03 rgba($shadow, 0.2);
box-shadow: $spacing-01 $spacing-02 $spacing-03 -$spacing-02 $overlay;
```

#### Option C: Define as CSS Custom Properties

For complex shadows used multiple times:

```scss
// Define once
$custom-shadow: 0 $spacing-02 $spacing-04 rgba($shadow, 0.15);

// Use throughout
.component {
  box-shadow: $custom-shadow;
}
```

### Affected Files (Sample)

```
packages/ibm-products/src/components/CreateFullPage/_storybook-styles.scss
  19:3  box-shadow: 4px 1px ... → Use $shadow or spacing tokens

packages/ibm-products/src/components/FullPageError/_storybook-styles.scss
  51:3  box-shadow: 4px 1px ... → Use $shadow or spacing tokens

packages/ibm-products/src/components/PageHeader/_storybook-styles.scss
  92:3  box-shadow: 4px 1px ... → Use $shadow or spacing tokens

packages/ibm-products-styles/src/components/AddSelect/_add-select.scss
  287:3  box-shadow: 6px 6px rgba(0, 0, 0, 0.2) → Use $shadow
  329:5  box-shadow: 2px 6px rgba(0, 0, 0, 0.2) → Use $shadow

packages/ibm-products-styles/src/components/Card/_card.scss
  201:3  box-shadow: inset -80px 70px -65px ... → Complex AI shadow, may need custom property
  213:3  box-shadow: inset -80px 70px -65px ... → Complex AI shadow

packages/ibm-products-styles/src/components/PageHeader/_page-header.scss
  198:5  box-shadow: 0 1px 0 0 $layer-accent-01 → Use spacing tokens
  217:5  box-shadow: 25vw 0 1px 0 $layer-accent-01 → Use spacing tokens
```

### Special Case: AI Gradient Shadows

Some components use complex AI gradient shadows:

```scss
// These may be intentional design elements
box-shadow:
  inset -80px 70px -65px $ai-inner-shadow,
  0 4px 10px 2px rgba($ai-aura-start, 0.1);
```

**Recommendation**: Document these as design exceptions or create reusable
mixins.

---

## 3. rgba() with RGB Values (~10 errors)

### Issue

Using RGB values directly instead of Carbon color tokens.

### Examples from Error Log

```scss
// ❌ WRONG - RGB values
rgba(0, 0, 0, 0.2)
rgba(255, 255, 255, 0)
background: rgba(0, 0, 0, 0.12)
```

### Fix Strategy

Use Carbon color tokens with alpha:

```scss
// ✅ CORRECT - Carbon tokens with alpha
rgba($text-primary, 0.2)      // Instead of rgba(0, 0, 0, 0.2)
rgba($background, 0)          // Instead of rgba(255, 255, 255, 0)
rgba($text-primary, 0.12)     // Instead of rgba(0, 0, 0, 0.12)
```

### Affected Files

```
packages/ibm-products-styles/src/components/AddSelect/_add-select.scss
  287:3  rgba(0, 0, 0, 0.2) → rgba($text-primary, 0.2)
  329:5  rgba(0, 0, 0, 0.2) → rgba($text-primary, 0.2)

packages/ibm-products/src/global/js/utils/makeDraggable/_storybook-styles.scss
  15:3  rgba(0, 0, 0, 0.2) → rgba($text-primary, 0.2)

packages/ibm-products-styles/src/components/Tearsheet/_tearsheet_next.scss
  404:7  rgba(0, 0, 0, 0.12) → rgba($text-primary, 0.12)

packages/ibm-products-web-components/src/components/truncated-text/truncated-text.scss
  31:3  rgba(255, 255, 255, 0) → rgba($background, 0)
```

---

## 4. Edge Cases Requiring Investigation

### grid-gap with rem values

```scss
// Found in AddSelect
grid-gap: 2rem; // Should this be $spacing-07?
```

**Recommendation**: Replace with `$spacing-07` (2rem).

### Animation duration edge cases

```scss
// Found in PageHeader
animation-duration: 1ms  // Very short duration
$duration: 1000ms        // Not a Carbon token
```

**Recommendation**:

- `1ms` might be intentional for instant animations - consider adding to
  acceptValues
- `1000ms` should use Carbon motion tokens like `$duration-slow-02`

---

## Implementation Plan

### Phase 1: Quick Wins (Low Risk)

1. Replace obvious hard-coded spacing (6px → $spacing-03, etc.)
2. Fix rgba() RGB values to use tokens
3. Update simple box-shadows with spacing tokens

**Estimated**: ~30 errors fixed

### Phase 2: Box-shadow Refactoring (Medium Risk)

1. Audit all box-shadows for design intent
2. Create reusable shadow mixins/variables for common patterns
3. Replace with Carbon elevation tokens where appropriate
4. Document exceptions for complex AI shadows

**Estimated**: ~60 errors fixed

### Phase 3: Edge Cases (Low Risk)

1. Review animation durations
2. Update grid-gap values
3. Handle any remaining special cases

**Estimated**: ~20 errors fixed

---

## Testing Checklist

After making fixes, verify:

- [ ] Visual regression testing for all affected components
- [ ] Storybook stories render correctly
- [ ] Spacing appears consistent with design specs
- [ ] Shadows match intended elevation levels
- [ ] No layout shifts or visual breaks
- [ ] Dark mode/theme switching works correctly
- [ ] Responsive behavior maintained

---

## Migration Script (Optional)

Consider creating a codemod to automate common replacements:

```javascript
// Example codemod for spacing
module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const replacements = {
    '6px': '$spacing-03',
    '10px': '$spacing-04',
    '18px': '$spacing-05',
    // ... more mappings
  };

  // Find and replace in SCSS
  // Implementation details...
};
```

---

## Summary

| Category              | Count    | Priority | Complexity |
| --------------------- | -------- | -------- | ---------- |
| Hard-coded spacing    | ~40      | HIGH     | Low        |
| Hard-coded box-shadow | ~60      | HIGH     | Medium     |
| rgba() RGB values     | ~10      | HIGH     | Low        |
| **Total**             | **~110** |          |            |

**Estimated Effort**: 2-3 days for complete fix + testing

**Risk Level**: Low-Medium (mostly straightforward replacements, some design
review needed for shadows)
