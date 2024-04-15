/**
 * Copyright IBM Corp. 2022, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// import { fixUsingMap } from "../../../utils/fix-utils.js";

export const fixes = [
  {
    // remove carbon prefix for easings
    version: '11',
    target: /\$(carbon--)((ease-in)|(ease-out)|(standard-easing)|(easings))/g,
    replacement: '$$$2',
  },
  {
    // remove carbon prefix for motion function
    version: '11',
    target: /carbon--motion/g,
    replacement: 'motion',
  },
];
