// import valueParser from "postcss-value-parser";
import postcss from "postcss";
import scss from "postcss-scss";
// import atImport from "postcss-import";
import { utils } from "stylelint";
import {
  declarationValueIndex,
  checkProp,
  isValidOption,
  isVariable,
  namespace,
  parseOptions,
  checkIgnoreValue,
  checkValue,
  normaliseVariableName,
} from "../../utils";
import splitValueList from "../../utils/splitValueList";
import fs from "fs";

export const ruleName = namespace("theme-token-use");

export const messages = utils.ruleMessages(ruleName, {
  rejected: (property, value) =>
    `Expected carbon token for "${property}" found "${value}".`,
  rejectedVariable: (property, variable, value) =>
    `Expected carbon token to be set for variable "${variable}" used by "${property}" found "${value}".`,
});

const isValidIgnoreValues = isValidOption;
const isValidIncludeProps = isValidOption;
const variables = {}; // used to contain variable declarations

const defaultOptions = {
  includeProps: ["/color/", "/shadow/", "border"],
  ignoreValues: ["/transparent|inherit|initial/"],
};

const checkAts = (root) => {
  let atsPromise;
  const atsVariables = [];

  root.walkAtRules((ats) => {
    if (ats.name === "import") {
      let filename = ats.params.substr(1, ats.params.length - 2);

      if (!filename.endsWith(".scss")) {
        filename = filename.concat(".scss");
      }

      let _filename = filename;
      const lastSlash = filename.lastIndexOf("/");

      if (lastSlash >= 0) {
        if (filename.charAt(lastSlash + 1) !== "_") {
          // try with _ before last name
          _filename = filename.replace(/\/([^/]*)$/, "/_$1");
        }
      }

      if (fs.existsSync(_filename)) {
        filename = _filename;
      }

      const scssFromFile = fs.readFileSync(filename, "utf8");

      // eslint-disable-next-line
      console.log(scssFromFile);

      atsPromise = postcss()
        // .use(atImport()) // not working resolver struggles with extensions, try newer version
        .process(`${scssFromFile}`, {
          from: `${filename}`,
          syntax: scss,
        })
        .then(function (result) {
          result.root.walkDecls((decl) => {
            if (isVariable(decl.prop)) {
              // eslint-disable-next-line
              console.log("prop is var");

              if (checkValue(decl.value)) {
                atsVariables[normaliseVariableName(decl.prop)] = decl.value;
              } else {
                // add to variable declarations
                // expects all variables to appear before use
                // expects all variables to be simple (not map or list)

                if (isVariable(decl.value)) {
                  // leave as is if checkValue is true
                  // eslint-disable-next-line
                  console.log("val is var");

                  atsVariables[normaliseVariableName(decl.prop)] =
                    atsVariables[normaliseVariableName(decl.value)];
                } else {
                  atsVariables[normaliseVariableName(decl.prop)] = decl.value;
                }
              }
            }
          });

          return atsVariables;
        })
        .catch((reason) => {
          // eslint-disable-next-line
          console.log("Rejected ---------------", reason);
        });

      // eslint-disable-next-line
      console.log("-------------asdfasdfasdfasdf-------");
    }
  });

  return atsPromise;
};

const checkPropsAndValues = (root, result, options) => {
  root.walkDecls((decl) => {
    // // eslint-disable-next-line
    // console.dir(decl);

    if (isVariable(decl.prop)) {
      // add to variable declarations
      // expects all variables to appear before use
      // expects all variables to be simple (not map or list)

      variables[normaliseVariableName(decl.prop)] = decl.value;
    } else if (checkProp(decl.prop, options.includeProps)) {
      // is supported prop
      // Some color properties have
      // variable parameter lists where color can be optional
      // variable parameters lists where color is not at a fixed position

      const values = splitValueList(decl.value);

      for (const value of values) {
        if (!checkIgnoreValue(value, options.ignoreValues)) {
          if (!checkValue(value)) {
            // not a carbon theme token
            if (isVariable(value)) {
              // a variable that could be carbon theme token
              const variableValue = variables[value];

              if (!checkValue(variableValue)) {
                // a variable that does not refer to a carbon color token
                utils.report({
                  ruleName,
                  result,
                  message: messages.rejectedVariable(
                    decl.prop,
                    value,
                    variableValue
                  ),
                  index: declarationValueIndex(decl),
                  node: decl,
                });
              }
            } else {
              // not a variable or a carbon theme token
              utils.report({
                ruleName,
                result,
                message: messages.rejected(decl.prop, decl.value),
                index: declarationValueIndex(decl),
                node: decl,
              });
            }
          }
        }
      }
    }

    // postcss provides valueParse which we could use
    // valueParser(decl.value).walk(node => {
    // });
    // }
  });
};

export default function rule(optionsIn) {
  const options = parseOptions(optionsIn, defaultOptions);

  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: options,
      possible: {
        includeProps: [isValidIncludeProps],
        ignoreValues: [isValidIgnoreValues],
      },
      optional: true,
    });

    if (!validOptions) {
      /* istanbul ignore next */
      return;
    }

    const atCheck = checkAts(root);

    if (atCheck === undefined) {
      checkPropsAndValues(root);
    } else {
      atCheck.then((atsVariables) => {
        // eslint-disable-next-line
        console.dir(atsVariables);

        checkPropsAndValues(root, result, options);
      });
    }
  };
}
