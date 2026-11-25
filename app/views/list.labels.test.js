import { describe, expect, test } from 'vitest';
import { createStore } from '../state.js';
import { createListView } from './list.js';

/**
 * Minimal issue stores stub: one snapshot for every client id.
 *
 * @param {any[]} issues
 */
function createIssueStores(issues) {
  return {
    snapshotFor: () => issues,
    subscribe: () => () => {},
    subscribeFor: () => () => {}
  };
}

const ISSUES = [
  {
    id: 'x-1',
    title: 'W1 · ENG-1',
    status: 'open',
    priority: 0,
    issue_type: 'task',
    labels: ['prd-206', 'wave-1']
  },
  {
    id: 'x-2',
    title: 'W2 · ENG-2',
    status: 'open',
    priority: 0,
    issue_type: 'task',
    labels: ['prd-206', 'wave-2']
  },
  {
    id: 'x-3',
    title: 'No labels',
    status: 'open',
    priority: 2,
    issue_type: 'task'
  }
];

/**
 * @param {HTMLElement} mount
 */
function labelDropdown(mount) {
  // 0 = status, 1 = types, 2 = labels
  return /** @type {HTMLElement} */ (
    mount.querySelectorAll('.filter-dropdown')[2]
  );
}

/**
 * @param {HTMLElement} mount
 * @param {string} label
 */
function toggleLabel(mount, label) {
  const dropdown = labelDropdown(mount);
  /** @type {HTMLButtonElement} */ (
    dropdown.querySelector('.filter-dropdown__trigger')
  ).click();
  const option = Array.from(
    dropdown.querySelectorAll('.filter-dropdown__option')
  ).find((opt) => (opt.textContent || '').trim() === label);
  const checkbox = /** @type {HTMLInputElement | null} */ (
    option ? option.querySelector('input[type="checkbox"]') : null
  );
  if (!checkbox) {
    throw new Error(`label option not found: ${label}`);
  }
  checkbox.click();
}

/**
 * @param {HTMLElement} mount
 */
function rowIds(mount) {
  return Array.from(mount.querySelectorAll('tbody tr[data-issue-id]')).map(
    (tr) => tr.getAttribute('data-issue-id')
  );
}

async function setup(store = createStore()) {
  const mount = document.createElement('div');
  document.body.appendChild(mount);
  const view = createListView(
    mount,
    async () => ({}),
    () => {},
    store,
    { selectors: { getIds: () => [] } },
    createIssueStores(ISSUES)
  );
  await view.load();
  return { mount, view, store };
}

describe('list view wave column and filter', () => {
  test('renders a Wave column showing only the wave label as W{n}', async () => {
    const { mount } = await setup();
    const headers = Array.from(mount.querySelectorAll('thead th')).map((th) =>
      (th.textContent || '').trim()
    );
    expect(headers).toContain('Wave');
    expect(headers).not.toContain('Labels');
    const first_row = mount.querySelector('tr[data-issue-id="x-1"]');
    const chips = Array.from(
      first_row?.querySelectorAll('.label-chip') || []
    ).map((c) => (c.textContent || '').trim());
    expect(chips).toEqual(['W1']);
    const no_wave_row = mount.querySelector('tr[data-issue-id="x-3"]');
    expect(no_wave_row?.querySelectorAll('.label-chip').length).toBe(0);
  });

  test('offers only the waves present in the list, in wave order', async () => {
    const { mount } = await setup();
    const options = Array.from(
      labelDropdown(mount).querySelectorAll('.filter-dropdown__option')
    ).map((o) => (o.textContent || '').trim());
    expect(options).toEqual(['W1', 'W2']);
  });

  test('filters rows by a selected wave and persists its label in the store', async () => {
    const { mount, store } = await setup();
    toggleLabel(mount, 'W1');
    expect(rowIds(mount)).toEqual(['x-1']);
    expect(store.getState().filters.labels).toEqual(['wave-1']);
  });

  test('two waves are a union', async () => {
    const { mount } = await setup();
    toggleLabel(mount, 'W1');
    toggleLabel(mount, 'W2');
    expect(rowIds(mount).sort()).toEqual(['x-1', 'x-2']);
  });

  test('clicking a wave chip toggles that wave filter', async () => {
    const { mount } = await setup();
    const chip = /** @type {HTMLButtonElement} */ (
      mount.querySelector('tr[data-issue-id="x-2"] .label-chip--button')
    );
    expect((chip.textContent || '').trim()).toBe('W2');
    chip.click();
    expect(rowIds(mount)).toEqual(['x-2']);
    chip.click();
    expect(rowIds(mount).length).toBe(3);
  });

  test('applies a persisted wave filter on first render', async () => {
    const store = createStore({ filters: { labels: ['wave-2'] } });
    const { mount } = await setup(store);
    expect(rowIds(mount)).toEqual(['x-2']);
    const trigger = labelDropdown(mount).querySelector(
      '.filter-dropdown__trigger'
    );
    expect((trigger?.textContent || '').trim()).toContain('Wave: W2');
  });
});
