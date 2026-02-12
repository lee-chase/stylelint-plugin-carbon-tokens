/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { loadLayoutTokens } from '../utils/carbon-tokens.js';
import { createCarbonRule } from '../utils/create-rule.js';
import type { LayoutRuleOptions, TokenCollection } from '../types/index.js';

export const ruleName = 'carbon/layout-use';

const defaultOptions: LayoutRuleOptions = {
  includeProps: [
    // Standard box model spacing
    '/^margin/',
    '/^padding/',

    // Positioning
    'top',
    'right',
    'bottom',
    'left',

    // Logical properties
    '/^inset/',

    // Gap properties
    '/gap$/',

    // Transform properties
    'translate',
    'transform',
  ],
  acceptValues: [
    '/inherit|initial|none|unset|auto/',
    '/^0$/',
    '/^100%$/',
    '/logical/', // inset keyword
    '1px', // Common for thin borders, outlines, box-shadows
    '/^\\$(?!spacing-|layout-|container-|fluid-spacing-|icon-size-)/', // Accept non-layout tokens (e.g., theme tokens in box-shadow)
    '/^--cds-(?!spacing-|layout-|container-|fluid-spacing-|icon-size-)/', // Accept non-layout CSS custom properties
  ],
  acceptUndefinedVariables: false,
  acceptCarbonCustomProp: false,
  carbonPrefix: 'cds',
};

export default createCarbonRule({
  ruleName,
  defaultOptions,
  tokenLoader: loadLayoutTokens,
  // Extract all layout tokens from the collection
  extractTokens: (tokens) => {
    const collection = tokens as TokenCollection;
    return [
      ...collection.spacing,
      ...collection.layout,
      ...collection.container,
      ...collection.fluidSpacing,
      ...collection.iconSize,
    ];
  },
});
