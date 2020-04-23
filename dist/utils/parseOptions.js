"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = parseOptions;

var parseAddDefaults = function parseAddDefaults(options, defaults) {
  var output = options ? options.filter(function (option) {
    return option.length > 0;
  }) : [];
  var addDefaults = false;

  if (output.length === 0) {
    addDefaults = true;
  } else {
    var index = output.findIndex(function (item) {
      return item === "*";
    });

    if (index >= 0) {
      addDefaults = true;
      output.splice(index, 1);
    }
  }

  if (addDefaults) {
    var filteredDefaults = defaults.filter(function (def) {
      return !output.includes(def);
    });
    return output.concat(filteredDefaults);
  }

  return output;
};

function parseOptions(options, defaults) {
  var optsOut = {}; // // eslint-disable-next-line
  // console.dir(defaults);

  optsOut.includeProps = parseAddDefaults(options && options.includeProps || [], defaults.includeProps);
  optsOut.ignoreValues = parseAddDefaults(options && options.ignoreValues || [], defaults.ignoreValues); // // eslint-disable-next-line
  // console.dir(optsOut);

  return optsOut;
}