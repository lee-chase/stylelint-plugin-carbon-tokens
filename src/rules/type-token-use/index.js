/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { checkRule, getMessages, isValidOption, namespace, parseOptions } from '../../utils';
import { getTypeInfo } from './utils';
import { utils } from 'stylelint';

export const ruleName = namespace('type-token-use');
export const messages = getMessages(ruleName, 'type');
export const meta = {
  url: 'https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/blob/main/src/rules/type-token-use/README.md',
};
const isValidAcceptValues = isValidOption;
const isValidIncludeProps = isValidOption;

const defaultOptions = {
  // include standard type properties
  includeProps: ['font', '/^font-*/', 'line-height', 'letterSpacing'],
  acceptValues: ['/inherit|initial|none|unset/'],
  acceptCarbonFontWeightFunction: false, // permit use of carbon font weight function
  acceptCarbonTypeScaleFunction: false, // permit use of carbon type scale function
  acceptCarbonFontFamilyFunction: false, // permit use of carbon font family function
  acceptScopes: ['type'],
  carbonPath: undefined,
  carbonModulePostfix: undefined,
  enforceScopes: undefined,
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
          acceptCarbonFontWeightFunction: (val) => val === undefined || typeof val === 'boolean',
          acceptCarbonTypeScaleFunction: (val) => val === undefined || typeof val === 'boolean',
          acceptCarbonFontFamilyFunction: (val) => val === undefined || typeof val === 'boolean',
          carbonPath: (val) => val === undefined || val.indexOf('@carbon') > -1,
          carbonModulePostfix: (val) => val === undefined || typeof val === 'string',
          enforceScopes: (val) => val === undefined || typeof val === 'boolean',
        },
        optional: true,
      }
    );

    if (!validOptions) {
      /* istanbul ignore next */
      return;
    }

    await checkRule(root, result, ruleName, options, messages, getTypeInfo, context);
  };
}

rule.meta = meta;
rule.messages = messages;
rule.ruleName = ruleName;
