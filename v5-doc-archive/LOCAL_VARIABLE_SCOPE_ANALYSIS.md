# Local SCSS Variable Scope Support Analysis

## Executive Summary

**V4 Behavior**: Supported local SCSS variable declarations within files,
tracking variable assignments and resolving them during validation.

**V5 Behavior**: Does NOT support local SCSS variable scope tracking. Variables
must either be Carbon tokens or use `acceptUndefinedVariables: true`.

**Impact**: Code patterns like the IBM Products `display-box` example will fail
validation in v5 unless `acceptUndefinedVariables: true` is enabled.

## V4 Implementation Details

### How V4 Tracked Local Variables

From
[`checkRule.js:178-282`](https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/blob/main/src/utils/checkRule.js#L178-L282):

```javascript
const localVariables = {}; // used to contain variable declarations

// Walk through all declarations
await root.walkDecls(async (decl) => {
  if (isVariable(decl.prop)) {
    const newKeys = [normalizeVariableName(decl.prop)];

    // Store variable value
    newKeys.forEach((key) => {
      localVariables[normalizeVariableName(key)] = tokenizedValue.items[0];
    });
  }
});
```

### How V4 Resolved Local Variables

From
[`testItem.js:107-156`](https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/blob/main/src/utils/testItem.js#L107-L156):

```javascript
const preProcessToken = (variable, localVariables) => {
  const regex = /#\{([$.\w-]*)\}/g;
  let result = variable;

  // Replace interpolated variables with their values
  while ((match = regex.exec(variable)) !== null) {
    const replacement = localVariables[match[1]];
    if (replacement) {
      replacements.push({
        match: replacementMatch,
        replacement: unquoteIfNeeded(replacement.raw),
      });
    }
  }

  // Recursively resolve variable chains
  result = normalizeVariableName(result);
  while (localVariables[result]) {
    result = normalizeVariableName(localVariables[result].raw);
  }

  return result;
};
```

### V4 Scope Management

**File-Level Scope**: V4 tracked variables at the file level using a
`localVariables` object that persisted across all declarations in a file.

**No Block Scope**: V4 did NOT implement block-level scoping (e.g., within
mixins or nested selectors). All variables were file-scoped.

**Variable Resolution Order**:

1. Check if value is in `localVariables`
2. Recursively resolve variable chains (e.g., `$a: $b; $b: $spacing-05`)
3. Check if final resolved value is a Carbon token
4. Check if value matches `acceptValues`
5. If `acceptUndefinedVariables: true`, accept any variable

## Example: IBM Products Display Box Pattern

### Original Code

```scss
$indicator-width: $spacing-02;
$indicator-height: $spacing-04;

.test__indicator--left {
  inset-inline-start: calc(-1 * $indicator-width);
}

.test__indicator--right {
  inset-inline-end: calc(-1 * $indicator-width);
}
```

### V4 Behavior

1. **Declaration Phase**:
   - Stores `$indicator-width` → `$spacing-02` in `localVariables`
   - Stores `$indicator-height` → `$spacing-04` in `localVariables`

2. **Usage Phase**:
   - Encounters `calc(-1 * $indicator-width)`
   - Resolves `$indicator-width` → `$spacing-02` (from `localVariables`)
   - Validates `calc(-1 * $spacing-02)` ✅ PASS

### V5 Behavior

1. **Declaration Phase**:
   - No tracking of variable declarations

2. **Usage Phase**:
   - Encounters `calc(-1 * $indicator-width)`
   - Does NOT resolve `$indicator-width`
   - Checks if `$indicator-width` is a Carbon token ❌ FAIL
   - Error: "Expected Carbon spacing token"

## V5 Workarounds

### Option 1: Use `acceptUndefinedVariables: true`

```json
{
  "carbon/layout-use": [
    true,
    {
      "acceptUndefinedVariables": true
    }
  ]
}
```

**Pros**:

- Allows local variable declarations
- Allows any custom SCSS variables

**Cons**:

- Disables validation for ALL variables (not just local ones)
- Defeats the purpose of the plugin for custom variables
- No distinction between local variables and typos

### Option 2: Refactor to Use Carbon Tokens Directly

```scss
.test__indicator--left {
  inset-inline-start: calc(-1 * $spacing-02);
}

.test__indicator--right {
  inset-inline-end: calc(-1 * $spacing-02);
}
```

**Pros**:

- Works with v5 validation
- More explicit about token usage

**Cons**:

- Loses DRY principle
- Harder to maintain if value needs to change
- Not always practical for complex calculations

### Option 3: Use CSS Custom Properties

```scss
:root {
  --indicator-width: var(--cds-spacing-02);
  --indicator-height: var(--cds-spacing-04);
}

.test__indicator--left {
  inset-inline-start: calc(-1 * var(--indicator-width));
}
```

**Pros**:

- Works with v5 validation (with `acceptCarbonCustomProp: true`)
- Runtime flexibility

**Cons**:

- Requires CSS custom property support
- Different syntax from SCSS variables
- May not work in all build pipelines

## Implementation Feasibility for V5

### Complexity Assessment

**High Complexity** - Implementing local variable scope tracking in v5 would
require:

1. **Variable Declaration Tracking**:
   - Walk all declarations before validation
   - Build a `localVariables` map per file
   - Handle variable reassignment

2. **Variable Resolution**:
   - Modify `validateValue()` to accept `localVariables` parameter
   - Recursively resolve variable chains
   - Handle interpolation (`#{$var}`)

3. **Scope Management**:
   - Track file-level scope
   - Potentially track block-level scope (mixins, nested selectors)
   - Handle `@use` and `@forward` module scoping

4. **Integration Points**:
   - Modify `create-rule.ts` to add pre-processing phase
   - Update all rule implementations to pass `localVariables`
   - Update validators to resolve variables before checking tokens

### Estimated Effort

- **Development**: 2-3 days
- **Testing**: 1-2 days
- **Documentation**: 1 day
- **Total**: 4-6 days

### Risks

1. **Performance**: Two-pass processing (declaration tracking + validation)
2. **Complexity**: Significant increase in codebase complexity
3. **Edge Cases**: Module scoping, variable shadowing, circular references
4. **Maintenance**: Ongoing complexity for future enhancements

## Recommendation

### Short Term (v5.0.0)

**Do NOT implement local variable scope tracking** for the initial v5 release:

1. **Document the limitation** clearly in migration guide
2. **Recommend `acceptUndefinedVariables: true`** for projects with local
   variables
3. **Provide refactoring guidance** for teams that want strict validation

### Long Term (v5.1.0+)

**Consider implementing as an opt-in feature**:

```json
{
  "carbon/layout-use": [
    true,
    {
      "trackLocalVariables": true // New option
    }
  ]
}
```

This allows:

- Teams that don't need it to avoid the complexity
- Teams that need it to opt-in
- Gradual rollout and testing

## Migration Guidance

### For IBM Products Team

The `display-box` pattern and similar patterns have two options:

**Option A: Enable `acceptUndefinedVariables`** (Recommended for now)

```json
{
  "carbon/layout-use": [
    true,
    {
      "acceptUndefinedVariables": true
    }
  ],
  "carbon/theme-use": [
    true,
    {
      "acceptUndefinedVariables": true
    }
  ]
}
```

**Option B: Refactor to inline Carbon tokens**

This is more work but provides stricter validation. Consider this for new code
or during major refactors.

### For Other Teams

1. **Audit your codebase** for local variable declarations
2. **Decide on strategy**:
   - Use `acceptUndefinedVariables: true` if you have many local variables
   - Refactor to inline tokens if you want strict validation
   - Mix approaches: strict for new code, permissive for legacy code

## Conclusion

V4's local variable scope tracking was a powerful feature that made the plugin
more flexible. However, it added significant complexity to the implementation.

V5 prioritizes simplicity and maintainability by not implementing this feature
in the initial release. Teams that need this functionality can use
`acceptUndefinedVariables: true` as a workaround, with the understanding that it
disables validation for all variables.

If there is strong demand from the community, local variable scope tracking can
be added as an opt-in feature in a future v5.x release.
