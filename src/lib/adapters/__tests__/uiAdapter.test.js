// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../config.js', () => ({
  getUsers: () => ['chrischi', 'michelle'],
  getDefaultUser: () => 'chrischi',
  getUserLabel: (user) => ({ chrischi: 'Chrischi', michelle: 'Michelle' }[user] || user),
}));

vi.mock('../detailModal.js', () => ({ createDetailModal: vi.fn(() => ({ show: vi.fn() })) }));
vi.mock('../filterSheet.js', () => ({ createFilterSheet: vi.fn(() => ({ show: vi.fn(), close: vi.fn(), updateDesktopFilterBar: vi.fn() })) }));
vi.mock('../../application/tabTitle.ts', () => ({ updateTabTitle: vi.fn() }));
vi.mock('../../icons.js', () => ({
  icon: () => '<svg>icon</svg>',
  iconSvg: () => '<svg>icon</svg>',
  star: '<svg>star</svg>',
  heart: '<svg>heart</svg>',
  user: '<svg>user</svg>',
  trash_2: '<svg>trash</svg>',
  filter: '<svg>filter</svg>',
  x: '<svg>x</svg>',
  check: '<svg>check</svg>',
  plus: '<svg>plus</svg>',
  pin: '<svg>pin</svg>',
  search: '<svg>search</svg>',
}));

import { createUiAdapter } from '../uiAdapter.js';

function setupDOM() {
  document.body.innerHTML = `
    <div id="anime-grid"></div>
    <div id="stats"></div>
    <div id="filter-summary"></div>
    <div id="filter-genre-tags"></div>
    <div id="filter-desktop-bar"></div>
    <div id="filter-sheet-container"></div>
    <div id="search-modal-container"></div>
    <button id="btn-add-anime"></button>
  `;
}

function createMockState(overrides = {}) {
  return {
    getState: vi.fn(() => ({ watchlist: [], filters: {}, activeTab: 'collection', ...overrides })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  };
}

function createMockUseCases() {
  return {
    getFilteredWatchlist: vi.fn(() => []),
    exportDownload: vi.fn(),
    removeAnimeFromList: vi.fn(),
    setFilters: vi.fn(),
    addAnimeToList: vi.fn(),
    toggleViewer: vi.fn(),
    updateRating: vi.fn(),
  };
}

describe('createUiAdapter', () => {
  let state, useCases, anilistAdapter;

  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    state = createMockState();
    useCases = createMockUseCases();
    anilistAdapter = { searchAnimePage: vi.fn() };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('render()', () => {
    it('shows empty state when watchlist is empty', () => {
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.render();
      expect(document.getElementById('anime-grid').innerHTML).toContain('Noch keine Animes');
    });

    it('shows no-results when filters empty the list', () => {
      state.getState = vi.fn(() => ({ watchlist: [{ anilist_id: 1 }], filters: { query: 'xyz' }, activeTab: 'collection' }));
      useCases.getFilteredWatchlist = vi.fn(() => []);
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.render();
      expect(document.getElementById('anime-grid').innerHTML).toContain('Keine Treffer');
    });

    it('renders cards when watchlist has items', () => {
      const items = [{ anilist_id: 1, title_romaji: 'Test', watched_by: ['chrischi'] }];
      state.getState = vi.fn(() => ({ watchlist: items, filters: {}, activeTab: 'collection' }));
      useCases.getFilteredWatchlist = vi.fn(() => items);
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.render();
      expect(document.getElementById('anime-grid').innerHTML).toContain('anime-card');
      expect(document.getElementById('anime-grid').innerHTML).not.toContain('anime-grid-empty');
    });

    it('updates stats with total count', () => {
      const items = [{ anilist_id: 1, title_romaji: 'A', watched_by: ['chrischi', 'michelle'] }];
      state.getState = vi.fn(() => ({ watchlist: items, filters: {}, activeTab: 'collection' }));
      useCases.getFilteredWatchlist = vi.fn(() => items);
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.render();
      expect(document.getElementById('total-count').textContent).toBe('1');
    });

    it('updates filter summary with active filter count', () => {
      state.getState = vi.fn(() => ({ watchlist: [], filters: { watchedBy: 'chrischi' }, activeTab: 'collection' }));
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.render();
      expect(document.getElementById('filter-summary').innerHTML).toContain('aktiv');
    });

    it('does not render when activeTab is not collection', () => {
      state.getState = vi.fn(() => ({ watchlist: [], filters: {}, activeTab: 'explore' }));
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.render();
      // Grid sollte leer bleiben (kein empty state)
      expect(document.getElementById('anime-grid').innerHTML).not.toContain('Noch keine Animes');
    });
  });

  describe('init()', () => {
    it('calls render on init', () => {
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.init();
      expect(document.getElementById('anime-grid').innerHTML).toContain('Noch keine Animes');
    });

    it('subscribes to state changes on init', () => {
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.init();
      expect(state.subscribe).toHaveBeenCalled();
      expect(state.subscribe.mock.calls[0][0]).toBeInstanceOf(Function);
    });

    it('switches to explore tab on FAB click', () => {
      const ui = createUiAdapter(state, useCases, anilistAdapter);
      ui.init();
      document.getElementById('btn-add-anime').click();
      expect(state.setState).toHaveBeenCalledWith({ activeTab: 'explore' });
    });
  });
});
