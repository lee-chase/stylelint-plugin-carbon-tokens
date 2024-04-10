/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rules from './rules/index.js';
import stylelint from 'stylelint';

const rulesPlugins = Object.keys(rules).map((ruleName) => {
  return stylelint.createPlugin(`carbon/${ruleName}`, rules[ruleName]);
});

export default rulesPlugins;
