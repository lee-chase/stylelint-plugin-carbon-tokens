/**
 * Copyright IBM Corp. 2022, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fixUsingMap } from '../../../utils/fix-utils';

export const fixes = [
  {
    // remove carbon prefix from spacing tokens
    version: '11',
    target: /\$carbon--((container)|(fluid-spacing)|(icon-size)|(spacing))-([0-9]{2})/g,
    replacement: '$$$1-$6',
  },
  {
    // remove carbon prefix from size tokens
    version: '11',
    target: /\$carbon--(size[a-zA-Z0-9]*)/g,
    replacement: '$$$1',
  },
  {
    // replace layout tokens with spacing tokens
    version: '11',
    target: /\$(carbon--)?layout-([0-9]{2})/g,
    replacement: (value, target) => {
      let workingValue = value;
      let match = target.exec(workingValue);

      while (match) {
        const spacingNumbers = ['05', '06', '07', '09', '10', '12', '13'];
        const layoutNumber = parseInt(match[2], 10);

        if (layoutNumber <= spacingNumbers.length) {
          workingValue = workingValue.replace(match[0], `$spacing-${spacingNumbers[layoutNumber - 1]}`);
        }

        match = target.exec(workingValue);
      }

      // return unmodified value
      return workingValue;
    },
  },
  {
    // replace pixel or rem values with spacing tokens
    target: /[0-9.]+(px|rem)/g,
    replacement: (value, target) => {
      return fixUsingMap(value, target, {
        '0.125rem': '$spacing-01',
        '2px': '$spacing-01',
        '0.25rem': '$spacing-02',
        '4px': '$spacing-02',
        '0.5rem': '$spacing-03',
        '8px': '$spacing-03',
        '0.75rem': '$spacing-04',
        '12px': '$spacing-04',
        '1rem': '$spacing-05',
        '16px': '$spacing-05',
        '1.5rem': '$spacing-06',
        '24px': '$spacing-06',
        '2rem': '$spacing-07',
        '32px': '$spacing-07',
        '2.5rem': '$spacing-08',
        '40px': '$spacing-08',
        '3rem': '$spacing-09',
        '48px': '$spacing-09',
        '4rem': '$spacing-10',
        '64px': '$spacing-10',
        '5rem': '$spacing-11',
        '80px': '$spacing-11',
        '6rem': '$spacing-12',
        '96px': '$spacing-12',
        '10rem': '$spacing-13',
        '160px': '$spacing-13',
      });
    },
  },
];
