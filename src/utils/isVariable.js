/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TOKEN_TYPES } from './tokenizeValue';

export default function isVariable(val) {
  if (typeof val === 'string') {
    return val !== undefined && (val.startsWith('$') || val.startsWith('--') || val.startsWith('var(--'));
  }

  // is tokenized
  if (
    val &&
    val.type === TOKEN_TYPES.SCSS_VAR
    // val.items &&
    // val.items[0] &&
    // val.items[0].type === TOKEN_TYPES.SCSS_VAR
  ) {
    return true;
  }

  return val.type === TOKEN_TYPES.FUNCTION && val.value === 'var';
}
