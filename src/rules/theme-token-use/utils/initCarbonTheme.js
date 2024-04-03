/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  unstable_metadata as installedMetadata,
  tokens as installedTokens,
  white as installedWhite,
} from '@carbon/themes';
import { formatTokenName } from '../../../utils/token-name.js';
import { unstable_tokens as installedLayout } from '@carbon/layout';
import { unstable_tokens as installedType } from '@carbon/type';
import { version as installedVersion } from '@carbon/themes/package.json';
import loadModules from '../../../utils/loadModules.js';

const missingButtonTokens = [
  'button-danger-active',
  'button-danger-hover',
  'button-danger-primary',
  'button-danger-secondary',
  'button-disabled',
  'button-primary',
  'button-primary-active',
  'button-primary-hover',
  'button-secondary',
  'button-secondary-active',
  'button-secondary-hover',
  'button-separator',
  'button-tertiary',
  'button-tertiary-active',
  'button-tertiary-hover',
];

const doInitTheme = async ({ carbonPath, carbonModulePostfix }) => {
  let layoutTokens;
  let typeTokens;
  let tokens;
  let white;
  let _version;
  let unstable_metadata;

  if (carbonPath) {
    const { layout, type, themes, pkg } = await loadModules(
      carbonPath,
      ['themes', 'layout', 'type'],
      carbonModulePostfix
    );

    layoutTokens = layout.unstable_tokens;
    typeTokens = type.unstable_tokens;
    white = themes.white;
    tokens = themes.tokens;
    unstable_metadata = themes.unstable_metadata;

    _version = pkg.version;
  } else {
    layoutTokens = installedLayout;
    typeTokens = installedType;
    white = installedWhite;
    tokens = installedTokens;
    unstable_metadata = installedMetadata;
    _version = installedVersion;
  }

  let themeTokens;

  if (unstable_metadata) {
    // prefer to installedWhite.
    themeTokens = unstable_metadata.v11.filter((token) => token.type === 'color').map((token) => `$${token.name}`);
  } else if (tokens?.colors) {
    // Carbon v10 as used in v1.0.0 of linter
    themeTokens = tokens.colors.map((token) => `$${formatTokenName(token)}`);
  } else {
    // Should be v11 prior to addition of `unstable_metadata` (11.4 tested)

    // map themes to recognizable tokens
    themeTokens = Object.keys(white)
      .filter((token) => !layoutTokens.includes(token) && !typeTokens.includes(token))
      .map((token) => `$${formatTokenName(token)}`);

    missingButtonTokens.forEach((token) => {
      themeTokens.push(`$${formatTokenName(token)}`);
    });
  }

  const isV10 = _version.startsWith('10');

  // permitted carbon theme functions
  // TODO: read this from carbon
  const themeFunctions = isV10 ? ['get-light-value'] : [];

  return { themeTokens, themeFunctions, version: _version };
};

export { doInitTheme };
