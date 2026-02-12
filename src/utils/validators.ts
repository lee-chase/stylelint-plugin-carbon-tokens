/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CarbonToken, ValidationResult } from '../types/index.js';

/**
 * Check if a value is a SCSS variable
 */
export function isScssVariable(value: string): boolean {
  return value.startsWith('$');
}

/**
 * Clean SCSS value by removing interpolation and namespaces
 * Examples:
 *   #{$spacing-04} → $spacing-04
 *   spacing.$spacing-04 → $spacing-04
 *   theme.$layer → $layer
 */
export function cleanScssValue(value: string): string {
  let cleaned = value.trim();

  // Remove interpolation: #{$token} → $token
  cleaned = cleaned.replace(/^#\{|\}$/g, '');

  // Remove namespace: module.$token → $token
  // Match: word.$token → $token
  cleaned = cleaned.replace(/^[a-zA-Z_][\w-]*\.\$/, '$');

  return cleaned;
}

/**
 * Check if a value is a CSS custom property
 */
export function isCssCustomProperty(value: string): boolean {
  return value.trim().startsWith('var(--');
}

/**
 * Check if a value is a Carbon CSS custom property
 */
export function isCarbonCustomProperty(
  value: string,
  carbonPrefix = 'cds'
): boolean {
  const match = value.match(/var\(--([^)]+)\)/);
  if (!match) return false;
  return match[1].startsWith(`${carbonPrefix}-`);
}

/**
 * Extract variable name from CSS custom property
 */
export function extractCssVarName(value: string): string | null {
  const match = value.match(/var\(--([^)]+)\)/);
  return match ? `--${match[1]}` : null;
}

/**
 * Check if value matches any of the accepted patterns
 */
export function matchesAcceptedValue(
  value: string,
  acceptedValues: string[]
): boolean {
  for (const pattern of acceptedValues) {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      // Regex pattern
      const regex = new RegExp(pattern.slice(1, -1));
      if (regex.test(value)) return true;
    } else if (pattern === value) {
      // Exact match
      return true;
    }
  }
  return false;
}

/**
 * Check if a property should be validated
 */
export function shouldValidateProperty(
  prop: string,
  includeProps: string[]
): boolean {
  for (const pattern of includeProps) {
    if (pattern === '*') return true;

    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      // Regex pattern
      const regex = new RegExp(pattern.slice(1, -1));
      if (regex.test(prop)) return true;
    } else if (pattern === prop) {
      // Exact match
      return true;
    }
  }
  return false;
}

/**
 * Validate a value against Carbon tokens
 */
export function validateValue(
  value: string,
  tokens: CarbonToken[],
  options: {
    acceptUndefinedVariables?: boolean;
    acceptCarbonCustomProp?: boolean;
    acceptValues?: string[];
    carbonPrefix?: string;
  } = {}
): ValidationResult {
  const {
    acceptUndefinedVariables = false,
    acceptCarbonCustomProp = false,
    acceptValues = [],
    carbonPrefix = 'cds',
  } = options;

  // Check if value matches accepted patterns
  if (matchesAcceptedValue(value, acceptValues)) {
    return { isValid: true };
  }

  // Always accept gradient functions
  if (isGradientFunction(value)) {
    return { isValid: true };
  }

  // Clean SCSS value (remove interpolation and namespaces)
  const cleanValue = cleanScssValue(value);

  // Check if it's a SCSS variable (after cleaning)
  if (isScssVariable(cleanValue)) {
    const isCarbon = tokens.some(
      (token) => token.type === 'scss' && token.name === cleanValue
    );
    if (isCarbon) {
      return { isValid: true };
    }
    if (acceptUndefinedVariables) {
      return { isValid: true };
    }
    return {
      isValid: false,
      message: `SCSS variable "${value}" is not a Carbon token`,
      suggestedFix: findClosestToken(cleanValue, tokens, 'scss'),
    };
  }

  // Check if it's a CSS custom property
  if (isCssCustomProperty(value)) {
    const varName = extractCssVarName(value);
    if (!varName) {
      return { isValid: false, message: 'Invalid CSS custom property syntax' };
    }

    const isCarbon = tokens.some(
      (token) => token.type === 'css-custom-prop' && token.name === varName
    );
    if (isCarbon) {
      return { isValid: true };
    }

    if (acceptCarbonCustomProp && varName.startsWith(`--${carbonPrefix}-`)) {
      return { isValid: true };
    }

    if (acceptUndefinedVariables) {
      return { isValid: true };
    }

    return {
      isValid: false,
      message: `CSS custom property "${value}" is not a Carbon token`,
      suggestedFix: findClosestToken(varName, tokens, 'css-custom-prop'),
    };
  }

  // Check if it's a hard-coded value that matches a token
  const matchingToken = tokens.find((token) => token.value === value);
  if (matchingToken) {
    return {
      isValid: false,
      message: `Use Carbon token instead of hard-coded value "${value}"`,
      suggestedFix: matchingToken.name,
    };
  }

  return {
    isValid: false,
    message: `Value "${value}" should use a Carbon token`,
  };
}

/**
 * Find the closest matching token (simple implementation)
 */
function findClosestToken(
  value: string,
  tokens: CarbonToken[],
  type: 'scss' | 'css-custom-prop'
): string | undefined {
  const relevantTokens = tokens.filter((token) => token.type === type);

  // Simple exact match first
  const exactMatch = relevantTokens.find((token) => token.name === value);
  if (exactMatch) return exactMatch.name;

  // Return first token as suggestion (could be improved with fuzzy matching)
  return relevantTokens[0]?.name;
}

/**
 * Parse a CSS value into individual values
 */
export function parseValue(value: string): string[] {
  const values: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ' ' && depth === 0) {
      if (current.trim()) {
        values.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  return values.filter((v) => v.length > 0);
}

/**
 * Check if a value contains a calc() function
 */
export function isCalcExpression(value: string): boolean {
  return value.trim().startsWith('calc(');
}

/**
 * Extract the contents of a calc() expression
 */
export function extractCalcContents(value: string): string | null {
  const match = value.match(/^calc\((.*)\)$/);
  return match ? match[1].trim() : null;
}

/**
 * Validate calc() expression for proportional math
 * Pattern: calc(P O token) where P is viewport/percentage unit, O is +/-
 * Supports: vw, vh, %, svw, lvw, dvw, svh, lvh, dvh, vi, vb, vmin, vmax
 */
function validateProportionalCalc(
  contents: string,
  tokens: CarbonToken[]
): ValidationResult {
  // Match: 100vw - #{$spacing-01} or 100% + $spacing-01
  // Supports all viewport units: vw, vh, svw, lvw, dvw, svh, lvh, dvh, vi, vb, vmin, vmax, %
  const proportionalPattern =
    /^(\d+(?:\.\d+)?)(vw|vh|svw|lvw|dvw|svh|lvh|dvh|vi|vb|vmin|vmax|%)\s*([+-])\s*(.+)$/;
  const match = contents.match(proportionalPattern);

  if (!match) return { isValid: false };

  const [, , , , tokenPart] = match;

  // Validate the token part (could be #{$token} or $token or var(--token))
  const cleanToken = cleanScssValue(tokenPart);

  // Check if it's a valid Carbon token
  const isValidToken =
    isScssVariable(cleanToken) &&
    tokens.some((token) => token.type === 'scss' && token.name === cleanToken);

  if (isValidToken) {
    return { isValid: true };
  }

  // Check CSS custom property
  if (isCssCustomProperty(cleanToken)) {
    const varName = extractCssVarName(cleanToken);
    const isValidCssToken = tokens.some(
      (token) => token.type === 'css-custom-prop' && token.name === varName
    );
    if (isValidCssToken) {
      return { isValid: true };
    }
  }

  return {
    isValid: false,
    message: `Token in calc() must be a Carbon spacing token`,
  };
}

/**
 * Validate calc() expression for token negation
 * Pattern: calc(-1 * token) or calc(token / -1) or calc(token * -1)
 */
function validateNegationCalc(
  contents: string,
  tokens: CarbonToken[]
): ValidationResult {
  // Match: -1 * #{$token} or #{$token} / -1 or #{$token} * -1
  const negationPattern1 = /^(-1)\s*([*/])\s*(.+)$/;
  const negationPattern2 = /^(.+?)\s*([*/])\s*(-1)$/;

  let match = contents.match(negationPattern1);
  let tokenPart: string;

  if (match) {
    const [, , , token] = match;
    tokenPart = token;
  } else {
    match = contents.match(negationPattern2);
    if (!match) return { isValid: false };
    const [, token] = match;
    tokenPart = token;
  }

  // Clean the token (remove #{} wrapper and namespace if present)
  const cleanToken = cleanScssValue(tokenPart);

  // Check if it's a valid Carbon token
  const isValidToken =
    isScssVariable(cleanToken) &&
    tokens.some((token) => token.type === 'scss' && token.name === cleanToken);

  if (isValidToken) {
    return { isValid: true };
  }

  // Check CSS custom property
  if (isCssCustomProperty(cleanToken)) {
    const varName = extractCssVarName(cleanToken);
    const isValidCssToken = tokens.some(
      (token) => token.type === 'css-custom-prop' && token.name === varName
    );
    if (isValidCssToken) {
      return { isValid: true };
    }
  }

  return {
    isValid: false,
    message: `Token in calc() must be a Carbon spacing token`,
  };
}

/**
 * Validate calc() expression according to V4 rules
 * Supports:
 * 1. Proportional math: calc(100vw - #{$spacing-01})
 * 2. Token negation: calc(-1 * #{$spacing-01}) or calc(#{$spacing-01} / -1)
 */
export function validateCalcExpression(
  value: string,
  tokens: CarbonToken[]
): ValidationResult {
  if (!isCalcExpression(value)) {
    return { isValid: false, message: 'Not a calc() expression' };
  }

  const contents = extractCalcContents(value);
  if (!contents) {
    return { isValid: false, message: 'Invalid calc() syntax' };
  }

  // Try proportional math validation first
  const proportionalResult = validateProportionalCalc(contents, tokens);
  if (proportionalResult.isValid) {
    return proportionalResult;
  }

  // Try negation math validation
  const negationResult = validateNegationCalc(contents, tokens);
  if (negationResult.isValid) {
    return negationResult;
  }

  // If neither pattern matches, return error with helpful message
  return {
    isValid: false,
    message: `Expected calc() of the form calc(P O token) or calc(-1 * token) where P is a viewport/percentage unit (vw, vh, svw, lvw, dvw, svh, lvh, dvh, vi, vb, vmin, vmax, %), O is +/-, and token is a Carbon spacing token. Found "${value}"`,
  };
}

/**
 * Check if value is a transform function (translate, translateX, translateY, translate3d)
 */
export function isTransformFunction(value: string): boolean {
  return /^translate(X|Y|3d)?\s*\(/.test(value.trim());
}

/**
 * Check if a transform function should be validated for spacing
 * Only translate functions use spacing values
 */
export function isSpacingTransformFunction(value: string): boolean {
  return /^translate(X|Y|3d)?\s*\(/.test(value.trim());
}

/**
 * Check if value is a gradient function
 */
export function isGradientFunction(value: string): boolean {
  return /^(linear|radial|conic)-gradient\s*\(/.test(value.trim());
}

/**
 * Extract function name and parameters from a function call
 * Returns null if not a valid function
 */
export function extractFunctionParams(value: string): {
  name: string;
  params: string[];
} | null {
  const match = value.match(/^([a-zA-Z0-9-]+)\((.*)\)$/);
  if (!match) return null;

  const [, name, paramsStr] = match;

  // Split by comma, but respect nested parentheses (for calc() inside transform)
  const params: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < paramsStr.length; i++) {
    const char = paramsStr[i];

    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      params.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    params.push(current.trim());
  }

  return { name, params };
}

/**
 * Check if a value is valid for spacing (layout) properties
 * Valid values:
 * - Carbon tokens (SCSS variables or CSS custom properties)
 * - Relative units: %, vw, vh, svw, lvw, dvw, svh, lvh, dvh, vi, vb, vmin, vmax
 * - calc() expressions
 * - 0 (unitless zero)
 */
export function isValidSpacingValue(
  value: string,
  tokens: CarbonToken[]
): boolean {
  const trimmed = value.trim();

  // Check for unitless zero
  if (trimmed === '0') return true;

  // Check for calc() expression
  if (isCalcExpression(trimmed)) {
    const result = validateCalcExpression(trimmed, tokens);
    return result.isValid;
  }

  // Check for relative units
  const relativeUnitPattern =
    /^-?\d*\.?\d+(vw|vh|svw|lvw|dvw|svh|lvh|dvh|vi|vb|vmin|vmax|%)$/;
  if (relativeUnitPattern.test(trimmed)) return true;

  // Check for Carbon SCSS variable (clean first to handle interpolation/namespaces)
  const cleanValue = cleanScssValue(trimmed);
  if (isScssVariable(cleanValue)) {
    return tokens.some(
      (token) => token.type === 'scss' && token.name === cleanValue
    );
  }

  // Check for Carbon CSS custom property
  if (isCssCustomProperty(trimmed)) {
    const varName = extractCssVarName(trimmed);
    return tokens.some(
      (token) => token.type === 'css-custom-prop' && token.name === varName
    );
  }

  return false;
}

/**
 * Validate transform function according to V4 rules
 * Supports:
 * - translate(x, y) - validates both parameters
 * - translateX(x) - validates single parameter
 * - translateY(y) - validates single parameter
 * - translate3d(x, y, z) - validates only first 2 parameters (z-axis not validated)
 */
export function validateTransformFunction(
  value: string,
  tokens: CarbonToken[]
): ValidationResult {
  if (!isTransformFunction(value)) {
    return { isValid: false, message: 'Not a transform function' };
  }

  const parsed = extractFunctionParams(value);
  if (!parsed) {
    return { isValid: false, message: 'Invalid function syntax' };
  }

  const { name, params } = parsed;

  // Validate based on function type
  switch (name) {
    case 'translateX':
    case 'translateY':
      if (params.length !== 1) {
        return {
          isValid: false,
          message: `${name}() requires exactly 1 parameter, found ${params.length}`,
        };
      }
      if (!isValidSpacingValue(params[0], tokens)) {
        return {
          isValid: false,
          message: `${name}() parameter must be a Carbon spacing token, relative unit (%, vw, vh, etc.), calc() expression, or 0. Found "${params[0]}"`,
        };
      }
      return { isValid: true };

    case 'translate':
      if (params.length !== 2) {
        return {
          isValid: false,
          message: `translate() requires exactly 2 parameters, found ${params.length}`,
        };
      }
      // Validate both parameters
      for (let i = 0; i < 2; i++) {
        if (!isValidSpacingValue(params[i], tokens)) {
          return {
            isValid: false,
            message: `translate() parameter ${i + 1} must be a Carbon spacing token, relative unit (%, vw, vh, etc.), calc() expression, or 0. Found "${params[i]}"`,
          };
        }
      }
      return { isValid: true };

    case 'translate3d':
      if (params.length !== 3) {
        return {
          isValid: false,
          message: `translate3d() requires exactly 3 parameters, found ${params.length}`,
        };
      }
      // Only validate first 2 parameters (x and y), z-axis is not validated
      for (let i = 0; i < 2; i++) {
        if (!isValidSpacingValue(params[i], tokens)) {
          return {
            isValid: false,
            message: `translate3d() parameter ${i + 1} must be a Carbon spacing token, relative unit (%, vw, vh, etc.), calc() expression, or 0. Found "${params[i]}"`,
          };
        }
      }
      return { isValid: true };

    default:
      return {
        isValid: false,
        message: `Unsupported transform function: ${name}()`,
      };
  }
}

/**
 * Check if value is an rgba() function
 */
export function isRgbaFunction(value: string): boolean {
  return /^rgba\s*\(/.test(value.trim());
}

/**
 * Validate rgba() function according to V4 rules
 * Only validates the first parameter (color) - must be a Carbon theme token
 * Alpha and other parameters are not validated
 */
export function validateRgbaFunction(
  value: string,
  tokens: CarbonToken[]
): ValidationResult {
  if (!isRgbaFunction(value)) {
    return { isValid: false, message: 'Not an rgba() function' };
  }

  const parsed = extractFunctionParams(value);
  if (!parsed) {
    return { isValid: false, message: 'Invalid rgba() syntax' };
  }

  const { params } = parsed;

  // rgba() requires at least 2 parameters (color, alpha)
  // Can have 4 parameters (r, g, b, alpha) but we reject that form
  if (params.length < 2) {
    return {
      isValid: false,
      message: `rgba() requires at least 2 parameters, found ${params.length}`,
    };
  }

  // Only validate the first parameter (color)
  const colorParam = params[0];

  // Check if it's a Carbon SCSS variable
  if (isScssVariable(colorParam)) {
    const isValidToken = tokens.some(
      (token) => token.type === 'scss' && token.name === colorParam
    );
    if (isValidToken) {
      return { isValid: true };
    }
    return {
      isValid: false,
      message: `rgba() color parameter must be a Carbon theme token. Found "${colorParam}"`,
    };
  }

  // Check if it's a Carbon CSS custom property
  if (isCssCustomProperty(colorParam)) {
    const varName = extractCssVarName(colorParam);
    const isValidToken = tokens.some(
      (token) => token.type === 'css-custom-prop' && token.name === varName
    );
    if (isValidToken) {
      return { isValid: true };
    }
    return {
      isValid: false,
      message: `rgba() color parameter must be a Carbon theme token. Found "${colorParam}"`,
    };
  }

  // If it's a number, it's the old rgba(r, g, b, a) format - reject
  if (/^\d+$/.test(colorParam.trim())) {
    return {
      isValid: false,
      message: `rgba() color parameter must be a Carbon theme token, not RGB values. Use rgba($token, alpha) format instead of rgba(r, g, b, alpha)`,
    };
  }

  // Any other format is invalid
  return {
    isValid: false,
    message: `rgba() color parameter must be a Carbon theme token. Found "${colorParam}"`,
  };
}

/**
 * Check if value is a Carbon type function (type-scale, font-family, font-weight)
 * These are SCSS functions that return Carbon typography values
 */
export function isCarbonTypeFunction(value: string): boolean {
  return /^(type-scale|font-family|font-weight)\s*\(/.test(value.trim());
}

/**
 * Validate Carbon type function
 * These functions are accepted as-is without parameter validation
 * Parameter correctness is validated by Sass at compile time
 */
export function validateCarbonTypeFunction(value: string): ValidationResult {
  if (!isCarbonTypeFunction(value)) {
    return { isValid: false, message: 'Not a Carbon type function' };
  }

  // Carbon type functions are always valid - no parameter validation needed
  // The Sass compiler will validate parameters at compile time
  return { isValid: true };
}

/**
 * Check if value is a Carbon motion function
 * motion(easing_type, motion_style) returns a cubic-bezier() easing curve
 */
export function isCarbonMotionFunction(value: string): boolean {
  return /\bmotion\s*\(/.test(value);
}

/**
 * Validate Carbon motion function parameters
 * Signature: motion(easing_type, motion_style) or motion(easing_type)
 * - easing_type: 'standard' | 'entrance' | 'exit'
 * - motion_style: 'productive' | 'expressive' (optional)
 * SCSS processes motion(standard) as a string, so shorthand is permitted
 */
export function validateCarbonMotionFunction(value: string): ValidationResult {
  if (!isCarbonMotionFunction(value)) {
    return { isValid: false, message: 'Not a Carbon motion function' };
  }

  // Match full syntax: motion(easing_type, motion_style) with optional quotes
  const fullMatch = value.match(
    /\bmotion\s*\(\s*['"]?(standard|entrance|exit)['"]?\s*,\s*['"]?(productive|expressive)['"]?\s*\)/
  );

  if (fullMatch) {
    return { isValid: true };
  }

  // Allow shorthand syntax: motion(standard) without quotes
  // SCSS processes this as a string
  const shorthandMatch = value.match(
    /\bmotion\s*\(\s*(standard|entrance|exit)\s*\)/
  );

  if (shorthandMatch) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message:
      "Invalid motion() parameters. Expected: motion('standard'|'entrance'|'exit', 'productive'|'expressive') or motion(standard|entrance|exit)",
  };
}
