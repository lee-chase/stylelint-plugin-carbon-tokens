/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { doInit } from './initAll.js';
import { fixes } from './fixes.js';

export default async function getLayoutInfo(options) {
  const { containerTokens, fluidSpacingTokens, iconSizeTokens, layoutFunctions, layoutTokens, spacingTokens, version } =
    await doInit(options);

  return {
    tokens: [
      {
        source: 'Container',
        accept: options.acceptContainerTokens,
        values: containerTokens,
      },
      {
        source: 'Fluid spacing',
        accept: options.acceptFluidSpacingTokens,
        values: fluidSpacingTokens,
      },
      {
        source: 'Icon size',
        accept: options.acceptIconSizeTokens,
        values: iconSizeTokens,
      },
      {
        source: 'Layout',
        accept: true,
        values: layoutTokens,
      },
      {
        source: 'Spacing',
        accept: true,
        values: spacingTokens,
      },
    ],
    functions: [
      {
        source: 'Layout',
        accept: options.acceptCarbonMiniUnitsFunction,
        values: layoutFunctions,
      },
      {
        source: 'CSS',
        accept: true,
        values: ['translate(1 2)', 'translateX(1)', 'translateY(1)', 'translate3d(1 2)'],
      },
      { source: 'CSS', accept: true, values: ['calc(1)'] },
    ],
    fixes,
    version,
  };
}
