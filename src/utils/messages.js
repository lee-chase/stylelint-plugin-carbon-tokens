/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { utils } from 'stylelint';

const stringOrRegexMessage = (f, { label, ...options }) => {
  // strip empty values from options
  const _opts = Object.keys(options).reduce((acc, key) => {
    if (options[key]) {
      acc[key] = options[key];
    }

    return acc;
  }, {});

  if (Object.keys(_opts).length > 0) {
    return f({ label, ..._opts });
  }

  const regexOpts = Object.keys(options).reduce((acc, key) => {
    acc[key] = '.*';

    return acc;
  }, {});

  // message with () escaped
  const msg = f({ label, ...regexOpts }).replace(/([()])/g, '\\$1');

  return `/${msg}/`;
};

const getMessages = (ruleName, label) => {
  return utils.ruleMessages(ruleName, {
    rejected: (property, value) =>
      stringOrRegexMessage(
        (o) => `Expected carbon ${o.label} token, mixin or function for "${o.property}" found "${o.value}".`,
        { label, property, value }
      ),
    rejectedUndefinedRange: (property, value, range) =>
      stringOrRegexMessage(
        (o) =>
          `Expected carbon ${o.label} token, mixin or function for "${o.property}" found "${o.value}" in position(s) "${o.range}".`,
        { label, property, value, range }
      ),
    rejectedUndefinedVariable: (property, variable, value) =>
      stringOrRegexMessage(
        () =>
          'Expected carbon ${o.label} token, mixin or function to be set for variable "${o.variable}"' +
          ' used by "${o.property}" found "an unknown, undefined or unrecognized value".',
        { label, property, variable, value }
      ),
    rejectedVariable: (property, variable, value) =>
      stringOrRegexMessage(
        () =>
          'Expected carbon ${o.label} token, mixin or function to be set for variable "${o.variable}"' +
          ' used by "${o.property}" found "${o.value}".',
        { label, property, variable, value }
      ),
    rejectedMaths: (property, value) =>
      stringOrRegexMessage(
        () =>
          "Expected calc of the form calc(P O #{$}) or calc(-1 * #{$}). Where 'P' is in (vw, vh or %), 'O' is" +
          ' + or -,  \'$\' is a carbon ${o.label} token, mixin or function for "${o.property}" found "${o.value}".',
        { label, property, value }
      ),
    rejectedTransition: (property, value) =>
      stringOrRegexMessage(
        (o) =>
          `Expected carbon ${o.label} token or function for duration and easing` +
          `at positions 2 and 3 for "${o.property}" found "${o.value}".`,
        { label, property, value }
      ),
    rejectedAnimation: (property, value) =>
      stringOrRegexMessage(
        (o) =>
          `Expected carbon ${o.label} token or function for duration and easing` +
          ` at positions 2 and 3 for "${o.property}" found "${o.value}".`,
        { label, property, value }
      ),
  });
};

export default getMessages;
