/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { unstable_tokens as layoutTokens } from '@carbon/layout';
import * as layoutPackage from '@carbon/layout';
import { unstable_tokens as typeTokens } from '@carbon/type';
import * as motionPackage from '@carbon/motion';
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
 * Convert rem value to px equivalent
 * @param remValue - Value in rem (e.g., "1rem")
 * @returns Value in px (e.g., "16px")
 */
function convertRemToPx(remValue: string): string {
  const match = remValue.match(/^([\d.]+)rem$/);
  if (match) {
    const rem = parseFloat(match[1]);
    return `${rem * 16}px`;
  }
  return remValue;
}

/**
 * Load theme tokens from Carbon
 * @param experimentalFixTheme - Optional theme name for color auto-fix
 */
export function loadThemeTokens(experimentalFixTheme?: string): CarbonToken[] {
  const tokens: CarbonToken[] = [];

  // If experimentalFixTheme is enabled, load actual color values for auto-fix
  if (experimentalFixTheme && (themes as any)[experimentalFixTheme]) {
    const theme = (themes as any)[experimentalFixTheme];

    for (const [tokenName, colorValue] of Object.entries(theme)) {
      // Skip non-color values (like spacing, type tokens that might be in theme)
      if (typeof colorValue !== 'string') continue;

      const formattedName = formatTokenName(tokenName);

      // Add SCSS variable with actual color value
      tokens.push({
        name: `$${formattedName}`,
        value: colorValue as string,
        type: 'scss',
      });

      // Add CSS custom property with actual color value
      tokens.push({
        name: `--cds-${formattedName}`,
        value: colorValue as string,
        type: 'css-custom-prop',
      });
    }

    return tokens;
  }

  // Default behavior: load token names only (no auto-fix for colors)
  // Use unstable_metadata if available (v11.4+)
  if (themes.unstable_metadata) {
    const colorTokens = themes.unstable_metadata.v11.filter(
      (token) => token.type === 'color'
    );

    for (const token of colorTokens) {
      // Token names in unstable_metadata are already in kebab-case format
      const name = token.name;
      // Add SCSS variable (with token name as value, not actual color)
      tokens.push({
        name: `$${name}`,
        value: token.name, // Token name, not color value
        type: 'scss',
      });
      // Add CSS custom property
      tokens.push({
        name: `--cds-${name}`,
        value: token.name,
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
      // Add SCSS variable (with token name as value, not actual color)
      tokens.push({
        name: `$${name}`,
        value: name, // Token name, not color value
        type: 'scss',
      });
      // Add CSS custom property
      tokens.push({
        name: `--cds-${name}`,
        value: name,
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

    // Get the actual CSS value from the Carbon package
    const actualValue = (layoutPackage as any)[tokenName];

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

    if (targetArray && actualValue) {
      // Add SCSS variable with rem value
      targetArray.push({
        name: `$${token}`,
        value: actualValue, // Actual CSS value (e.g., "1rem")
        type: 'scss',
      });

      // Add SCSS variable with px equivalent (for matching)
      const pxValue = convertRemToPx(actualValue);
      if (pxValue !== actualValue) {
        targetArray.push({
          name: `$${token}`,
          value: pxValue, // px equivalent (e.g., "16px")
          type: 'scss',
        });
      }

      // Add CSS custom property with rem value
      targetArray.push({
        name: `--cds-${token}`,
        value: actualValue,
        type: 'css-custom-prop',
      });

      // Add CSS custom property with px equivalent (for matching)
      if (pxValue !== actualValue) {
        targetArray.push({
          name: `--cds-${token}`,
          value: pxValue,
          type: 'css-custom-prop',
        });
      }
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

  // Load duration tokens with actual values
  const durationTokenNames = [
    'durationFast01',
    'durationFast02',
    'durationModerate01',
    'durationModerate02',
    'durationSlow01',
    'durationSlow02',
  ];

  for (const tokenName of durationTokenNames) {
    const token = formatTokenName(tokenName);
    const actualValue = (motionPackage as any)[tokenName];

    if (actualValue) {
      // Add SCSS variable
      duration.push({
        name: `$${token}`,
        value: actualValue, // Actual value (e.g., "110ms")
        type: 'scss',
      });
      // Add CSS custom property
      duration.push({
        name: `--cds-${token}`,
        value: actualValue,
        type: 'css-custom-prop',
      });
    }
  }

  // Load easing tokens with actual cubic-bezier values
  const easings = (motionPackage as any).easings;
  const easingMappings = [
    {
      name: 'easing-standard-productive',
      value: easings.standard.productive,
    },
    {
      name: 'easing-standard-expressive',
      value: easings.standard.expressive,
    },
    {
      name: 'easing-entrance-productive',
      value: easings.entrance.productive,
    },
    {
      name: 'easing-entrance-expressive',
      value: easings.entrance.expressive,
    },
    {
      name: 'easing-exit-productive',
      value: easings.exit.productive,
    },
    {
      name: 'easing-exit-expressive',
      value: easings.exit.expressive,
    },
  ];

  for (const { name, value } of easingMappings) {
    // Add SCSS variable
    easing.push({
      name: `$${name}`,
      value: value, // Actual cubic-bezier value
      type: 'scss',
    });
    // Add CSS custom property
    easing.push({
      name: `--cds-${name}`,
      value: value,
      type: 'css-custom-prop',
    });
  }

  // Add @carbon/styles convenience aliases
  // These are defined in @carbon/styles/scss/_motion.scss
  // $ease-in: cubic-bezier(0.25, 0, 1, 1) - for removing elements
  // $ease-out: cubic-bezier(0, 0, 0.25, 1) - for adding elements
  // $standard-easing: cubic-bezier(0.5, 0, 0.1, 1) - for majority of animations
  const aliases = [
    { name: 'standard-easing', value: 'cubic-bezier(0.5, 0, 0.1, 1)' },
    { name: 'ease-in', value: 'cubic-bezier(0.25, 0, 1, 1)' },
    { name: 'ease-out', value: 'cubic-bezier(0, 0, 0.25, 1)' },
  ];

  for (const { name, value } of aliases) {
    // Add SCSS variable (aliases are SCSS-only, no CSS custom properties)
    easing.push({
      name: `$${name}`,
      value: value,
      type: 'scss',
    });
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
