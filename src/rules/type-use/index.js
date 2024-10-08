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
import { getTypeInfo } from './utils/index.js';
import stylelint from 'stylelint';
const { utils } = stylelint;

export const ruleName = namespace('type-use');
export const messages = getMessages(ruleName, 'type');
const meta = {
  fixable: true,
  url: 'https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens/tree/main/src/rules/type-use/README.md',
};

const isValidAcceptValues = isValidOption;
const isValidIncludeProps = isValidOption;

const defaultOptions = {
  // include standard type properties
  includeProps: ['font', '/^font-(?!style)/', 'line-height', 'letterSpacing'],
  acceptValues: ['/inherit|initial|none|unset/'],
  acceptScopes: ['type'],
  carbonPath: undefined,
  carbonModulePostfix: undefined,
  enforceScopes: false,
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
          carbonPath: (val) => val === undefined || val.indexOf('@carbon') > -1,
          carbonModulePostfix: (val) =>
            val === undefined || typeof val === 'string',
          enforceScopes: (val) => val === undefined || typeof val === 'boolean',
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
      getTypeInfo,
      context
    );
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default ruleFunction;
