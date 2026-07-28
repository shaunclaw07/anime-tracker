// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../config.js', () => ({
  getUsers: () => ['chrischi', 'michelle'],
  getDefaultUser: () => 'chrischi',
  getUserLabel: (user) => ({ chrischi: 'Chrischi', michelle: 'Michelle' }[user] || user),
}));

vi.mock('../../application/tabTitle.js', () => ({ updateTabTitle: vi.fn() }));
vi.mock('../templates.js', () => ({
  cardTemplate: vi.fn(() => '<div class="anime-card">mock</div>'),
  searchResultTemplate: vi.fn(() => '<div class="search-result">mock</div>'),
  filterSheetTemplate: vi.fn(() => '<div class="filter-panel">mock</div>'),
  filterSummaryTemplate: vi.fn((n) => `<span>${n} aktiv</span>`),
}));

import { createSearchModal } from '../searchModal.js';
import { createDetailModal } from '../detailModal.js';
import { createSettingsModal } from '../settingsModal.js';

function setupDOM() {
  document.body.innerHTML = `
    <div id="search-modal-container"></div>
    <div id="anime-grid"></div>
    <div id="stats"></div>
  `;
}

describe('searchModal', () => {
  let state, useCases, anilistAdapter, uiState;

  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    state = {
      getState: vi.fn(() => ({ watchlist: [], filters: {} })),
      setState: vi.fn(),
      subscribe: vi.fn(),
    };
    useCases = {
      addAnimeToList: vi.fn(),
      toggleViewer: vi.fn(),
      updateDeTitles: vi.fn(),
    };
    anilistAdapter = { searchAnimePage: vi.fn() };
    uiState = {
      searchDebounceTimer: null,
      searchResults: null,
      selectedAnilistId: null,
      savedSearchState: null,
      searchPage: 1,
      searchHasMore: false,
      allResults: [],
      lastQuery: '', lastGenre: '', lastTag: '', lastSort: 'relevance',
      resetSearch: vi.fn(),
      initPagination: vi.fn(),
    };
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('renders the search overlay when shown', () => {
    const modal = createSearchModal(state, useCases, anilistAdapter, uiState);
    modal.show();
    const container = document.getElementById('search-modal-container');
    expect(container.innerHTML).toContain('search-overlay');
    expect(container.innerHTML).toContain('search-input');
    expect(container.innerHTML).toContain('modal-cancel');
    expect(container.innerHTML).toContain('modal-add');
  });

  it('closes modal when cancel is clicked', () => {
    const modal = createSearchModal(state, useCases, anilistAdapter, uiState);
    modal.show();
    document.getElementById('modal-cancel').click();
    expect(document.getElementById('search-modal-container').innerHTML).toBe('');
  });

  it('disables add button by default', () => {
    const modal = createSearchModal(state, useCases, anilistAdapter, uiState);
    modal.show();
    const addBtn = document.getElementById('modal-add');
    expect(addBtn.disabled).toBe(true);
  });

  it('renders who-checkboxes for both users', () => {
    const modal = createSearchModal(state, useCases, anilistAdapter, uiState);
    modal.show();
    const checkboxes = document.querySelectorAll('#modal-who input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
  });
});

describe('detailModal', () => {
  let state, useCases;

  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    useCases = { toggleViewer: vi.fn(), updateRating: vi.fn() };
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('renders nothing when anime is not in watchlist', () => {
    state = { getState: vi.fn(() => ({ watchlist: [] })) };
    const modal = createDetailModal(state, useCases);
    modal.show(999);
    expect(document.getElementById('search-modal-container').innerHTML).toBe('');
  });

  it('renders detail content for existing anime', () => {
    const anime = {
      anilist_id: 1, title_romaji: 'Cowboy Bebop',
      title_english: 'Cowboy Bebop', genres: ['Action'],
      average_score: 86, episodes: 26,
      watched_by: ['chrischi'], ratings: [],
    };
    state = { getState: vi.fn(() => ({ watchlist: [anime] })) };
    const modal = createDetailModal(state, useCases);
    modal.show(1);
    const html = document.getElementById('search-modal-container').innerHTML;
    expect(html).toContain('detail-modal');
    expect(html).toContain('Cowboy Bebop');
    expect(html).toContain('detail-close-btn');
  });

  it('closes when close button is clicked', () => {
    const anime = {
      anilist_id: 1, title_romaji: 'Test',
      watched_by: ['chrischi'], ratings: [],
    };
    state = { getState: vi.fn(() => ({ watchlist: [anime] })) };
    const modal = createDetailModal(state, useCases);
    modal.show(1);
    document.getElementById('detail-close').click();
    expect(document.getElementById('search-modal-container').innerHTML).toBe('');
  });
});

describe('settingsModal', () => {
  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('renders settings with user labels', () => {
    const modal = createSettingsModal();
    modal.show();
    const html = document.getElementById('search-modal-container').innerHTML;
    expect(html).toContain('settings-card');
    expect(html).toContain('settings-title');
    expect(html).toContain('settings-save');
  });

  it('closes on cancel', () => {
    const modal = createSettingsModal();
    modal.show();
    document.getElementById('settings-cancel').click();
    expect(document.getElementById('search-modal-container').innerHTML).toBe('');
  });
});
