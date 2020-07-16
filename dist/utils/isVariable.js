"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = isVariable;

function isVariable(string) {
  return (
    string !== undefined &&
    (string.startsWith("$") ||
      string.startsWith("--") ||
      string.startsWith("var(--"))
  );
}
