/**
 * Copyright IBM Corp. 2020, 2024
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
} from '../../utils/index.js';
import { getMotionInfo } from './utils/index.js';
import stylelint from 'stylelint';
const { utils } = stylelint;

export const ruleName = namespace('motion-easing-use');
export const messages = getMessages(ruleName, 'motion-easing');
const meta = {
  fixable: true,
  url: 'https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/tree/main/src/rules/motion-easing-use/README.md',
};

const isValidAcceptValues = isValidOption;
const isValidIncludeProps = isValidOption;

const defaultOptions = {
  // include standard motion properties
  includeProps: [
    'transition<3>', // only permitted definition order fails otherwise
    'transition-timing-function',
    'animation<3>', // only permitted definition order fails otherwise
    'animation-timing-function',
  ],
  //  Accept reset values
  acceptValues: ['/$0s?/', '/inherit|initial|none|unset/'],
  acceptUndefinedVariables: false,
  acceptScopes: ['motion'],
  enforceScopes: false, // TODO: default in v3
  carbonPath: undefined,
  carbonModulePostfix: undefined,
  acceptCarbonCubicBezier: false,
};

const ruleFunction = (primaryOptions, secondaryOptions, context) => {
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
          carbonPath: (val) => val === undefined || val.indexOf('@carbon') > -1,
          carbonModulePostfix: (val) =>
            val === undefined || typeof val === 'string',
          enforceScopes: (val) => val === undefined || typeof val === 'boolean',
          acceptCarbonCubicBezier: (val) =>
            val === undefined || typeof val === 'boolean',
        },
        optional: true,
      }
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
      getMotionInfo,
      context
    );
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default ruleFunction;
