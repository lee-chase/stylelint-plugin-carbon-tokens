"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = splitValueList;

function splitValueList(value) {
  // NOTE: inside function as otherwise regex.lastIndex may be non-zero on second call
  var commaSplitRegex = /,(?=(((?!\)).)*\()|[^()]*$)/g;
  var values = [];
  var lastPos = 0;
  var matches;

  while ((matches = commaSplitRegex.exec(value)) !== null) {
    values.push(value.substring(lastPos, matches.index).trim());
    lastPos = commaSplitRegex.lastIndex;
  }
  /* istanbul ignore else */


  if (lastPos < value.length) {
    values.push(value.substring(lastPos).trim());
  }

  return values;
}