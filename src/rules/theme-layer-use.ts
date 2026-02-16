/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import stylelint from 'stylelint';
import { loadThemeTokens } from '../utils/carbon-tokens.js';
import { shouldValidateProperty, parseValue } from '../utils/validators.js';
import type { ThemeRuleOptions } from '../types/index.js';

export const ruleName = 'carbon/theme-layer-use';

const defaultOptions: ThemeRuleOptions = {
  includeProps: [
    '/color$/',
    'background',
    'background-color',
    '/border.*color$/',
    '/outline.*color$/',
    'fill',
    'stroke',
    '/shadow$/',
    'border',
    'outline',
  ],
  acceptValues: [
    '/inherit|initial|none|unset/',
    '/^0$/',
    '/currentColor|transparent/',
  ],
  acceptUndefinedVariables: false,
  acceptCarbonCustomProp: false,
  carbonPrefix: 'cds',
};

// Mapping of numbered tokens to their contextual equivalents
const CONTEXTUAL_TOKEN_MAP: Record<string, string> = {
  // Layer tokens
  '$layer-01': '$layer',
  '$layer-02': '$layer',
  '$layer-03': '$layer',
  '--cds-layer-01': '--cds-layer',
  '--cds-layer-02': '--cds-layer',
  '--cds-layer-03': '--cds-layer',

  // Layer hover tokens
  '$layer-hover-01': '$layer-hover',
  '$layer-hover-02': '$layer-hover',
  '$layer-hover-03': '$layer-hover',
  '--cds-layer-hover-01': '--cds-layer-hover',
  '--cds-layer-hover-02': '--cds-layer-hover',
  '--cds-layer-hover-03': '--cds-layer-hover',

  // Layer active tokens
  '$layer-active-01': '$layer-active',
  '$layer-active-02': '$layer-active',
  '$layer-active-03': '$layer-active',
  '--cds-layer-active-01': '--cds-layer-active',
  '--cds-layer-active-02': '--cds-layer-active',
  '--cds-layer-active-03': '--cds-layer-active',

  // Layer selected tokens
  '$layer-selected-01': '$layer-selected',
  '$layer-selected-02': '$layer-selected',
  '$layer-selected-03': '$layer-selected',
  '--cds-layer-selected-01': '--cds-layer-selected',
  '--cds-layer-selected-02': '--cds-layer-selected',
  '--cds-layer-selected-03': '--cds-layer-selected',

  // Layer selected hover tokens
  '$layer-selected-hover-01': '$layer-selected-hover',
  '$layer-selected-hover-02': '$layer-selected-hover',
  '$layer-selected-hover-03': '$layer-selected-hover',
  '--cds-layer-selected-hover-01': '--cds-layer-selected-hover',
  '--cds-layer-selected-hover-02': '--cds-layer-selected-hover',
  '--cds-layer-selected-hover-03': '--cds-layer-selected-hover',

  // Layer accent tokens
  '$layer-accent-01': '$layer-accent',
  '$layer-accent-02': '$layer-accent',
  '$layer-accent-03': '$layer-accent',
  '--cds-layer-accent-01': '--cds-layer-accent',
  '--cds-layer-accent-02': '--cds-layer-accent',
  '--cds-layer-accent-03': '--cds-layer-accent',

  // Layer accent hover tokens
  '$layer-accent-hover-01': '$layer-accent-hover',
  '$layer-accent-hover-02': '$layer-accent-hover',
  '$layer-accent-hover-03': '$layer-accent-hover',
  '--cds-layer-accent-hover-01': '--cds-layer-accent-hover',
  '--cds-layer-accent-hover-02': '--cds-layer-accent-hover',
  '--cds-layer-accent-hover-03': '--cds-layer-accent-hover',

  // Layer accent active tokens
  '$layer-accent-active-01': '$layer-accent-active',
  '$layer-accent-active-02': '$layer-accent-active',
  '$layer-accent-active-03': '$layer-accent-active',
  '--cds-layer-accent-active-01': '--cds-layer-accent-active',
  '--cds-layer-accent-active-02': '--cds-layer-accent-active',
  '--cds-layer-accent-active-03': '--cds-layer-accent-active',

  // Field tokens
  '$field-01': '$field',
  '$field-02': '$field',
  '$field-03': '$field',
  '--cds-field-01': '--cds-field',
  '--cds-field-02': '--cds-field',
  '--cds-field-03': '--cds-field',

  // Field hover tokens
  '$field-hover-01': '$field-hover',
  '$field-hover-02': '$field-hover',
  '$field-hover-03': '$field-hover',
  '--cds-field-hover-01': '--cds-field-hover',
  '--cds-field-hover-02': '--cds-field-hover',
  '--cds-field-hover-03': '--cds-field-hover',

  // Border subtle tokens
  '$border-subtle-00': '$border-subtle',
  '$border-subtle-01': '$border-subtle',
  '$border-subtle-02': '$border-subtle',
  '$border-subtle-03': '$border-subtle',
  '--cds-border-subtle-00': '--cds-border-subtle',
  '--cds-border-subtle-01': '--cds-border-subtle',
  '--cds-border-subtle-02': '--cds-border-subtle',
  '--cds-border-subtle-03': '--cds-border-subtle',

  // Border subtle selected tokens
  '$border-subtle-selected-01': '$border-subtle-selected',
  '$border-subtle-selected-02': '$border-subtle-selected',
  '$border-subtle-selected-03': '$border-subtle-selected',
  '--cds-border-subtle-selected-01': '--cds-border-subtle-selected',
  '--cds-border-subtle-selected-02': '--cds-border-subtle-selected',
  '--cds-border-subtle-selected-03': '--cds-border-subtle-selected',

  // Border strong tokens
  '$border-strong-01': '$border-strong',
  '$border-strong-02': '$border-strong',
  '$border-strong-03': '$border-strong',
  '--cds-border-strong-01': '--cds-border-strong',
  '--cds-border-strong-02': '--cds-border-strong',
  '--cds-border-strong-03': '--cds-border-strong',

  // Border tile tokens
  '$border-tile-01': '$border-tile',
  '$border-tile-02': '$border-tile',
  '$border-tile-03': '$border-tile',
  '--cds-border-tile-01': '--cds-border-tile',
  '--cds-border-tile-02': '--cds-border-tile',
  '--cds-border-tile-03': '--cds-border-tile',
};

const { createPlugin, utils } = stylelint;

const messages = utils.ruleMessages(ruleName, {
  preferContextual: (value: string, contextual: string) =>
    `Prefer contextual token "${contextual}" over numbered token "${value}" when using Carbon's Layer component`,
});

const meta = {
  url: `https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/tree/main/src/rules/theme-layer-use.ts`,
  fixable: true,
};

const ruleFunction: stylelint.Rule<boolean, ThemeRuleOptions> = (
  primaryOption,
  secondaryOptions
) => {
  return async (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      {
        actual: primaryOption,
        possible: [true, false],
      },
      {
        actual: secondaryOptions,
        possible: {
          includeProps: [() => true],
          acceptValues: [() => true],
          acceptUndefinedVariables: [() => true],
          acceptCarbonCustomProp: [() => true],
          carbonPrefix: [() => true],
        },
        optional: true,
      }
    );

    if (!validOptions || !primaryOption) {
      return;
    }

    const options: ThemeRuleOptions = {
      ...defaultOptions,
      ...secondaryOptions,
    };

    // Load theme tokens to ensure they exist
    loadThemeTokens();

    root.walkDecls((decl) => {
      const prop = decl.prop;

      // Check if this property should be validated
      if (!shouldValidateProperty(prop, options.includeProps || [])) {
        return;
      }

      // Parse the value into individual parts
      const values = parseValue(decl.value);

      for (const value of values) {
        // Check if it's a SCSS variable or CSS custom property
        const isScssVar = value.startsWith('$');
        const isCssVar = value.startsWith('var(--');

        if (!isScssVar && !isCssVar) {
          continue;
        }

        // Extract the token name
        let tokenName: string;
        if (isCssVar) {
          // Extract from var(--cds-layer-01) -> --cds-layer-01
          const match = value.match(/var\((--[^)]+)\)/);
          if (!match) continue;
          tokenName = match[1];
        } else {
          tokenName = value;
        }

        // Check if this token has a contextual equivalent
        const contextualToken = CONTEXTUAL_TOKEN_MAP[tokenName];
        if (!contextualToken) {
          continue;
        }

        // Format the suggestion based on the original format
        const suggestion = isCssVar
          ? `var(${contextualToken})`
          : contextualToken;

        utils.report({
          message: messages.preferContextual(value, suggestion),
          node: decl,
          result,
          ruleName,
          fix: () => {
            decl.value = decl.value.replace(value, suggestion);
          },
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
