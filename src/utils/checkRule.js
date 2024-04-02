/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  TOKEN_TYPES,
  checkProp,
  declarationValueIndex,
  isVariable,
  normalizeVariableName,
  parseRangeValue,
  testItem,
  tokenizeValue,
} from './';
import { tryFix } from './fix-utils';
import { utils } from 'stylelint';

// import valueParser from "postcss-value-parser";

export default async function checkRule(root, result, ruleName, options, messages, getRuleInfo, context) {
  const checkItem = (decl, item, propSpec, ruleInfo, localScopes, localVariables) => {
    // Expects to be passed an item containing either a token { raw, type, value} or
    // one of the types with children Math, Function or Bracketed content { raw, type, items: [] }

    const testResult = testItem(item, ruleInfo, options, localScopes, localVariables);
    let message;

    if (!testResult.accepted) {
      if (item === undefined) {
        message = messages.rejectedUndefinedRange(decl.prop, item, propSpec.range);
      } else if (testResult.isVariable) {
        testResult.variableValue !== undefined
          ? (message = messages.rejectedVariable(decl.prop, item.raw, testResult.variableValue))
          : (message = messages.rejectedUndefinedVariable(decl.prop, item.raw));
      } else if (testResult.isCalc) {
        message = messages.rejectedMaths(decl.prop, item.raw);
      } else if (decl.prop === 'transition') {
        message = messages.rejectedTransition(decl.prop, item.raw);
      } else if (decl.prop === 'animation') {
        message = messages.rejectedAnimation(decl.prop, item.raw);
      } else {
        message = messages.rejected(decl.prop, decl.value);
      }

      // adjust position for multipart value
      const offsetValue = item !== undefined ? decl.value.indexOf(item.raw) : 0;

      return {
        ruleName,
        result,
        message,
        index: declarationValueIndex(decl) + offsetValue,
        node: decl,
      };
    }

    return null;
  };

  const specialItems = ['inherit', 'initial', 'none', 'unset'];

  const checkItems = (items, decl, propSpec, ruleInfo, localScopes, localVariables) => {
    // expects to be passed an items array containing tokens
    let itemsToCheck;
    const isRange = propSpec.range !== undefined;
    const reports = [];

    if (!isRange || (items.length === 1 && specialItems.includes(items[0].value))) {
      // check all items in list
      itemsToCheck = items;
    } else if (isRange) {
      // for the range select only the values to check
      // 1 = first value, -1 = last value
      let [start, end] = propSpec.range.split(' ');

      itemsToCheck = [];

      start = parseRangeValue(start, items.length);
      // missing value equates to incorrect ordering
      end = parseRangeValue(end, items.length);

      if (end) {
        itemsToCheck.push(...items.slice(start, end + 1)); // +1 as slice end is not inclusive
      } else {
        itemsToCheck.push(items[start]);
      }
    }

    // look at propSpec.valueCheck
    if (propSpec.valueCheck) {
      itemsToCheck = itemsToCheck.filter((item) => {
        if (typeof propSpec.valueCheck === 'object') {
          return propSpec.valueCheck.test(item.raw);
        }

        return propSpec.valueCheck === item.raw;
      });
    }

    for (const item of itemsToCheck) {
      const report = checkItem(decl, item, propSpec, ruleInfo, localScopes, localVariables);

      if (report) {
        // contains report
        reports.push(report);
      }
    }

    return reports;
  };

  const localVariables = {}; // used to contain variable declarations

  const ruleInfo = await getRuleInfo(options);

  const localScopes = [];

  // **** walk at rules to find carbon @use scopes
  await root.walkAtRules(
    /**
     *
     * Looks for acceptable scope usage.
     * - If an acceptable scope is renamed or * then options.acceptScopes is updated.
     */
    (rule) => {
      if (rule.name === 'use') {
        const ruleParams = rule.params.replace(/'(.*)'/, '$1').replace(/"(.*)"/, '$1'); // remove quotes if needed
        const [usedThing, usedScope] = ruleParams.split(' as ');

        const carbonThingRegex = // eslint-disable-next-line regexp/no-unused-capturing-group
          /((@carbon)|(carbon-components(\/([^/$]+))*))\/+_?([^.]+)(\.scss)*/;

        const carbonThing = carbonThingRegex.exec(usedThing);
        let fileScope;

        if (carbonThing) {
          fileScope = carbonThing[6].toLowerCase(); // use the last folder name if no scope
        } else if (!options.enforceScopes) {
          // at this point local scopes come from a known import at least in theory
          // other scopes we might accept are based on user

          const nonCarbonThingRegex = // eslint-disable-next-line regexp/no-unused-capturing-group
            /((.+)\/)*_?([^.]+)(\.scss)*/;

          const nonCarbonThing = nonCarbonThingRegex.exec(usedThing);

          if (nonCarbonThing) {
            fileScope = nonCarbonThing[3];
          }
        }

        const knownScope = options.acceptScopes.find(
          (
            aScope // allow known scope or file scope if *
          ) => (usedScope && aScope === usedScope) || fileScope === aScope
        );

        if (usedScope) {
          // may want to add it to accept scopes
          if (knownScope || !options.enforceScopes) {
            const acceptThisScope = usedScope === '*' ? '' : usedScope;

            localScopes.push(acceptThisScope);
            options.acceptScopes.push(acceptThisScope);
          }
        } else if (knownScope) {
          localScopes.push(knownScope);
        }
      }
    }
  );

  if (!options.enforceScopes && !localScopes.includes('')) {
    // scopes are not being enforced allow no scope
    localScopes.push('');
  }

  // **** walk rules and check values
  await root.walkDecls(async (decl) => {
    const tokenizedValue = tokenizeValue(decl.value);

    if (tokenizedValue && tokenizedValue.error) {
      // eslint-disable-next-line no-console
      console.warn(
        `Unexpected syntax in decl: ${JSON.stringify(
          decl
        )}. \n\n HELP. If you see this message PLEASE copy the contents of the message above and raise a github issue. Thankyou in advance for helping us to improve the tool.`
      );
    } else if (tokenizedValue && tokenizedValue.warning) {
      // eslint-disable-next-line no-console
      console.warn(tokenizedValue.warning);
    } else {
      if (isVariable(decl.prop)) {
        const newKeys = [normalizeVariableName(decl.prop)];

        // In some decl.prop may contain an existing known value
        // Store the value as an additional key
        Object.keys(localVariables).forEach((key) => {
          const interpolatedKey = `#{${key}}`;

          if (decl.prop.indexOf(key) !== -1) {
            newKeys.push(decl.prop.replace(interpolatedKey, localVariables[key].value));
          }
        });

        newKeys.forEach((key) => {
          // add to variable declarations
          // expects all variables to appear before use
          // expects all variables to be simple (not map or list)
          localVariables[normalizeVariableName(key)] = tokenizedValue.items[0];
        });
      }

      // *** Does the prop need to be checked?
      const propSpec = checkProp(decl.prop, options.includeProps);

      if (propSpec) {
        // is supported prop
        // Some color properties have
        // variable parameters lists where color is not at a fixed position

        const itemsToCheck =
          // eslint-disable-next-line eqeqeq
          tokenizedValue.type == TOKEN_TYPES.LIST ? tokenizedValue.items : [tokenizedValue];

        const reports = [];

        // *** check each item found in value
        for (const itemToCheck of itemsToCheck) {
          const newReports = checkItems(itemToCheck.items, decl, propSpec, ruleInfo, localScopes, localVariables);

          if (newReports?.length > 0) {
            reports.push(...newReports);
          }
        }

        // *** found issues try to fix and report if not fixed
        if (reports.length > 0) {
          let fixed = false;

          if (context && context.fix && ruleInfo.fixes) {
            let workingValue = decl.value;

            // try to fix
            ruleInfo.fixes.forEach((fix) => {
              // NOTE: multiple different fixes may be applied to multi part values
              workingValue = tryFix(fix, workingValue, {
                ruleInfo,
                options,
                prop: decl.prop,
              });
            });

            if (workingValue !== decl.value) {
              for (let si = 0; si < localScopes.length; si++) {
                const reportsFix = [];
                const scope = localScopes[si];
                const scopedValue = scope.length > 0 ? `${scope}.${workingValue}` : workingValue;

                // test new value
                const tokenizedValueFix = tokenizeValue(scopedValue);
                const itemsToCheckFix =
                  tokenizedValueFix.type === TOKEN_TYPES.LIST ? tokenizedValueFix.items : [tokenizedValueFix];

                for (const itemToCheckFix of itemsToCheckFix) {
                  const newReports = checkItems(
                    itemToCheckFix.items,
                    decl,
                    propSpec,
                    ruleInfo,
                    localScopes,
                    localVariables
                  );

                  if (newReports?.length > 0) {
                    reportsFix.push(...newReports);
                  }
                }

                // If any fixes applied do not create an accepted result then do NOT update decl.value
                if (reportsFix.length === 0) {
                  fixed = true;
                  decl.value = scopedValue;
                  break; // fixed no need to try next scope
                }
              }
            }
          }

          if (!fixed) {
            // always report original warnings not those based on fix
            reports.forEach((report) => {
              utils.report(report);
            });
          }
        }
      }
    }
  });
}
