"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = declarationValueIndex;

/**
 * Get the index of a declaration's value
 *
 * @param {Decl} decl
 * @return {int} The index
 */
function declarationValueIndex(decl) {
  var beforeColon = decl.toString().indexOf(":");
  var afterColon = decl.raw("between").length - decl.raw("between").indexOf(":");
  return beforeColon + afterColon;
}