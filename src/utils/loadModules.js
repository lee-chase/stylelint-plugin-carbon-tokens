/**
 * Copyright IBM Corp. 2022, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

const loadModules = async (carbonPath, modules, carbonModulePostfix) => {
  // Late loads modules from a path with optional postfix e.g. "node_modules/@carbon", ["themes", "type"], "10"
  // will try to load "mode_modules/@carbon/theme-10", "mode_modules/@carbon/type-10" and "mode_modules/@carbon/theme-10/package.json"
  // returning { themes, type, pkg }

  const postFix = carbonModulePostfix || '';
  const basePath = path.join(process.cwd(), carbonPath);
  const result = {};

  for (let m = 0; m < modules.length; m++) {
    const modulePath = path.join(basePath, modules[m] + postFix);

    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const module = await import(modulePath);

    result[modules[m]] = module;
  }

  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  result.pkg = await import(path.join(basePath, modules[0] + postFix, 'package.json'));

  return result;
};

export default loadModules;
