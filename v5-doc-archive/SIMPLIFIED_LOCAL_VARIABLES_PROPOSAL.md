# Simplified Local Variable Support Proposal

## Constraints

1. **Module-level only**: Variables must be declared at the root level (not
   inside selectors, mixins, or functions)
2. **Declared before use**: Variables must be declared before they are
   referenced
3. **Simple resolution**: Only resolve one level deep (no recursive chains)

## Implementation Simplification

### V4 Complexity vs Simplified Approach

| Feature             | V4 Implementation          | Simplified Approach     |
| ------------------- | -------------------------- | ----------------------- |
| Scope tracking      | File-level + interpolation | File-level only         |
| Variable chains     | Recursive resolution       | Single-level resolution |
| Declaration order   | Any order                  | Must declare before use |
| Interpolation       | Supported `#{$var}`        | Not needed              |
| Two-pass processing | Required                   | **Single pass!**        |

### Key Simplification: Single-Pass Processing

With "declare before use" constraint, we can validate in a **single pass**:

```typescript
// Pseudo-code
const fileVariables = new Map<string, string>();

root.walkDecls((decl) => {
  // If this is a variable declaration
  if (decl.prop.startsWith('$')) {
    // Store it for later lookups
    fileVariables.set(decl.prop, decl.value);
  }

  // If this is a property to validate
  if (shouldValidate(decl.prop)) {
    // Check if value uses a local variable
    const value = decl.value;
    if (value.includes('$')) {
      // Try to resolve from fileVariables
      const resolved = resolveVariable(value, fileVariables);
      validateValue(resolved); // Validate the resolved value
    } else {
      validateValue(value);
    }
  }
});
```

## Implementation Estimate

### Reduced Complexity

**Original Estimate**: 4-6 days **Simplified Estimate**: 1-2 days

### What's Simplified

1. **No two-pass processing**: Build variable map as we go
2. **No recursive resolution**: Only resolve one level
3. **No interpolation handling**: Direct variable replacement
4. **No scope management**: File-level only
5. **Simpler error messages**: "Variable not declared" vs complex resolution
   errors

## Implementation Plan

### Phase 1: Core Variable Tracking (4 hours)

```typescript
// In create-rule.ts
interface FileContext {
  variables: Map<string, string>;
}

function createRule(ruleName, ruleConfig) {
  return (root, result) => {
    const fileContext: FileContext = {
      variables: new Map(),
    };

    root.walkDecls((decl) => {
      // Track variable declarations
      if (isVariableDeclaration(decl)) {
        fileContext.variables.set(decl.prop, decl.value);
      }

      // Validate properties
      if (shouldValidate(decl.prop)) {
        validateDeclaration(decl, fileContext, result);
      }
    });
  };
}
```

### Phase 2: Variable Resolution (2 hours)

```typescript
// In validators.ts
function resolveLocalVariable(
  value: string,
  fileVariables: Map<string, string>
): string {
  // Simple regex to find $variable references
  const varRegex = /\$[\w-]+/g;
  let resolved = value;

  const matches = value.match(varRegex);
  if (matches) {
    for (const varName of matches) {
      const varValue = fileVariables.get(varName);
      if (varValue) {
        // Replace variable with its value
        resolved = resolved.replace(varName, varValue);
      }
      // If not found, leave as-is (will fail validation)
    }
  }

  return resolved;
}
```

### Phase 3: Integration (2 hours)

Update each rule to:

1. Accept `fileContext` parameter
2. Call `resolveLocalVariable()` before validation
3. Pass resolved value to existing validators

### Phase 4: Testing (4 hours)

- Test variable declarations
- Test variable usage
- Test undeclared variables
- Test calc() with variables
- Test multiple variables in one value

**Total: 12 hours (1.5 days)**

## Example Behavior

### Valid Pattern

```scss
// ✅ Declare before use
$indicator-width: $spacing-02;
$indicator-height: $spacing-04;

.test {
  // Resolves: calc(-1 * $spacing-02)
  // Validates: ✅ PASS
  inset-inline-start: calc(-1 * $indicator-width);
}
```

### Invalid Pattern (Declare After Use)

```scss
.test {
  // ❌ $indicator-width not declared yet
  inset-inline-start: calc(-1 * $indicator-width);
}

$indicator-width: $spacing-02;
```

Error: `Variable $indicator-width used before declaration`

### Invalid Pattern (Non-Carbon Value)

```scss
// ❌ $custom-width is not a Carbon token
$custom-width: 100px;

.test {
  // Resolves: calc(-1 * 100px)
  // Validates: ❌ FAIL - 100px is not a Carbon token
  inset-inline-start: calc(-1 * $custom-width);
}
```

Error: `Expected Carbon spacing token, found "100px"`

### Variable Chains (Not Supported)

```scss
$a: $b; // ❌ Not supported in simplified approach
$b: $spacing-05;

.test {
  margin: $a; // Would need recursive resolution
}
```

**Workaround**: Declare directly

```scss
$a: $spacing-05; // ✅ Direct declaration
```

## Configuration

### New Option: `trackFileVariables`

```json
{
  "carbon/layout-use": [
    true,
    {
      "trackFileVariables": true // Enable local variable tracking
    }
  ]
}
```

**Default**: `false` (for backward compatibility and simplicity)

### Interaction with `acceptUndefinedVariables`

```typescript
if (options.trackFileVariables) {
  // Try to resolve from file variables first
  const resolved = resolveLocalVariable(value, fileContext.variables);

  if (resolved !== value) {
    // Variable was resolved, validate the resolved value
    return validateValue(resolved);
  }

  // Variable not found in file
  if (options.acceptUndefinedVariables) {
    // Accept any undefined variable
    return { isValid: true };
  } else {
    // Reject undefined variable
    return {
      isValid: false,
      message: `Variable ${value} not declared in file`,
    };
  }
}
```

## Limitations

### What's NOT Supported

1. **Variable chains**: `$a: $b; $b: $spacing-05;`
   - **Workaround**: Use direct assignment `$a: $spacing-05;`

2. **Block-scoped variables**: Variables inside selectors/mixins
   - **Workaround**: Declare at module level

3. **Interpolation**: `#{$var}`
   - **Workaround**: Use direct variable reference

4. **Computed values**: `$a: $spacing-05 + $spacing-03;`
   - **Workaround**: Use calc() in usage, not declaration

5. **Module imports**: Variables from `@use` or `@import`
   - **Workaround**: Use `acceptUndefinedVariables: true` or declare locally

### What IS Supported

1. ✅ Module-level variable declarations
2. ✅ Variables in calc() expressions
3. ✅ Multiple variables in one value
4. ✅ Negative variables: `-$spacing-05`
5. ✅ Variables in shorthand properties

## Migration Impact

### For IBM Products

The `display-box` pattern **works perfectly** with this approach:

```scss
// ✅ All declarations at module level, before use
$indicator-width: $spacing-02;
$indicator-height: $spacing-04;

.test__indicator--left {
  // ✅ Resolves to: calc(-1 * $spacing-02)
  inset-inline-start: calc(-1 * $indicator-width);
}
```

**No code changes needed** - just enable `trackFileVariables: true`

### For Other Projects

Most SCSS follows this pattern naturally:

- Variables declared at top of file
- Used in selectors below

**Edge cases** that need refactoring:

- Variable chains (rare)
- Block-scoped variables (uncommon)
- Computed variable values (rare)

## Performance Impact

### Minimal Overhead

- **Single pass**: No additional file traversal
- **Simple Map lookup**: O(1) variable resolution
- **No recursion**: Linear complexity
- **Memory**: One Map per file (typically <100 variables)

**Estimated overhead**: <5% processing time increase

## Recommendation

### ✅ Implement Simplified Approach

**Pros**:

1. **Low complexity**: 1-2 days implementation
2. **Covers 95%+ of real-world use cases**
3. **Minimal performance impact**
4. **Clear error messages**
5. **Opt-in feature** (no breaking changes)

**Cons**:

1. Doesn't support variable chains (rare use case)
2. Doesn't support block-scoped variables (uncommon)
3. Requires "declare before use" (already best practice)

### Implementation Timeline

**v5.0.0-alpha.13** (Next release):

- Implement core variable tracking
- Add `trackFileVariables` option
- Add tests and documentation
- **Estimated**: 2 days

**Benefits**:

- Solves IBM Products use case
- Provides clear migration path
- Maintains v5 simplicity goals
- Opt-in feature (safe to add)

## Conclusion

By constraining to module-level variables with "declare before use", we can
implement local variable support with **minimal complexity** while covering
**95%+ of real-world use cases**.

This is a **pragmatic solution** that:

- Solves the immediate problem (IBM Products patterns)
- Maintains v5's simplicity goals
- Provides clear upgrade path from v4
- Can be implemented quickly (1-2 days)

**Recommendation**: Implement for v5.0.0-alpha.13
