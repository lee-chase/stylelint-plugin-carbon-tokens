"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _ = _interopRequireWildcard(require(".."));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

testRule(_["default"], {
  ruleName: _.ruleName,
  config: [{
    ignoreValues: ["/transparent|inherit/"],
    includeProps: ["/color/", "/shadow/", "border"]
  }],
  syntax: "scss",
  accept: [{
    code: ".foo { color: $ui-01; }",
    description: "Carbon theme token expected."
  }, {
    code: ".foo { box-shadow: 0 0 5px $ui-01, 0 0 10px $ui-02; }",
    description: "All color tokens in split are Carbon theme tokens."
  }, {
    code: "$my-color-accept: $ui-01; .foo { color: $my-color-accept; }",
    description: "Accept $varaible declared before use with Carbon theme tokens."
  }, {
    code: "--my-color-accept: $ui-01; .foo { color: var(--my-color-accept); }",
    description: "Accept --variable declared before use with Carbon theme tokens."
  }],
  reject: [{
    code: ".foo { background-color: #f4f4f4; }",
    description: "Used #color istead of Carbon theme token expected.",
    message: _.messages.expected
  }, {
    code: ".foo { box-shadow: 0 0 5px $ui-01, 0 0 10px #fefefe; }",
    description: "Used #color in a split property not Carbon theme tokens.",
    message: _.messages.expected
  }, {
    code: ".foo { color: $my-color-reject; }",
    description: "Not a $varaible declared before use with Carbon theme tokens."
  }, {
    code: ".foo { color: var(--my-color-reject); }",
    description: "Not a --variable declared before use with Carbon theme tokens."
  }]
});
testConfig({
  ruleName: _.ruleName,
  description: "Check for invalid ignore values",
  message: "Unknown rule carbon/theme-token-use.",
  config: ["always", {
    ignoreValues: ["/wibble"],
    message: _.messages.expected
  }]
});