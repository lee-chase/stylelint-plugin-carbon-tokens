"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = rule;
exports.messages = exports.ruleName = void 0;

var _stylelint = require("stylelint");

var _utils = require("../../utils");

var _splitValueList = _interopRequireDefault(require("../../utils/splitValueList"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var ruleName = (0, _utils.namespace)("theme-token-use");
exports.ruleName = ruleName;

var messages = _stylelint.utils.ruleMessages(ruleName, {
  rejected: function rejected(property, value) {
    return "Expected carbon token for \"".concat(property, "\" found \"").concat(value, ".");
  },
  rejectedVariable: function rejectedVariable(property, variable, value) {
    return "Expected carbon token to be set for variable \"".concat(variable, "\" used by \"").concat(property, "\" found \"").concat(value, ".");
  }
});

exports.messages = messages;
var isValidIgnoreValues = _utils.isValidOption;
var isValidIncludeProps = _utils.isValidOption;
var variables = {}; // used to contain variable declarations

var defaultOptions = {
  includeProps: ["/color/", "/shadow/", "border"],
  ignoreValues: ["/transparent|inherit|initial/"]
};

function rule(optionsIn) {
  var options = (0, _utils.parseOptions)(optionsIn, defaultOptions);
  return function (root, result) {
    var validOptions = _stylelint.utils.validateOptions(result, ruleName, {
      actual: options,
      possible: {
        includeProps: [isValidIncludeProps],
        ignoreValues: [isValidIgnoreValues]
      },
      optional: true
    });

    if (!validOptions) {
      /* istanbul ignore next */
      return;
    } // list of variables that may need checking during walk
    // const declVariables = [];
    // root.walkDecls(decl => {
    //   // record variable for check later with $ or --
    //   if (isVariable(decl.prop)) {
    //     declVariables.push(decl);
    //   }
    // });


    root.walkDecls(function (decl) {
      if ((0, _utils.isVariable)(decl.prop)) {
        // add to variable declarations
        // expects all variables to appear before use
        // expects all variables to be simple (not map or list)
        variables[(0, _utils.normaliseVariableName)(decl.prop)] = decl.value;
      } else if ((0, _utils.checkProp)(decl.prop, options.includeProps)) {
        // is supported prop
        // Some color properties have
        // variable parameter lists where color can be optional
        // variable parameters lists where color is not at a fixed position
        var values = (0, _splitValueList["default"])(decl.value);

        var _iterator = _createForOfIteratorHelper(values),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var value = _step.value;

            if (!(0, _utils.checkIgnoreValue)(value, options.ignoreValues)) {
              if (!(0, _utils.checkValue)(value)) {
                // not a carbon theme token
                if ((0, _utils.isVariable)(value)) {
                  // a variable that could be carbon theme token
                  var variableValue = variables[value];

                  if (!(0, _utils.checkValue)(variableValue)) {
                    // a variable that does not refer to a carbon color token
                    _stylelint.utils.report({
                      ruleName: ruleName,
                      result: result,
                      message: messages.rejectedVariable(decl.prop, value, variableValue),
                      index: (0, _utils.declarationValueIndex)(decl),
                      node: decl
                    });
                  }
                } else {
                  // not a variable or a carbon theme token
                  _stylelint.utils.report({
                    ruleName: ruleName,
                    result: result,
                    message: messages.rejected(decl.prop, decl.value),
                    index: (0, _utils.declarationValueIndex)(decl),
                    node: decl
                  });
                }
              }
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } // postcss provides valueParse which we could use
      // valueParser(decl.value).walk(node => {
      // });
      // }

    });
  };
}