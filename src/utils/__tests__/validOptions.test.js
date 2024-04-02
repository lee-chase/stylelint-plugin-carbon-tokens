/**
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isValidOption } from '..';

describe('isValidOptions', () => {
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

  it('Option to be invalid', () => {
    expect(isValidOption(['/expected to cause warning during test'])).toBe(false);
    expect(spyWarn).toHaveBeenCalled();
  });
});
