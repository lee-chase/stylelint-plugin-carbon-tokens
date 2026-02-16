/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isScssVariable,
  isCssCustomProperty,
  isCarbonCustomProperty,
  extractCssVarName,
  matchesAcceptedValue,
  shouldValidateProperty,
  parseValue,
  cleanScssValue,
  isSpacingTransformFunction,
  isGradientFunction,
} from '../validators.js';

describe('validators', () => {
  describe('isScssVariable', () => {
    it('should identify SCSS variables', () => {
      assert.strictEqual(isScssVariable('$spacing-05'), true);
      assert.strictEqual(isScssVariable('$background'), true);
      assert.strictEqual(isScssVariable('16px'), false);
      assert.strictEqual(isScssVariable('var(--cds-spacing-05)'), false);
    });

    it('should identify negative SCSS variables', () => {
      assert.strictEqual(isScssVariable('-$spacing-05'), true);
      assert.strictEqual(isScssVariable('-$spacing-07'), true);
      assert.strictEqual(isScssVariable('-$spacing-01'), true);
    });

    it('should reject non-SCSS values', () => {
      assert.strictEqual(isScssVariable('-16px'), false);
      assert.strictEqual(isScssVariable('16px'), false);
      assert.strictEqual(isScssVariable('-1rem'), false);
    });
  });

  describe('isCssCustomProperty', () => {
    it('should identify CSS custom properties', () => {
      assert.strictEqual(isCssCustomProperty('var(--cds-spacing-05)'), true);
      assert.strictEqual(isCssCustomProperty('var(--my-var)'), true);
      assert.strictEqual(isCssCustomProperty('$spacing-05'), false);
      assert.strictEqual(isCssCustomProperty('16px'), false);
    });
  });

  describe('isCarbonCustomProperty', () => {
    it('should identify Carbon CSS custom properties', () => {
      assert.strictEqual(
        isCarbonCustomProperty('var(--cds-spacing-05)', 'cds'),
        true
      );
      assert.strictEqual(
        isCarbonCustomProperty('var(--cds-background)', 'cds'),
        true
      );
      assert.strictEqual(isCarbonCustomProperty('var(--my-var)', 'cds'), false);
      assert.strictEqual(isCarbonCustomProperty('$spacing-05', 'cds'), false);
    });

    it('should support custom prefixes', () => {
      assert.strictEqual(
        isCarbonCustomProperty('var(--custom-spacing-05)', 'custom'),
        true
      );
      assert.strictEqual(
        isCarbonCustomProperty('var(--cds-spacing-05)', 'custom'),
        false
      );
    });
  });

  describe('extractCssVarName', () => {
    it('should extract CSS variable names', () => {
      assert.strictEqual(
        extractCssVarName('var(--cds-spacing-05)'),
        '--cds-spacing-05'
      );
      assert.strictEqual(extractCssVarName('var(--my-var)'), '--my-var');
      assert.strictEqual(extractCssVarName('$spacing-05'), null);
      assert.strictEqual(extractCssVarName('16px'), null);
    });
  });

  describe('matchesAcceptedValue', () => {
    it('should match exact values', () => {
      assert.strictEqual(
        matchesAcceptedValue('transparent', ['transparent']),
        true
      );
      assert.strictEqual(
        matchesAcceptedValue('inherit', ['inherit', 'initial']),
        true
      );
      assert.strictEqual(matchesAcceptedValue('16px', ['transparent']), false);
    });

    it('should match regex patterns', () => {
      assert.strictEqual(matchesAcceptedValue('0', ['/^0$/']), true);
      assert.strictEqual(matchesAcceptedValue('0px', ['/^0[a-z]*$/']), true);
      assert.strictEqual(matchesAcceptedValue('16px', ['/^0[a-z]*$/']), false);
    });

    it('should match multiple patterns', () => {
      const patterns = ['transparent', '/^0[a-z]*$/', 'inherit'];
      assert.strictEqual(matchesAcceptedValue('transparent', patterns), true);
      assert.strictEqual(matchesAcceptedValue('0px', patterns), true);
      assert.strictEqual(matchesAcceptedValue('inherit', patterns), true);
      assert.strictEqual(matchesAcceptedValue('16px', patterns), false);
    });
  });

  describe('shouldValidateProperty', () => {
    it('should match exact property names', () => {
      assert.strictEqual(shouldValidateProperty('color', ['color']), true);
      assert.strictEqual(
        shouldValidateProperty('background-color', ['background-color']),
        true
      );
      assert.strictEqual(shouldValidateProperty('margin', ['color']), false);
    });

    it('should match regex patterns', () => {
      assert.strictEqual(shouldValidateProperty('color', ['/color$/']), true);
      assert.strictEqual(
        shouldValidateProperty('background-color', ['/color$/']),
        true
      );
      assert.strictEqual(shouldValidateProperty('margin', ['/color$/']), false);
    });

    it('should match wildcard', () => {
      assert.strictEqual(shouldValidateProperty('color', ['*']), true);
      assert.strictEqual(shouldValidateProperty('margin', ['*']), true);
      assert.strictEqual(shouldValidateProperty('anything', ['*']), true);
    });
  });

  describe('parseValue', () => {
    it('should parse single values', () => {
      assert.deepStrictEqual(parseValue('16px'), ['16px']);
      assert.deepStrictEqual(parseValue('$spacing-05'), ['$spacing-05']);
      assert.deepStrictEqual(parseValue('transparent'), ['transparent']);
    });

    it('should parse multiple values', () => {
      assert.deepStrictEqual(parseValue('16px 24px'), ['16px', '24px']);
      assert.deepStrictEqual(parseValue('0 auto'), ['0', 'auto']);
    });

    it('should handle extra whitespace', () => {
      assert.deepStrictEqual(parseValue('  16px  24px  '), ['16px', '24px']);
    });
  });

  describe('cleanScssValue', () => {
    it('should strip SCSS interpolation syntax', () => {
      assert.strictEqual(cleanScssValue('#{$spacing-05}'), '$spacing-05');
      assert.strictEqual(cleanScssValue('#{$background}'), '$background');
      assert.strictEqual(
        cleanScssValue('#{$layer-accent-01}'),
        '$layer-accent-01'
      );
    });

    it('should strip SCSS module namespaces', () => {
      assert.strictEqual(cleanScssValue('spacing.$spacing-05'), '$spacing-05');
      assert.strictEqual(cleanScssValue('theme.$background'), '$background');
      assert.strictEqual(
        cleanScssValue('motion.$duration-fast-01'),
        '$duration-fast-01'
      );
    });

    it('should handle both interpolation and namespace', () => {
      assert.strictEqual(
        cleanScssValue('#{spacing.$spacing-05}'),
        '$spacing-05'
      );
      assert.strictEqual(cleanScssValue('#{theme.$layer}'), '$layer');
    });

    it('should leave plain tokens unchanged', () => {
      assert.strictEqual(cleanScssValue('$spacing-05'), '$spacing-05');
      assert.strictEqual(cleanScssValue('$background'), '$background');
    });

    it('should handle values without tokens', () => {
      assert.strictEqual(cleanScssValue('16px'), '16px');
      assert.strictEqual(cleanScssValue('transparent'), 'transparent');
    });

    it('should trim whitespace', () => {
      assert.strictEqual(cleanScssValue('  $spacing-05  '), '$spacing-05');
      assert.strictEqual(cleanScssValue('  #{$spacing-05}  '), '$spacing-05');
    });

    it('should handle negative SCSS variables', () => {
      assert.strictEqual(cleanScssValue('-$spacing-05'), '-$spacing-05');
      assert.strictEqual(cleanScssValue('-$spacing-07'), '-$spacing-07');
      assert.strictEqual(cleanScssValue('-$spacing-01'), '-$spacing-01');
    });

    it('should handle negative with interpolation', () => {
      assert.strictEqual(cleanScssValue('-#{$spacing-05}'), '-$spacing-05');
      assert.strictEqual(cleanScssValue('-#{$spacing-07}'), '-$spacing-07');
    });

    it('should handle negative with namespace', () => {
      assert.strictEqual(
        cleanScssValue('-spacing.$spacing-05'),
        '-$spacing-05'
      );
      assert.strictEqual(cleanScssValue('-theme.$layer'), '-$layer');
    });

    it('should handle negative with both interpolation and namespace', () => {
      assert.strictEqual(
        cleanScssValue('-#{spacing.$spacing-05}'),
        '-$spacing-05'
      );
    });
  });

  describe('isSpacingTransformFunction', () => {
    it('should identify translate functions', () => {
      assert.strictEqual(
        isSpacingTransformFunction('translate(10px, 20px)'),
        true
      );
      assert.strictEqual(isSpacingTransformFunction('translateX(10px)'), true);
      assert.strictEqual(isSpacingTransformFunction('translateY(20px)'), true);
      assert.strictEqual(
        isSpacingTransformFunction('translate3d(10px, 20px, 0)'),
        true
      );
    });

    it('should reject non-spacing transform functions', () => {
      assert.strictEqual(isSpacingTransformFunction('rotate(45deg)'), false);
      assert.strictEqual(isSpacingTransformFunction('scale(1.5)'), false);
      assert.strictEqual(isSpacingTransformFunction('scaleX(2)'), false);
      assert.strictEqual(isSpacingTransformFunction('scaleY(0.5)'), false);
      assert.strictEqual(isSpacingTransformFunction('skew(10deg)'), false);
      assert.strictEqual(
        isSpacingTransformFunction('matrix(1, 0, 0, 1, 0, 0)'),
        false
      );
    });

    it('should handle whitespace variations', () => {
      assert.strictEqual(
        isSpacingTransformFunction('translate (10px, 20px)'),
        true
      );
      assert.strictEqual(
        isSpacingTransformFunction('  translateX(10px)  '),
        true
      );
    });

    it('should reject non-function values', () => {
      assert.strictEqual(isSpacingTransformFunction('10px'), false);
      assert.strictEqual(isSpacingTransformFunction('$spacing-05'), false);
    });
  });

  describe('isGradientFunction', () => {
    it('should identify linear gradients', () => {
      assert.strictEqual(
        isGradientFunction('linear-gradient(to right, red, blue)'),
        true
      );
      assert.strictEqual(
        isGradientFunction(
          'linear-gradient(90deg, $blue-90 0%, $purple-70 100%)'
        ),
        true
      );
    });

    it('should identify radial gradients', () => {
      assert.strictEqual(
        isGradientFunction('radial-gradient(circle, red, blue)'),
        true
      );
      assert.strictEqual(
        isGradientFunction('radial-gradient(ellipse at center, red, blue)'),
        true
      );
    });

    it('should identify conic gradients', () => {
      assert.strictEqual(isGradientFunction('conic-gradient(red, blue)'), true);
      assert.strictEqual(
        isGradientFunction('conic-gradient(from 90deg, red, blue)'),
        true
      );
    });

    it('should handle whitespace variations', () => {
      assert.strictEqual(
        isGradientFunction('linear-gradient (to right, red, blue)'),
        true
      );
      assert.strictEqual(
        isGradientFunction('  radial-gradient(circle, red, blue)  '),
        true
      );
    });

    it('should reject non-gradient functions', () => {
      assert.strictEqual(isGradientFunction('rgba(255, 0, 0, 0.5)'), false);
      assert.strictEqual(isGradientFunction('calc(100% - 20px)'), false);
      assert.strictEqual(isGradientFunction('var(--my-color)'), false);
    });

    it('should reject non-function values', () => {
      assert.strictEqual(isGradientFunction('red'), false);
      assert.strictEqual(isGradientFunction('$background'), false);
      assert.strictEqual(isGradientFunction('#ffffff'), false);
    });
  });
});
