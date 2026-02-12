/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Rule } from 'stylelint';

/**
 * Carbon token information
 */
export interface CarbonToken {
  name: string;
  value: string;
  type: 'scss' | 'css-custom-prop' | 'function';
}

/**
 * Token collection by category
 */
export interface TokenCollection {
  [key: string]: CarbonToken[];
}

/**
 * Rule options shared across all rules
 */
export interface BaseRuleOptions {
  /** Properties to check */
  includeProps?: string[];
  /** Values to accept without validation */
  acceptValues?: string[];
  /** Allow undefined SCSS/CSS variables */
  acceptUndefinedVariables?: boolean;
  /** Allow Carbon CSS custom properties */
  acceptCarbonCustomProp?: boolean;
  /** Custom Carbon prefix for CSS custom properties */
  carbonPrefix?: string;
}

/**
 * Theme rule specific options
 */
export interface ThemeRuleOptions extends BaseRuleOptions {
  /**
   * Experimental: Enable auto-fix for hard-coded color values
   * Specify which theme to use for color-to-token mapping
   * WARNING: Colors can be ambiguous (same color used by multiple tokens)
   * @example 'white' | 'g10' | 'g90' | 'g100'
   */
  experimentalFixTheme?: 'white' | 'g10' | 'g90' | 'g100';
}

/**
 * Layout rule specific options
 */
export type LayoutRuleOptions = BaseRuleOptions;

/**
 * Type rule specific options
 */
export type TypeRuleOptions = BaseRuleOptions;

/**
 * Motion duration rule specific options
 */
export type MotionDurationRuleOptions = BaseRuleOptions;

/**
 * Motion easing rule specific options
 */
export type MotionEasingRuleOptions = BaseRuleOptions;

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestedFix?: string;
}

/**
 * Property value to validate
 */
export interface PropertyValue {
  prop: string;
  value: string;
  index: number;
}

/**
 * Rule creator type
 */
export type RuleCreator<T extends BaseRuleOptions> = Rule<boolean, T>;
