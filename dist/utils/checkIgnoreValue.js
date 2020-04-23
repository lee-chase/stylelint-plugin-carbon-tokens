"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = checkIgnoreValue;

var _parseToRegexOrString = _interopRequireDefault(require("./parseToRegexOrString"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* istanbul ignore next */
function checkIgnoreValue(value) {
  var ignoredValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return ignoredValues.some(function (ignoredValue) {
    // regex or string
    var testValue = (0, _parseToRegexOrString["default"])(ignoredValue);
    return testValue.test && testValue.test(value) || testValue === value;
  });
}