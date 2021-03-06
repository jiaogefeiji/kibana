/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { StaticIndexPattern } from 'ui/index_patterns';

import { getPivotDropdownOptions } from './common';

describe('Data Frame: Define Pivot Common', () => {
  test('getPivotDropdownOptions()', () => {
    const indexPattern: StaticIndexPattern = {
      title: 'the-index-pattern-title',
      fields: [{ name: 'the-field', type: 'number', aggregatable: true, searchable: true }],
    };

    const options = getPivotDropdownOptions(indexPattern);

    expect(options).toEqual({
      aggOptions: [
        {
          label: 'the-field',
          options: [
            { label: 'avg(the-field)' },
            { label: 'max(the-field)' },
            { label: 'min(the-field)' },
            { label: 'sum(the-field)' },
            { label: 'value_count(the-field)' },
          ],
        },
      ],
      aggOptionsData: {
        'avg(the-field)': { agg: 'avg', field: 'the-field', formRowLabel: 'avg_the-field' },
        'max(the-field)': { agg: 'max', field: 'the-field', formRowLabel: 'max_the-field' },
        'min(the-field)': { agg: 'min', field: 'the-field', formRowLabel: 'min_the-field' },
        'sum(the-field)': { agg: 'sum', field: 'the-field', formRowLabel: 'sum_the-field' },
        'value_count(the-field)': {
          agg: 'value_count',
          field: 'the-field',
          formRowLabel: 'value_count_the-field',
        },
      },
      groupByOptions: [{ label: 'histogram(the-field)' }],
      groupByOptionsData: {
        'histogram(the-field)': {
          agg: 'histogram',
          field: 'the-field',
          formRowLabel: 'histogram_the-field',
          interval: '10',
        },
      },
    });
  });
});
