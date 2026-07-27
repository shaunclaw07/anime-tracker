import { cardTemplate, searchResultTemplate } from './templates.js';
import { extractGenres } from '../domain/filters.js';
import { createAnime } from '../domain/anime.js';

/**
 * createUiAdapter — Creates the DOM adapter connecting state, useCases, and AniList.
 *
 * @param {{ getState: () => object, setState: (partial: object) => void, subscribe: (fn) => () => void }} state
 * @param {object} useCases
 * @param {{ searchAnime: (query: string) => Promise<Array<object>> }} anilistAdapter
 * @returns {{ init: () => void, render: () => void }}
 */
export function createUiAdapter(state, useCases, anilistAdapter) {
  /** @type {number|null} */
  let searchDebounceTimer = null;
  /** @type {Array<object>|null} */
  let searchResults = null;
  /** @type {number|null} */
  let selectedAnilistId = null;

  /* ------------------------------------------------------------------ */
  /*  render                                                              */
  /* ------------------------------------------------------------------ */
  function render() {
    const { watchlist, deTitles, filters } = state.getState();
    const grid = document.getElementById('anime-grid');
    const gridMessage = document.getElementById('grid-message');
    if (!grid) return;

    const filtered = useCases.getFilteredWatchlist();

    // Clear grid
    grid.innerHTML = '';

    if (watchlist.length === 0) {
      // No anime added at all
      const emptyEl = document.createElement('div');
      emptyEl.className = 'anime-grid-empty';
      emptyEl.innerHTML = `
        <div class="anime-grid-empty-icon">🎬</div>
        <p class="anime-grid-empty-text">Noch keine Animes in der Sammlung.</p>
        <p class="anime-grid-empty-sub">Klicke auf "Anime hinzufügen", um zu starten.</p>
      `;
      grid.appendChild(emptyEl);
      if (gridMessage) gridMessage.innerHTML = '';
    } else if (filtered.length === 0) {
      // No results matching filters
      const emptyEl = document.createElement('div');
      emptyEl.className = 'anime-grid-empty';
      emptyEl.innerHTML = `
        <div class="anime-grid-empty-icon">🔍</div>
        <p class="anime-grid-empty-text">Keine Treffer</p>
        <p class="anime-grid-empty-sub">Versuche andere Filter oder suche mit einem anderen Begriff.</p>
      `;
      grid.appendChild(emptyEl);
      if (gridMessage) gridMessage.innerHTML = '';
    } else {
      grid.innerHTML = filtered.map((a) => cardTemplate(a, deTitles)).join('');
    }

    // Update stats
    updateStats(watchlist);

    // Populate genre dropdown
    populateGenreDropdown(watchlist, filters);
  }

  /* ------------------------------------------------------------------ */
  /*  updateStats                                                         */
  /* ------------------------------------------------------------------ */
  function updateStats(watchlist) {
    const totalEl = document.getElementById('total-count');
    const bothEl = document.getElementById('both-count');
    const chrischiEl = document.getElementById('chrischi-count');
    const michelleEl = document.getElementById('michelle-count');

    if (totalEl) totalEl.textContent = String(watchlist.length);

    const both = watchlist.filter(
      (a) => a.watched_by && a.watched_by.includes('chrischi') && a.watched_by.includes('michelle'),
    ).length;
    const chrischi = watchlist.filter(
      (a) => a.watched_by && a.watched_by.includes('chrischi'),
    ).length;
    const michelle = watchlist.filter(
      (a) => a.watched_by && a.watched_by.includes('michelle'),
    ).length;

    if (bothEl) bothEl.textContent = String(both);
    if (chrischiEl) chrischiEl.textContent = String(chrischi);
    if (michelleEl) michelleEl.textContent = String(michelle);
  }

  /* ------------------------------------------------------------------ */
  /*  populateGenreDropdown                                               */
  /* ------------------------------------------------------------------ */
  function populateGenreDropdown(watchlist, filters) {
    const genreSelect = document.getElementById('filter-genre');
    if (!genreSelect) return;

    const genres = extractGenres(watchlist);
    const currentValue = genreSelect.value;

    // Keep the "Alle Genres" option
    genreSelect.innerHTML = '<option value="">Alle Genres</option>';
    genres.forEach((g) => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      if (g === currentValue || g === (filters.genres || [])[0]) {
        opt.selected = true;
      }
      genreSelect.appendChild(opt);
    });
  }

  /* ------------------------------------------------------------------ */
  /*  init                                                                */
  /* ------------------------------------------------------------------ */
  function init() {
    // Initial render
    render();

    // Subscribe to state changes
    state.subscribe(() => render());

    // --- Filter: text search (input event) ---
    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        useCases.setFilters({
          ...state.getState().filters,
          query: searchInput.value || '',
        });
      });
    }

    // --- Filter: watched by ---
    const watchedSelect = document.getElementById('filter-watched');
    if (watchedSelect) {
      watchedSelect.addEventListener('change', () => {
        const val = watchedSelect.value;
        const filters = { ...state.getState().filters };
        if (val === 'all' && filters.watchedBy) {
          delete filters.watchedBy;
        } else if (val !== 'all') {
          filters.watchedBy = val;
        }
        useCases.setFilters(filters);
      });
    }

    // --- Filter: score range ---
    const scoreSlider = document.getElementById('filter-score');
    const scoreValue = document.getElementById('filter-score-value');
    if (scoreSlider && scoreValue) {
      scoreSlider.addEventListener('input', () => {
        const val = Number(scoreSlider.value);
        scoreValue.textContent = String(val);
        const filters = { ...state.getState().filters };
        if (val === 0) {
          delete filters.minScore;
        } else {
          filters.minScore = val;
        }
        useCases.setFilters(filters);
      });
    }

    // --- Filter: genre ---
    const genreSelect = document.getElementById('filter-genre');
    if (genreSelect) {
      genreSelect.addEventListener('change', () => {
        const val = genreSelect.value;
        const filters = { ...state.getState().filters };
        if (!val) {
          delete filters.genres;
        } else {
          filters.genres = [val];
        }
        useCases.setFilters(filters);
      });
    }

    // --- Add anime button ---
    const addBtn = document.getElementById('btn-add-anime');
    if (addBtn) {
      addBtn.addEventListener('click', showSearchModal);
    }

    // --- Export button ---
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => useCases.exportDownload());
    }

    // --- Event delegation on grid: toggle viewer / remove ---
    const grid = document.getElementById('anime-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);
        if (isNaN(id)) return;

        if (action === 'remove') {
          useCases.removeAnimeFromList(id);
        } else if (action === 'toggle-chrischi') {
          useCases.toggleViewer(id, 'chrischi');
        } else if (action === 'toggle-michelle') {
          useCases.toggleViewer(id, 'michelle');
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  showSearchModal                                                     */
  /* ------------------------------------------------------------------ */
  function showSearchModal() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    // Reset selection
    searchResults = null;
    selectedAnilistId = null;

    // Build modal HTML
    container.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-content" id="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">🔍 Anime suchen</h2>
            <button class="modal-close" id="modal-close" aria-label="Schließen">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-search-group">
              <input
                type="text"
                id="modal-search-input"
                class="modal-search-input"
                placeholder="Anime-Titel eingeben…"
                autocomplete="off"
                autofocus
              />
            </div>
            <div id="modal-search-results" class="modal-search-results"></div>
            <div class="modal-who" id="modal-who">
              <span class="modal-who-label">Gesehen von:</span>
              <label class="modal-who-checkbox">
                <input type="checkbox" value="chrischi" checked />
                Chrischi
              </label>
              <label class="modal-who-checkbox">
                <input type="checkbox" value="michelle" checked />
                Michelle
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-cancel">Abbrechen</button>
            <button class="btn btn-primary" id="modal-add" disabled>Hinzufügen</button>
          </div>
        </div>
      </div>
    `;

    const overlay = document.getElementById('modal-overlay');
    const searchInput = /** @type {HTMLInputElement} */ (document.getElementById('modal-search-input'));
    const resultsContainer = document.getElementById('modal-search-results');
    const addBtn = document.getElementById('modal-add');
    const cancelBtn = document.getElementById('modal-cancel');
    const closeBtn = document.getElementById('modal-close');
    const whoCheckboxes = document.querySelectorAll('#modal-who input[type="checkbox"]');

    // --- Close handlers ---
    function closeModal() {
      container.innerHTML = '';
      searchResults = null;
      selectedAnilistId = null;
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // --- Search with debounce ---
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        const query = searchInput.value.trim();
        if (!query) {
          resultsContainer.innerHTML = '';
          searchResults = null;
          return;
        }

        searchDebounceTimer = setTimeout(async () => {
          resultsContainer.innerHTML = '<div class="search-loading">Suche…</div>';
          try {
            const results = await anilistAdapter.searchAnime(query);
            searchResults = results;
            if (results.length === 0) {
              resultsContainer.innerHTML = '<div class="search-no-results">Keine Ergebnisse gefunden.</div>';
            } else {
              resultsContainer.innerHTML = results.map(searchResultTemplate).join('');
            }
          } catch (err) {
            resultsContainer.innerHTML = '<div class="search-error">Fehler bei der Suche.</div>';
          }
        }, 300);
      });
    }

    // --- Result selection ---
    if (resultsContainer) {
      resultsContainer.addEventListener('click', (e) => {
        const resultEl = e.target.closest('.search-result');
        if (!resultEl) return;

        const id = Number(resultEl.dataset.id);
        if (isNaN(id)) return;

        // Deselect all
        resultsContainer.querySelectorAll('.search-result').forEach((el) => el.classList.remove('selected'));
        resultEl.classList.add('selected');
        selectedAnilistId = id;

        // Enable add button
        if (addBtn) addBtn.disabled = false;
      });
    }

    // --- Add button ---
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (selectedAnilistId === null || !searchResults) return;

        const result = searchResults.find((r) => r.anilist_id === selectedAnilistId);
        if (!result) return;

        // Determine who watched
        const checkedUsers = [];
        whoCheckboxes.forEach((cb) => {
          if (cb.checked) checkedUsers.push(cb.value);
        });
        const watchedBy = checkedUsers.length > 0 ? checkedUsers[0] : 'chrischi';

        // Create anime entity and add
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

          // If both users checked, toggle second user
          if (checkedUsers.length >= 2) {
            useCases.toggleViewer(result.anilist_id, checkedUsers[1]);
          }
        } catch (err) {
          // Likely duplicate
          resultsContainer.innerHTML = `<div class="search-error">❌ ${err.message}</div>`;
          return;
        }

        closeModal();
      });
    }

    // Focus search input after modal renders
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 50);
    }
  }

  return { init, render };
}
