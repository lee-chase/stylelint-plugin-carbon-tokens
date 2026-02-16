/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCarbonMotionFunction,
  validateCarbonMotionFunction,
} from '../validators.js';

describe('Carbon motion() function validation', () => {
  describe('isCarbonMotionFunction', () => {
    it('should detect motion() function', () => {
      assert.equal(
        isCarbonMotionFunction('motion(standard, productive)'),
        true
      );
      assert.equal(
        isCarbonMotionFunction('motion(entrance, expressive)'),
        true
      );
      assert.equal(isCarbonMotionFunction('motion(exit, productive)'), true);
    });

    it('should detect motion() with quotes', () => {
      assert.equal(
        isCarbonMotionFunction("motion('standard', 'productive')"),
        true
      );
      assert.equal(
        isCarbonMotionFunction('motion("entrance", "expressive")'),
        true
      );
    });

    it('should detect motion() with whitespace', () => {
      assert.equal(
        isCarbonMotionFunction('motion( standard , productive )'),
        true
      );
      assert.equal(
        isCarbonMotionFunction('motion(  entrance  ,  expressive  )'),
        true
      );
    });

    it('should not detect non-motion functions', () => {
      assert.equal(
        isCarbonMotionFunction('cubic-bezier(0.4, 0, 0.2, 1)'),
        false
      );
      assert.equal(isCarbonMotionFunction('ease-in-out'), false);
      assert.equal(isCarbonMotionFunction('$standard-productive'), false);
    });
  });

  describe('validateCarbonMotionFunction', () => {
    describe('valid motion() calls', () => {
      it('should validate standard easing types', () => {
        const result1 = validateCarbonMotionFunction(
          'motion(standard, productive)'
        );
        assert.equal(result1.isValid, true);

        const result2 = validateCarbonMotionFunction(
          'motion(entrance, productive)'
        );
        assert.equal(result2.isValid, true);

        const result3 = validateCarbonMotionFunction(
          'motion(exit, productive)'
        );
        assert.equal(result3.isValid, true);
      });

      it('should validate expressive motion style', () => {
        const result1 = validateCarbonMotionFunction(
          'motion(standard, expressive)'
        );
        assert.equal(result1.isValid, true);

        const result2 = validateCarbonMotionFunction(
          'motion(entrance, expressive)'
        );
        assert.equal(result2.isValid, true);

        const result3 = validateCarbonMotionFunction(
          'motion(exit, expressive)'
        );
        assert.equal(result3.isValid, true);
      });

      it('should validate with quotes', () => {
        const result1 = validateCarbonMotionFunction(
          "motion('standard', 'productive')"
        );
        assert.equal(result1.isValid, true);

        const result2 = validateCarbonMotionFunction(
          'motion("entrance", "expressive")'
        );
        assert.equal(result2.isValid, true);
      });

      it('should validate with whitespace', () => {
        const result = validateCarbonMotionFunction(
          'motion( standard , productive )'
        );
        assert.equal(result.isValid, true);
      });

      it('should validate shorthand syntax (SCSS processes as string)', () => {
        const result1 = validateCarbonMotionFunction('motion(standard)');
        assert.equal(result1.isValid, true);

        const result2 = validateCarbonMotionFunction('motion(entrance)');
        assert.equal(result2.isValid, true);

        const result3 = validateCarbonMotionFunction('motion(exit)');
        assert.equal(result3.isValid, true);
      });

      it('should validate shorthand with whitespace', () => {
        const result = validateCarbonMotionFunction('motion( standard )');
        assert.equal(result.isValid, true);
      });
    });

    describe('invalid motion() calls', () => {
      it('should reject invalid easing types', () => {
        const result = validateCarbonMotionFunction(
          'motion(invalid, productive)'
        );
        assert.equal(result.isValid, false);
        assert.ok(result.message?.includes('Invalid motion() parameters'));
      });

      it('should reject invalid motion styles', () => {
        const result = validateCarbonMotionFunction(
          'motion(standard, invalid)'
        );
        assert.equal(result.isValid, false);
        assert.ok(result.message?.includes('Invalid motion() parameters'));
      });

      it('should reject empty motion() call', () => {
        const result = validateCarbonMotionFunction('motion()');
        assert.equal(result.isValid, false);
        assert.ok(result.message?.includes('Invalid motion() parameters'));
      });

      it('should reject invalid shorthand parameter', () => {
        const result = validateCarbonMotionFunction('motion(invalid)');
        assert.equal(result.isValid, false);
        assert.ok(result.message?.includes('Invalid motion() parameters'));
      });

      it('should reject non-motion functions', () => {
        const result = validateCarbonMotionFunction(
          'cubic-bezier(0.4, 0, 0.2, 1)'
        );
        assert.equal(result.isValid, false);
        assert.equal(result.message, 'Not a Carbon motion function');
      });
    });
  });
});
