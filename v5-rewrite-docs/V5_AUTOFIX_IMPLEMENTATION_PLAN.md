# V5 Auto-Fix Implementation Plan

## Current State

V5 currently has **limited auto-fix capabilities** compared to V4. While the
infrastructure exists (marked as `fixable: true`), the actual value-to-token
mappings are missing.

### What V5 Can Fix Now

- ✅ Wrong SCSS variable names (suggests closest Carbon token)
- ✅ Wrong CSS custom property names (suggests closest Carbon token)
- ✅ Shorthand property components (if they already use tokens)
- ✅ Function name prefixes (v10 → v11 migrations)

### What V5 Cannot Fix (Lost from V4)

- ❌ Layout: `16px` → `$spacing-05`
- ❌ Motion Duration: `110ms` → `$duration-fast-02`
- ❌ Motion Easing: `cubic-bezier(0.2, 0, 0.38, 0.9)` →
  `$easing-standard-productive`
- ❌ Theme: `#0f62fe` → `$link-primary` (was experimental in V4)

## Root Cause

The issue is in `src/utils/carbon-tokens.ts`. V5 stores token **names** as
values instead of actual CSS values:

```typescript
// Current (broken)
tokens.push({
  name: `$spacing-05`,
  value: 'spacing05', // ❌ Token name, not CSS value
  type: 'scss',
});
```

Then `src/utils/validators.ts:159` tries to match:

```typescript
const matchingToken = tokens.find((token) => token.value === value);
// Looks for token.value === "16px"
// But token.value is "spacing05", not "16px"
```

## Solution: Access Real Values from Carbon Packages

All Carbon packages export the actual CSS values we need:

### 1. Layout Values (`@carbon/layout`)

```javascript
// node_modules/@carbon/layout/es/index.js:106-118
var spacing05 = miniUnits(2); // = "1rem"
var spacing06 = miniUnits(3); // = "1.5rem"
var spacing07 = miniUnits(4); // = "2rem"
// Can calculate px: miniUnits(2) = rem(8 * 2) = rem(16) = "1rem" = 16px
```

### 2. Motion Duration Values (`@carbon/motion`)

```javascript
// node_modules/@carbon/motion/es/index.js:8-20
var durationFast01 = '70ms';
var durationFast02 = '110ms';
var durationModerate01 = '150ms';
var durationModerate02 = '240ms';
var durationSlow01 = '400ms';
var durationSlow02 = '700ms';
```

### 3. Motion Easing Values (`@carbon/motion`)

```javascript
// node_modules/@carbon/motion/es/index.js:22-35
var easings = {
  standard: {
    productive: 'cubic-bezier(0.2, 0, 0.38, 0.9)',
    expressive: 'cubic-bezier(0.4, 0.14, 0.3, 1)',
  },
  entrance: {
    productive: 'cubic-bezier(0, 0, 0.38, 0.9)',
    expressive: 'cubic-bezier(0, 0, 0.3, 1)',
  },
  exit: {
    productive: 'cubic-bezier(0.2, 0, 1, 0.9)',
    expressive: 'cubic-bezier(0.4, 0.14, 1, 1)',
  },
};
```

### 4. Theme Color Values (`@carbon/themes`)

```javascript
// Available but AMBIGUOUS - same color used by multiple tokens
themes.white.linkPrimary; // "#0f62fe"
themes.white.background; // "#ffffff" (also used by text-on-color, icon-on-color, etc.)
```

## Implementation Plan

### Phase 1: Layout Tokens (High Priority)

**Goal**: Enable `16px` → `$spacing-05` auto-fix

**Changes Required**:

1. **Modify `src/utils/carbon-tokens.ts:loadLayoutTokens()`**:

   ```typescript
   import * as layoutPackage from '@carbon/layout';
   import { rem, miniUnit } from '@carbon/layout';

   export function loadLayoutTokens(): TokenCollection {
     const spacing: CarbonToken[] = [];

     for (const tokenName of layoutTokens) {
       const token = formatTokenName(tokenName);
       const remValue = layoutPackage[tokenName]; // Get actual value: "1rem"
       const pxValue = convertRemToPx(remValue); // Calculate: "16px"

       // Add SCSS variable with rem value
       spacing.push({
         name: `$${token}`,
         value: remValue, // "1rem"
         type: 'scss',
       });

       // Add SCSS variable with px value (for matching)
       spacing.push({
         name: `$${token}`,
         value: pxValue, // "16px"
         type: 'scss',
       });

       // Add CSS custom property with rem value
       spacing.push({
         name: `--cds-${token}`,
         value: remValue,
         type: 'css-custom-prop',
       });

       // Add CSS custom property with px value (for matching)
       spacing.push({
         name: `--cds-${token}`,
         value: pxValue,
         type: 'css-custom-prop',
       });
     }

     return { spacing, layout, container, fluidSpacing, iconSize };
   }

   function convertRemToPx(remValue: string): string {
     const match = remValue.match(/^([\d.]+)rem$/);
     if (match) {
       const rem = parseFloat(match[1]);
       return `${rem * 16}px`;
     }
     return remValue;
   }
   ```

2. **Update `CarbonToken` type in `src/types/index.ts`**:
   ```typescript
   export interface CarbonToken {
     name: string;
     value: string;
     type: 'scss' | 'css-custom-prop';
     // Optional: for deduplication
     canonicalValue?: string; // The "primary" value (e.g., "1rem")
   }
   ```

**Expected Results**:

- ✅ `margin: 16px;` → `margin: $spacing-05;`
- ✅ `margin: 1rem;` → `margin: $spacing-05;`
- ✅ `padding: 24px;` → `padding: $spacing-06;`

### Phase 2: Motion Duration Tokens (High Priority)

**Goal**: Enable `110ms` → `$duration-fast-02` auto-fix

**Changes Required**:

1. **Modify `src/utils/carbon-tokens.ts:loadMotionTokens()`**:

   ```typescript
   import * as motionPackage from '@carbon/motion';

   export function loadMotionTokens(): TokenCollection {
     const duration: CarbonToken[] = [];

     // Map of token names to their actual values
     const durationValues = {
       durationFast01: motionPackage.durationFast01, // "70ms"
       durationFast02: motionPackage.durationFast02, // "110ms"
       durationModerate01: motionPackage.durationModerate01, // "150ms"
       durationModerate02: motionPackage.durationModerate02, // "240ms"
       durationSlow01: motionPackage.durationSlow01, // "400ms"
       durationSlow02: motionPackage.durationSlow02, // "700ms"
     };

     for (const [tokenName, msValue] of Object.entries(durationValues)) {
       const token = formatTokenName(tokenName);

       duration.push({
         name: `$${token}`,
         value: msValue, // Actual value: "110ms"
         type: 'scss',
       });

       duration.push({
         name: `--cds-${token}`,
         value: msValue,
         type: 'css-custom-prop',
       });
     }

     return { duration, easing };
   }
   ```

**Expected Results**:

- ✅ `transition: opacity 110ms;` → `transition: opacity $duration-fast-02;`
- ✅ `animation-duration: 400ms;` → `animation-duration: $duration-slow-01;`

### Phase 3: Motion Easing Tokens (High Priority)

**Goal**: Enable `cubic-bezier(0.2, 0, 0.38, 0.9)` →
`$easing-standard-productive` auto-fix

**Changes Required**:

1. **Modify `src/utils/carbon-tokens.ts:loadMotionTokens()`**:

   ```typescript
   import { easings } from '@carbon/motion';

   export function loadMotionTokens(): TokenCollection {
     const easing: CarbonToken[] = [];

     // Map easing values to token names
     const easingMappings = [
       {
         name: 'easing-standard-productive',
         value: easings.standard.productive,
       },
       {
         name: 'easing-standard-expressive',
         value: easings.standard.expressive,
       },
       {
         name: 'easing-entrance-productive',
         value: easings.entrance.productive,
       },
       {
         name: 'easing-entrance-expressive',
         value: easings.entrance.expressive,
       },
       { name: 'easing-exit-productive', value: easings.exit.productive },
       { name: 'easing-exit-expressive', value: easings.exit.expressive },
     ];

     for (const { name, value } of easingMappings) {
       easing.push({
         name: `$${name}`,
         value: value, // Actual cubic-bezier value
         type: 'scss',
       });

       easing.push({
         name: `--cds-${name}`,
         value: value,
         type: 'css-custom-prop',
       });
     }

     return { duration, easing };
   }
   ```

2. **Update `src/utils/validators.ts` to normalize cubic-bezier**:
   ```typescript
   function normalizeCubicBezier(value: string): string {
     // Remove whitespace variations
     return value.replace(/\s+/g, ' ').trim();
   }
   ```

**Expected Results**:

- ✅ `transition: opacity 300ms cubic-bezier(0.2, 0, 0.38, 0.9);` →
  `transition: opacity 300ms $easing-standard-productive;`
- ✅ `animation-timing-function: cubic-bezier(0, 0, 0.38, 0.9);` →
  `animation-timing-function: $easing-entrance-productive;`

### Phase 4: Theme Color Tokens (Medium Priority - Opt-in)

**Goal**: Enable `#0f62fe` → `$link-primary` auto-fix (with warnings for
ambiguous colors)

**Problem**: Colors are ambiguous - same color used by multiple tokens

- Example: `#ffffff` could be `$background`, `$text-on-color`, `$icon-on-color`,
  etc.

**V4's Solution**: Experimental opt-in feature with warning comments

**Changes Required**:

1. **Add `experimentalFixTheme` option to `ThemeRuleOptions`**:

   ```typescript
   // src/types/index.ts
   export interface ThemeRuleOptions extends BaseRuleOptions {
     experimentalFixTheme?: 'white' | 'g10' | 'g90' | 'g100';
   }
   ```

2. **Modify `src/utils/carbon-tokens.ts:loadThemeTokens()`**:

   ```typescript
   import * as themes from '@carbon/themes';

   export function loadThemeTokens(
     experimentalFixTheme?: string
   ): CarbonToken[] {
     const tokens: CarbonToken[] = [];

     if (experimentalFixTheme && themes[experimentalFixTheme]) {
       // Load actual color values for auto-fix
       const theme = themes[experimentalFixTheme];

       for (const [tokenName, colorValue] of Object.entries(theme)) {
         const formattedName = formatTokenName(tokenName);

         tokens.push({
           name: `$${formattedName}`,
           value: colorValue, // Actual hex/rgba value
           type: 'scss',
         });

         tokens.push({
           name: `--cds-${formattedName}`,
           value: colorValue,
           type: 'css-custom-prop',
         });
       }
     } else {
       // Default: load token names only (no auto-fix)
       // Use existing unstable_metadata approach
       if (themes.unstable_metadata) {
         const colorTokens = themes.unstable_metadata.v11.filter(
           (token) => token.type === 'color'
         );

         for (const token of colorTokens) {
           tokens.push({
             name: `$${token.name}`,
             value: token.name, // Token name, not color value
             type: 'scss',
           });

           tokens.push({
             name: `--cds-${token.name}`,
             value: token.name,
             type: 'css-custom-prop',
           });
         }
       }
     }

     return tokens;
   }
   ```

3. **Update `src/rules/theme-use.ts` to pass option**:

   ```typescript
   export default createCarbonRule({
     ruleName,
     defaultOptions,
     tokenLoader: (options?: ThemeRuleOptions) =>
       loadThemeTokens(options?.experimentalFixTheme),
   });
   ```

4. **Handle ambiguous colors in `src/utils/validators.ts`**:
   ```typescript
   export function validateValue(
     value: string,
     tokens: CarbonToken[],
     options: ValidationOptions = {}
   ): ValidationResult {
     // ... existing code ...

     // Check if it's a hard-coded value that matches a token
     const matchingTokens = tokens.filter((token) => token.value === value);

     if (matchingTokens.length > 0) {
       const suggestedFix = matchingTokens[0].name;
       const hasMultipleMatches = matchingTokens.length > 1;

       return {
         isValid: false,
         message: `Use Carbon token instead of hard-coded value "${value}"`,
         suggestedFix: hasMultipleMatches
           ? `${suggestedFix} /* fix: see notes - ${matchingTokens.length} tokens match */`
           : suggestedFix,
       };
     }

     // ... rest of code ...
   }
   ```

**Configuration Example**:

```javascript
{
  'carbon/theme-use': [
    true,
    {
      // Default: undefined (no auto-fix for colors)
      experimentalFixTheme: undefined,

      // Opt-in: specify theme for color auto-fix
      // experimentalFixTheme: 'white',
    }
  ]
}
```

**Expected Results**:

- Default: `color: #0f62fe;` → Error, no auto-fix suggestion
- With `experimentalFixTheme: 'white'`:
  - ✅ `color: #0f62fe;` → `color: $link-primary;` (unique match)
  - ⚠️ `color: #ffffff;` →
    `color: $background; /* fix: see notes - 5 tokens match */` (ambiguous)

### Phase 5: Type Tokens (Not Possible)

**Status**: ❌ Cannot implement

**Reason**: Type tokens return objects, not simple values

```typescript
import { heading03 } from '@carbon/type';
// heading03 = {
//   fontSize: '1.25rem',
//   fontWeight: 400,
//   lineHeight: 1.4,
//   letterSpacing: 0
// }
```

**Why no auto-fix**:

- `16px` could map to multiple type scales
- Font properties are multi-dimensional (size + weight + line-height)
- No 1:1 mapping exists
- V4 didn't have this either

## Testing Strategy

### Unit Tests

1. **Token Loading Tests** (`src/utils/__tests__/carbon-tokens.test.ts`):

   ```typescript
   describe('loadLayoutTokens', () => {
     it('should load actual rem values', () => {
       const tokens = loadLayoutTokens();
       const spacing05 = tokens.spacing.find((t) => t.name === '$spacing-05');
       expect(spacing05?.value).toBe('1rem');
     });

     it('should load px equivalents', () => {
       const tokens = loadLayoutTokens();
       const spacing05Px = tokens.spacing.find(
         (t) => t.name === '$spacing-05' && t.value === '16px'
       );
       expect(spacing05Px).toBeDefined();
     });
   });
   ```

2. **Validation Tests** (`src/utils/__tests__/validators.test.ts`):
   ```typescript
   describe('validateValue with real values', () => {
     it('should suggest token for 16px', () => {
       const tokens = loadLayoutTokens().spacing;
       const result = validateValue('16px', tokens, {});
       expect(result.isValid).toBe(false);
       expect(result.suggestedFix).toBe('$spacing-05');
     });

     it('should suggest token for 1rem', () => {
       const tokens = loadLayoutTokens().spacing;
       const result = validateValue('1rem', tokens, {});
       expect(result.isValid).toBe(false);
       expect(result.suggestedFix).toBe('$spacing-05');
     });
   });
   ```

### Integration Tests

1. **Auto-fix Tests** (`src/rules/__tests__/layout-use.test.ts`):

   ```typescript
   it('should auto-fix 16px to $spacing-05', async () => {
     const result = await stylelint.lint({
       code: '.test { margin: 16px; }',
       config: {
         plugins: ['./src/index.ts'],
         rules: { 'carbon/layout-use': true },
       },
       fix: true,
     });

     expect(result.output).toBe('.test { margin: $spacing-05; }');
   });
   ```

2. **Fixture Tests** (`src/__tests__/fixtures.test.ts`):
   - Add fixtures for auto-fix scenarios
   - Test both detection and fixing

## Migration Guide Updates

Update `MIGRATION_V4_TO_V5.md` to document:

1. **Auto-fix improvements**:
   - Layout tokens: Now supports both px and rem
   - Motion easing: Now supports cubic-bezier values
   - Theme colors: Opt-in via `experimentalFixTheme`

2. **Breaking changes**:
   - Theme color auto-fix now requires explicit opt-in
   - Default behavior: no auto-fix for hex colors (safer)

3. **Configuration examples**:

   ```javascript
   // V4 (experimental theme fix was always on if configured)
   {
     'carbon/theme-use': [true, {
       experimentalFixTheme: 'white'
     }]
   }

   // V5 (same, but more explicit about being experimental)
   {
     'carbon/theme-use': [true, {
       experimentalFixTheme: 'white'  // Opt-in for color auto-fix
     }]
   }
   ```

## Documentation Updates

Update `README.md` to clarify auto-fix capabilities:

```markdown
## Auto-Fix Support

V5 includes comprehensive auto-fix capabilities:

### Always Enabled

- **Layout tokens**: `16px` → `$spacing-05`, `1rem` → `$spacing-05`
- **Motion duration**: `110ms` → `$duration-fast-02`
- **Motion easing**: `cubic-bezier(0.2, 0, 0.38, 0.9)` →
  `$easing-standard-productive`

### Opt-in (Experimental)

- **Theme colors**: `#0f62fe` → `$link-primary`
  - Requires `experimentalFixTheme` option
  - May suggest multiple tokens for ambiguous colors
  - Use with caution in production

### Not Supported

- **Type tokens**: No 1:1 mapping exists for font sizes
```

## Implementation Checklist

- [ ] Phase 1: Layout tokens
  - [ ] Update `loadLayoutTokens()` to load real values
  - [ ] Add px/rem conversion utility
  - [ ] Update token type to support multiple values
  - [ ] Add unit tests
  - [ ] Add integration tests
  - [ ] Update fixtures

- [ ] Phase 2: Motion duration tokens
  - [ ] Update `loadMotionTokens()` to load real values
  - [ ] Add unit tests
  - [ ] Add integration tests
  - [ ] Update fixtures

- [ ] Phase 3: Motion easing tokens
  - [ ] Update `loadMotionTokens()` to load easing values
  - [ ] Add cubic-bezier normalization
  - [ ] Add unit tests
  - [ ] Add integration tests
  - [ ] Update fixtures

- [ ] Phase 4: Theme color tokens (opt-in)
  - [ ] Add `experimentalFixTheme` option to types
  - [ ] Update `loadThemeTokens()` to conditionally load values
  - [ ] Add ambiguity detection and warning comments
  - [ ] Add unit tests
  - [ ] Add integration tests
  - [ ] Update fixtures
  - [ ] Document experimental nature

- [ ] Documentation
  - [ ] Update README.md with auto-fix details
  - [ ] Update MIGRATION_V4_TO_V5.md
  - [ ] Add examples to configuration docs
  - [ ] Document experimental features

- [ ] Testing
  - [ ] Verify all auto-fix scenarios work
  - [ ] Test with real Carbon projects
  - [ ] Performance testing with large codebases
  - [ ] Edge case testing (malformed values, etc.)

## Timeline Estimate

- Phase 1 (Layout): 1-2 days
- Phase 2 (Motion Duration): 0.5 days
- Phase 3 (Motion Easing): 0.5 days
- Phase 4 (Theme Colors): 1-2 days
- Documentation: 0.5 days
- Testing & Polish: 1 day

**Total**: ~5-7 days

## Success Criteria

1. All V4 auto-fix capabilities restored (except type tokens)
2. New capabilities added (motion easing cubic-bezier)
3. Safer defaults (theme colors opt-in only)
4. Comprehensive test coverage (>90%)
5. Clear documentation with examples
6. No performance regression
7. Backward compatible configuration (where possible)
