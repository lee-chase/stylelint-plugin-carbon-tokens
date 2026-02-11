/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import stylelint from 'stylelint';
import {
  shouldValidateProperty,
  validateValue,
  parseValue,
  isCalcExpression,
  validateCalcExpression,
  isTransformFunction,
  validateTransformFunction,
  isRgbaFunction,
  validateRgbaFunction,
  isCarbonTypeFunction,
  validateCarbonTypeFunction,
  isCarbonMotionFunction,
  validateCarbonMotionFunction,
  isValidSpacingValue,
} from './validators.js';
import {
  parseTransition,
  parseAnimation,
  parseFont,
  parseBorder,
  parseOutline,
  splitByComma,
  reconstructTransition,
  reconstructAnimation,
  reconstructFont,
  reconstructBorder,
  reconstructOutline,
} from './parse-shorthand.js';
import type {
  CarbonToken,
  TokenCollection,
  BaseRuleOptions,
} from '../types/index.js';

/**
 * Check if a property is a shorthand property
 */
function isShorthandProperty(prop: string): boolean {
  return ['transition', 'animation', 'font', 'border', 'outline'].includes(
    prop
  );
}

/**
 * Validate shorthand property values based on the rule
 */
function validateShorthandProperty(
  prop: string,
  value: string,
  ruleName: string,
  tokens: CarbonToken[],
  options: BaseRuleOptions
): Array<{
  isValid: boolean;
  message?: string;
  component?: string;
  suggestedFix?: string;
  originalValue?: string;
}> {
  const results: Array<{
    isValid: boolean;
    message?: string;
    component?: string;
    suggestedFix?: string;
    originalValue?: string;
  }> = [];

  // Handle multiple comma-separated values (e.g., multiple transitions)
  const values = splitByComma(value);

  for (const singleValue of values) {
    if (prop === 'transition') {
      const parsed = parseTransition(singleValue);

      // Validate duration for motion-duration-use rule
      if (
        ruleName === 'carbon/motion-duration-use' &&
        parsed.duration &&
        parsed.duration !== '0' &&
        parsed.duration !== '0s'
      ) {
        const validation = validateValue(parsed.duration, tokens, {
          acceptUndefinedVariables: options.acceptUndefinedVariables,
          acceptCarbonCustomProp: options.acceptCarbonCustomProp,
          acceptValues: options.acceptValues,
          carbonPrefix: options.carbonPrefix,
        });
        if (!validation.isValid) {
          // Generate suggested fix if available
          let suggestedFix: string | undefined;
          if (validation.suggestedFix) {
            const fixedParsed = {
              ...parsed,
              duration: validation.suggestedFix,
            };
            suggestedFix = reconstructTransition(fixedParsed);
          }

          results.push({
            isValid: false,
            message: `transition duration ${validation.message || 'is invalid'}`,
            component: 'duration',
            suggestedFix,
            originalValue: singleValue,
          });
        }
      }

      // Validate timing function for motion-easing-use rule
      if (ruleName === 'carbon/motion-easing-use' && parsed.timingFunction) {
        let validation;
        if (isCarbonMotionFunction(parsed.timingFunction)) {
          validation = validateCarbonMotionFunction(parsed.timingFunction);
        } else {
          validation = validateValue(parsed.timingFunction, tokens, {
            acceptUndefinedVariables: options.acceptUndefinedVariables,
            acceptCarbonCustomProp: options.acceptCarbonCustomProp,
            acceptValues: options.acceptValues,
            carbonPrefix: options.carbonPrefix,
          });
        }
        if (!validation.isValid) {
          // Generate suggested fix if available
          let suggestedFix: string | undefined;
          if (validation.suggestedFix) {
            const fixedParsed = {
              ...parsed,
              timingFunction: validation.suggestedFix,
            };
            suggestedFix = reconstructTransition(fixedParsed);
          }

          results.push({
            isValid: false,
            message: `transition timing-function ${validation.message || 'is invalid'}`,
            component: 'timing-function',
            suggestedFix,
            originalValue: singleValue,
          });
        }
      }
    } else if (prop === 'animation') {
      const parsed = parseAnimation(singleValue);

      // Validate duration for motion-duration-use rule
      if (
        ruleName === 'carbon/motion-duration-use' &&
        parsed.duration &&
        parsed.duration !== '0' &&
        parsed.duration !== '0s'
      ) {
        const validation = validateValue(parsed.duration, tokens, {
          acceptUndefinedVariables: options.acceptUndefinedVariables,
          acceptCarbonCustomProp: options.acceptCarbonCustomProp,
          acceptValues: options.acceptValues,
          carbonPrefix: options.carbonPrefix,
        });
        if (!validation.isValid) {
          // Generate suggested fix if available
          let suggestedFix: string | undefined;
          if (validation.suggestedFix) {
            const fixedParsed = {
              ...parsed,
              duration: validation.suggestedFix,
            };
            suggestedFix = reconstructAnimation(fixedParsed);
          }

          results.push({
            isValid: false,
            message: `animation duration ${validation.message || 'is invalid'}`,
            component: 'duration',
            suggestedFix,
            originalValue: singleValue,
          });
        }
      }

      // Validate timing function for motion-easing-use rule
      if (ruleName === 'carbon/motion-easing-use' && parsed.timingFunction) {
        let validation;
        if (isCarbonMotionFunction(parsed.timingFunction)) {
          validation = validateCarbonMotionFunction(parsed.timingFunction);
        } else {
          validation = validateValue(parsed.timingFunction, tokens, {
            acceptUndefinedVariables: options.acceptUndefinedVariables,
            acceptCarbonCustomProp: options.acceptCarbonCustomProp,
            acceptValues: options.acceptValues,
            carbonPrefix: options.carbonPrefix,
          });
        }
        if (!validation.isValid) {
          // Generate suggested fix if available
          let suggestedFix: string | undefined;
          if (validation.suggestedFix) {
            const fixedParsed = {
              ...parsed,
              timingFunction: validation.suggestedFix,
            };
            suggestedFix = reconstructAnimation(fixedParsed);
          }

          results.push({
            isValid: false,
            message: `animation timing-function ${validation.message || 'is invalid'}`,
            component: 'timing-function',
            suggestedFix,
            originalValue: singleValue,
          });
        }
      }
    } else if (prop === 'font') {
      const parsed = parseFont(singleValue);

      // Validate font properties for type-use rule
      if (ruleName === 'carbon/type-use') {
        // Validate font-size
        if (parsed.size) {
          let validation;
          if (isCarbonTypeFunction(parsed.size)) {
            validation = validateCarbonTypeFunction(parsed.size);
          } else {
            validation = validateValue(parsed.size, tokens, {
              acceptUndefinedVariables: options.acceptUndefinedVariables,
              acceptCarbonCustomProp: options.acceptCarbonCustomProp,
              acceptValues: options.acceptValues,
              carbonPrefix: options.carbonPrefix,
            });
          }
          if (!validation.isValid) {
            // Generate suggested fix if available
            let suggestedFix: string | undefined;
            if (validation.suggestedFix) {
              const fixedParsed = { ...parsed, size: validation.suggestedFix };
              suggestedFix = reconstructFont(fixedParsed);
            }

            results.push({
              isValid: false,
              message: `font-size ${validation.message || 'is invalid'}`,
              component: 'size',
              suggestedFix,
              originalValue: singleValue,
            });
          }
        }

        // Validate font-family
        if (parsed.family) {
          let validation;
          if (isCarbonTypeFunction(parsed.family)) {
            validation = validateCarbonTypeFunction(parsed.family);
          } else {
            validation = validateValue(parsed.family, tokens, {
              acceptUndefinedVariables: options.acceptUndefinedVariables,
              acceptCarbonCustomProp: options.acceptCarbonCustomProp,
              acceptValues: options.acceptValues,
              carbonPrefix: options.carbonPrefix,
            });
          }
          if (!validation.isValid) {
            // Generate suggested fix if available
            let suggestedFix: string | undefined;
            if (validation.suggestedFix) {
              const fixedParsed = {
                ...parsed,
                family: validation.suggestedFix,
              };
              suggestedFix = reconstructFont(fixedParsed);
            }

            results.push({
              isValid: false,
              message: `font-family ${validation.message || 'is invalid'}`,
              component: 'family',
              suggestedFix,
              originalValue: singleValue,
            });
          }
        }

        // Validate line-height
        if (parsed.lineHeight) {
          const validation = validateValue(parsed.lineHeight, tokens, {
            acceptUndefinedVariables: options.acceptUndefinedVariables,
            acceptCarbonCustomProp: options.acceptCarbonCustomProp,
            acceptValues: options.acceptValues,
            carbonPrefix: options.carbonPrefix,
          });
          if (!validation.isValid) {
            // Generate suggested fix if available
            let suggestedFix: string | undefined;
            if (validation.suggestedFix) {
              const fixedParsed = {
                ...parsed,
                lineHeight: validation.suggestedFix,
              };
              suggestedFix = reconstructFont(fixedParsed);
            }

            results.push({
              isValid: false,
              message: `line-height ${validation.message || 'is invalid'}`,
              component: 'line-height',
              suggestedFix,
              originalValue: singleValue,
            });
          }
        }
      }
    } else if (prop === 'border' || prop === 'outline') {
      const parsed =
        prop === 'border'
          ? parseBorder(singleValue)
          : parseOutline(singleValue);

      // Validate color for theme-use rule
      if (ruleName === 'carbon/theme-use' && parsed.color) {
        let validation;
        if (isRgbaFunction(parsed.color)) {
          validation = validateRgbaFunction(parsed.color, tokens);
        } else {
          validation = validateValue(parsed.color, tokens, {
            acceptUndefinedVariables: options.acceptUndefinedVariables,
            acceptCarbonCustomProp: options.acceptCarbonCustomProp,
            acceptValues: options.acceptValues,
            carbonPrefix: options.carbonPrefix,
          });
        }
        if (!validation.isValid) {
          // Generate suggested fix if available
          let suggestedFix: string | undefined;
          if (validation.suggestedFix) {
            const fixedParsed = { ...parsed, color: validation.suggestedFix };
            suggestedFix =
              prop === 'border'
                ? reconstructBorder(fixedParsed)
                : reconstructOutline(fixedParsed);
          }

          results.push({
            isValid: false,
            message: `${prop}-color ${validation.message || 'is invalid'}`,
            component: 'color',
            suggestedFix,
            originalValue: singleValue,
          });
        }
      }
    }
  }

  return results;
}

const { createPlugin, utils } = stylelint;

export interface RuleConfig<T extends BaseRuleOptions = BaseRuleOptions> {
  /** Rule name (e.g., 'carbon/theme-use') */
  ruleName: string;

  /** Default options for the rule */
  defaultOptions: T;

  /** Function to load tokens for this rule */
  tokenLoader: () => CarbonToken[] | TokenCollection;

  /** Optional function to check if a value should be skipped before validation */
  shouldSkipValue?: (value: string, prop: string) => boolean;

  /** Optional function to extract tokens from TokenCollection */
  extractTokens?: (tokens: CarbonToken[] | TokenCollection) => CarbonToken[];
}

/**
 * Create a Carbon token validation rule with standard behavior
 */
export function createCarbonRule<T extends BaseRuleOptions = BaseRuleOptions>(
  config: RuleConfig<T>
): stylelint.Plugin {
  const {
    ruleName,
    defaultOptions,
    tokenLoader,
    shouldSkipValue,
    extractTokens,
  } = config;

  const messages = utils.ruleMessages(ruleName, {
    rejected: (prop: string, value: string, message: string) =>
      `${prop}: ${message}: "${value}"`,
    expected: (prop: string, value: string, suggestion: string) =>
      `${prop}: Expected Carbon token instead of "${value}". Consider using: ${suggestion}`,
  });

  const meta = {
    url: `https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/tree/main/src/rules/${ruleName.replace('carbon/', '')}/README.md`,
    fixable: true,
  };

  const ruleFunction: stylelint.Rule<boolean, T> = (
    primaryOption,
    secondaryOptions,
    context
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

      const options: T = {
        ...defaultOptions,
        ...secondaryOptions,
      } as T;

      // Load tokens
      const loadedTokens = tokenLoader();
      const tokens = extractTokens
        ? extractTokens(loadedTokens)
        : (loadedTokens as CarbonToken[]);

      root.walkDecls((decl) => {
        const prop = decl.prop;

        // Check if this property should be validated
        if (!shouldValidateProperty(prop, options.includeProps || [])) {
          return;
        }

        // Handle shorthand properties
        if (isShorthandProperty(prop)) {
          const validations = validateShorthandProperty(
            prop,
            decl.value,
            ruleName,
            tokens,
            options
          );

          for (const validation of validations) {
            if (!validation.isValid) {
              const message = validation.suggestedFix
                ? messages.expected(
                    prop,
                    validation.originalValue || decl.value,
                    validation.suggestedFix
                  )
                : messages.rejected(
                    prop,
                    decl.value,
                    validation.message || 'Invalid value'
                  );

              utils.report({
                message,
                node: decl,
                result,
                ruleName,
                fix:
                  validation.suggestedFix &&
                  validation.originalValue &&
                  context.fix
                    ? () => {
                        // Replace the specific shorthand value with the fixed version
                        const newValue = decl.value.replace(
                          validation.originalValue!,
                          validation.suggestedFix!
                        );
                        decl.value = newValue;
                      }
                    : undefined,
              });
            }
          }
          return;
        }

        // Parse the value into individual parts
        const values = parseValue(decl.value);

        for (const value of values) {
          // Allow rule-specific skipping logic
          if (shouldSkipValue && shouldSkipValue(value, prop)) {
            continue;
          }

          // Check for special function validation based on rule
          let validation;
          if (ruleName === 'carbon/layout-use') {
            // Layout rule: validate calc() and transform functions
            if (isCalcExpression(value)) {
              validation = validateCalcExpression(value, tokens);
            } else if (isTransformFunction(value)) {
              validation = validateTransformFunction(value, tokens);
            } else if (isValidSpacingValue(value, tokens)) {
              // Valid spacing value (includes proportional units like -100%, 50vw, etc.)
              validation = { isValid: true };
            } else {
              validation = validateValue(value, tokens, {
                acceptUndefinedVariables: options.acceptUndefinedVariables,
                acceptCarbonCustomProp: options.acceptCarbonCustomProp,
                acceptValues: options.acceptValues,
                carbonPrefix: options.carbonPrefix,
              });
            }
          } else if (ruleName === 'carbon/theme-use') {
            // Theme rule: validate rgba() function
            if (isRgbaFunction(value)) {
              validation = validateRgbaFunction(value, tokens);
            } else {
              validation = validateValue(value, tokens, {
                acceptUndefinedVariables: options.acceptUndefinedVariables,
                acceptCarbonCustomProp: options.acceptCarbonCustomProp,
                acceptValues: options.acceptValues,
                carbonPrefix: options.carbonPrefix,
              });
            }
          } else if (ruleName === 'carbon/type-use') {
            // Type rule: validate Carbon type functions
            if (isCarbonTypeFunction(value)) {
              validation = validateCarbonTypeFunction(value);
            } else {
              validation = validateValue(value, tokens, {
                acceptUndefinedVariables: options.acceptUndefinedVariables,
                acceptCarbonCustomProp: options.acceptCarbonCustomProp,
                acceptValues: options.acceptValues,
                carbonPrefix: options.carbonPrefix,
              });
            }
          } else if (
            ruleName === 'carbon/motion-duration-use' ||
            ruleName === 'carbon/motion-easing-use'
          ) {
            // Motion rules: validate Carbon motion() function
            if (isCarbonMotionFunction(value)) {
              validation = validateCarbonMotionFunction(value);
            } else {
              validation = validateValue(value, tokens, {
                acceptUndefinedVariables: options.acceptUndefinedVariables,
                acceptCarbonCustomProp: options.acceptCarbonCustomProp,
                acceptValues: options.acceptValues,
                carbonPrefix: options.carbonPrefix,
              });
            }
          } else {
            // Other rules: standard validation
            validation = validateValue(value, tokens, {
              acceptUndefinedVariables: options.acceptUndefinedVariables,
              acceptCarbonCustomProp: options.acceptCarbonCustomProp,
              acceptValues: options.acceptValues,
              carbonPrefix: options.carbonPrefix,
            });
          }

          if (!validation.isValid) {
            // Report error with fix callback
            const message = validation.suggestedFix
              ? messages.expected(prop, value, validation.suggestedFix)
              : messages.rejected(
                  prop,
                  value,
                  validation.message || 'Invalid value'
                );

            utils.report({
              message,
              node: decl,
              result,
              ruleName,
              fix:
                validation.suggestedFix && context.fix
                  ? () => {
                      const newValue = decl.value.replace(
                        value,
                        validation.suggestedFix!
                      );
                      decl.value = newValue;
                    }
                  : undefined,
            });
          }
        }
      });
    };
  };

  ruleFunction.ruleName = ruleName;
  ruleFunction.messages = messages;
  ruleFunction.meta = meta;

  return createPlugin(ruleName, ruleFunction);
}
