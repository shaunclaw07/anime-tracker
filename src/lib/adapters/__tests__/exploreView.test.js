// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../config.js', () => ({
  getUsers: () => ['chrischi', 'michelle'],
  getDefaultUser: () => 'chrischi',
  getUserLabel: (user) =>
    ({ chrischi: 'Chrischi', michelle: 'Michelle' }[user] || user),
}));

vi.mock('../../icons.js', () => ({
  icon: () => '<svg>icon</svg>',
  iconSvg: () => '<svg>icon</svg>',
  search: '<svg>search</svg>',
  shuffle: '<svg>shuffle</svg>',
  plus: '<svg>plus</svg>',
  star: '<svg>star</svg>',
  x: '<svg>x</svg>',
}));

vi.mock('../templates.js', () => ({
  searchResultTemplate: vi.fn(
    (r) =>
      `<div class="search-result" data-id="${r.anilist_id}">
        <div class="search-result-info">
          <span class="search-result-title">${r.title_romaji}</span>
        </div>
      </div>`,
  ),
  searchLoadingTemplate: vi.fn(
    () => '<div class="search-loading">Suche…</div>',
  ),
  searchLoadMoreTemplate: vi.fn(
    () => '<div class="search-load-more"><button id="btn-load-more">Mehr laden</button></div>',
  ),
  searchNoResultsTemplate: vi.fn(
    () => '<div class="search-no-results">Keine Ergebnisse</div>',
  ),
  searchErrorTemplate: vi.fn(
    () => '<div class="search-error">Fehler</div>',
  ),
  alreadyAddedBadgeTemplate: vi.fn(
    () => '<span class="already-added-badge">Bereits in Sammlung</span>',
  ),
}));

import { createExploreView } from '../exploreView.js';

function setupDOM() {
  document.body.innerHTML = `
    <div id="view-explore" class="view"></div>
  `;
}

describe('exploreView', () => {
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
    };
    anilistAdapter = {
      searchAnimePage: vi.fn(),
      getAnimeById: vi.fn(),
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /* ── show() tests ─────────────────────────────────────────────── */

  it('renders explore view HTML in #view-explore when shown', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const container = document.getElementById('view-explore');
    expect(container.innerHTML).toContain('explore-view');
    expect(container.innerHTML).toContain('explore-search-input');
    expect(container.innerHTML).toContain('explore-genre');
    expect(container.innerHTML).toContain('explore-tag');
    expect(container.innerHTML).toContain('explore-sort');
    expect(container.innerHTML).toContain('explore-random-btn');
    expect(container.innerHTML).toContain('explore-results');
    expect(container.innerHTML).toContain('explore-add-section');
    expect(container.innerHTML).toContain('explore-add-btn');
  });

  it('renders search input field', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Anime suchen…');
  });

  it('renders genre, tag and sort selects', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    expect(document.getElementById('explore-genre')).toBeTruthy();
    expect(document.getElementById('explore-tag')).toBeTruthy();
    expect(document.getElementById('explore-sort')).toBeTruthy();
  });

  it('renders random anime button', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const btn = document.getElementById('explore-random-btn');
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain('Zufalls-Anime');
  });

  it('renders add button in disabled state', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const addBtn = document.getElementById('explore-add-btn');
    expect(addBtn).toBeTruthy();
    expect(addBtn.disabled).toBe(true);
  });

  it('renders who-checkboxes for both users', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const checkboxes = document.querySelectorAll(
      '#explore-who-row input[type="checkbox"]',
    );
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0].value).toBe('chrischi');
    expect(checkboxes[1].value).toBe('michelle');
  });

  it('restores saved search state on second show()', () => {
    // Seed saved search state by calling hide() after entering text
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    input.value = 'Naruto';
    const genre = document.getElementById('explore-genre');
    genre.value = 'Action';

    view.hide(); // saves state

    // Show again – should restore
    view.show();
    const restoredInput = document.getElementById('explore-search-input');
    const restoredGenre = document.getElementById('explore-genre');
    expect(restoredInput.value).toBe('Naruto');
    expect(restoredGenre.value).toBe('Action');
  });

  /* ── hide() tests ─────────────────────────────────────────────── */

  it('clears #view-explore content when hidden', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();
    view.hide();

    const container = document.getElementById('view-explore');
    expect(container.innerHTML).toBe('');
  });

  it('clears debounce timer on hide', () => {
    const clearSpy = vi.spyOn(global, 'clearTimeout');
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    input.value = 'Test';
    input.dispatchEvent(new Event('input')); // starts debounce timer

    view.hide();

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  /* ── Search input tests ───────────────────────────────────────── */

  it('triggers search via input event after debounce', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 1, title_romaji: 'Naruto' }],
      hasNextPage: false,
      currentPage: 1,
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    input.value = 'Naruto';
    input.dispatchEvent(new Event('input'));

    await new Promise((r) => setTimeout(r, 350));

    expect(anilistAdapter.searchAnimePage).toHaveBeenCalled();
  });

  it('shows search loading indicator while searching', async () => {
    anilistAdapter.searchAnimePage.mockImplementation(
      () => new Promise(() => {}),
    );

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    input.value = 'Naruto';
    input.dispatchEvent(new Event('input'));

    await new Promise((r) => setTimeout(r, 350));

    const results = document.getElementById('explore-results');
    expect(results.innerHTML).toContain('Suche');
  });

  it('shows search results after successful search', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 1, title_romaji: 'Naruto' }],
      hasNextPage: false,
      currentPage: 1,
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    input.value = 'Naruto';
    input.dispatchEvent(new Event('input'));

    await new Promise((r) => setTimeout(r, 350));
    // Wait for async render
    await vi.waitFor(() => {
      const results = document.getElementById('explore-results');
      expect(results.innerHTML).toContain('Naruto');
    });
  });

  it('shows no results message when search returns empty', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [],
      hasNextPage: false,
      currentPage: 1,
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    input.value = 'NonexistentAnime';
    input.dispatchEvent(new Event('input'));

    await new Promise((r) => setTimeout(r, 350));
    await vi.waitFor(() => {
      const results = document.getElementById('explore-results');
      expect(results.innerHTML).toContain('Keine Ergebnisse');
    });
  });

  it('shows error message when search fails', async () => {
    anilistAdapter.searchAnimePage.mockRejectedValue(
      new Error('API error'),
    );

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    input.value = 'Error';
    input.dispatchEvent(new Event('input'));

    await new Promise((r) => setTimeout(r, 350));
    await vi.waitFor(() => {
      const results = document.getElementById('explore-results');
      expect(results.innerHTML).toContain('Fehler');
    });
  });

  it('performs search when genre select changes', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 2, title_romaji: 'Action Anime' }],
      hasNextPage: false,
      currentPage: 1,
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const genreSelect = document.getElementById('explore-genre');
    genreSelect.value = 'Action';
    genreSelect.dispatchEvent(new Event('change'));

    await new Promise((r) => setTimeout(r, 100));

    expect(anilistAdapter.searchAnimePage).toHaveBeenCalled();
  });

  it('performs search when sort select changes', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [],
      hasNextPage: false,
      currentPage: 1,
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    // First set a query so search has something to search for
    const input = document.getElementById('explore-search-input');
    input.value = 'Test';

    const sortSelect = document.getElementById('explore-sort');
    sortSelect.value = 'score_desc';
    sortSelect.dispatchEvent(new Event('change'));

    await new Promise((r) => setTimeout(r, 100));

    expect(anilistAdapter.searchAnimePage).toHaveBeenCalled();
  });

  /* ── Random button tests ──────────────────────────────────────── */

  it('shows random filter UI when random button is clicked', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const randomBtn = document.getElementById('explore-random-btn');
    randomBtn.click();

    const area = document.getElementById('explore-random-area');
    expect(area.innerHTML).toContain('Zufalls-Anime finden');
    expect(area.innerHTML).toContain('explore-random-genre');
    expect(area.innerHTML).toContain('explore-random-score');
    expect(area.innerHTML).toContain('explore-random-format');
    expect(area.innerHTML).toContain('explore-random-go');
  });

  it('closes random filter UI when close button is clicked', () => {
    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    document.getElementById('explore-random-btn').click();
    document.getElementById('explore-random-close').click();

    const area = document.getElementById('explore-random-area');
    expect(area.innerHTML).toBe('');
  });

  it('calls searchAnimePage when random go is clicked', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 1, title_romaji: 'Test' }],
      hasNextPage: false,
      currentPage: 1,
    });
    anilistAdapter.getAnimeById.mockResolvedValue({
      anilist_id: 1,
      title_romaji: 'Test Anime',
      title_english: 'Test',
      genres: ['Action'],
      average_score: 80,
      format: 'TV',
      episodes: 12,
      cover_url: null,
      description: 'A test anime.',
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    document.getElementById('explore-random-btn').click();
    document.getElementById('explore-random-go').click();

    await vi.waitFor(() => {
      expect(anilistAdapter.searchAnimePage).toHaveBeenCalledWith(
        '',
        undefined,
        '',
        expect.any(Number),
        'POPULARITY_DESC',
      );
    });
  });

  it('shows random result with anime details', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 7, title_romaji: 'Seven Samurai' }],
      hasNextPage: false,
      currentPage: 1,
    });
    anilistAdapter.getAnimeById.mockResolvedValue({
      anilist_id: 7,
      title_romaji: 'Seven Samurai',
      title_english: 'Seven Samurai',
      genres: ['Action', 'Drama'],
      average_score: 90,
      episodes: 26,
      format: 'MOVIE',
      cover_url: 'https://example.com/cover.jpg',
      description: 'An epic tale of seven samurai.',
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    document.getElementById('explore-random-btn').click();
    document.getElementById('explore-random-go').click();

    await vi.waitFor(() => {
      const area = document.getElementById('explore-random-area');
      expect(area.innerHTML).toContain('Seven Samurai');
    });
  });

  /* ── Add functionality tests ──────────────────────────────────── */

  it('enables add button when a search result is selected', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 42, title_romaji: 'Cowboy Bebop' }],
      hasNextPage: false,
      currentPage: 1,
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    // Trigger search
    const input = document.getElementById('explore-search-input');
    input.value = 'Cowboy';
    input.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 350));

    // Wait for results to render
    await vi.waitFor(() => {
      const result = document.querySelector('.search-result');
      expect(result).toBeTruthy();
    });

    // Click result
    const resultEl = document.querySelector('.search-result');
    resultEl.click();

    const addBtn = document.getElementById('explore-add-btn');
    expect(addBtn.disabled).toBe(false);
    expect(
      document.getElementById('explore-add-section').style.display,
    ).not.toBe('none');
  });

  it('calls addAnimeToList when add button is clicked', async () => {
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [
        {
          anilist_id: 42,
          title_romaji: 'Cowboy Bebop',
          title_english: 'Cowboy Bebop',
          genres: ['Action', 'Sci-Fi'],
          average_score: 86,
          episodes: 26,
          format: 'TV',
          cover_url: null,
        },
      ],
      hasNextPage: false,
      currentPage: 1,
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    // Trigger search
    const input = document.getElementById('explore-search-input');
    input.value = 'Cowboy';
    input.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 350));

    // Wait for result
    await vi.waitFor(() => {
      expect(document.querySelector('.search-result')).toBeTruthy();
    });

    // Select result
    document.querySelector('.search-result').click();
    document.getElementById('explore-add-btn').click();

    expect(useCases.addAnimeToList).toHaveBeenCalledWith(
      expect.objectContaining({ anilist_id: 42 }),
      'chrischi',
    );
  });

  it('marks already-added results with a badge', async () => {
    state.getState.mockReturnValue({
      watchlist: [{ anilist_id: 1, title_romaji: 'Naruto' }],
    });
    anilistAdapter.searchAnimePage.mockResolvedValue({
      results: [{ anilist_id: 1, title_romaji: 'Naruto' }],
      hasNextPage: false,
      currentPage: 1,
    });

    const view = createExploreView(state, useCases, anilistAdapter);
    view.show();

    const input = document.getElementById('explore-search-input');
    input.value = 'Naruto';
    input.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 350));

    await vi.waitFor(() => {
      const result = document.querySelector('.search-result');
      expect(result.classList.contains('already-added')).toBe(true);
    });
  });
});
