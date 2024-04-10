/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { version as installedVersion } from '@carbon/motion/package.json';
import loadModules from '../../../utils/loadModules.js';

const doInit = async ({ carbonPath, carbonModulePostfix }) => {
  const baseTokens = ['ease-in', 'ease-out', 'standard-easing'];
  const motionFunctions = ['motion'];
  let motionTokens;
  let _version;

  if (carbonPath) {
    const { pkg } = await loadModules(carbonPath, ['motion'], carbonModulePostfix);

    _version = pkg.version;
  } else {
    _version = installedVersion;
  }

  const isV10 = _version.startsWith('10');

  if (isV10) {
    motionFunctions.push('carbon--motion');
    motionTokens = baseTokens.map((token) => `$carbon--${token}`);
  } else {
    motionFunctions.push('motion');
    motionTokens = baseTokens.map((token) => `$${token}`);
  }

  return { motionTokens, motionFunctions, version: _version };
};

export { doInit };
