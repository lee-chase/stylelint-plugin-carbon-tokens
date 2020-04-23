"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = checkProp;

var _parseToRegexOrString = _interopRequireDefault(require("./parseToRegexOrString"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function checkProp(prop2Check, includedProps) {
  return includedProps.some(function (includedProp) {
    // regex or string
    var testProp = (0, _parseToRegexOrString["default"])(includedProp);
    return testProp.test && testProp.test(prop2Check) || testProp === prop2Check;
  });
}