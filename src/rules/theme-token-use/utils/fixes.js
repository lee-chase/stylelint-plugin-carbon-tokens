/**
 * Copyright IBM Corp. 2022, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fixUsingMap } from '../../../utils/fix-utils';

// It would be really nice to be able to fix raw colors to theme tokens, however this is problematic
// due to colors often being used by multiple tokens. In the 'White' theme the color 'white' is used
// for $ui-background $ui-02 (container background on $ui-01), $text-04 (text on interactive colors),
// $icon-03, $field-02, $inverse-01 and $inverse-focus-ui. This makes it difficult to do anything useful.

export const fixes = [
  {
    // v10 to v11 Updated and deprecated tokens from https://github.com/carbon-design-system/carbon/blob/main/docs/migration/v11.md#carbonthemes
    // NOTE: Not all can be automated, but the ones that can are.
    target: /\$[a-z0-9-]+/gi,
    replacement: (value, target, config) =>
      fixUsingMap(
        value,
        target,
        {
          '$active-danger': '$button-danger-active',
          '$active-light-ui': '$layer-active-02', // OR context: $layer-active?
          '$active-primary': '$button-primary-active',
          '$active-secondary': '$button-secondary-active',
          '$active-tertiary': '$button-tertiary-active',
          $danger: '$button-danger-primary',
          '$danger-01': '$button-danger-primary',
          '$danger-02': '$button-danger-secondary',
          '$decorative-01': '$border-subtle-02',
          // "$decorative-01": {
          //   standard: "$border-subtle-02",
          //   context: "$border-subtle"
          // }, // OR context: $border-subtle?
          '$hover-danger': '$button-danger-hover',
          '$hover-light-ui': '$layer-hover-02',
          '$hover-primary': '$button-primary-hover',
          '$hover-primary-text': '$link-primary-hover',
          '$hover-row': '$layer-hover-01', // OR context: $layer-hover?
          '$hover-secondary': '$button-secondary-hover',
          '$hover-tertiary': '$button-tertiary-hover',
          '$hover-ui': '$background-hover',
          '$icon-01': '$icon-primary',
          '$icon-02': '$icon-secondary',
          '$icon-03': '$icon-on-color',
          '$interactive-02': '$button-secondary',
          '$interactive-03': '$button-tertiary',
          '$inverse-02': '$background-inverse',
          '$inverse-focus-ui': '$focus-inverse',
          '$inverse-hover-ui': '$background-inverse-hover',
          '$inverse-link': '$link-inverse',
          '$inverse-support-01': '$support-error-inverse',
          '$inverse-support-02': '$support-success-inverse',
          '$inverse-support-03': '$support-warning-inverse',
          '$inverse-support-04': '$support-info-inverse',
          '$link-01': '$link-primary',
          '$link-02': '$link-secondary',
          '$overlay-01': '$overlay',
          '$selected-light-ui': '$layer-selected-02',
          '$skeleton-01': '$skeleton-background',
          '$skeleton-02': '$skeleton-element',
          '$support-01': '$support-error',
          '$support-02': '$support-success',
          '$support-03': '$support-warning',
          '$support-04': '$support-info',
          '$text-01': '$text-primary',
          '$text-02': '$text-secondary',
          '$text-03': '$text-placeholder',
          '$text-04': '$text-on-color',
          '$text-05': '$text-helper',
          '$text-error': '$text-error',
          '$ui-01': '$layer-01', // OR context: $layer?
          '$ui-02': '$layer-02', // OR context: $layer?
          '$ui-background': '$background',
          '$visited-link': '$link-visited',
        },
        config
      ),
  },
  {
    // v10 to v11 split tokens from https://github.com/carbon-design-system/carbon/blob/main/docs/migration/v11.md#carbonthemes
    // NOTE: Not all can be automated, but the ones that can are.
    target: /\$[a-z0-9-]+/gi,
    replacement: (value, target, config) =>
      fixUsingMap(
        value,
        target,
        {
          '$active-ui': {
            standard: '$layer-active-01', // OR context: $layer-active?
            '^background': '$background-active',
            // "$active-ui": "$layer-accent-active-01", // OR context: $layer-accent-active?
            // "$active-ui": "$border-subtle-selected-01", // OR context: $border-subtle-selected?
          },
          '$disabled-02': {
            standard: '$text-disabled',
            '^(border|outline|box-shadow)': '$border-disabled',
          },
          // "$disabled-02": "$icon-disabled",
          // "$disabled-02": "$button-disabled",
          // "$disabled-02": "$border-disabled", // OR context: $border-disabled?
          '$disabled-03': '$icon-on-color-disabled',
          // "$disabled-03": "$layer-selected-disabled",
          // "$disabled-03": "$text-on-color-disabled",
          '$hover-selected-ui': '$background-selected-hover',
          // "$hover-selected-ui": "$layer-accent-hover-01", // OR context: $layer-accent-hover?
          // "$hover-selected-ui": "$layer-selected-hover-01", // OR context: $layer-selected-hover?
          '$hover-ui': '$layer-hover-01', // OR context: $layer-hover?
          // "$hover-ui": "$field-hover-01", // OR context: $field-hover?
          // "$hover-ui": "$field-hover-02", // OR context: $field-hover?
          '$interactive-01': {
            standard: '$button-primary',
            '^background': '$background-brand',
          },
          '$interactive-04': {
            standard: '$interactive',
            '^(border|outline|box-shadow)': '$border-interactive',
          },
          '$inverse-01': '$text-inverse',
          // "$inverse-01": "$icon-inverse",
          // "$inverse-01": "$focus-inset",
          '$selected-ui': {
            standard: '$layer-selected-01', // OR context: $layer-selected?
            '^background': '$background-selected',
          },
          '$ui-03': {
            standard: '$layer-accent-01',
            '^(border|outline|box-shadow)': '$border-subtle-01',
          }, // OR context: $layer-accent?
          '$ui-04': {
            standard: '$toggle-off',
            '^(border|outline|box-shadow)': '$border-strong-01',
          }, // OR context: $border-strong?
          '$ui-05': {
            standard: '$layer-selected-inverse',
            '^(border|outline|box-shadow)': '$border-inverse',
          },
        },
        config
      ),
  },
];
