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
import { createRandomModal } from '../randomModal.js';

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

describe('randomModal', () => {
  let state, useCases, anilistAdapter;

  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    state = {
      getState: vi.fn(() => ({ watchlist: [] })),
      setState: vi.fn(),
      subscribe: vi.fn(),
    };
    useCases = {
      addAnimeToList: vi.fn(),
      toggleViewer: vi.fn(),
      updateDeTitles: vi.fn(),
    };
    anilistAdapter = {
      searchAnimePage: vi.fn(),
      getAnimeById: vi.fn(),
    };
  });

  afterEach(() => { document.body.innerHTML = ''; });

  it('renders filter UI (not loading) when shown initially', () => {
    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();
    const html = document.getElementById('search-modal-container').innerHTML;
    expect(html).toContain('random-overlay');
    expect(html).toContain('Zufalls-Anime finden');
    expect(html).toContain('random-genre');
    expect(html).toContain('random-score');
    expect(html).toContain('random-format');
    expect(html).toContain('random-go');
    expect(html).not.toContain('loader-spinner');
  });

  it('closes when close button is clicked', () => {
    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();
    document.getElementById('random-close-init').click();
    expect(document.getElementById('search-modal-container').innerHTML).toBe('');
  });

  it('shows loading state and calls searchAnimePage on find click', async () => {
    const mockResults = [
      { anilist_id: 1, title_romaji: 'Test Anime', title_english: 'Test', genres: ['Action'], average_score: 80, format: 'TV', episodes: 12 },
    ];
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: mockResults,
      hasNextPage: false,
      currentPage: 1,
    });
    anilistAdapter.getAnimeById.mockResolvedValue({
      anilist_id: 1, title_romaji: 'Test Anime', title_english: 'Test',
      genres: ['Action'], average_score: 80, format: 'TV', episodes: 12,
      cover_url: null, description: 'A test anime.',
    });

    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();

    // Click find button
    document.getElementById('random-go').click();

    // Should show loading
    let html = document.getElementById('search-modal-container').innerHTML;
    expect(html).toContain('loader-spinner');

    // Wait for async fetch to complete
    await vi.waitFor(() => {
      html = document.getElementById('search-modal-container').innerHTML;
      expect(html).toContain('Test Anime');
    });

    // Should have called searchAnimePage with genre + popularity sort
    expect(anilistAdapter.searchAnimePage).toHaveBeenCalledWith(
      '', expect.any(String), '', expect.any(Number), 'POPULARITY_DESC'
    );
    expect(anilistAdapter.getAnimeById).toHaveBeenCalledWith(1);
  });

  it('uses selected genre in searchAnimePage call', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 42, title_romaji: 'Action Anime' }],
      hasNextPage: false, currentPage: 1,
    });
    anilistAdapter.getAnimeById.mockResolvedValue({
      anilist_id: 42, title_romaji: 'Action Anime', title_english: null,
      genres: ['Action'], average_score: 80, format: 'TV', episodes: 12,
    });

    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();

    // Select a genre
    const genreSelect = document.getElementById('random-genre');
    genreSelect.value = 'Action';

    document.getElementById('random-go').click();

    await vi.waitFor(() => {
      expect(anilistAdapter.searchAnimePage).toHaveBeenCalled();
    });

    // Should call with 'Action' genre
    expect(anilistAdapter.searchAnimePage).toHaveBeenCalledWith(
      '', 'Action', '', expect.any(Number), 'POPULARITY_DESC'
    );
  });

  it('shows error state when no results found', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [],
      hasNextPage: false, currentPage: 1,
    });

    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();

    document.getElementById('random-go').click();

    await vi.waitFor(() => {
      const html = document.getElementById('search-modal-container').innerHTML;
      expect(html).toContain('random-card-error');
      expect(html).toContain('Kein Anime gefunden');
    });
  });

  it('shows error state when searchAnimePage fails', async () => {
    anilistAdapter.searchAnimePage.mockRejectedValue(new Error('API error'));

    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();

    document.getElementById('random-go').click();

    await vi.waitFor(() => {
      const html = document.getElementById('search-modal-container').innerHTML;
      expect(html).toContain('random-card-error');
    });
  });

  it('shows result with correct anime details', async () => {
    const anime = {
      anilist_id: 7, title_romaji: 'Seven Samurai',
      title_english: 'Seven Samurai',
      genres: ['Action', 'Drama'],
      average_score: 90, episodes: 26,
      format: 'MOVIE', cover_url: 'https://example.com/cover.jpg',
      description: 'An epic tale of seven samurai.',
    };

    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 7, title_romaji: 'Seven Samurai' }],
      hasNextPage: false, currentPage: 1,
    });
    anilistAdapter.getAnimeById.mockResolvedValue(anime);

    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();

    document.getElementById('random-go').click();

    await vi.waitFor(() => {
      const html = document.getElementById('search-modal-container').innerHTML;
      expect(html).toContain('Seven Samurai');
      expect(html).toContain('90%');
      expect(html).toContain('MOVIE');
      expect(html).toContain('26');
    });
  });

  it('shows "in list" badge when anime is already in watchlist', async () => {
    state.getState.mockReturnValue({
      watchlist: [{ anilist_id: 5, title_romaji: 'Already Added' }],
    });

    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 5, title_romaji: 'Already Added' }],
      hasNextPage: false, currentPage: 1,
    });
    anilistAdapter.getAnimeById.mockResolvedValue({
      anilist_id: 5, title_romaji: 'Already Added', title_english: null,
      genres: [], average_score: null, episodes: null, format: null,
    });

    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();

    document.getElementById('random-go').click();

    await vi.waitFor(() => {
      const html = document.getElementById('search-modal-container').innerHTML;
      expect(html).toContain('Bereits in der Sammlung');
      expect(html).not.toContain('random-add');
    });
  });

  it('shows add section when anime is not in watchlist', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 99, title_romaji: 'New Anime' }],
      hasNextPage: false, currentPage: 1,
    });
    anilistAdapter.getAnimeById.mockResolvedValue({
      anilist_id: 99, title_romaji: 'New Anime', title_english: null,
      genres: [], average_score: null, episodes: null, format: null,
    });

    const modal = createRandomModal(state, useCases, anilistAdapter);
    modal.show();

    document.getElementById('random-go').click();

    await vi.waitFor(() => {
      const html = document.getElementById('search-modal-container').innerHTML;
      expect(html).toContain('random-add');
      expect(html).toContain('Zur Sammlung hinzufügen');
    });
  });
});
