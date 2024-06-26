/**
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { doInitColors } from './initCarbonColor.js';
import { doInitTheme } from './initCarbonTheme.js';
import { fixes } from './fixes.js';
import { sassColorFunctions } from './initSassFunctions.js';

export default async function getThemeInfo(options) {
  const { carbonColorTokens, ibmColorTokens } = await doInitColors(options);
  const { themeTokens, themeFunctions, version } = await doInitTheme(options);

  return {
    tokens: [
      {
        source: 'Theme',
        accept: true,
        values: themeTokens,
      },
      {
        source: 'Carbon color',
        accept: options.acceptCarbonColorTokens,
        values: carbonColorTokens,
      },
      {
        source: 'IBM Color',
        accept: options.acceptIBMColorTokensCarbonV10Only,
        values: ibmColorTokens,
      },
    ],
    functions: [
      {
        source: 'Theme',
        accept: true,
        values: themeFunctions,
      },
      {
        source: 'SASS',
        accept: true,
        values: sassColorFunctions,
      },
    ],
    fixes,
    version,
  };
}
