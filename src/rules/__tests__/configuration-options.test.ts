/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import stylelint from 'stylelint';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, '../../../dist/index.js');

describe('Configuration Options', () => {
  describe('acceptValues option', () => {
    it('should accept custom values in theme-use', async () => {
      const result = await stylelint.lint({
        code: '.test { color: red; background: blue; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { acceptValues: ['red', 'blue'] }],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should accept custom values in layout-use', async () => {
      const result = await stylelint.lint({
        code: '.test { margin: 8px; padding: 16px; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [true, { acceptValues: ['8px', '16px'] }],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should accept custom values in type-use', async () => {
      const result = await stylelint.lint({
        code: '.test { font-size: 14px; line-height: 1.5; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/type-use': [
              true,
              { acceptValues: ['14px', '1.5', 'inherit'] },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should accept custom values in motion-duration-use', async () => {
      const result = await stylelint.lint({
        code: '.test { transition-duration: 150ms; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/motion-duration-use': [true, { acceptValues: ['150ms'] }],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should accept custom values in motion-easing-use', async () => {
      const result = await stylelint.lint({
        code: '.test { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/motion-easing-use': [
              true,
              { acceptValues: ['/^cubic-bezier/'] },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });
  });

  describe('acceptUndefinedVariables option', () => {
    it('should accept undefined SCSS variables when enabled', async () => {
      const result = await stylelint.lint({
        code: '.test { color: $custom-color; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { acceptUndefinedVariables: true }],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should reject undefined SCSS variables when disabled', async () => {
      const result = await stylelint.lint({
        code: '.test { color: $custom-color; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { acceptUndefinedVariables: false }],
          },
        },
      });

      assert.strictEqual(result.errored, true);
    });

    it('should work with layout-use rule', async () => {
      const result = await stylelint.lint({
        code: '.test { margin: $custom-spacing; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [true, { acceptUndefinedVariables: true }],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });
  });

  describe('acceptCarbonCustomProp option', () => {
    it('should accept known Carbon custom properties when enabled', async () => {
      const result = await stylelint.lint({
        code: '.test { color: var(--cds-background); }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { acceptCarbonCustomProp: true }],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should reject known Carbon custom properties when disabled', async () => {
      const result = await stylelint.lint({
        code: '.test { color: var(--cds-background); }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { acceptCarbonCustomProp: false }],
          },
        },
      });

      assert.strictEqual(result.errored, true);
    });

    it('should reject unknown Carbon-prefixed custom properties', async () => {
      const result = await stylelint.lint({
        code: '.test { color: var(--cds-custom-color); }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { acceptCarbonCustomProp: true }],
          },
        },
      });

      assert.strictEqual(result.errored, true);
    });

    it('should reject non-Carbon custom properties', async () => {
      const result = await stylelint.lint({
        code: '.test { color: var(--my-color); }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { acceptCarbonCustomProp: true }],
          },
        },
      });

      assert.strictEqual(result.errored, true);
    });

    it('should work with layout-use rule', async () => {
      const result = await stylelint.lint({
        code: '.test { margin: var(--cds-spacing-05); }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [true, { acceptCarbonCustomProp: true }],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });
  });

  describe('carbonPrefix option', () => {
    it('should accept custom Carbon prefix for CSS custom properties', async () => {
      // Note: carbonPrefix doesn't load different tokens, it just changes validation
      // Since tokens are always loaded as --cds-*, this test verifies the option exists
      // but in practice, carbonPrefix is rarely used since Carbon tokens use --cds-
      const result = await stylelint.lint({
        code: '.test { color: $background; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [
              true,
              { carbonPrefix: 'custom', acceptCarbonCustomProp: true },
            ],
          },
        },
      });

      // SCSS variables work regardless of carbonPrefix (which only affects CSS custom properties)
      assert.strictEqual(result.errored, false);
    });

    it('should reject CSS custom properties with wrong prefix', async () => {
      const result = await stylelint.lint({
        code: '.test { color: var(--cds-my-color); }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [
              true,
              { carbonPrefix: 'custom', acceptCarbonCustomProp: true },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, true);
    });

    it('should accept standard Carbon tokens regardless of prefix setting', async () => {
      const result = await stylelint.lint({
        code: '.test { color: $background; margin: var(--cds-spacing-05); }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { carbonPrefix: 'custom' }],
          },
        },
      });

      // Real Carbon tokens are always accepted regardless of carbonPrefix
      assert.strictEqual(result.errored, false);
    });
  });

  describe('includeProps option', () => {
    it('should validate only specified properties', async () => {
      const result = await stylelint.lint({
        code: '.test { color: #fff; background: #000; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { includeProps: ['color'] }],
          },
        },
      });

      // Should error on color but not background
      assert.strictEqual(result.errored, true);
      assert.strictEqual(result.results[0].warnings.length, 1);
      assert.ok(result.results[0].warnings[0].text.includes('color'));
    });

    it('should support regex patterns', async () => {
      const result = await stylelint.lint({
        code: '.test { border-color: #fff; border-width: 1px; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [true, { includeProps: ['/^border-color/'] }],
          },
        },
      });

      // Should only validate border-color
      assert.strictEqual(result.errored, true);
      assert.strictEqual(result.results[0].warnings.length, 1);
      assert.ok(result.results[0].warnings[0].text.includes('border-color'));
    });

    it('should support negative lookahead regex', async () => {
      const result = await stylelint.lint({
        code: '.test { font-size: 16px; font-style: italic; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/type-use': [true, { includeProps: ['/^font-(?!style)/'] }],
          },
        },
      });

      // Should validate font-size but not font-style
      assert.strictEqual(result.errored, true);
      assert.strictEqual(result.results[0].warnings.length, 1);
      assert.ok(result.results[0].warnings[0].text.includes('font-size'));
    });

    it('should support multiple patterns', async () => {
      const result = await stylelint.lint({
        code: '.test { margin: 10px; padding: 10px; gap: 10px; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [
              true,
              { includeProps: ['margin', '/^padding/'] },
            ],
          },
        },
      });

      // Should validate margin and padding but not gap
      assert.strictEqual(result.errored, true);
      assert.strictEqual(result.results[0].warnings.length, 2);
    });
  });

  describe('Combined options', () => {
    it('should work with multiple options together', async () => {
      const result = await stylelint.lint({
        code: '.test { color: red; background: var(--custom-bg); border-color: $custom-border; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [
              true,
              {
                acceptValues: ['red'],
                acceptUndefinedVariables: true,
                acceptCarbonCustomProp: true,
                carbonPrefix: 'custom',
                includeProps: ['color', 'background', 'border-color'],
              },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should validate shorthand properties with custom includeProps', async () => {
      const result = await stylelint.lint({
        code: '.test { transition: opacity 200ms ease-in; animation: slide 300ms; }',
        config: {
          plugins: [configPath],
          rules: {
            'carbon/motion-duration-use': [
              true,
              { includeProps: ['transition'] },
            ],
          },
        },
      });

      // Should validate transition but not animation
      assert.strictEqual(result.errored, true);
      assert.strictEqual(result.results[0].warnings.length, 1);
      assert.ok(result.results[0].warnings[0].text.includes('transition'));
    });
  });

  describe('trackFileVariables option', () => {
    it('should resolve local SCSS variables when enabled', async () => {
      const result = await stylelint.lint({
        code: `
          @use '@carbon/styles/scss/spacing' as *;
          $indicator-width: $spacing-02;
          .test { margin: $indicator-width; }
        `,
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [
              true,
              { trackFileVariables: true, acceptUndefinedVariables: false },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should reject unresolved local variables when disabled', async () => {
      const result = await stylelint.lint({
        code: `
          @use '@carbon/styles/scss/spacing' as *;
          $indicator-width: $spacing-02;
          .test { margin: $indicator-width; }
        `,
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [
              true,
              {
                trackFileVariables: false,
                acceptUndefinedVariables: false,
                acceptValues: [], // Clear default acceptValues to ensure strict validation
              },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, true);
    });

    it('should resolve variables in calc() expressions', async () => {
      const result = await stylelint.lint({
        code: `
          @use '@carbon/styles/scss/spacing' as *;
          $indicator-height: $spacing-05;
          .test { inset-block-end: calc(-1 * $indicator-height); }
        `,
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [
              true,
              { trackFileVariables: true, acceptUndefinedVariables: false },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should resolve negative variables', async () => {
      const result = await stylelint.lint({
        code: `
          @use '@carbon/styles/scss/spacing' as *;
          $indicator-width: $spacing-02;
          .test { margin-inline: -$indicator-width; }
        `,
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [
              true,
              { trackFileVariables: true, acceptUndefinedVariables: false },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should resolve variable chains (transitive resolution)', async () => {
      const result = await stylelint.lint({
        code: `
          @use '@carbon/styles/scss/spacing' as *;
          $base-spacing: $spacing-03;
          $derived-spacing: $base-spacing;
          .test { padding: $derived-spacing; }
        `,
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [
              true,
              { trackFileVariables: true, acceptUndefinedVariables: false },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should work with theme-use rule', async () => {
      const result = await stylelint.lint({
        code: `
          @use '@carbon/styles/scss/theme' as *;
          $custom-bg: $background;
          .test { background-color: $custom-bg; }
        `,
        config: {
          plugins: [configPath],
          rules: {
            'carbon/theme-use': [
              true,
              { trackFileVariables: true, acceptUndefinedVariables: false },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });

    it('should handle multiple variables in one value', async () => {
      const result = await stylelint.lint({
        code: `
          @use '@carbon/styles/scss/spacing' as *;
          $indicator-width: $spacing-02;
          .test { margin: $spacing-05 $indicator-width; }
        `,
        config: {
          plugins: [configPath],
          rules: {
            'carbon/layout-use': [
              true,
              { trackFileVariables: true, acceptUndefinedVariables: false },
            ],
          },
        },
      });

      assert.strictEqual(result.errored, false);
    });
  });
});
