/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {fileURLToPath} from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPathIndex = __dirname.indexOf('/node_modules/');
const inNodeModules = modulesPathIndex > -1;
//
const modulesPath = inNodeModules
  ? __dirname.substr(0, modulesPathIndex + 14) // in node modules
  : path.join(__dirname, '../../../'); //

const packagesInfo = {
  layout: {
    nodeModules: '@carbon/layout/scss/generated/',
    srcModules: 'layout/scss/generated',
  },
};

const getCarbonFilePath = (pkg, file) => {
  const packageInfo = packagesInfo[pkg];
  const packagePath = path.join(modulesPath, `${inNodeModules ? packageInfo.nodeModules : packageInfo.srcModules}`);
  const filePart = (packageInfo.file && packageInfo.file[file]) || file;

  return path.join(packagePath, filePart);
};

export default getCarbonFilePath;
