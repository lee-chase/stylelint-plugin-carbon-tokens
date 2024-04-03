/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { doInit } from './initTypeTokens.js';
import { fixes } from './fixes.js';

export default async function getTypeInfo(options) {
  const { typeFunctions, version } = await doInit(options);

  return {
    // There are no type tokens that are used directly
    // Types are applied via mixins and functions
    tokens: [
      //   {
      //     source: "Type",
      //     accept: true,
      //     values: typeTokens,
      //   },
    ],
    functions: typeFunctions.map((item) => {
      const result = {
        source: 'Type',
        accept: options[item.accept],
        values: [item.name],
      };

      return result;
    }),
    fixes,
    version,
  };
}
