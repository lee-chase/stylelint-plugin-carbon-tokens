export default {
  rules: {
    'carbon/layout-use': [
      true,
      { severity: 'error', trackFileVariables: false },
    ],
    'carbon/theme-use': [
      true,
      { severity: 'error', trackFileVariables: false },
    ],
    'carbon/theme-layer-use': [true, { severity: 'error' }],
    'carbon/type-use': [true, { severity: 'error', trackFileVariables: false }],
    'carbon/motion-duration-use': [
      true,
      { severity: 'error', trackFileVariables: false },
    ],
    'carbon/motion-easing-use': [
      true,
      { severity: 'error', trackFileVariables: false },
    ],
  },
};
