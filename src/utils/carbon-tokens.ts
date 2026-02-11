/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { unstable_tokens as layoutTokens } from '@carbon/layout';
import { unstable_tokens as typeTokens } from '@carbon/type';
import { unstable_tokens as motionTokens } from '@carbon/motion';
import * as themes from '@carbon/themes';
import type { CarbonToken, TokenCollection } from '../types/index.js';

/**
 * Format token name to ensure consistent format
 * Converts camelCase to kebab-case and handles number suffixes
 * Examples: spacing01 -> spacing-01, fluidSpacing01 -> fluid-spacing-01
 */
function formatTokenName(token: string): string {
  return token
    .split(/(?<![A-Z])(?=[A-Z]|[0-9]{2})/) // Split before capital letters or 2-digit numbers (not preceded by capital)
    .join('-')
    .toLowerCase();
}

/**
 * Load theme tokens from Carbon
 */
export function loadThemeTokens(): CarbonToken[] {
  const tokens: CarbonToken[] = [];

  // Use unstable_metadata if available (v11.4+)
  if (themes.unstable_metadata) {
    const colorTokens = themes.unstable_metadata.v11.filter(
      (token) => token.type === 'color'
    );

    for (const token of colorTokens) {
      const name = formatTokenName(token.name);
      // Add SCSS variable
      tokens.push({
        name: `$${name}`,
        value: token.value,
        type: 'scss',
      });
      // Add CSS custom property
      tokens.push({
        name: `--cds-${name}`,
        value: token.value,
        type: 'css-custom-prop',
      });
    }
  } else if (themes.white) {
    // Fallback for earlier v11 versions
    const themeKeys = Object.keys(themes.white).filter(
      (key) =>
        !Object.keys(layoutTokens).includes(key) &&
        !Object.keys(typeTokens).includes(key)
    );

    for (const key of themeKeys) {
      const name = formatTokenName(key);
      const value = themes.white[key as keyof typeof themes.white] as string;
      // Add SCSS variable
      tokens.push({
        name: `$${name}`,
        value,
        type: 'scss',
      });
      // Add CSS custom property
      tokens.push({
        name: `--cds-${name}`,
        value,
        type: 'css-custom-prop',
      });
    }
  }

  return tokens;
}

/**
 * Load layout tokens from Carbon
 */
export function loadLayoutTokens(): TokenCollection {
  const spacing: CarbonToken[] = [];
  const layout: CarbonToken[] = [];
  const container: CarbonToken[] = [];
  const fluidSpacing: CarbonToken[] = [];
  const iconSize: CarbonToken[] = [];

  // layoutTokens is an array of token names
  for (const tokenName of layoutTokens) {
    const token = formatTokenName(tokenName);

    // Determine which category this token belongs to
    let targetArray: CarbonToken[] | undefined;

    if (token.startsWith('spacing')) {
      targetArray = spacing;
    } else if (token.startsWith('layout')) {
      targetArray = layout;
    } else if (token.startsWith('container')) {
      targetArray = container;
    } else if (
      token.startsWith('fluid-spacing') ||
      token.startsWith('fluidSpacing')
    ) {
      targetArray = fluidSpacing;
    } else if (token.startsWith('icon-size') || token.startsWith('iconSize')) {
      targetArray = iconSize;
    } else if (token.startsWith('size')) {
      targetArray = container;
    }

    if (targetArray) {
      // Add SCSS variable
      targetArray.push({
        name: `$${token}`,
        value: tokenName, // Use original token name as value
        type: 'scss',
      });
      // Add CSS custom property
      targetArray.push({
        name: `--cds-${token}`,
        value: tokenName,
        type: 'css-custom-prop',
      });
    }
  }

  return {
    spacing,
    layout,
    container,
    fluidSpacing,
    iconSize,
  };
}

/**
 * Load type tokens from Carbon
 */
export function loadTypeTokens(): CarbonToken[] {
  const tokens: CarbonToken[] = [];

  // typeTokens is an array of token names
  for (const tokenName of typeTokens) {
    const token = formatTokenName(tokenName);

    // Add SCSS variable
    tokens.push({
      name: `$${token}`,
      value: tokenName, // Use original token name as value
      type: 'scss',
    });
    // Add CSS custom property
    tokens.push({
      name: `--cds-${token}`,
      value: tokenName,
      type: 'css-custom-prop',
    });
  }

  return tokens;
}

/**
 * Load motion tokens from Carbon
 */
export function loadMotionTokens(): TokenCollection {
  const duration: CarbonToken[] = [];
  const easing: CarbonToken[] = [];

  // motionTokens is an array of token names
  for (const tokenName of motionTokens) {
    const token = formatTokenName(tokenName);

    let targetArray: CarbonToken[] | undefined;

    // Duration tokens start with 'duration' or are named like 'fast01', 'moderate01', 'slow01'
    if (token.startsWith('duration')) {
      targetArray = duration;
    } else if (
      token.startsWith('fast') ||
      token.startsWith('moderate') ||
      token.startsWith('slow')
    ) {
      // These are easing function names (fast01, fast02, moderate01, etc.)
      targetArray = easing;
    }

    if (targetArray) {
      // Add SCSS variable
      targetArray.push({
        name: `$${token}`,
        value: tokenName, // Use original token name as value
        type: 'scss',
      });
      // Add CSS custom property
      targetArray.push({
        name: `--cds-${token}`,
        value: tokenName,
        type: 'css-custom-prop',
      });
    }
  }

  return {
    duration,
    easing,
  };
}

/**
 * Get all Carbon tokens organized by category
 */
export function getAllTokens(): {
  theme: CarbonToken[];
  layout: TokenCollection;
  type: CarbonToken[];
  motion: TokenCollection;
} {
  return {
    theme: loadThemeTokens(),
    layout: loadLayoutTokens(),
    type: loadTypeTokens(),
    motion: loadMotionTokens(),
  };
}
