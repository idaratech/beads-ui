/**
 * Label filter helpers shared by the store and the list view.
 */

/**
 * Normalize a persisted or patched label selection to a de-duplicated list
 * of non-empty strings. Anything that is not a list of strings degrades to
 * "no label filter".
 *
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizeLabelFilters(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  /** @type {string[]} */
  const out = [];
  for (const it of value) {
    if (typeof it !== 'string') {
      continue;
    }
    const v = it.trim();
    if (v.length > 0 && !out.includes(v)) {
      out.push(v);
    }
  }
  return out;
}

/**
 * Order-insensitive equality of two label selections.
 *
 * @param {string[]} a
 * @param {string[]} b
 * @returns {boolean}
 */
export function sameLabelFilters(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/**
 * Collect the distinct labels used by a list of issues, sorted for display.
 *
 * @param {Array<{ labels?: unknown }>} issues
 * @returns {string[]}
 */
export function collectLabels(issues) {
  /** @type {Set<string>} */
  const set = new Set();
  for (const it of issues) {
    if (Array.isArray(it.labels)) {
      for (const l of it.labels) {
        if (typeof l === 'string' && l.length > 0) {
          set.add(l);
        }
      }
    }
  }
  return Array.from(set).sort((x, y) => x.localeCompare(y));
}

/** Labels that name a wave look like `wave-1`. */
export const WAVE_PREFIX = 'wave-';

/**
 * Is this label a wave label?
 *
 * @param {unknown} label
 * @returns {label is string}
 */
export function isWaveLabel(label) {
  return typeof label === 'string' && label.startsWith(WAVE_PREFIX);
}

/**
 * Short display text for a wave label: `wave-1` → `W1`.
 *
 * @param {string} label
 * @returns {string}
 */
export function waveText(label) {
  return `W${label.slice(WAVE_PREFIX.length)}`;
}

/**
 * The wave labels of an issue, in label order.
 *
 * @param {{ labels?: unknown }} issue
 * @returns {string[]}
 */
export function waveLabels(issue) {
  return Array.isArray(issue.labels) ? issue.labels.filter(isWaveLabel) : [];
}

/**
 * Distinct wave labels of a list, sorted by wave number.
 *
 * @param {Array<{ labels?: unknown }>} issues
 * @returns {string[]}
 */
export function collectWaves(issues) {
  return collectLabels(issues)
    .filter(isWaveLabel)
    .sort((a, b) => {
      const na = Number(a.slice(WAVE_PREFIX.length));
      const nb = Number(b.slice(WAVE_PREFIX.length));
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return a.localeCompare(b);
    });
}
