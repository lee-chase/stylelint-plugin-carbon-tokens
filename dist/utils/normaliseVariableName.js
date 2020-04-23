"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = normaliseVariableName;

function normaliseVariableName(variable) {
  if (variable.startsWith("--")) {
    return "var(".concat(variable, ")");
  } else {
    return variable;
  }
}