/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// There are no type tokens that are used directly
// Types are applied via mixins and functions
// const typeTokens = [];
import { version as installedVersion } from '@carbon/type/package.json';
import loadModules from '../../../utils/loadModules';

const doInit = async ({ carbonPath, carbonModulePostfix }) => {
  // permitted carbon type functions
  // TODO: read this from carbon
  let typeFunctions;
  let _version;

  if (carbonPath) {
    const { pkg } = await loadModules(carbonPath, ['type'], carbonModulePostfix);

    _version = pkg.version;
  } else {
    _version = installedVersion;
  }

  const isV10 = _version.startsWith('10');

  if (isV10) {
    typeFunctions = [
      {
        name: 'carbon--font-weight',
        accept: 'acceptCarbonFontWeightFunction',
      },
      {
        name: 'carbon--type-scale',
        accept: 'acceptCarbonTypeScaleFunction',
      },
      {
        name: 'carbon--font-family',
        accept: 'acceptCarbonFontFamilyFunction',
      },
    ];
  } else {
    typeFunctions = [
      {
        name: 'font-weight',
        accept: 'acceptCarbonFontWeightFunction',
      },
      {
        name: 'type-scale',
        accept: 'acceptCarbonTypeScaleFunction',
      },
      {
        name: 'font-family',
        accept: 'acceptCarbonFontFamilyFunction',
      },
    ];
  }

  return { typeFunctions, version: _version };
};

export { doInit };
