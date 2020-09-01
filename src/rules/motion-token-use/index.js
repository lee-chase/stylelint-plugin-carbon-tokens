// import valueParser from "postcss-value-parser";
import { utils } from "stylelint";
import {
  isValidOption,
  namespace,
  parseOptions,
  checkRule,
  getMessages,
} from "../../utils";
import { getMotionInfo } from "./utils";

export const ruleName = namespace("motion-token-use");
export const messages = getMessages(ruleName, "motion");

const isValidIgnoreValues = isValidOption;
const isValidIncludeProps = isValidOption;

const defaultOptions = {
  // include standard motion properites
  includeProps: [
    "transition<2>", // only permitted definition order fails otherwise
    "transition-duration",
    "animation<1>", // only permitted definition order fails otherwise
    "animation-duration",
  ],
  //  Ignore reset values
  ignoreValues: ["/$0s?/", "/inherit|initial|none|unset/"],
  acceptUndefinedVariables: true,
};

export default function rule(primaryOptions, secondaryOptions) {
  const options = parseOptions(secondaryOptions, defaultOptions);

  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      {
        actual: primaryOptions,
      },
      {
        actual: options,
        possible: {
          includeProps: [isValidIncludeProps],
          ignoreValues: [isValidIgnoreValues],
          acceptUndefinedVariables: (val) =>
            val === undefined || typeof val === "boolean",
        },
        optional: true,
      }
    );

    if (!validOptions) {
      /* istanbul ignore next */
      return;
    }

    checkRule(root, result, ruleName, options, messages, getMotionInfo);
  };
}
