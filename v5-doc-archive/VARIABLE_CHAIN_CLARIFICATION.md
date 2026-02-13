# Variable Chain Resolution Clarification

## The Question

Does "declare before use" constraint handle variable chains differently based on
order?

**Case A**: `$a: $b; $b: $spacing-05;` (forward reference) **Case B**:
`$b: $spacing-05; $a: $b;` (backward reference)

## Answer: Declaration Order Matters

### Case A: Forward Reference (❌ Would NOT work)

```scss
$a: $b; // ❌ $b not declared yet
$b: $spacing-05;

.test {
  margin: $a; // Tries to resolve $a → $b (but $b was undefined when $a was declared)
}
```

**Problem**: When we encounter `$a: $b;`, we store `$a → "$b"` (the literal
string
"$b"), not the resolved value. Later when `$b`is declared, we don't go back and update`$a`.

**Result**:

- `$a` resolves to the string `"$b"`
- Validation fails: `"$b"` is not a Carbon token

### Case B: Backward Reference (✅ WOULD work)

```scss
$b: $spacing-05; // ✅ Declare first
$a: $b; // ✅ $b is already known

.test {
  margin: $a; // Resolves: $a → $b → $spacing-05 ✅
}
```

**How it works**:

1. Store `$b → "$spacing-05"`
2. When we encounter `$a: $b;`, we can immediately resolve:
   - Look up `$b` in our map
   - Find `"$spacing-05"`
   - Store `$a → "$spacing-05"`
3. When validating `margin: $a;`:
   - Look up `$a` → `"$spacing-05"`
   - Validate `$spacing-05` ✅ PASS

## Implementation Detail

### Simple Approach (No Recursive Resolution)

```typescript
function resolveVariable(
  value: string,
  fileVariables: Map<string, string>
): string {
  const varRegex = /\$[\w-]+/g;
  let resolved = value;

  const matches = value.match(varRegex);
  if (matches) {
    for (const varName of matches) {
      const varValue = fileVariables.get(varName);
      if (varValue) {
        // Simple replacement - no recursion
        resolved = resolved.replace(varName, varValue);
      }
    }
  }

  return resolved;
}
```

**When storing variable declarations**:

```typescript
if (decl.prop.startsWith('$')) {
  // Resolve the value immediately when storing
  const resolvedValue = resolveVariable(decl.value, fileVariables);
  fileVariables.set(decl.prop, resolvedValue);
}
```

### Example Walkthrough

**Code**:

```scss
$b: $spacing-05;
$a: $b;
```

**Processing**:

1. **Encounter `$b: $spacing-05;`**:
   - Resolve `$spacing-05` → no variables, stays as `$spacing-05`
   - Store: `$b → "$spacing-05"`
   - Map: `{ "$b": "$spacing-05" }`

2. **Encounter `$a: $b;`**:
   - Resolve `$b` → look up in map → find `"$spacing-05"`
   - Replace: `$b` → `$spacing-05`
   - Store: `$a → "$spacing-05"`
   - Map: `{ "$b": "$spacing-05", "$a": "$spacing-05" }`

3. **Validate `margin: $a;`**:
   - Resolve `$a` → look up in map → find `"$spacing-05"`
   - Validate `$spacing-05` ✅ PASS

## Revised Proposal

### ✅ DOES Support Variable Chains (with correct order)

The simplified approach **DOES support variable chains** as long as they follow
"declare before use":

```scss
// ✅ Works - proper order
$base: $spacing-05;
$derived: $base;
$final: $derived;

.test {
  margin: $final; // Resolves to $spacing-05 ✅
}
```

```scss
// ❌ Fails - forward reference
$derived: $base; // $base not declared yet
$base: $spacing-05;

.test {
  margin: $derived; // Resolves to "$base" (string) ❌
}
```

### Implementation: Resolve on Store

The key is to **resolve variables when storing them**:

```typescript
root.walkDecls((decl) => {
  if (decl.prop.startsWith('$')) {
    // Resolve the value using currently known variables
    const resolvedValue = resolveVariable(decl.value, fileVariables);

    // Store the resolved value
    fileVariables.set(decl.prop, resolvedValue);
  }
});
```

This gives us **transitive resolution** without recursion:

- `$a: $b;` stores `$a → (resolved value of $b)`
- If `$b` was already resolved to `$spacing-05`, then `$a` gets `$spacing-05`
- No need to recursively resolve later

## Comparison with V4

### V4 Approach (Recursive Resolution)

V4 allowed **any declaration order** by recursively resolving at usage time:

```javascript
// V4 code
while (localVariables[result]) {
  result = normalizeVariableName(localVariables[result].raw);
}
```

This meant:

```scss
$a: $b; // ✅ V4 allowed this
$b: $spacing-05;

.test {
  margin: $a; // V4 recursively resolves: $a → $b → $spacing-05
}
```

### V5 Simplified Approach (Resolve on Store)

V5 requires **declare before use** but still supports chains:

```scss
$b: $spacing-05; // ✅ Must declare first
$a: $b; // ✅ Resolves immediately to $spacing-05

.test {
  margin: $a; // Already resolved to $spacing-05
}
```

## Benefits of "Resolve on Store"

1. **No recursion needed** - variables are pre-resolved
2. **Faster lookups** - single Map lookup, no traversal
3. **Clearer errors** - "Variable not declared" vs "Circular reference"
4. **Simpler code** - no recursive resolution logic
5. **Still supports chains** - just requires proper order

## Updated Limitations

### What's NOT Supported

1. **Forward references**: `$a: $b; $b: $spacing-05;`
   - **Workaround**: Declare in correct order: `$b: $spacing-05; $a: $b;`

2. **Circular references**: `$a: $b; $b: $a;`
   - **Workaround**: Don't create circular references (already invalid SCSS)

3. **Block-scoped variables**: Variables inside selectors
   - **Workaround**: Declare at module level

### What IS Supported

1. ✅ **Variable chains** (with correct order): `$b: $spacing-05; $a: $b;`
2. ✅ **Multiple levels**: `$c: $spacing-05; $b: $c; $a: $b;`
3. ✅ **Variables in calc()**: `calc(-1 * $a)`
4. ✅ **Multiple variables**: `$a $b $c`

## Conclusion

The simplified approach **DOES support variable chains**, just with the
constraint that variables must be declared before they are referenced.

This is actually a **best practice** in SCSS anyway:

- More readable (dependencies are clear)
- Easier to maintain (no hunting for declarations)
- Matches how most developers write SCSS naturally

**Updated complexity**: Still 1-2 days, but now supports more use cases than
initially stated.
