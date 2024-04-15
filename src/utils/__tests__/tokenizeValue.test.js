/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { tokenizeValue /*, TOKEN_TYPES */ } from '../index.js';

describe('tokenizeValue', () => {
  let spyWarn;

  beforeEach(() => {
    // The component instantiations that follow will generate a stack of
    // console errors and warnings about required props not provided or
    // conditions not met, and for the purposes of these tests we don't care.
    spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    spyWarn.mockRestore();
  });

  it('Handles empty input', () => {
    expect(tokenizeValue('')).toEqual({
      items: [],
      raw: '',
    });
  });

  it('Handles single quoted strings', () => {
    expect(tokenizeValue("'a value'")).toEqual({
      items: [
        {
          type: 'Quoted literal',
          value: "'a value'",
          raw: "'a value'",
        },
      ],
      raw: "'a value'",
    });
  });

  it('Handles double quoted strings', () => {
    expect(tokenizeValue('"a value"')).toEqual({
      items: [
        {
          type: 'Quoted literal',
          value: '"a value"',
          raw: '"a value"',
        },
      ],
      raw: '"a value"',
    });
  });

  it('Handles single $variable', () => {
    expect(tokenizeValue('$test')).toEqual({
      items: [
        {
          type: 'scss variable',
          value: '$test',
          raw: '$test',
        },
      ],
      raw: '$test',
    });
  });

  it('Handles single CSS variable', () => {
    expect(tokenizeValue('var(--test)')).toEqual({
      items: [
        {
          items: [
            {
              type: 'Text Literal',
              value: '--test',
              raw: '--test',
            },
          ],
          type: 'function',
          value: 'var',
          isCalc: false,
          raw: 'var(--test)',
        },
      ],
      raw: 'var(--test)',
    });
  });

  it('Handles a function with multiple parameters', () => {
    expect(tokenizeValue("func('test', 'a value')")).toEqual({
      items: [
        {
          items: [
            {
              items: [
                {
                  type: 'Item in list',
                  items: [
                    {
                      type: 'Quoted literal',
                      value: "'test'",
                      raw: "'test'",
                    },
                  ],
                  raw: "'test'",
                },
                {
                  type: 'Item in list',
                  items: [
                    {
                      type: 'Quoted literal',
                      value: "'a value'",
                      raw: "'a value'",
                    },
                  ],
                  raw: "'a value'",
                },
              ],
              type: 'Comma separated list',
              raw: "'test', 'a value'",
            },
          ],
          type: 'function',
          value: 'func',
          isCalc: false,
          raw: "func('test', 'a value')",
        },
      ],
      raw: "func('test', 'a value')",
    });
  });

  it('Handles calc', () => {
    expect(tokenizeValue('calc(100vw - 20px)')).toEqual({
      items: [
        {
          items: [
            {
              items: [
                {
                  type: 'Numeric literal',
                  value: '100',
                  units: 'vw',
                  raw: '100vw',
                },
                {
                  type: 'operator',
                  value: '-',
                  raw: '-',
                },
                {
                  type: 'Numeric literal',
                  value: '20',
                  units: 'px',
                  raw: '20px',
                },
              ],
              type: 'Math',
              raw: '100vw - 20px',
            },
          ],
          type: 'function',
          value: 'calc',
          isCalc: true,
          raw: 'calc(100vw - 20px)',
        },
      ],
      raw: 'calc(100vw - 20px)',
    });
  });

  it('Handles math', () => {
    expect(tokenizeValue('100vw - 20px')).toEqual({
      items: [
        {
          items: [
            {
              type: 'Numeric literal',
              value: '100',
              units: 'vw',
              raw: '100vw',
            },
            {
              type: 'operator',
              value: '-',
              raw: '-',
            },
            {
              type: 'Numeric literal',
              value: '20',
              units: 'px',
              raw: '20px',
            },
          ],
          type: 'Math',
          raw: '100vw - 20px',
        },
      ],
      raw: '100vw - 20px',
    });

    expect(tokenizeValue('-1 * #{$test}')).toMatchObject({
      items: [
        {
          items: [
            { value: '-1', type: 'Numeric literal', raw: '-1', units: '' },
            { type: 'operator', value: '*', raw: '*' },
            { value: '#{$test}', type: 'Unknown', raw: '#{$test}' },
          ],
          type: 'Math',
          raw: '-1 * #{$test}',
        },
      ],
      raw: '-1 * #{$test}',
    });

    expect(tokenizeValue('-1 * $test')).toMatchObject({
      items: [
        {
          items: [
            {
              raw: '-1',
              type: 'Numeric literal',
              value: '-1',
            },
            {
              value: '*',
              type: 'operator',
              raw: '*',
            },
            {
              raw: '$test',
              type: 'scss variable',
              value: '$test',
            },
          ],
          type: 'Math',
          raw: '-1 * $test',
        },
      ],
      raw: '-1 * $test',
    });

    expect(tokenizeValue('- 10px')).toEqual({
      items: [
        {
          raw: '- 10px',
          type: 'Numeric literal',
          units: 'px',
          value: '- 10',
        },
      ],
      raw: '- 10px',
    });

    expect(tokenizeValue('- - + - 10%')).toEqual({
      items: [
        {
          raw: '- - + - 10%',
          type: 'Numeric literal',
          units: '%',
          value: '- - + - 10',
        },
      ],
      raw: '- - + - 10%',
    });

    expect(tokenizeValue('+ 10px')).toEqual({
      items: [
        {
          raw: '+ 10px',
          type: 'Numeric literal',
          units: 'px',
          value: '+ 10',
        },
      ],
      raw: '+ 10px',
    });

    expect(tokenizeValue('* 10px')).toEqual({
      items: [],
      warning: "It looks like you are starting some math with '*' without anything to apply it to.",
      raw: '* 10px',
    });

    expect(tokenizeValue('/ 10px')).toEqual({
      items: [],
      warning: "It looks like you are starting some math with '/' without anything to apply it to.",
      raw: '/ 10px',
    });
  });

  it('Handles multiple space separated values', () => {
    expect(tokenizeValue('$a $b $c')).toEqual({
      items: [
        { type: 'scss variable', value: '$a', raw: '$a' },
        { type: 'scss variable', value: '$b', raw: '$b' },
        { type: 'scss variable', value: '$c', raw: '$c' },
      ],
      raw: '$a $b $c',
    });
  });

  it('Handles comma separated list', () => {
    expect(tokenizeValue('$a, $b,$c')).toEqual({
      items: [
        {
          type: 'Item in list',
          items: [{ type: 'scss variable', value: '$a', raw: '$a' }],
          raw: '$a',
        },
        {
          type: 'Item in list',
          items: [{ type: 'scss variable', value: '$b', raw: '$b' }],
          raw: '$b',
        },
        {
          type: 'Item in list',
          items: [{ type: 'scss variable', value: '$c', raw: '$c' }],
          raw: '$c',
        },
      ],
      raw: '$a, $b, $c', // spaces added by parse after comma
      type: 'Comma separated list',
    });
  });

  it('Handles unexpected input', () => {
    expect(tokenizeValue("'unterminated quoted literal")).toMatchObject({
      items: [
        {
          value: "'",
          type: 'Quoted literal',
          raw: "'",
        },
        {
          value: 'unterminated',
          type: 'Text Literal',
          raw: 'unterminated',
        },
        {
          value: 'quoted',
          type: 'Text Literal',
          raw: 'quoted',
        },
        {
          value: 'literal',
          type: 'Text Literal',
          raw: 'literal',
        },
      ],
      raw: "'unterminated quoted literal",
    });
  });

  it("Treats #{$var} as an 'Other' type", () => {
    expect(tokenizeValue('#{$i-am-not-easily-knowable}')).toMatchObject({
      items: [
        {
          raw: '#{$i-am-not-easily-knowable}',
          type: 'Unknown',
          value: '#{$i-am-not-easily-knowable}',
        },
      ],
      raw: '#{$i-am-not-easily-knowable}',
    });
  });

  it('Handles content split across lines', () => {
    expect(
      tokenizeValue(`url(
  "/graphics/settings/checkMark.svg"
)`)
    ).toMatchObject({});
  });

  it('can parse scope', () => {
    expect(tokenizeValue('scope.$test')).toEqual({
      items: [
        {
          type: 'scss variable',
          value: '$test',
          scope: 'scope',
          raw: 'scope.$test',
        },
      ],
      raw: 'scope.$test',
    });
  });
});
