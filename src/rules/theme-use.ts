/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { loadThemeTokens } from '../utils/carbon-tokens.js';
import { createCarbonRule } from '../utils/create-rule.js';
import type { ThemeRuleOptions } from '../types/index.js';

export const ruleName = 'carbon/theme-use';

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
    '/inset|outset/', // box-shadow keywords
    '/padding-box|border-box|content-box/', // background-clip keywords
    '1px', // Common for thin borders, outlines, box-shadows
  ],
  acceptUndefinedVariables: false,
  acceptCarbonCustomProp: false,
  carbonPrefix: 'cds',
};

export default createCarbonRule<ThemeRuleOptions>({
  ruleName,
  defaultOptions,
  tokenLoader: (options) => loadThemeTokens(options?.experimentalFixTheme),
});
