/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isVariable, normalizeVariableName, parseRangeValue, parseToRegexOrString } from './index';
import { TOKEN_TYPES } from './tokenizeValue';

const sanitizeUnconnectedOperators = (val) => {
  const regex = /^([+ -]*)([^+-]*)$/;
  const matches = val.match(regex);
  let sign = '';
  let resultVal = val;

  if (matches && matches[1] && matches[2]) {
    // index is start of non sign part
    const signs = `${matches[1]}1`;

    sign = parseInt(signs) < 0 ? '-' : '';

    resultVal = `${sign}${matches[2]}`;
  }

  return resultVal;
};

const scopeMatch = (item, acceptedScope) => {
  const testValue = parseToRegexOrString(acceptedScope);

  return (testValue.test && testValue.test(item.scope)) || testValue === item.scope;
};

const checkScope = (item, options, localScopes) => {
  if (options.acceptScopes[0] === '**' && item.scope) {
    // ** means all scopes
    return true;
  }

  let result = localScopes.length > 0 && localScopes.some((scope) => scopeMatch(item, scope));

  if (!result && !options.enforceScopes) {
    result = options.acceptScopes && options.acceptScopes.some((scope) => scopeMatch(item, scope));
  }

  return result;
};

const checkAcceptValuesRaw = (valueToCheck, options) => {
  return options.acceptValues.some((acceptedValue) => {
    // regex or string
    const testValue = parseToRegexOrString(acceptedValue);

    return (testValue.test && testValue.test(sanitizeUnconnectedOperators(valueToCheck))) || testValue === valueToCheck;
  });
};

const checkAcceptValues = (item, options, localScopes) => {
  // Simply check raw values, improve later
  let result = false;
  let valueToCheck = item.raw;

  if (item) {
    if (item.scope) {
      valueToCheck = item.value;

      if (!checkScope(item, options, localScopes)) {
        return result;
      }
    }

    result = checkAcceptValuesRaw(valueToCheck, options);
  }

  return result;
};

const unquoteIfNeeded = (val) => {
  if (typeof val === 'string') {
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      return val.substring(1, val.length - 1);
    }
  }

  return val;
};

const preProcessToken = (variable, localVariables) => {
  const regex = /#\{([$\w-]*)\}/g;
  const replacements = [];
  let result = variable;
  let match;

  while ((match = regex.exec(variable)) !== null) {
    // This function copes with various forms and returns the scss variable or css custom prop
    // var(--test) --test -$test -#{$test} -var(--test) etc.

    // node 10 does not support matchAll
    const replacement = localVariables[match[1]];
    const isMinus = variable.match(/^-[^-]/);

    const replacementMatch = isMinus ? `-${match[0]}` : match[0];

    if (replacement) {
      replacements.push({
        index: match.index,
        match: replacementMatch,
        replacement: unquoteIfNeeded(replacement.raw),
      });
    } else {
      replacements.push({
        index: match.index,
        match: replacementMatch,
        replacement: match[1],
      });
    }
  }

  for (let i = replacements.length - 1; i >= 0; i--) {
    const replacement = replacements[i];

    const lastIndex = result.lastIndexOf(replacement.match);

    result =
      result.substr(0, lastIndex) + replacement.replacement + result.substr(lastIndex + replacement.match.length);
  }

  result = normalizeVariableName(result);

  while (localVariables[result]) {
    result = normalizeVariableName(localVariables[result].raw);
  }

  return result;
};

const checkTokens = function (item, ruleInfo, options, localScopes, localVariables) {
  const result = { accepted: false, done: false };
  let valueToCheck = item.raw;

  // if options.enforceScopes then scope must appear in localScopes
  // otherwise can appear in localScopes or options.acceptScopes
  if (item.scope) {
    valueToCheck = item.value;

    if (!checkScope(item, options, localScopes)) {
      return result;
    }
  } else if (options.enforceScopes && !options.acceptScopes.includes('')) {
    return result; // reject without scope
  }

  const start = valueToCheck.substr(0, 2);

  if (start[0] === '-' && start[1] !== '-') {
    // is negation not a variable
    valueToCheck = valueToCheck.substr(1);
  }

  // cope with variables wrapped in #{}
  let _variable = preProcessToken(valueToCheck, localVariables);

  if (_variable.startsWith('#')) {
    // token set does not contain #{}
    _variable = _variable.substr(2, _variable.length - 3);
  }

  if (checkAcceptValuesRaw(_variable, options)) {
    // value matches one of the acceptValues
    result.accepted = true;
    result.done = true;
  } else {
    for (const tokenSet of ruleInfo.tokens) {
      const tokenSpecs = tokenSet.values;

      if (tokenSpecs.includes(_variable)) {
        result.source = tokenSet.source;
        result.accepted = tokenSet.accept;
        result.done = true; // all tests completed

        break;
      }
    }
  }

  return result;
};

const checkProportionalMath = (mathItems, ruleInfo, options, localScopes, localVariables) => {
  let otherItem;

  if (mathItems[0].type === TOKEN_TYPES.NUMERIC_LITERAL && ['vw', 'vh', '%'].indexOf(mathItems[0].units) > -1) {
    otherItem = mathItems[2];
  } else if (mathItems[2].type === TOKEN_TYPES.NUMERIC_LITERAL && ['vw', 'vh', '%'].indexOf(mathItems[2].units) > -1) {
    otherItem = mathItems[0];
  }

  if (otherItem !== undefined) {
    if (['+', '-'].indexOf(mathItems[1].value) > -1) {
      // is plus or minus
      return checkTokens(otherItem, ruleInfo, options, localScopes, localVariables);
    }
  }

  return {};
};

const checkNegationMaths = (mathItems, ruleInfo, options, localScopes, localVariables) => {
  let otherItem;
  let numeric;

  if (mathItems[0].type === TOKEN_TYPES.NUMERIC_LITERAL && mathItems[0].units === '') {
    numeric = mathItems[0];
    otherItem = mathItems[2];
  } else if (mathItems[2].type === TOKEN_TYPES.NUMERIC_LITERAL && mathItems[2].units === '') {
    numeric = mathItems[2];
    otherItem = mathItems[0];
  }

  if (otherItem !== undefined) {
    if (['*', '/'].indexOf(mathItems[1].value) > -1 && numeric.raw === '-1') {
      // is times or divide by -1
      return checkTokens(otherItem, ruleInfo, options, localScopes, localVariables);
    }
  }

  return {};
};

const testItemInner = function (item, ruleInfo, options, localScopes, localVariables) {
  // Expects to be passed an item containing either a item { raw, type, value} or
  // one of the types with children Math, Function or Bracketed content { raw, type, items: [] }
  const result = {
    accepted: false,
    done: false,
  };

  if (item === undefined) {
    // do not accept undefined
    result.done = true;

    return result;
  }

  if (checkAcceptValues(item, options, localScopes)) {
    // value matches one of the acceptValues
    result.accepted = true;
    result.done = true;

    return result;
  }

  // cope with css variables
  const _item = item.type === TOKEN_TYPES.FUNCTION && item.value === 'var' ? item.items[0] : item;

  if (item.type === TOKEN_TYPES.BRACKETED_CONTENT) {
    // test all parts
    const bracketContentsGood = item.items.every((bracketedItem) => {
      const bracketedItemResult = testItemInner(bracketedItem, ruleInfo, options, localScopes, localVariables);

      return bracketedItemResult.accepted;
    });

    result.source = 'Bracketed content';
    result.accepted = bracketContentsGood;
    result.done = true; // all tests completed
  } else if (_item.type === TOKEN_TYPES.FUNCTION) {
    for (const funcSet of ruleInfo.functions) {
      const funcSpecs = funcSet.values;

      const matchesFuncSpec = funcSpecs.some((funcSpec) => {
        const parts = funcSpec.split('(');

        if (_item.scope && !checkScope(_item, options, localScopes)) {
          return false;
        }

        if (parts.length === 1) {
          // no parameter checks
          return parts[0] === _item.value;
        }

        // check parameters
        if (parts[0] === _item.value) {
          // a function will contain an items array that is either a LIST or not
          // IF TRUE a list then _item.items[0] === list which contains LIST_ITEMS in which case
          // LIST_ITEMS.items is what we are interested in
          // IF FALSE a list contains values which could include math or brackets or function calls
          // NOTE: we do not try to deal with function calls inside function calls

          const inList = Boolean(_item.items && _item.items[0].type === TOKEN_TYPES.LIST);
          const paramItems = inList
            ? _item.items[0].items // List[0] contains list items
            : _item.items; // otherwise contains Tokens

          let [start, end] = parts[1].substring(0, parts[1].length - 1).split(' ');

          start = parseRangeValue(start, paramItems.length);
          end = parseRangeValue(end, paramItems.length) || start; // start if end empty

          for (let pos = start; pos <= end; pos++) {
            // check each param to see if it is acceptable

            if (!paramItems[pos]) {
              break; // ignore parts after undefined
            }

            // raw value of list and non-list item does allow for math
            let tokenResult = {};

            if (_item.isCalc && paramItems[pos].type === TOKEN_TYPES.MATH) {
              // allow proportional + or - checkTokens
              const mathItems = paramItems[pos].items;

              tokenResult = checkProportionalMath(mathItems, ruleInfo, options, localScopes, localVariables);

              if (!tokenResult.accepted) {
                tokenResult = checkNegationMaths(mathItems, ruleInfo, options, localScopes, localVariables);
              }
            } else {
              tokenResult.accepted = checkAcceptValues(paramItems[pos], options, localScopes);

              if (!tokenResult.accepted) {
                const paramItem =
                  paramItems[pos].type === TOKEN_TYPES.LIST_ITEM ? paramItems[pos].items[0] : paramItems[pos];

                if (paramItem.type === TOKEN_TYPES.FUNCTION) {
                  // child function
                  tokenResult = testItemInner(paramItem, ruleInfo, options, localScopes, localVariables);
                } else {
                  tokenResult = checkTokens(paramItem, ruleInfo, options, localScopes, localVariables);
                }
              }
            }

            if (!tokenResult.accepted) {
              return false;
            }
          }

          // all variables in function passed so return true
          return true;
        }

        return false;
      });

      if (matchesFuncSpec) {
        result.source = funcSet.source;
        result.accepted = funcSet.accept;
        result.done = true; // all tests completed
        break;
      }
    }
  } else if (item.type === TOKEN_TYPES.MATH) {
    let tokenResult = checkProportionalMath(item.items, ruleInfo, options, localScopes, localVariables);

    if (!tokenResult.accepted) {
      tokenResult = checkNegationMaths(item.items, ruleInfo, options, localScopes, localVariables);
    }

    result.source = tokenResult.source;
    result.accepted = tokenResult.accepted;
    result.done = tokenResult.done;
  } else {
    // test what ever is left over

    const tokenResult = checkTokens(_item, ruleInfo, options, localScopes, localVariables);

    result.source = tokenResult.source;
    result.accepted = tokenResult.accepted;
    result.done = tokenResult.done;
  }

  // if (
  //   !result.accepted &&
  //   item &&
  //   (item.startsWith("carbon--mini-units") ||
  //     item.startsWith("get-light-item"))
  // ) {
  //   // eslint-disable-next-line
  //   console.log(
  //     result,
  //     item,
  //     matches,
  //     matches && matches[matchFunction],
  //     matches && matches[matchFunction].length > 0,
  //     regexFuncAndItem
  //   );
  // }

  result.isCalc = _item.isCalc;

  return result;
};

export default function testItem(item, ruleInfo, options, localScopes, localVariables) {
  // Expects to be passed an item containing either a item { raw, type, value} or
  // one of the types with children Math, Function or Bracketed content { raw, type, items: [] }
  let result = {};

  if (item === undefined) {
    // do not accept undefined
    result.done = true;

    return result;
  }

  result = testItemInner(item, ruleInfo, options, localScopes, localVariables);

  result.isVariable = isVariable(item); // causes different result message

  if (!result.done && result.isVariable && options.acceptUndefinedVariables) {
    result.accepted = true;
  }

  // result.variableItem = testItem; // last testItem found

  // if (result.isCalc) {
  //   // eslint-disable-next-line
  //   console.log("We have calc", item.raw);
  // }

  return result;
}
