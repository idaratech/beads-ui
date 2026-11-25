import { describe, expect, test } from 'vitest';
import {
  collectLabels,
  collectWaves,
  isWaveLabel,
  normalizeLabelFilters,
  sameLabelFilters,
  waveLabels,
  waveText
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

  test('wave helpers recognise, render and order wave labels', () => {
    expect(isWaveLabel('wave-1')).toBe(true);
    expect(isWaveLabel('prd-206')).toBe(false);
    expect(waveText('wave-10')).toBe('W10');
    expect(waveLabels({ labels: ['prd-206', 'wave-2'] })).toEqual(['wave-2']);
    expect(
      collectWaves([
        { labels: ['wave-10'] },
        { labels: ['wave-2', 'prd-206'] },
        { labels: ['wave-1'] }
      ])
    ).toEqual(['wave-1', 'wave-2', 'wave-10']);
  });
});
