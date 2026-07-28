// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../config.js', () => ({
  getUsers: () => ['chrischi', 'michelle'],
  getDefaultUser: () => 'chrischi',
  getUserLabel: (user) => ({ chrischi: 'Chrischi', michelle: 'Michelle' }[user] || user),
}));

vi.mock('../templates.js', () => ({
  filterSheetTemplate: vi.fn(() =>
    `<div class="filter-overlay" id="filter-overlay"></div>
    <div class="filter-panel" id="filter-panel">
      <button class="filter-panel-close" id="filter-panel-close">X</button>
      <div class="filter-genre-tags" id="filter-genre-tags">
        <span class="filter-genre-tag" data-genre="Action">Action</span>
        <span class="filter-genre-tag active" data-genre="Comedy">Comedy</span>
      </div>
      <input type="range" id="filter-score" value="50" />
      <div id="filter-who-toggle">
        <button class="filter-who-btn" data-who="both">Beide</button>
        <button class="filter-who-btn active" data-who="chrischi">Chrischi</button>
      </div>
      <input type="checkbox" id="filter-unwatched" />
      <select id="filter-season"><option value="">Alle</option><option value="WINTER">Winter</option></select>
      <input id="filter-year" value="2024" />
      <input id="filter-studio" value="Madhouse" />
      <button id="filter-apply">Anwenden</button>
      <button id="filter-reset">Zurücksetzen</button>
      <select id="sort-select"><option value="date_added-desc">Neueste</option><option value="title-asc">Titel A→Z</option></select>
    </div>`
  ),
  sortSelectTemplate: vi.fn(() => '<select id="sort-select"><option value="date_added-desc">Neueste</option><option value="title-asc">Titel A→Z</option></select>'),
}));

import { createFilterSheet } from '../filterSheet.js';
import { createDesktopFilterBar } from '../desktopFilterBar.js';
import { createFilterEngine } from '../filterEngine.js';

function setupDOM() {
  document.body.innerHTML = `
    <div id="filter-sheet-container"></div>
    <div id="filter-desktop-bar"></div>
  `;
}

describe('filterSheet (Mobile Bottom Sheet)', () => {
  let state, useCases, filterSheet;

  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    state = {
      getState: vi.fn(() => ({ watchlist: [], filters: {} })),
      setState: vi.fn(),
      subscribe: vi.fn(),
    };
    useCases = { setFilters: vi.fn(), setSorting: vi.fn() };
    filterSheet = createFilterSheet(state, useCases);
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('renders the filter panel when shown', () => {
    filterSheet.show();
    const container = document.getElementById('filter-sheet-container');
    expect(container.innerHTML).toContain('filter-panel');
  });

  it('clears container on close', () => {
    filterSheet.show();
    filterSheet.close();
    expect(document.getElementById('filter-sheet-container').innerHTML).toBe('');
  });

  it('binds apply button to call setFilters', () => {
    filterSheet.show();
    document.getElementById('filter-apply').click();
    expect(useCases.setFilters).toHaveBeenCalled();
  });

  it('binds reset button to clear filters', () => {
    filterSheet.show();
    document.getElementById('filter-reset').click();
    expect(useCases.setFilters).toHaveBeenCalledWith({});
  });

  it('binds close button to close the sheet', () => {
    filterSheet.show();
    document.getElementById('filter-panel-close').click();
    expect(document.getElementById('filter-sheet-container').innerHTML).toBe('');
  });

  it('binds overlay click to close', () => {
    filterSheet.show();
    document.getElementById('filter-overlay').click();
    expect(document.getElementById('filter-sheet-container').innerHTML).toBe('');
  });

  it('binds sort select change to setSorting', () => {
    filterSheet.show();
    const sortSelect = document.getElementById('sort-select');
    sortSelect.value = 'title-asc';
    sortSelect.dispatchEvent(new Event('change'));
    expect(useCases.setSorting).toHaveBeenCalledWith('title', 'asc');
  });
});

describe('desktopFilterBar', () => {
  let state, useCases, filterEngine, desktopBar;

  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    state = {
      getState: vi.fn(() => ({
        watchlist: [],
        filters: {},
        viewMode: 'grid',
        sortBy: 'date_added',
        sortOrder: 'desc',
      })),
      setState: vi.fn(),
    };
    useCases = { setFilters: vi.fn(), setSorting: vi.fn() };
    filterEngine = createFilterEngine(useCases);
    desktopBar = createDesktopFilterBar(state, useCases, filterEngine);
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('renders desktop bar HTML on update', () => {
    desktopBar.update({}, []);
    const bar = document.getElementById('filter-desktop-bar');
    expect(bar.innerHTML).toContain('filter-desktop-inner');
  });

  it('does nothing when desktop bar element is missing', () => {
    document.getElementById('filter-desktop-bar').remove();
    expect(() => desktopBar.update({}, [])).not.toThrow();
  });

  it('renders genre tags from allGenres', () => {
    desktopBar.update({}, ['Action', 'Comedy']);
    const bar = document.getElementById('filter-desktop-bar');
    expect(bar.innerHTML).toContain('Action');
    expect(bar.innerHTML).toContain('Comedy');
  });

  it('marks active genres', () => {
    desktopBar.update({ genres: ['Action'] }, ['Action', 'Comedy']);
    expect(document.getElementById('filter-desktop-bar').innerHTML).toContain('active');
  });

  it('renders view toggle with current viewMode', () => {
    desktopBar.update({}, []);
    expect(document.getElementById('filter-desktop-bar').innerHTML).toContain('view-toggle');
  });

  it('includes sort select template', () => {
    desktopBar.update({}, []);
    expect(document.getElementById('filter-desktop-bar').innerHTML).toContain('sort-select');
  });
});
