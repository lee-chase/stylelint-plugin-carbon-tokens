/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { checkRule, getMessages, isValidOption, namespace, parseOptions } from '../../utils';
import { getMotionInfo } from './utils';
import { utils } from 'stylelint';

export const ruleName = namespace('motion-duration-use');
export const messages = getMessages(ruleName, 'motion');

const isValidAcceptValues = isValidOption;
const isValidIncludeProps = isValidOption;

const defaultOptions = {
  // include standard motion properties
  includeProps: [
    'transition<2>', // only permitted definition order fails otherwise
    'transition-duration',
    'animation<2>', // only permitted definition order fails otherwise
    'animation-duration',
  ],
  //  Accept reset values
  acceptValues: ['/$0s?/', '/inherit|initial|none|unset/'],
  acceptUndefinedVariables: false,
  acceptScopes: ['motion'],
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
          acceptUndefinedVariables: (val) => val === undefined || typeof val === 'boolean',
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

    await checkRule(root, result, ruleName, options, messages, getMotionInfo, context);
  };
}
