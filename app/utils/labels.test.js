import { describe, expect, test } from 'vitest';
import {
  collectLabels,
  normalizeLabelFilters,
  sameLabelFilters
} from './labels.js';

describe('utils/labels', () => {
  test('normalizeLabelFilters keeps distinct non-empty strings', () => {
    expect(normalizeLabelFilters(['wave-1', ' wave-1 ', '', 3, null])).toEqual(
      ['wave-1']
    );
  });

  test('normalizeLabelFilters degrades non-arrays to no filter', () => {
    expect(normalizeLabelFilters('wave-1')).toEqual([]);
    expect(normalizeLabelFilters(undefined)).toEqual([]);
  });

  test('sameLabelFilters ignores order', () => {
    expect(sameLabelFilters(['a', 'b'], ['b', 'a'])).toBe(true);
    expect(sameLabelFilters(['a'], ['a', 'b'])).toBe(false);
  });

  test('collectLabels returns sorted distinct labels', () => {
    expect(
      collectLabels([
        { labels: ['wave-2', 'prd-206'] },
        { labels: ['wave-1'] },
        { labels: ['prd-206'] },
        {}
      ])
    ).toEqual(['prd-206', 'wave-1', 'wave-2']);
  });
});
