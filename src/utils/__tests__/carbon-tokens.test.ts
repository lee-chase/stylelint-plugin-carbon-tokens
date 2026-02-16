/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  loadThemeTokens,
  loadLayoutTokens,
  loadTypeTokens,
  loadMotionTokens,
  getAllTokens,
} from '../carbon-tokens.js';

describe('carbon-tokens', () => {
  describe('loadThemeTokens', () => {
    it('should load theme tokens', () => {
      const tokens = loadThemeTokens();
      assert.ok(Array.isArray(tokens), 'Should return an array');
      assert.ok(tokens.length > 0, 'Should have tokens');
    });

    it('should include SCSS variables', () => {
      const tokens = loadThemeTokens();
      const scssTokens = tokens.filter((t) => t.type === 'scss');
      assert.ok(scssTokens.length > 0, 'Should have SCSS tokens');
      assert.ok(
        scssTokens.some((t) => t.name.startsWith('$')),
        'SCSS tokens should start with $'
      );
    });

    it('should include CSS custom properties', () => {
      const tokens = loadThemeTokens();
      const cssTokens = tokens.filter((t) => t.type === 'css-custom-prop');
      assert.ok(cssTokens.length > 0, 'Should have CSS custom property tokens');
      assert.ok(
        cssTokens.some((t) => t.name.startsWith('--cds-')),
        'CSS tokens should start with --cds-'
      );
    });

    it('should properly format tokens with hyphens and numbers', () => {
      const tokens = loadThemeTokens();
      // Check for layer-hover-01 token (not layer-hover--01 with double dash)
      const layerHoverToken = tokens.find((t) => t.name === '$layer-hover-01');
      assert.ok(
        layerHoverToken,
        'Should have $layer-hover-01 token with single dash before number'
      );

      // Verify no tokens have double dashes before numbers
      const tokensWithDoubleDash = tokens.filter((t) => t.name.match(/--\d/));
      assert.strictEqual(
        tokensWithDoubleDash.length,
        0,
        'Should not have tokens with double dashes before numbers'
      );
    });
  });

  describe('loadLayoutTokens', () => {
    it('should load layout token collections', () => {
      const tokens = loadLayoutTokens();
      assert.ok(typeof tokens === 'object', 'Should return an object');
      assert.ok(Array.isArray(tokens.spacing), 'Should have spacing array');
      assert.ok(Array.isArray(tokens.layout), 'Should have layout array');
    });

    it('should have spacing tokens', () => {
      const tokens = loadLayoutTokens();
      assert.ok(tokens.spacing.length > 0, 'Should have spacing tokens');
      assert.ok(
        tokens.spacing.some((t) => t.name.includes('spacing')),
        'Should include spacing in token names'
      );
    });

    it('should include both SCSS and CSS formats', () => {
      const tokens = loadLayoutTokens();
      const allTokens = [...tokens.spacing, ...tokens.layout];
      const scssTokens = allTokens.filter((t) => t.type === 'scss');
      const cssTokens = allTokens.filter((t) => t.type === 'css-custom-prop');
      assert.ok(scssTokens.length > 0, 'Should have SCSS tokens');
      assert.ok(cssTokens.length > 0, 'Should have CSS tokens');
    });
  });

  describe('loadTypeTokens', () => {
    it('should load type tokens', () => {
      const tokens = loadTypeTokens();
      assert.ok(Array.isArray(tokens), 'Should return an array');
      assert.ok(tokens.length > 0, 'Should have tokens');
    });

    it('should include both formats', () => {
      const tokens = loadTypeTokens();
      const scssTokens = tokens.filter((t) => t.type === 'scss');
      const cssTokens = tokens.filter((t) => t.type === 'css-custom-prop');
      assert.ok(scssTokens.length > 0, 'Should have SCSS tokens');
      assert.ok(cssTokens.length > 0, 'Should have CSS tokens');
    });
  });

  describe('loadMotionTokens', () => {
    it('should load motion token collections', () => {
      const tokens = loadMotionTokens();
      assert.ok(typeof tokens === 'object', 'Should return an object');
      assert.ok(Array.isArray(tokens.duration), 'Should have duration array');
      assert.ok(Array.isArray(tokens.easing), 'Should have easing array');
    });

    it('should have duration tokens', () => {
      const tokens = loadMotionTokens();
      assert.ok(tokens.duration.length > 0, 'Should have duration tokens');
    });

    it('should have easing tokens', () => {
      const tokens = loadMotionTokens();
      assert.ok(tokens.easing.length > 0, 'Should have easing tokens');
    });
  });

  describe('getAllTokens', () => {
    it('should load all token categories', () => {
      const tokens = getAllTokens();
      assert.ok(typeof tokens === 'object', 'Should return an object');
      assert.ok(Array.isArray(tokens.theme), 'Should have theme tokens');
      assert.ok(typeof tokens.layout === 'object', 'Should have layout tokens');
      assert.ok(Array.isArray(tokens.type), 'Should have type tokens');
      assert.ok(typeof tokens.motion === 'object', 'Should have motion tokens');
    });

    it('should have tokens in all categories', () => {
      const tokens = getAllTokens();
      assert.ok(tokens.theme.length > 0, 'Should have theme tokens');
      assert.ok(tokens.layout.spacing.length > 0, 'Should have spacing tokens');
      assert.ok(tokens.type.length > 0, 'Should have type tokens');
      assert.ok(
        tokens.motion.duration.length > 0,
        'Should have motion duration tokens'
      );
    });
  });
});
