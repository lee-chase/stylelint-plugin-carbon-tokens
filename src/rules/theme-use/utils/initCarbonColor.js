/**
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { colors as installedColors } from "@carbon/colors";
// colors comes in as object depth 2
// keys are color names, values are objects
// value objects container key: intensity number, value actual color
import { formatTokenName } from "../../../utils/token-name.js";
import colorPkg from "@carbon/colors/package.json" assert { type: "json" };
import loadModules from "../../../utils/loadModules.js";

const installedVersion = colorPkg.version;

const carbonColorPrefix = "$carbon--";
const ibmColorPrefix = "$ibm-color__";

const doInitColors = async ({ carbonPath, carbonModulePostfix }) => {
  let _version;
  let colorTokens;
  const carbonColorTokens = [];
  const ibmColorTokens = []; // deprecated

  if (carbonPath) {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const { colors, pkg } = await loadModules(
      carbonPath,
      ["colors"],
      carbonModulePostfix
    );

    colorTokens = colors.colors;

    _version = pkg.version;
  } else {
    _version = installedVersion;
    colorTokens = installedColors;
  }

  const isV10 = _version.startsWith("10");

  for (const key in colorTokens) {
    if (Object.hasOwn(colorTokens, key)) {
      const colorMap = colorTokens[key];

      for (const index in colorMap) {
        if (Object.hasOwn(colorMap, index)) {
          const colorName = formatTokenName(`${key}${index}`);

          carbonColorTokens.push(`$${colorName}`);

          if (isV10) {
            carbonColorTokens.push(`${carbonColorPrefix}${colorName}`);
            ibmColorTokens.push(`${ibmColorPrefix}${colorName}`);
          }
        }
      }
    }
  }

  return { carbonColorTokens, ibmColorTokens };
};

export { doInitColors };