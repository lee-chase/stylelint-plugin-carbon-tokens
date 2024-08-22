/**
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import loadModules, { loadPackageJson } from '../../../utils/loadModules.js';
import { easings } from '@carbon/motion';

const doInit = async ({
  carbonPath,
  carbonModulePostfix,
  acceptCarbonCubicBezier,
}) => {
  const baseTokens = ['ease-in', 'ease-out', 'standard-easing'];
  const motionFunctions = ['motion'];
  let motionTokens;
  let _version;

  if (carbonPath) {
    const { pkg } = await loadModules(
      carbonPath,
      ['motion'],
      carbonModulePostfix
    );

    _version = pkg.version;
  } else {
    const pkg = loadPackageJson('@carbon/motion');
    _version = pkg.version;
  }

  const isV10 = _version.startsWith('10');

  if (isV10) {
    motionFunctions.push('carbon--motion');
    motionTokens = baseTokens.map((token) => `$carbon--${token}`);
  } else {
    motionFunctions.push('motion');
    motionTokens = baseTokens.map((token) => `$${token}`);

    if (acceptCarbonCubicBezier) {
      // "easings": Object {
      //   "entrance": Object {
      //     "expressive": "cubic-bezier(0, 0, 0.3, 1)",
      //     "productive": "cubic-bezier(0, 0, 0.38, 0.9)",
      //   },
      //   "exit": Object {
      //     "expressive": "cubic-bezier(0.4, 0.14, 1, 1)",
      //     "productive": "cubic-bezier(0.2, 0, 1, 0.9)",
      //   },
      //   "standard": Object {
      //     "expressive": "cubic-bezier(0.4, 0.14, 0.3, 1)",
      //     "productive": "cubic-bezier(0.2, 0, 0.38, 0.9)",
      //   },
      // },
      for (let name in easings) {
        for (let kind in easings[name]) {
          motionTokens.push(easings[name][kind]);
        }
      }
    }
  }

  return { motionTokens, motionFunctions, version: _version };
};

export { doInit };
