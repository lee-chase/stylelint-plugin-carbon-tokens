/**
 * Copyright IBM Corp. 2022, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

export const loadPackageJson = (packageName) => {
  const require = createRequire(import.meta.url);
  const pkg = require(path.join(packageName, 'package.json'));

  return pkg;
};

const loadModules = async (carbonPath, modules, carbonModulePostfix) => {
  // Late loads modules from a path with optional postfix e.g. "node_modules/@carbon", ["themes", "type"], "10"
  // will try to load "mode_modules/@carbon/theme-10", "mode_modules/@carbon/type-10" and "mode_modules/@carbon/theme-10/package.json"
  // returning { themes, type, pkg }

  const postFix = carbonModulePostfix || '';
  const basePath = path.join(process.cwd(), carbonPath);
  const result = {};

  for (let m = 0; m < modules.length; m++) {
    const modulePath = path.join(
      basePath,
      modules[m] + postFix,
      'lib/index.js' // /es/index.js not possible as import assumes cjs
    );

    const module = await import(modulePath);

    result[modules[m]] = module;
  }

  const packageFile = fs.readFileSync(
    path.join(basePath, modules[0] + postFix, 'package.json')
  );
  result.pkg = JSON.parse(packageFile);

  return result;
};

export default loadModules;
