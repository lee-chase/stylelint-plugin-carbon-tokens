# IBM Products V5 Error Analysis - Executive Summary

## Overview

Analyzed 336 stylelint errors from IBM Products testing with v5 plugin. Results
show these are primarily due to v5 enhancements, with a mix of false positives
and legitimate issues.

## Key Findings

### Error Breakdown

| Category                | Count   | %        | Status                    |
| ----------------------- | ------- | -------- | ------------------------- |
| **False Positives**     | 113     | 34%      | Plugin fixes needed       |
| **Legitimate Issues**   | 110     | 33%      | IBM Products fixes needed |
| **Policy Decisions**    | 45      | 13%      | Team decisions required   |
| **Needs Investigation** | 48      | 14%      | Further analysis needed   |
| **Mixed**               | 20      | 6%       | Case-by-case review       |
| **TOTAL**               | **336** | **100%** |                           |

### Are These V5 Enhancements?

**Yes.** The errors are primarily caused by v5's enhanced validation:

1. **Enhanced Transform Validation** - Now validates transform function
   parameters directly
2. **Stricter calc() Validation** - Enforces specific patterns for calc()
   expressions
3. **Comprehensive Shorthand Validation** - Validates ALL components, not just
   specific positions
4. **SCSS Variable Handling** - Stricter about variable formats (interpolation,
   namespaces)
5. **motion() Function Validation** - Validates Carbon motion() function
   parameters

## False Positives (34% - Plugin Fixes Needed)

### Top Issues

1. **SCSS Interpolation** (~15 errors)
   - `#{$spacing-06}` not recognized as Carbon token
   - **Fix**: Strip `#{}` wrapper before validation

2. **SCSS Module Namespaces** (~25 errors)
   - `spacing.$spacing-04`, `theme.$layer` not recognized
   - **Fix**: Support common namespaces in token loading

3. **Transform rotate/scale** (~30 errors)
   - Non-spacing transforms flagged unnecessarily
   - **Fix**: Only validate translate\* functions for layout-use

4. **calc() Token Arithmetic** (~20 errors)
   - `calc($token1 + $token2)` rejected
   - **Fix**: Allow arithmetic with Carbon tokens

5. **CSS Keywords** (~8 errors)
   - `inset`, `padding-box`, etc. flagged
   - **Fix**: Add to default acceptValues

6. **Linear Gradients** (~10 errors)
   - Gradients with Carbon tokens flagged
   - **Fix**: Parse gradients and validate color stops

7. **var() with Fallbacks** (~15 errors)
   - `var(--cds-background, #ffffff)` flagged
   - **Fix**: Accept Carbon custom properties regardless of fallback

### Implementation Priority

**Quick Wins** (Low complexity, high impact):

- SCSS interpolation
- CSS keywords
- Transform rotate/scale exclusion

**Medium Priority** (Medium complexity):

- SCSS namespaces
- calc() arithmetic
- var() fallbacks

## Legitimate Issues (33% - IBM Products Fixes Needed)

### Top Issues

1. **Hard-coded Spacing** (~40 errors)
   - `100px`, `18px`, `6px`, etc.
   - **Fix**: Replace with Carbon spacing tokens

2. **Hard-coded box-shadow** (~60 errors)
   - Pixel values in shadows
   - **Fix**: Use Carbon elevation tokens or spacing tokens

3. **rgba() with RGB** (~10 errors)
   - `rgba(0, 0, 0, 0.2)` instead of tokens
   - **Fix**: Use `rgba($token, alpha)` format

### Implementation Plan

**Phase 1**: Quick wins (~30 errors)

- Replace obvious spacing values
- Fix rgba() calls
- Update simple box-shadows

**Phase 2**: Box-shadow refactoring (~60 errors)

- Audit design intent
- Create reusable patterns
- Use Carbon elevation tokens

**Phase 3**: Edge cases (~20 errors)

- Animation durations
- Grid gaps
- Special cases

## Policy Decisions Needed (13%)

### Critical Decisions

1. **Transform Functions**
   - Should rotate/scale require tokens?
   - **Recommendation**: No, only validate translate\*

2. **motion() Shorthand**
   - Allow `motion(standard)` or require full syntax?
   - **Recommendation**: Research Carbon docs first

3. **SCSS Interpolation**
   - Accept `#{$token}`?
   - **Recommendation**: Yes, it's valid SCSS

4. **Module Namespaces**
   - Accept `module.$token`?
   - **Recommendation**: Yes, it's Carbon v11 pattern

5. **calc() Arithmetic**
   - Allow `calc($token1 + $token2)`?
   - **Recommendation**: Yes, maintains consistency

6. **CSS Keywords**
   - Validate keywords like `inset`?
   - **Recommendation**: No, exclude from validation

## Impact Analysis

### If Plugin Fixes Are Implemented

- **False positives eliminated**: 113 errors (34%)
- **Remaining legitimate issues**: 110 errors (33%)
- **Policy decisions**: 45 errors (13%)
- **Needs investigation**: 48 errors (14%)

### If IBM Products Fixes Are Implemented

- **Design system compliance**: Improved
- **Maintenance**: Easier with tokens
- **Consistency**: Better across components
- **Effort**: 2-3 days + testing

## Recommendations

### Immediate Actions

1. **Plugin Team**:
   - Implement quick win fixes (SCSS interpolation, CSS keywords, transform
     exclusion)
   - Research motion() and calc() patterns
   - Make policy decisions

2. **IBM Products Team**:
   - Start Phase 1 fixes (hard-coded spacing)
   - Audit box-shadows for design intent
   - Plan visual regression testing

3. **Both Teams**:
   - Review policy decisions together
   - Align on Carbon v11 best practices
   - Document exceptions

### Timeline

**Week 1**: Plugin quick wins + policy decisions **Week 2**: Plugin medium
priority fixes + IBM Products Phase 1 **Week 3**: IBM Products Phase 2
(box-shadows) **Week 4**: Testing + edge cases

## Conclusion

The 336 errors are **primarily due to v5 enhancements** catching both:

- **False positives** (34%) - Plugin needs updates for v11 patterns
- **Legitimate issues** (33%) - IBM Products needs token adoption

With targeted fixes to both the plugin and IBM Products, we can:

- Eliminate false positives
- Improve design system compliance
- Maintain v5's enhanced validation capabilities

The v5 enhancements are working as intended - they're just catching edge cases
that need refinement.

## Documents Created

1. **ibm-products-error-analysis.md** - Detailed categorization of all 336
   errors
2. **PLUGIN_FIX_RECOMMENDATIONS.md** - Technical fixes for false positives
3. **IBM_PRODUCTS_FIX_RECOMMENDATIONS.md** - Fixes for legitimate issues
4. **POLICY_DECISIONS_NEEDED.md** - Policy questions requiring team decisions
5. **EXECUTIVE_SUMMARY.md** - This document

## Next Steps

1. Review findings with both teams
2. Make policy decisions
3. Prioritize and implement fixes
4. Test thoroughly
5. Document patterns and exceptions
