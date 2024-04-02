/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  checkRule,
  getMessages,
  isValidOption,
  namespace,
  parseOptions,
} from '../../utils';
import { getLayoutInfo } from './utils';
import { utils } from 'stylelint';

export const ruleName = namespace('layout-token-use');
export const messages = getMessages(ruleName, 'layout');
export const meta = {
  url: 'https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/blob/main/src/rules/layout-token-use/README.md',
};
const isValidAcceptValues = isValidOption;
const isValidIncludeProps = isValidOption;

const defaultOptions = {
  // include standard layout properties
  includeProps: [
    '/^margin$/<1 4>',
    '/^margin-/',
    '/^padding$/<1 4>',
    '/^padding-/',
    'left',
    'top',
    'bottom',
    'right',
    'transform[/^translate/]',
    // the following are not really layout or spacing
    // "height",
    // "width",
    // "/^border$/<1 -2>",
    // "/^border-/",
    // "/^box-shadow$/<1 -2>",
  ],
  // Accept transparent, common reset values, 0, proportional values,
  acceptValues: [
    '/inherit|initial|auto|none|unset/',
    '/^0[a-z]*$/',
    '/^-{0,1}[0-9]*(%|vw|vh)$/',
  ],
  acceptUndefinedVariables: false,
  acceptContainerTokens: false,
  acceptIconSizeTokens: false,
  acceptFluidSpacingTokens: false,
  acceptCarbonMiniUnitsFunction: false,
  acceptScopes: ['layout'],
  carbonPath: undefined,
  carbonModulePostfix: undefined,
};

export default function rule(primaryOptions, secondaryOptions, context) {
  const options = parseOptions(secondaryOptions, defaultOptions);

  return async (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      {
        actual: primaryOptions,
      },
      {
        actual: options,
        possible: {
          includeProps: [isValidIncludeProps],
          acceptValues: [isValidAcceptValues],
          acceptScopes: [isValidAcceptValues],
          acceptUndefinedVariables: (val) =>
            val === undefined || typeof val === 'boolean',
          acceptContainerTokens: (val) =>
            val === undefined || typeof val === 'boolean',
          acceptIconSizeTokens: (val) =>
            val === undefined || typeof val === 'boolean',
          acceptFluidSpacingTokens: (val) =>
            val === undefined || typeof val === 'boolean',
          acceptCarbonMiniUnitsFunction: (val) =>
            val === undefined || typeof val === 'boolean',
          carbonPath: (val) => val === undefined || val.indexOf('@carbon') > -1,
          carbonModulePostfix: (val) =>
            val === undefined || typeof val === 'string',
          enforceScopes: (val) => val === undefined || typeof val === 'boolean',
        },
        optional: true,
      },
    );

    if (!validOptions) {
      /* istanbul ignore next */
      return;
    }

    await checkRule(
      root,
      result,
      ruleName,
      options,
      messages,
      getLayoutInfo,
      context,
    );
  };
}

rule.meta = meta;
rule.messages = messages;
rule.ruleName = ruleName;
