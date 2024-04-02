/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

const formatTokenName = (token) => {
  return `${token
    .split(/(?<![A-Z])(?=[A-Z]|[0-9]{2})/) // capital letter or number not preceded by a capital letter
    .join('-')
    .toLowerCase()}`;
};

export { formatTokenName };
