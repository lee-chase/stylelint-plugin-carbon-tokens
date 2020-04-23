"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = checkValue;

var _themes = require("@carbon/themes");

// map themes to recognisable tokens
var themesTokens = _themes.tokens.colors.map(function (token) {
  return (0, _themes.formatTokenName)(token);
}); // permitted carbon theme functions
// TODO: read this from carbon


var themeFunctions = ["get-light-value"];

function checkValue(val) {
  // Regex for checking - capture: 3 = function, 4 = earlier variables, 6 = variable
  // $any-variable;
  // any-function($any-variable
  // NOTE: inside function as otherwise regex.lastIndex may be non-zero on second call
  var regexFuncAndToken = /^((([a-zA-Z0-9-]*)\(*)|([a-zA-Z0-9- ]*))(\$([A-Z0-9a-z-]+))/g;
  var matches = regexFuncAndToken.exec(val);
  var matchVariable = 6;
  var matchFunction = 3;

  if (matches && matches[matchVariable]) {
    // if function check it's in themeFunctions

    /* istanbul ignore next */
    var passFunctionCheck = !matches[matchFunction] || matches[matchFunction].length === 0 || themeFunctions.includes(matches[matchFunction]); // check token exists in theme

    return passFunctionCheck && themesTokens.includes(matches[matchVariable]);
  }

  return false;
}