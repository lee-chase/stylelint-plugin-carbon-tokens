/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

class MathsError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'MathsError';
    Error.captureStackTrace(this, MathsError);
  }
}

const TOKEN_TYPES = {
  NUMERIC_LITERAL: 'Numeric literal',
  SCSS_VAR: 'scss variable',
  OPERATOR: 'operator',
  SEPARATOR: 'separator',
  FUNCTION: 'function',
  LEFT_BR: 'Left bracket',
  RIGHT_BR: 'Right bracket',
  BRACKETED_CONTENT: 'Content of brackets',
  QUOTED_LITERAL: 'Quoted literal',
  TEXT_LITERAL: 'Text Literal',
  COLOR_LITERAL: 'Color Literal',
  MATH: 'Math',
  LIST: 'Comma separated list',
  LIST_ITEM: 'Item in list',
  UNKNOWN: 'Unknown',
};

const COMMA = 1;
const SQ = 2;
const DQ = 3;
const SPACE = 4;
const LEFT_BR = 5;
const RIGHT_BR = 6;

const structureParse = (value) => {
  // This method parses out a basic structure, it will be thrown by bracketed content with commas outside
  // of a function but we are not trying to parse the full SCSS syntax.

  const regex = /(,)|(')|(")|(\s)|(\()|(\))|([^,"'()\s]*)/g; // This regex splits by ', "()

  let inDoubleQuotes = false;
  let inSingleQuotes = false;

  const commaSplit = [];
  let matches = [];
  const depth = [];

  let match;

  while ((match = regex.exec(value)) !== null && match.index < value.length) {
    const inQuotes = inDoubleQuotes || inSingleQuotes;
    const maybeSplit = !(inQuotes || depth.length > 0);

    if (maybeSplit && match[COMMA]) {
      // only commas outside of quotes and functions split the value
      if (matches.length) {
        commaSplit.push(matches);
      }

      matches = [];
    } else if (maybeSplit && match[SPACE]) {
      if (matches.length) {
        matches.push(match);
      }
      // otherwise NO-OP
    } else if (!inQuotes && match[RIGHT_BR]) {
      const oldMatches = depth.pop();

      oldMatches.push(matches);
      matches = oldMatches;

      // don't push brackets depth indicates brackets
    } else if (!inQuotes && match[LEFT_BR]) {
      // start of a function or bracketed content
      const newMatches = [];

      depth.push(matches);
      matches = newMatches;

      // don't push brackets depth indicates brackets
    } else if ((match[DQ] && !inSingleQuotes) || (match[SQ] && !inDoubleQuotes)) {
      // This section pre-parses quoted values into full string matches
      // If no terminating quote is found a list of not really parsed brackets might be found
      // but again we are not worried about parsing the full SCSS syntax

      if ((match[DQ] && inDoubleQuotes) || (match[SQ] && inSingleQuotes)) {
        // exiting quotes
        const oldMatches = depth.pop();
        // construct something that looks like a regex match but contains the full string
        const newMatch = { input: match.input, groups: undefined };
        const priorMatches = [];

        for (const index in matches) {
          priorMatches.push(matches[index][0]);
        }

        const priorMatchString = priorMatches.join('');

        newMatch[0] = `${priorMatchString}${match[0]}`;
        newMatch[match[DQ] ? DQ : SQ] = newMatch[0];
        newMatch.index = match.index - priorMatchString.length;
        oldMatches.push(newMatch);
        matches = oldMatches;
      } else {
        // entering quotes
        const newMatches = [];

        depth.push(matches);
        matches = newMatches;
        matches.push(match);
      }

      inDoubleQuotes = match[DQ] !== undefined && !inDoubleQuotes;
      inSingleQuotes = match[SQ] !== undefined && !inSingleQuotes;
    } else {
      matches.push(match);
    }
  }

  if (matches.length) {
    commaSplit.push(matches);
  }

  return commaSplit;
};

const tokensAreList = (tokens) => {
  // inside bracketed content do we have a list
  // tokens are matches from a regex
  return tokens.findIndex((token) => token.input !== undefined && token[COMMA] !== undefined) > -1;
};

const formatParamsAsTokenList = (tokens) => {
  // The most common scenario is that this is parsing a function parameter list like (a, b)
  // It could be (a, b(c, d) e)
  // Both scenarios above output a list with two tokens [[a], [b]] and [[a], [b(c, d) f]]
  // In the latter case 'c, d' will be in a sub array so we do not need to worry

  const tokenList = [];
  let tokensToAdd = [];
  let lastWasComma = false;

  // any brackets we meet form part of an inner token list
  for (const index in tokens) {
    const token = tokens[index];

    if (token.input === undefined) {
      // plain array
      tokensToAdd.push(token);
      lastWasComma = false;
    } else if (token[COMMA]) {
      lastWasComma = true;
      tokenList.push(tokensToAdd);
      tokensToAdd = [];
    } else if (!(token[SPACE] && lastWasComma)) {
      // don't bother adding spaces after commas they can be added back later
      tokensToAdd.push(token);
      lastWasComma = false;
    }
  }

  if (tokensToAdd.length) {
    tokenList.push(tokensToAdd);
  }

  return tokenList;
};

const addToItems = (lastItem, host, newItem) => {
  let continueMath = lastItem && lastItem.type === TOKEN_TYPES.MATH;

  if (continueMath) {
    continueMath = lastItem.items.length > 0 && lastItem.items[lastItem.items.length - 1].type === TOKEN_TYPES.OPERATOR;
  }

  if (continueMath) {
    lastItem.items.push(newItem);
    lastItem.raw += ` ${newItem.raw}`;
    host.raw += newItem.raw; // only add space to lastItem, host will already have it
  } else {
    host.items.push(newItem);
    host.raw += newItem.raw;
  }
};

const processTokens = (tokens) => {
  // At this point tokens represents a valid SCSS property value
  // It may be a list e.g. such as that used by a border
  // The individual parts can be simple values, function calls or math that does not require a calc
  // Math may be surrounded by brackets inside or outside a calc
  const result = { items: [], raw: '' };

  let lastItem;
  let unattachedOperators = ''; // "border: - 5px" is valid SCSS but not CSS. Compiles to "border: -5px" only / is prohibited

  for (const index in tokens) {
    const token = tokens[index];

    // NOTE: token here is a regex match or an array
    let item;

    lastItem = result && result.items ? result.items[result.items.length - 1] : undefined;

    // we are going into bracketed content (array has no input property)
    if (token && token.input === undefined) {
      const lastItemLiteral = lastItem && lastItem.type === TOKEN_TYPES.TEXT_LITERAL;
      const lastItemMathLiteral =
        lastItem &&
        lastItem.type === TOKEN_TYPES.MATH &&
        lastItem.items[lastItem.items.length - 1].type === TOKEN_TYPES.TEXT_LITERAL;

      if (lastItemLiteral || lastItemMathLiteral) {
        // update existing item
        if (lastItemLiteral) {
          item = lastItem;
        } else {
          item = lastItem.items[lastItem.items.length - 1];
          lastItem.raw += '(';
        }

        item.items = [];
        item.type = TOKEN_TYPES.FUNCTION;
        item.isCalc = lastItem.value === 'calc';
        item.raw += '(';
        result.raw += '(';

        if (item.type === TOKEN_TYPES.FUNCTION) {
          // last item may have scope
          const parts = item.value.split('.');

          if (parts.length === 2) {
            item.scope = parts[0];
            item.value = parts[1];
          }
        }
      } else {
        item = {
          type: TOKEN_TYPES.BRACKETED_CONTENT,
          raw: `${unattachedOperators}(`,
          items: [],
        };
        unattachedOperators = '';
        addToItems(lastItem, result, item);
      }

      let processedStuff;

      if (tokensAreList(token)) {
        processedStuff = processList(formatParamsAsTokenList(token));
        addToItems(undefined, item, processedStuff);
      } else {
        // not a list just ordinary tokens space separated
        processedStuff = processTokens(token);

        for (const i in processedStuff.items) {
          addToItems(undefined, item, processedStuff.items[i]);
        }
      }

      result.raw += processedStuff.raw;

      if (lastItem && lastItem.type === TOKEN_TYPES.MATH) {
        lastItem.raw += processedStuff.raw;
        lastItem.raw += ')'; // close the brackets
      }

      item.raw += ')'; // close the brackets
      result.raw += ')'; // close the brackets
    } else {
      const tokenValue = token[0];
      // at this point we have either math or simple tokens with some spaces
      // That is SQ, DQ or UNKNOWN

      if ('+-*%/'.indexOf(tokenValue) > -1 && tokenValue.length === 1) {
        // are we continuing math or creating new math?
        if (lastItem && lastItem.type === TOKEN_TYPES.MATH) {
          // continue math
          lastItem.items.push({
            type: TOKEN_TYPES.OPERATOR,
            value: tokenValue,
            raw: tokenValue,
          });
          lastItem.raw += ` ${tokenValue}`;
        } else {
          if (result.items.length < 1) {
            if (tokenValue !== '*' && tokenValue !== '/') {
              unattachedOperators += tokenValue; // can be a whole string of minus
              continue;
            } else {
              throw new MathsError(
                `It looks like you are starting some math with '${tokenValue}' without anything to apply it to.`
              );
            }
          }

          // new Math
          result.items.length -= 1; // we already have lastItem recorded
          item = {
            items: [lastItem],
            type: TOKEN_TYPES.MATH,
            raw: lastItem.raw,
          };
          item.items.push({
            type: TOKEN_TYPES.OPERATOR,
            value: tokenValue,
            raw: tokenValue,
          });
          item.raw += ` ${tokenValue}`;
          result.items.push(item);
        }

        result.raw += tokenValue;
      } else if (token[COMMA]) {
        // does last item need space?
        if (lastItem) {
          lastItem.raw += token[COMMA];
        }

        result.raw += token[COMMA];
      } else if (token[SPACE]) {
        // never add space to last item it is not needed and confuses tests

        if (unattachedOperators) {
          unattachedOperators += token[SPACE];
        } else {
          result.raw += token[SPACE];
        }

        continue;
      } else {
        // process all remaining into an item before deciding where to put it.
        const numeric = /^(-?[0-9.]+)([^0-9.-]*)$/.exec(token[0]);
        const addInfo = {};

        if (numeric) {
          const units = numeric[2];

          item = {
            value: `${unattachedOperators}${numeric[1]}`,
            type: TOKEN_TYPES.NUMERIC_LITERAL,
            raw: `${unattachedOperators}${numeric[1]}${units}`,
            units,
          };
          unattachedOperators = '';
        } else {
          let type = TOKEN_TYPES.UNKNOWN;

          if (token[SQ] || token[DQ]) {
            // We have found a quoted literal
            type = TOKEN_TYPES.QUOTED_LITERAL;
          } else if (/^#[0-9a-f]*$/.test(token[0])) {
            // color literal
            type = TOKEN_TYPES.COLOR_LITERAL;
          } else {
            const scopeCheck = /^-?(?:[a-z_-][\w-]*\.)?\$/i.exec(token[0]);

            if (scopeCheck) {
              const dollarPos = scopeCheck[0].length - 1;

              if (dollarPos > 0) {
                addInfo.scope = scopeCheck[0].substring(0, dollarPos - 1);
                addInfo.value = token[0].substring(dollarPos);
              }

              type = TOKEN_TYPES.SCSS_VAR;
            } else if (/^-?\$/.test(token[0])) {
              type = TOKEN_TYPES.SCSS_VAR;
            } else if (/^[^0-9#]/.test(token[0])) {
              type = TOKEN_TYPES.TEXT_LITERAL;
            }
          }

          item = {
            value: `${unattachedOperators}${token[0]}`,
            type,
            raw: `${unattachedOperators}${token[0]}`,
            ...addInfo,
          };
          unattachedOperators = '';
        }

        addToItems(lastItem, result, item);
      }

      if (unattachedOperators) {
        throw new MathsError(
          `It looks like you are starting some math with '${unattachedOperators}' without anything to apply it to.`
        );
      }

      unattachedOperators = '';
    }
  }

  return result;
};

const processListItems = (listItems) => {
  const items = [];
  let raw = '';

  for (const index in listItems) {
    // if (!listItems[index][COMMA] && !listItems[index][SPACE]) {
    // ignore space and comma in list
    const listItemValues = processTokens(listItems[index]);
    const comma = raw.length ? ', ' : '';

    items.push({
      type: TOKEN_TYPES.LIST_ITEM,
      items: listItemValues.items,
      raw: listItemValues.raw,
    });
    raw += `${comma}${listItemValues.raw}`;
    // }
  }

  return { items, raw };
};

const processList = (list) => {
  const result = { type: TOKEN_TYPES.LIST };

  const processedListItem = processListItems(list);

  result.items = processedListItem.items;
  result.raw = processedListItem.raw;

  return result;
};

const postProcessStructuredTokens = (structuredTokens) => {
  // At this point we have a hierarchical array structure.
  // The top level is an array of stuff separated by non quoted and non-function parameter commas.
  // This is because some CSS values e.g box-shadow have a comma separated list of valid values

  if (structuredTokens.length <= 1) {
    // only one item do not treat as list
    return processTokens(structuredTokens[0]);
  }

  // a list of items
  return processList(structuredTokens);
};

const tokenizeValue = (value) => {
  let result;

  try {
    const structuredTokens = structureParse(value);

    result = postProcessStructuredTokens(structuredTokens);
  } catch (error) {
    if (error instanceof MathsError) {
      result = { items: [], raw: value, warning: error.message };
    } else {
      result = {
        items: [],
        raw: value,
        error,
        message: 'Failed to parse value',
      };
    }
  }

  return result;
};

export { tokenizeValue, TOKEN_TYPES };
