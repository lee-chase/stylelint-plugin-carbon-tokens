/**
 * Copyright IBM Corp. 2022, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// import { fixUsingMap } from "../../../utils/fix-utils";

export const fixes = [
  {
    // remove carbon prefix for font functions
    version: '11',
    target: /(carbon--)((font-family)|(type-scale)|(font-weight))\(/g,
    replacement: '$2(',
  },
];
