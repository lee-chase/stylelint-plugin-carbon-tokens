/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import themeUse from './rules/theme-use.js';
import themeLayerUse from './rules/theme-layer-use.js';
import layoutUse from './rules/layout-use.js';
import typeUse from './rules/type-use.js';
import motionDurationUse from './rules/motion-duration-use.js';
import motionEasingUse from './rules/motion-easing-use.js';

const plugins = [
  themeUse,
  themeLayerUse,
  layoutUse,
  typeUse,
  motionDurationUse,
  motionEasingUse,
];

export default plugins;

// Export individual rules for direct access
export {
  themeUse,
  themeLayerUse,
  layoutUse,
  typeUse,
  motionDurationUse,
  motionEasingUse,
};
