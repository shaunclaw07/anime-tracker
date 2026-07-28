/**
 * exploreView — Full-screen browse-and-add anime view.
 *
 * Replaces the searchModal/randomModal overlay-style modals with a
 * dedicated full-screen view rendered inside #view-explore.
 *
 * @param {object} state - Global state (getState, setState, subscribe)
 * @param {object} useCases - Application use cases
 * @param {object} anilistAdapter - AniList API adapter
 * @returns {{ show: () => void, hide: () => void }}
 */

import {
  searchResultTemplate,
  searchLoadingTemplate,
  searchLoadMoreTemplate,
  searchNoResultsTemplate,
  searchErrorTemplate,
  alreadyAddedBadgeTemplate,
} from './templates.js';
import { getUsers, getDefaultUser, getUserLabel } from '../config.js';
import { search, shuffle, plus, star, x } from '../icons.js';
import { iconSvg } from '../icons.js';

/* ── Hardcoded lists matching templates.js ──────────────────────── */

const SEARCH_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Thriller', 'Ecchi',
];

const SEARCH_TAGS = [
  'Isekai', 'Mecha', 'Harem', 'Psychological', 'Supernatural',
  'Shounen', 'Seinen', 'Shoujo', 'Josei', 'Music',
];

const SEARCH_SORTS = [
  { value: 'relevance', label: 'Relevanz' },
  { value: 'score_desc', label: 'Bewertung ↓' },
  { value: 'score_asc', label: 'Bewertung ↑' },
  { value: 'title_asc', label: 'Titel A–Z' },
  { value: 'title_desc', label: 'Titel Z–A' },
  { value: 'popularity', label: 'Beliebteste' },
];

const RANDOM_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Thriller', 'Ecchi',
];

const FORMAT_OPTIONS = [
  { value: '', label: 'Alle' },
  { value: 'TV', label: 'TV' },
  { value: 'MOVIE', label: 'Film' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'SPECIAL', label: 'Special' },
];

/* ── createExploreView ──────────────────────────────────────────── */

export function createExploreView(state, useCases, anilistAdapter) {
  /* ── Internal search state ─────────────────────────────────── */

  let searchTimer = null;
  let searchResults = null;       // Array or null
  let selectedAnilistId = null;
  let searchPage = 1;
  let searchHasMore = false;
  let allResults = [];
  let lastQuery = '';
  let lastGenre = '';
  let lastTag = '';
  let lastSort = 'relevance';

  /** Saved "Gesehen von" checkboxes for the selected result */
  let savedWhoState = null;

  /* ── saved search state (persists across hide/show) ────────── */
  let savedSearchState = null;

  /* ── Random state ──────────────────────────────────────────── */
  let randomSavedFilters = null;

  /* ── Helpers ───────────────────────────────────────────────── */

  function resetSearch() {
    searchResults = null;
    selectedAnilistId = null;
    searchPage = 1;
    searchHasMore = false;
    allResults = [];
    lastQuery = '';
    lastGenre = '';
    lastTag = '';
    lastSort = 'relevance';
    savedWhoState = null;
  }

  /* ── show() ────────────────────────────────────────────────── */

  function show() {
    const container = document.getElementById('view-explore');
    if (!container) return;

    resetSearch();

    const whoCheckboxesHtml = getUsers()
      .map(
        (u) =>
          `<label class="search-who-checkbox">
            <input type="checkbox" value="${u}" checked />
            ${getUserLabel(u)}
          </label>`,
      )
      .join('');

    const genreOptions = SEARCH_GENRES.map(
      (g) => `<option value="${g}">${g}</option>`,
    ).join('');
    const tagOptions = SEARCH_TAGS.map(
      (t) => `<option value="${t}">${t}</option>`,
    ).join('');
    const sortOptions = SEARCH_SORTS.map(
      (s) => `<option value="${s.value}">${s.label}</option>`,
    ).join('');

    const searchIconHtml = iconSvg(search, 18);
    const searchTitleIconHtml = iconSvg(search, 20);
    const shuffleIconHtml = iconSvg(shuffle, 20);

    container.innerHTML = `
      <div class="explore-view">
        <!-- Header -->
        <div class="explore-view-header">
          <h2 class="explore-view-title">${searchTitleIconHtml} Entdecken</h2>
        </div>

        <!-- Search header -->
        <div class="explore-header">
          <div class="explore-input-wrapper">
            ${searchIconHtml}
            <input
              type="text"
              id="explore-search-input"
              class="search-input"
              placeholder="Anime suchen…"
              autocomplete="off"
              autofocus
            />
          </div>
        </div>

        <!-- Filter row -->
        <div class="explore-filters">
          <div class="explore-filter-row">
            <select id="explore-genre" class="search-genre-select explore-filter-half">
              <option value="">Genre</option>
              ${genreOptions}
            </select>
            <select id="explore-tag" class="search-genre-select explore-filter-half">
              <option value="">Tag</option>
              ${tagOptions}
            </select>
          </div>
          <div class="explore-filter-row" style="margin-top:var(--space-2)">
            <select id="explore-sort" class="search-genre-select">
              ${sortOptions}
            </select>
          </div>
        </div>

        <!-- Random anime section -->
        <div class="explore-random-section">
          <button id="explore-random-btn" class="btn btn-secondary explore-random-btn">
            ${shuffleIconHtml} 🎲 Zufalls-Anime
          </button>
          <div id="explore-random-area"></div>
        </div>

        <!-- Divider -->
        <div class="explore-divider">
          <span class="explore-divider-text">ODER</span>
        </div>

        <!-- Search results -->
        <div class="explore-results" id="explore-results"></div>

        <!-- Add section (visible when a result is selected) -->
        <div class="explore-add-section" id="explore-add-section" style="display:none">
          <div class="explore-add-who">
            <span class="explore-add-label">Gesehen von:</span>
            <div class="explore-who-row" id="explore-who-row">
              ${whoCheckboxesHtml}
            </div>
          </div>
          <button class="btn btn-primary explore-add-btn" id="explore-add-btn" disabled>
            ${iconSvg(plus, 16)} Hinzufügen
          </button>
        </div>
      </div>
    `;

    bindSearchEvents(container);
    bindRandomEvents();

    // Restore saved search state
    if (savedSearchState) {
      const input = document.getElementById('explore-search-input');
      const genreEl = document.getElementById('explore-genre');
      const tagEl = document.getElementById('explore-tag');
      const sortEl = document.getElementById('explore-sort');
      if (input && savedSearchState.query) input.value = savedSearchState.query;
      if (genreEl && savedSearchState.genre) genreEl.value = savedSearchState.genre;
      if (tagEl && savedSearchState.tag) tagEl.value = savedSearchState.tag;
      if (sortEl && savedSearchState.sort) sortEl.value = savedSearchState.sort;
      setTimeout(() => performSearch(true), 100);
    }

    // Focus input
    setTimeout(() => {
      const input = document.getElementById('explore-search-input');
      if (input) input.focus();
    }, 50);
  }

  /* ── hide() ────────────────────────────────────────────────── */

  function hide() {
    // Clear debounce timer
    if (searchTimer) {
      clearTimeout(searchTimer);
      searchTimer = null;
    }

    // Save search state
    const input = document.getElementById('explore-search-input');
    const genreEl = document.getElementById('explore-genre');
    const tagEl = document.getElementById('explore-tag');
    const sortEl = document.getElementById('explore-sort');
    const q = input?.value || '';
    const g = genreEl?.value || '';
    const t = tagEl?.value || '';
    const s = sortEl?.value || 'relevance';
    if (q || g || t) {
      savedSearchState = { query: q, genre: g, tag: t, sort: s };
    }

    // Clear container (removes all event listeners)
    const container = document.getElementById('view-explore');
    if (container) {
      container.innerHTML = '';
    }
  }

  /* ── Event binding: search ─────────────────────────────────── */

  function bindSearchEvents(container) {
    const searchInput = document.getElementById('explore-search-input');
    const genreSelect = document.getElementById('explore-genre');
    const tagSelect = document.getElementById('explore-tag');
    const sortSelect = document.getElementById('explore-sort');
    const resultsContainer = document.getElementById('explore-results');
    const addSection = document.getElementById('explore-add-section');
    const addBtn = document.getElementById('explore-add-btn');

    // Search input debounce
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => performSearch(true), 300);
      });
    }

    // Genre/Tag/Sort → immediate search
    if (genreSelect) genreSelect.addEventListener('change', () => performSearch(true));
    if (tagSelect) tagSelect.addEventListener('change', () => performSearch(true));
    if (sortSelect) sortSelect.addEventListener('change', () => performSearch(true));

    // Result selection (event delegation)
    if (resultsContainer) {
      resultsContainer.addEventListener('click', (e) => {
        const resultEl = e.target.closest('.search-result');
        if (!resultEl) return;

        const id = Number(resultEl.dataset.id);
        if (isNaN(id)) return;

        resultsContainer.querySelectorAll('.search-result').forEach((el) =>
          el.classList.remove('selected'),
        );

        if (resultEl.classList.contains('already-added')) {
          if (addBtn) addBtn.disabled = true;
          if (addSection) addSection.style.display = 'none';
          return;
        }

        resultEl.classList.add('selected');
        selectedAnilistId = id;

        // Show add section
        if (addSection) addSection.style.display = '';
        if (addBtn) addBtn.disabled = false;
      });

      // Load more delegation
      resultsContainer.addEventListener('click', (e) => {
        const loadMoreBtn = e.target.closest('#btn-load-more');
        if (loadMoreBtn) {
          performSearch(false);
        }
      });
    }

    // Add button
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (selectedAnilistId === null || !searchResults) return;

        const result = searchResults.find(
          (r) => r.anilist_id === selectedAnilistId,
        );
        if (!result) return;

        const checkedUsers = [];
        document
          .querySelectorAll('#explore-who-row input[type="checkbox"]:checked')
          .forEach((cb) => checkedUsers.push(cb.value));
        if (checkedUsers.length === 0) return;

        const watchedBy = checkedUsers[0];
        const animeData = {
          anilist_id: result.anilist_id,
          title_romaji: result.title_romaji,
          title_english: result.title_english,
          genres: result.genres,
          average_score: result.average_score,
          episodes: result.episodes,
          format: result.format,
          cover_url: result.cover_url,
        };

        try {
          useCases.addAnimeToList(animeData, watchedBy);
          if (checkedUsers.length >= 2) {
            useCases.toggleViewer(result.anilist_id, checkedUsers[1]);
          }

          // Deselect – mark as already-added in the results
          selectedAnilistId = null;
          if (addBtn) addBtn.disabled = true;
          if (addSection) addSection.style.display = 'none';

          // Re-run duplicate marking
          markDuplicates();
        } catch (err) {
          if (resultsContainer) {
            resultsContainer.insertAdjacentHTML(
              'beforeend',
              `<div class="search-error">Fehler: ${err.message}</div>`,
            );
          }
        }
      });
    }
  }

  /* ── bindRandomEvents ──────────────────────────────────────── */

  function bindRandomEvents() {
    const randomBtn = document.getElementById('explore-random-btn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        showRandomFiltersOrResult();
      });
    }
  }

  /* ── showRandomFiltersOrResult ─────────────────────────────── */

  function showRandomFiltersOrResult() {
    const area = document.getElementById('explore-random-area');
    if (!area) return;

    randomSavedFilters = null;

    const genreOptions = RANDOM_GENRES.map(
      (g) => `<option value="${g}">${g}</option>`,
    ).join('');
    const formatOptions = FORMAT_OPTIONS.map(
      (f) => `<option value="${f.value}">${f.label}</option>`,
    ).join('');

    area.innerHTML = `
      <div class="explore-random-card">
        <div class="explore-random-body">
          <h4 class="explore-random-heading">Zufalls-Anime finden</h4>
          <div class="explore-random-filter-row">
            <label class="explore-random-label">Genre</label>
            <select id="explore-random-genre" class="search-genre-select">
              <option value="">Alle</option>
              ${genreOptions}
            </select>
          </div>
          <div class="explore-random-filter-row">
            <label class="explore-random-label">Min. Bewertung: <span id="explore-random-score-val">0</span></label>
            <input type="range" id="explore-random-score" class="random-score-slider" min="0" max="100" value="0" />
          </div>
          <div class="explore-random-filter-row">
            <label class="explore-random-label">Format</label>
            <select id="explore-random-format" class="search-genre-select">
              ${formatOptions}
            </select>
          </div>
          <div class="explore-random-actions">
            <button id="explore-random-go" class="btn btn-primary explore-random-action-btn">
              ${iconSvg(shuffle, 16)} Zufälligen Anime finden
            </button>
            <button id="explore-random-close" class="btn btn-secondary explore-random-action-btn">Schließen</button>
          </div>
        </div>
      </div>
    `;

    // Score slider live
    const scoreSlider = document.getElementById('explore-random-score');
    const scoreVal = document.getElementById('explore-random-score-val');
    if (scoreSlider && scoreVal) {
      scoreSlider.addEventListener('input', () => {
        scoreVal.textContent = scoreSlider.value;
      });
    }

    // Close
    const closeBtn = document.getElementById('explore-random-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        area.innerHTML = '';
      });
    }

    // Go
    const goBtn = document.getElementById('explore-random-go');
    if (goBtn) {
      goBtn.addEventListener('click', () => {
        const genre = /** @type {HTMLSelectElement} */ (
          document.getElementById('explore-random-genre')
        )?.value;
        const minScore = Number(
          /** @type {HTMLInputElement} */ (
            document.getElementById('explore-random-score')
          )?.value,
        );
        const format = /** @type {HTMLSelectElement} */ (
          document.getElementById('explore-random-format')
        )?.value;
        randomSavedFilters = { genre: genre || '', minScore, format: format || '' };
        showRandomLoading();
        fetchRandomAnime();
      });
    }
  }

  /* ── showRandomLoading ─────────────────────────────────────── */

  function showRandomLoading() {
    const area = document.getElementById('explore-random-area');
    if (!area) return;
    area.innerHTML = `
      <div class="explore-random-card">
        <div class="explore-random-body" style="text-align:center">
          <div class="loader-spinner" style="margin:0 auto 16px"></div>
          <p style="color:var(--color-muted-foreground)">Suche zufälligen Anime…</p>
        </div>
      </div>
    `;
  }

  /* ── fetchRandomAnime ──────────────────────────────────────── */

  async function fetchRandomAnime() {
    const area = document.getElementById('explore-random-area');
    if (!area) return;

    const filters = randomSavedFilters || { genre: '', minScore: 0, format: '' };
    const genre = filters.genre || undefined;

    try {
      // Bis zu 5 Versuche, einen passenden Anime zu finden
      for (let attempt = 0; attempt < 5; attempt++) {
        const page = Math.floor(Math.random() * 5) + 1;
        const result = await anilistAdapter.searchAnimePage(
          '',
          genre,
          '',
          page,
          'POPULARITY_DESC',
        );

        if (!result || !result.results || result.results.length === 0) {
          continue;
        }

        let candidates = result.results;
        if (filters.minScore > 0) {
          candidates = candidates.filter(
            (a) => a.average_score != null && a.average_score >= filters.minScore,
          );
        }
        if (filters.format) {
          candidates = candidates.filter((a) => a.format === filters.format);
        }

        if (candidates.length === 0) {
          continue; // Kein Treffer → nächster Versuch mit neuer Seite
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        const anime = await anilistAdapter.getAnimeById(chosen.anilist_id);
        if (anime) {
          showRandomResult(anime);
          return;
        }
      }

      // Nach 5 Versuchen kein passender Anime gefunden
      showRandomError();
    } catch {
      showRandomError();
    }
  }

  /* ── showRandomError ───────────────────────────────────────── */

  function showRandomError() {
    const area = document.getElementById('explore-random-area');
    if (!area) return;
    area.innerHTML = `
      <div class="explore-random-card">
        <div class="explore-random-body" style="text-align:center">
          <p style="color:var(--color-muted-foreground);margin-bottom:12px">
            Kein Anime gefunden. Nochmal versuchen?
          </p>
          <button id="explore-random-retry" class="btn btn-primary explore-random-action-btn">
            ${iconSvg(shuffle, 16)} Erneut versuchen
          </button>
          <button id="explore-random-close-fail" class="btn btn-secondary explore-random-action-btn" style="margin-top:8px">Schließen</button>
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('explore-random-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        showRandomLoading();
        fetchRandomAnime();
      });
    }
    const closeBtn = document.getElementById('explore-random-close-fail');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        area.innerHTML = '';
      });
    }
  }

  /* ── showRandomResult ──────────────────────────────────────── */

  function showRandomResult(anime) {
    const area = document.getElementById('explore-random-area');
    if (!area) return;

    const title = anime.title_english || anime.title_romaji;
    const isInList = state
      .getState()
      .watchlist.some((a) => a.anilist_id === anime.anilist_id);

    area.innerHTML = `
      <div class="explore-random-card">
        ${
          anime.cover_url
            ? `<img class="random-cover" src="${anime.cover_url}" alt="" />`
            : ''
        }
        <div class="explore-random-body">
          <h4 class="explore-random-result-title">${title}</h4>
          <div class="explore-random-result-subtitle">${anime.title_romaji}</div>
          <div class="explore-random-genres">
            ${(anime.genres || [])
              .slice(0, 4)
              .map((g) => `<span class="genre-tag">${g}</span>`)
              .join('')}
          </div>
          <div class="random-meta">
            <span>${iconSvg(star, 14)} ${anime.average_score || '–'}%</span>
            <span>📺 ${anime.format || '–'}</span>
            <span>📺 ${anime.episodes || '?'} Ep.</span>
          </div>
          ${
            anime.description
              ? `<div class="random-synopsis">${anime.description.slice(0, 300)}${
                  anime.description.length > 300 ? '…' : ''
                }</div>`
              : ''
          }
          ${
            isInList
              ? `<div class="explore-random-in-list">✅ Bereits in der Sammlung</div>`
              : `<div class="explore-random-add-section">
                  <div class="explore-add-label">Gesehen von:</div>
                  <div class="explore-who-row">
                    ${getUsers()
                      .map(
                        (u) =>
                          `<label class="search-who-checkbox">
                            <input type="checkbox" class="explore-random-who-cb" value="${u}" checked />
                            ${getUserLabel(u)}
                          </label>`,
                      )
                      .join('')}
                  </div>
                </div>
                <button id="explore-random-add" class="btn btn-primary explore-random-action-btn" style="margin-top:12px">
                  ${iconSvg(plus, 16)} Zur Sammlung hinzufügen
                </button>`
          }
          <div class="explore-random-result-actions" style="margin-top:8px">
            <button id="explore-random-close-result" class="btn btn-secondary explore-random-action-btn">Schließen</button>
            <button id="explore-random-another" class="btn btn-secondary explore-random-action-btn" style="margin-top:4px">
              ${iconSvg(shuffle, 16)} Nächster Zufalls-Anime
            </button>
          </div>
        </div>
      </div>
    `;

    // Close result
    const closeResult = document.getElementById('explore-random-close-result');
    if (closeResult) {
      closeResult.addEventListener('click', () => {
        area.innerHTML = '';
      });
    }

    // Another random
    const anotherBtn = document.getElementById('explore-random-another');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', () => {
        showRandomLoading();
        fetchRandomAnime();
      });
    }

    // Add (if not already in list)
    if (!isInList) {
      const addBtn = document.getElementById('explore-random-add');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const checkedUsers = [];
          document
            .querySelectorAll('.explore-random-who-cb:checked')
            .forEach((cb) => checkedUsers.push(cb.value));
          if (checkedUsers.length === 0) {
            return;
          }

          const animeData = {
            anilist_id: anime.anilist_id,
            title_romaji: anime.title_romaji,
            title_english: anime.title_english,
            genres: anime.genres,
            average_score: anime.average_score,
            episodes: anime.episodes,
            format: anime.format,
            cover_url: anime.cover_url,
          };

          try {
            useCases.addAnimeToList(animeData, checkedUsers[0]);
            if (checkedUsers.length >= 2) {
              useCases.toggleViewer(anime.anilist_id, checkedUsers[1]);
            }
            area.innerHTML = '';
          } catch (err) {
            area.insertAdjacentHTML(
              'beforeend',
              `<div class="search-error" style="margin-top:8px">Fehler: ${err.message}</div>`,
            );
          }
        });
      }
    }
  }

  /* ── performSearch ─────────────────────────────────────────── */

  async function performSearch(reset = true) {
    const searchInput = document.getElementById('explore-search-input');
    const resultsContainer = document.getElementById('explore-results');
    const addSection = document.getElementById('explore-add-section');
    const addBtn = document.getElementById('explore-add-btn');

    const query = searchInput ? searchInput.value.trim() : '';
    const genre =
      /** @type {HTMLSelectElement} */ (
        document.getElementById('explore-genre')
      )?.value || '';
    const tag =
      /** @type {HTMLSelectElement} */ (
        document.getElementById('explore-tag')
      )?.value || '';
    const sort =
      /** @type {HTMLSelectElement} */ (
        document.getElementById('explore-sort')
      )?.value || 'relevance';

    if (reset) {
      searchPage = 1;
      allResults = [];
      lastQuery = query;
      lastGenre = genre;
      lastTag = tag;
      lastSort = sort;
      selectedAnilistId = null;
      if (addSection) addSection.style.display = 'none';
      if (addBtn) addBtn.disabled = true;
    }

    if (!lastQuery && !lastGenre && !lastTag) {
      if (resultsContainer) resultsContainer.innerHTML = '';
      searchResults = null;
      return;
    }

    if (reset && resultsContainer) {
      resultsContainer.innerHTML = searchLoadingTemplate();
    } else if (resultsContainer) {
      const loadMore = resultsContainer.querySelector('.search-load-more');
      if (loadMore) {
        loadMore.innerHTML =
          '<span class="search-loading" style="padding:12px">Lade…</span>';
      }
    }

    try {
      const result = await anilistAdapter.searchAnimePage(
        lastQuery,
        lastGenre || undefined,
        lastTag || undefined,
        searchPage,
        lastSort,
      );
      const newResults = result.results || [];
      allResults = reset ? newResults : [...allResults, ...newResults];
      searchHasMore = result.hasNextPage;
      searchResults = allResults;
      searchPage = result.currentPage + 1;

      let html = allResults.map(searchResultTemplate).join('');

      // Add load more button if more pages
      if (searchHasMore) {
        html += searchLoadMoreTemplate();
      }

      if (resultsContainer) {
        resultsContainer.innerHTML = html || searchNoResultsTemplate();
      }

      // Mark duplicates
      markDuplicates();
    } catch (err) {
      if (resultsContainer) {
        resultsContainer.innerHTML = searchErrorTemplate();
      }
    }
  }

  /* ── markDuplicates ────────────────────────────────────────── */

  function markDuplicates() {
    const resultsContainer = document.getElementById('explore-results');
    if (!resultsContainer) return;

    const watchlistIds = new Set(
      state.getState().watchlist.map((a) => a.anilist_id),
    );

    allResults.forEach((r) => {
      if (watchlistIds.has(r.anilist_id)) {
        const el = resultsContainer.querySelector(
          `.search-result[data-id="${r.anilist_id}"]`,
        );
        if (el) {
          el.classList.add('already-added');
          const infoEl = el.querySelector('.search-result-info');
          if (infoEl && !infoEl.querySelector('.already-added-badge')) {
            infoEl.insertAdjacentHTML('beforeend', alreadyAddedBadgeTemplate());
          }
        }
      }
    });
  }

  /* ── Public API ────────────────────────────────────────────── */

  return { show, hide };
}
