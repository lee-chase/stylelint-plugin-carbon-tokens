# Changelog

## 4.0.5

- fix: Completely resolve circular structure JSON serialization error in VSCode
  - Remove `syntax` property from PostCSS nodes before reporting to prevent
    circular references from postcss-scss's Lexer
  - This fixes the "Converting circular structure to JSON" error that was still
    occurring in VSCode/Bob when using the plugin

## 4.0.4

- fix: Stylelint v17 compatibility - Fixed circular structure JSON serialization
  error
  - Replaced `JSON.stringify(decl)` with safe property extraction in error
    logging
  - Updated stylelint dependency to support both v16 and v17:
    `"^16.26.1 || ^17.0.0"`
  - Fixes "Converting circular structure to JSON" error in VSCode extension when
    using Stylelint v17

## 4.0.3

- fix: CVE-2025-69873 - Updated ajv from 8.17.1 to 8.18.0 to address security
  vulnerability
  - Added resolution in package.json to force ajv@^8.18.0

## 4.0.2

- Various minor dependency updates.

## 4.0.1

- f6aca05 - fix: remove package-lock, lock update, add js-yaml resolution
- a4d63d9 - chore: add renovate config

## 4.0.0

- BREAK: Updated Node.js version requirement from `>=18` to `>=20`
- BREAK: Updated major dependencies:
  - ESLint v9 (from v8.57.1)
  - cspell v9 (from v8.14.4)
  - eslint-config-prettier v10 (from v9.1.0)
  - npm-check-updates v19 (from v16.14.20)
- BREAK: Migrated from `.eslintrc` to the new `eslint.config.js` format required
  by ESLint v9
- Added `@eslint/js` as a dev dependency
- Migrated ignore patterns from `.eslintignore` to the `ignores` property in
  `eslint.config.js`
- Fixed plugin configuration to use the correct object format for the import
  plugin
- Added global definitions for `console` and `process` to fix linting errors
- Removed the old `.eslintrc` and `.eslintignore` files
- Updated minor version dependencies:
  - @ibm/telemetry-js (^1.6.1 → ^1.10.2)
  - eslint-plugin-import (^2.30.0 → ^2.32.0)
  - eslint-plugin-prettier (^5.2.1 → ^5.5.4)
  - prettier (^3.3.3 → ^3.6.2)
  - stylelint (^16.13.2 → ^16.25.0)
  - stylelint-test-rule-node (^0.3.0 → ^0.4.0)

## 3.2.3

- fix: endIndex deprecation warning

## 3.2.2

- chore: update endpoint and readme
- fix: use of spacing namespace

## 3.2.1

- fix: deprecation warnings caused by use of `content.fix` following
  https://stylelint.io/changelog/#1682.

## 3.2.0

- chore: bump versions
- feat: Introduce experimental fix theme hex
- fix: enforceScopes to false (instead of undefiend).
- feat: add acceptCarbonCustomProp to layout-use, default false
- feat: add carbonPrefix option to layout-use, default 'cds'
- feat: add acceptCarbonCustomProp to motion-duration-use, default false
- feat: add carbonPrefix option to motion-duration-use, default 'cds'
- feat: add acceptCarbonCustomProp to theme-use, default false
- feat: add carbonPrefix option to theme-use, default 'cds'
- feat: update light-touch to include acceptCarbonCustomProp

## 3.1.0

- Address some test descriptions using expect instead of accept.
- Test added for #125 (fixed by #124)
- Partial fix for #124 (enforceScopes: false)
- Rework peer dependency to resolve #128

## 3.0.0

- V3 release (ESM for Stylelint 16)

## 3.0.0-rc.11

- Chore: address ESLint warnings and errors

## 3.0.0-rc.10

- Add example configs to be used in extends.
  - config/light-touch.js
  - config/recommended.js
  - config/strict.js

## 3.0.0-rc.9

- Accept fluid, container and icon size tokens for layout-use
- Accept type functions for weight, font family and scale.

## 3.0.0-rc.8

- Permit font-style setting by default

## 3.0.0-rc.7

- Add gap to spacing properties

## 3.0.0-rc.6

- Add option to exclude properties and values in options

## 3.0.0-rc.5

- Add logical size properties

## 3.0.0-rc.4

- Add Carbon telemetry package

## 3.0.0-rc.3

- fix: removes direct experimental load of JSON to improve node version
  compatibility

## 3.0.0-rc.2

- ~~Feat: acceptCarbonFontStyleFunction to allow
  `font-style: type.font-style('italic')` for instance.~~

## 3.0.0-rc.1

- BREAK: carbon/layout-token-use renamed for consistency to carbon/layout-use
- BREAK: carbon/layout-theme-use renamed for consistency to carbon/theme-use
- BREAK: carbon/layout-type-use renamed for consistency to carbon/type-use

## 3.0.0-rc.0

- BREAK: Move to Stylelint 16 and ESM only

## 2.3.1

- Fix: potential infinite loop
- Fix: missing motion function.
- Fix enforceScopes option.

## 2.3.0

- Feat: add 'enforceScopes' option preventing use of an empty scope or
  undeclared local scopes.

## 2.2.0

- Fix: issue #89 by pinning Babel to node 14. This can be updated in April when
  node 14 goes out of maintenance.
- Feat Adds `acceptScopes: ["**"]` to all rules. This value permits correctly
  named tokens regardless of scope.

## 2.1.0

- feat: add improved scope fixes

## 2.0.2

- Adds simplistic implementation of inline @use renames including vars

## 2.0.1

- Missing postcss dependency

## 2.0.0

- Released after testing in @carbon/ibm-products

## 2.0.0-rc.0

- Makes use of `unstable_metadata` now available in @carbon/themes version 11.

## 2.0.0-beta.14

- Adds the ability to specify a Carbon path as part of each rule. This is mainly
  for use with multiple Carbon versions in monorepo packages.

## 2.0.0-beta.13

- Fix use of carbon--motion prefix in v10.
- Ignore values not specified in multi-part value

## 2.0.0-beta.12

- Add type fixes
- Add theme fixes

## 2.0.0-beta.11

- BREAK: `carbon/motion-token-use` has been renamed to
  `carbon/motion-duration-use` to allow `carbon/motion-easing-use`
- Feat: Add `carbon/motion-easing-use` rule and fixes.
- Fix math before function not parsing.

## 2.0.0-beta.10

- fix: auto fix for `$layout--nn` in v11 now works.
- fix: multi value layout e.g. padding margin
- feat: add motion fixes

## 2.0.0-beta.9

- fix: Fix processing of comma separated values.

## 2.0.0-beta.8

- feat: Layout automatic fixes see [./src/rules/layout-token-use/README.md]

## 2.0.0-beta.7

- fix: mini-unit and carbon--mini-unit function use in v10
- fix: token name format to cope with `hoverSelectedUI`

## 2.0.0-beta.6

- Fix interpolated known values

## 2.0.0-beta.5

- Fix tests of #{$var} against token list.

## 2.0.0-beta.4

- Test fix for block class

## 2.0.0-beta.3

- Animation order should expect name first
- Changed v10 motion `duration--` prefix to v11 `duration-`
- Added v10 specific motion test for `duration--`.
- Add transition and animation specific messages.

## 2.0.0-beta.2

- fix: Temporarily fudge theme token list adding button category manually
- feat: Read Carbon version from package.json
- chore: Change `target` option to `testOnlyVersion`

## 2.0.0-beta.1

- Restore optional v10 support.

## 2.0 0-alpha.2

- Add scope support
- BREAK: Change acceptUndefinedVariables default to false

## 2.0 0-alpha.1

- Carbon V11 support
- Carbon 10 support dropped, use V1 for Carbon 10 support.

## 1.0.0

Updates to the latest version of Carbon 10 and calls V1 in prep for a v-next or
v2 branch for Carbon 11. V1 will continue to track v10 with updates published on
a request only basis.

├── @carbon/colors@10.37.1 ├── @carbon/layout@10.37.1 ├── @carbon/motion@10.29.0
├── @carbon/themes@10.54.0 ├── carbon-components@10.56.0

## 0.12.0

- chore: update Carbon versions
- chore: update browser list
- fix: resetting motion using none, unset, initial, inherit
- chore: read motion tokens using js

## 0.11.2

- Add support for translate3d

## 0.11.1

- Prevent linter falling over when passed the following forms code:
  `.foo { $body--height: 400px; top: -($body--height - $spacing-05); }`, code:
  `.foo { top: -($body--height - $spacing-05); }`, code:
  `.foo { $body--height: 400px; top: ($body--height - $spacing-05); }`, code:
  `.foo { top: ($body--height - $spacing-05); }`, code:
  `.foo { $body--height: 400px; top: $body--height - $spacing-05; }`,
  description: `Reject non-supported maths of form $x: 1px; $x - $token`, code:
  `.foo { top: $body--height - $spacing-05; }`, description:
  `Reject non-supported maths of form $unknown - $token`, code:
  `.foo {margin-top: 1 + map-get($map: (key: 1rem), $key: key);}`,

## 0.11.0

- Mocked console warnings thrown out during testing
- Added support for various forms of simple negation using
- Improved bracketed content support

## 0.10.0

- feat: Minor package dependency bumps including Carbon

## 0.9.0

- feat: Apply the 'acceptValues' in function parameters. Add tests for
  transform(x%, y%)

## 0.8.1

- fix: Previous version failed to process - and + and allowed / which is illegal
  in CSS and SCSS

## 0.8.0

- feat: improve handling of unattached operators

## 0.7.1

- fix: failure to parse math that has no value before it. Now emits warning

## 0.7.0

- feat: add support of -ve proportional values

## 0.6.1

- chore: add additional tests for value construction via pre-processor

## 0.6.0

- chore: switch tokenizer to simpler version

## 0.5.0

- fix: Replace use of matchAll with regex.exec to better support node 10

## 0.4.0

- feat: improve support for #{} syntax

## 0.3.0

- feat: switch layout to use js import of tokens

## 0.2.0

- chore: Removed dist from github
- chore: Updated gitignore
- feat: Add recommended config to README.md
- feat: switch color to use js import of tokens
- chore: add test for includeProps in theme

## 0.1.1

- Minor correction to initial release

## 0.1.0 Initial release
