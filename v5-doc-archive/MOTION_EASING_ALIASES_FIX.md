# Motion Easing Aliases Support

## Problem

IBM Products uses `$standard-easing` from `@carbon/styles`, but the plugin was
only loading the newer token names from `@carbon/motion`
(`$easing-standard-productive`, `$easing-standard-expressive`, etc.), causing
false positive errors.

## Root Cause

The plugin's token loader (`loadMotionTokens()`) was loading tokens directly
from `@carbon/motion` package, which uses the v11 naming convention. However,
`@carbon/styles` provides convenience aliases for backward compatibility:

- `$standard-easing` → `cubic-bezier(0.5, 0, 0.1, 1)` (for majority of
  animations)
- `$ease-in` → `cubic-bezier(0.25, 0, 1, 1)` (for removing elements)
- `$ease-out` → `cubic-bezier(0, 0, 0.25, 1)` (for adding elements)

These aliases are defined in `/packages/styles/scss/_motion.scss` in the Carbon
monorepo.

## Solution

Updated [`loadMotionTokens()`](../src/utils/carbon-tokens.ts:316-332) to include
the `@carbon/styles` convenience aliases:

```typescript
// Add @carbon/styles convenience aliases
const aliases = [
  { name: 'standard-easing', value: 'cubic-bezier(0.5, 0, 0.1, 1)' },
  { name: 'ease-in', value: 'cubic-bezier(0.25, 0, 1, 1)' },
  { name: 'ease-out', value: 'cubic-bezier(0, 0, 0.25, 1)' },
];

for (const { name, value } of aliases) {
  // Add SCSS variable (aliases are SCSS-only, no CSS custom properties)
  easing.push({
    name: `$${name}`,
    value: value,
    type: 'scss',
  });
}
```

## Test Coverage

Created test fixture
[`carbon-easing-aliases.scss`](../src/__tests__/fixtures/motion-easing-use/valid/carbon-easing-aliases.scss)
to verify all three aliases work correctly in both standalone and shorthand
properties.

## Impact

This fix resolves all `$standard-easing` errors in IBM Products (and similar
errors for `$ease-in` and `$ease-out` if they exist).

### Before

```
animation-timing-function: Expected Carbon token instead of "$standard-easing"
```

### After

```
✓ No errors - $standard-easing is recognized as a valid Carbon token
```

## Files Modified

1. [`src/utils/carbon-tokens.ts`](../src/utils/carbon-tokens.ts:316-332) - Added
   alias loading
2. [`src/__tests__/fixtures/motion-easing-use/valid/carbon-easing-aliases.scss`](../src/__tests__/fixtures/motion-easing-use/valid/carbon-easing-aliases.scss) -
   Test fixture

## Related Issues

This fix addresses the motion easing errors reported in IBM Products testing,
specifically:

- Lines 48, 56, 71, 117 in various component files using `$standard-easing`
- Any usage of `$ease-in` or `$ease-out` aliases

## Notes

- These aliases are SCSS-only (no CSS custom property equivalents)
- The aliases map to the "productive" variants of the motion tokens
- This maintains backward compatibility with Carbon v10 code that may still use
  these aliases
