# Policy Decisions Needed for V5

Based on the IBM Products error analysis, several policy decisions are needed to
finalize v5 behavior.

## Decision 1: Transform Functions - What Should Be Validated?

### Current Behavior

V5 validates ALL transform property values against layout tokens, including:

- `rotate()`, `scale()`, `scaleX()`, `scaleY()` - NOT spacing-related
- `translate()`, `translateX()`, `translateY()`, `translate3d()` -
  spacing-related

### The Issue

~30 errors like:

```scss
transform: rotate(0deg)      // ❌ Flagged
transform: rotate(180deg)    // ❌ Flagged
transform: scale(0.9)        // ❌ Flagged
transform: scaleY(-1)        // ❌ Flagged
```

### Options

#### Option A: Only Validate Translate Functions (RECOMMENDED)

**Rationale**: Only translate functions use spacing. Rotation and scaling are
not spacing-related.

**Implementation**: Update validator to skip non-translate transforms.

**Pros**:

- Logical - only validates spacing-related transforms
- Reduces false positives
- Aligns with design system intent

**Cons**:

- Less strict validation
- Users could use non-standard rotation/scale values

#### Option B: Validate All Transforms Strictly

**Rationale**: Enforce consistency across all transform values.

**Implementation**: Create Carbon tokens for common rotations/scales.

**Pros**:

- Complete consistency
- Prevents arbitrary values

**Cons**:

- Requires defining rotation/scale tokens (not in Carbon currently)
- May be overly restrictive
- Not aligned with current Carbon Design System

#### Option C: Make It Configurable

**Rationale**: Let teams decide their strictness level.

**Implementation**: Add `validateAllTransforms` option (default: false).

**Pros**:

- Flexibility for different teams
- Can be strict or lenient

**Cons**:

- More configuration complexity
- Teams may not know which to choose

### Recommendation

**Choose Option A** - Only validate translate functions. Rotation and scaling
are not spacing concerns and shouldn't require Carbon tokens.

---

## Decision 2: motion() Function - Should Shorthand Be Allowed?

### Current Behavior

V5 requires full syntax: `motion('standard', 'productive')`

Rejects shorthand: `motion(standard)` (without quotes or second parameter)

### The Issue

~15 errors like:

```scss
animation: slide 300ms motion(standard); // ❌ Flagged
transition: opacity 200ms motion(standard); // ❌ Flagged
```

### Options

#### Option A: Allow Shorthand (If Carbon Supports It)

**Rationale**: If Carbon's motion() function accepts shorthand, plugin should
too.

**Implementation**: Update validator to accept single parameter.

**Pros**:

- Matches Carbon behavior
- More convenient for developers
- Reduces errors

**Cons**:

- Need to verify Carbon actually supports this
- May hide parameter mistakes

#### Option B: Require Full Syntax (Current Behavior)

**Rationale**: Explicit is better than implicit.

**Implementation**: Keep current validation.

**Pros**:

- Clear and explicit
- No ambiguity about motion style
- Catches incomplete calls

**Cons**:

- More verbose
- May frustrate developers if Carbon allows shorthand

#### Option C: Make It Configurable

**Rationale**: Let teams choose strictness.

**Implementation**: Add `allowMotionShorthand` option.

**Pros**:

- Flexibility
- Can match team preferences

**Cons**:

- More configuration
- Inconsistency across projects

### Recommendation

**Research Required**: Check Carbon documentation/source code to see if
`motion(standard)` is valid.

- If valid in Carbon → Choose Option A
- If not valid in Carbon → Choose Option B (current)

**Action Item**: Review `@carbon/motion` package to verify supported syntax.

---

## Decision 3: SCSS Interpolation - Should #{$token} Be Accepted?

### Current Behavior

V5 does NOT recognize `#{$token}` as a valid token reference.

### The Issue

~15 errors like:

```scss
inset-block-end: #{$spacing-06}; // ❌ Flagged
--overlay-color: #{$overlay}; // ❌ Flagged
```

### Options

#### Option A: Accept Interpolation (RECOMMENDED)

**Rationale**: `#{$token}` is valid SCSS syntax and the token IS a Carbon token.

**Implementation**: Strip `#{}` wrapper before validation.

**Pros**:

- Correct - these ARE Carbon tokens
- Reduces false positives
- Matches SCSS reality

**Cons**:

- Slightly more complex parsing
- Could hide typos in interpolation

#### Option B: Reject Interpolation

**Rationale**: Encourage direct token usage without interpolation.

**Implementation**: Keep current behavior, document as style preference.

**Pros**:

- Simpler code
- Encourages cleaner SCSS

**Cons**:

- False positives
- Interpolation is sometimes necessary (CSS custom properties, calc)
- Overly restrictive

### Recommendation

**Choose Option A** - Accept interpolation. It's valid SCSS and the tokens are
correct. This is a clear false positive that should be fixed.

---

## Decision 4: SCSS Module Namespaces - Should module.$token Be Accepted?

### Current Behavior

V5 does NOT recognize `spacing.$spacing-04` or `theme.$layer` as valid tokens.

### The Issue

~25 errors like:

```scss
padding: spacing.$spacing-04; // ❌ Flagged
color: theme.$text-primary; // ❌ Flagged
duration: motion.$duration-slow-01; // ❌ Flagged
```

### Options

#### Option A: Accept Module Namespaces (RECOMMENDED)

**Rationale**: This is the recommended Carbon v11 pattern using `@use`.

**Implementation**: Load tokens with common namespace prefixes.

**Pros**:

- Matches Carbon v11 best practices
- Reduces false positives
- Aligns with modern SCSS

**Cons**:

- Need to handle multiple possible namespaces
- Slightly more complex token loading

#### Option B: Reject Namespaces

**Rationale**: Only accept direct token references.

**Implementation**: Keep current behavior, require users to import without
namespace.

**Pros**:

- Simpler validation
- Forces consistent import style

**Cons**:

- Goes against Carbon v11 recommendations
- Many false positives
- Doesn't match real-world usage

### Recommendation

**Choose Option A** - Accept module namespaces. This is the Carbon v11
recommended pattern and should be supported.

**Implementation Note**: Support common namespaces: `spacing`, `layout`,
`theme`, `motion`, `type`.

---

## Decision 5: calc() Token Arithmetic - Should It Be Allowed?

### Current Behavior

V5 only accepts:

- `calc(100vw - $token)` - proportional math
- `calc(-1 * $token)` - negation

Rejects:

- `calc($token1 + $token2)` - token arithmetic
- `calc(100% + $token1 + $token2)` - complex expressions

### The Issue

~20 errors like:

```scss
calc($spacing-02 + $spacing-01)           // ❌ Flagged
calc(100% + #{$spacing-04} + #{$spacing-01}) // ❌ Flagged
calc(-1 * $indicator-height)              // ❌ Flagged (variable not recognized)
```

### Options

#### Option A: Allow Token Arithmetic (RECOMMENDED)

**Rationale**: Adding/subtracting Carbon tokens is valid and maintains design
system consistency.

**Implementation**: Expand calc() validation to accept token arithmetic.

**Pros**:

- Flexible for complex layouts
- Still uses Carbon tokens
- Reduces false positives

**Cons**:

- More complex validation
- Could allow overly complex expressions

#### Option B: Restrict to Simple Patterns (Current)

**Rationale**: Keep calc() simple and predictable.

**Implementation**: Keep current validation.

**Pros**:

- Simpler validation
- Encourages simpler CSS
- Clear patterns

**Cons**:

- Many false positives
- Limits legitimate use cases
- Doesn't match real-world needs

#### Option C: Make It Configurable

**Rationale**: Let teams choose complexity level.

**Implementation**: Add `allowCalcArithmetic` option.

**Pros**:

- Flexibility
- Can be strict or lenient

**Cons**:

- More configuration
- Inconsistency

### Recommendation

**Choose Option A** - Allow token arithmetic. If both operands are Carbon
tokens, the expression maintains design system consistency.

**Constraint**: Both operands must be Carbon tokens or valid spacing values (%,
vw, etc.).

---

## Decision 6: CSS Keywords in Shorthand - Should They Be Validated?

### Current Behavior

V5 validates ALL values in shorthand properties, including CSS keywords.

### The Issue

~8 errors like:

```scss
box-shadow: inset 0 1px 0 $border; // ❌ "inset" flagged
background: padding-box, border-box; // ❌ Keywords flagged
inset: logical; // ❌ "logical" flagged
```

### Options

#### Option A: Exclude CSS Keywords (RECOMMENDED)

**Rationale**: CSS keywords are not token values and shouldn't be validated.

**Implementation**: Add common keywords to default acceptValues.

**Pros**:

- Correct behavior
- Reduces false positives
- Matches CSS spec

**Cons**:

- Need to maintain keyword list
- Could miss new keywords

#### Option B: Validate Everything (Current)

**Rationale**: Be strict about all values.

**Implementation**: Keep current behavior.

**Pros**:

- Consistent validation
- Simple logic

**Cons**:

- Many false positives
- Incorrect - keywords are valid CSS

### Recommendation

**Choose Option A** - Exclude CSS keywords. Add to default acceptValues:

- `inset`, `outset` (box-shadow)
- `padding-box`, `border-box`, `content-box` (background-clip)
- `logical` (inset)
- Other common CSS keywords

---

## Summary of Recommendations

| Decision                  | Recommendation               | Priority | Impact     |
| ------------------------- | ---------------------------- | -------- | ---------- |
| 1. Transform functions    | Only validate translate\*    | HIGH     | ~30 errors |
| 2. motion() shorthand     | Research Carbon, then decide | MEDIUM   | ~15 errors |
| 3. SCSS interpolation #{} | Accept                       | HIGH     | ~15 errors |
| 4. Module namespaces      | Accept                       | HIGH     | ~25 errors |
| 5. calc() arithmetic      | Allow token arithmetic       | HIGH     | ~20 errors |
| 6. CSS keywords           | Exclude from validation      | HIGH     | ~8 errors  |

**Total False Positives Resolved**: ~113 errors (34% of total)

---

## Implementation Priority

### Phase 1: Clear Fixes (No Research Needed)

1. ✅ Accept SCSS interpolation `#{$token}`
2. ✅ Accept module namespaces `module.$token`
3. ✅ Exclude CSS keywords from validation
4. ✅ Only validate translate\* transforms

**Impact**: ~78 errors fixed

### Phase 2: Research Required

1. ❓ Check Carbon motion() syntax support
2. ❓ Verify calc() arithmetic patterns in Carbon usage

**Impact**: ~35 errors potentially fixed

### Phase 3: Implementation

1. Implement Phase 1 fixes
2. Based on research, implement Phase 2 fixes
3. Update documentation
4. Add tests for new patterns

---

## Questions for Carbon Team

1. **motion() function**: Does `motion(standard)` shorthand work, or is
   `motion('standard', 'productive')` required?

2. **calc() patterns**: Are there official guidelines for calc() usage with
   Carbon tokens?

3. **Transform validation**: Should rotation/scaling transforms be validated, or
   only translate functions?

4. **Module namespaces**: What are the recommended namespace names for Carbon
   v11 imports?

---

## Next Steps

1. Review this document with the team
2. Make decisions on each policy
3. Research motion() and calc() patterns if needed
4. Implement fixes based on decisions
5. Update documentation to reflect policies
6. Add tests for new patterns
