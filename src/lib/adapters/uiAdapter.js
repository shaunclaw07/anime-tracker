import { cardTemplate, searchResultTemplate, filterSheetTemplate, filterSummaryTemplate } from './templates.js';
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
    const filterSummary = document.getElementById('filter-summary');
    if (!grid) return;

    const filtered = useCases.getFilteredWatchlist();

    // Clear grid
    grid.innerHTML = '';

    if (watchlist.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'anime-grid-empty';
      emptyEl.innerHTML = `
        <div class="anime-grid-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="32" height="32"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg></div>
        <p class="anime-grid-empty-text">Noch keine Animes in der Sammlung.</p>
        <p class="anime-grid-empty-sub">Tippe auf +, um zu starten.</p>
      `;
      grid.appendChild(emptyEl);
    } else if (filtered.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'anime-grid-empty';
      emptyEl.innerHTML = `
        <div class="anime-grid-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="32" height="32"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg></div>
        <p class="anime-grid-empty-text">Keine Treffer</p>
        <p class="anime-grid-empty-sub">Versuche andere Filter.</p>
      `;
      grid.appendChild(emptyEl);
    } else {
      grid.innerHTML = filtered.map((a) => cardTemplate(a, deTitles)).join('');
    }

    // Update stats
    updateStats(watchlist);

    // Update filter summary
    updateFilterSummary(filters);

    // Populate inline genre tags & update filter sheet on next open
    const allGenres = extractGenres(watchlist);
    populateInlineGenreTags(allGenres, filters);

    // If filter sheet is open, update it
    const filterPanel = document.getElementById('filter-panel');
    if (filterPanel) {
      const container = document.getElementById('filter-sheet-container');
      if (container) {
        container.innerHTML = filterSheetTemplate(filters, allGenres);
        bindFilterSheetEvents();
      }
    }

    // Update desktop inline filter bar
    updateDesktopFilterBar(filters, allGenres);
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
  /*  updateFilterSummary                                                 */
  /* ------------------------------------------------------------------ */
  function updateFilterSummary(filters) {
    const el = document.getElementById('filter-summary');
    if (!el) return;

    let count = 0;
    if (filters.genres && filters.genres.length > 0) count++;
    if (filters.minScore && filters.minScore > 0) count++;
    if (filters.watchedBy) count++;
    if (filters.query) count++;

    el.innerHTML = filterSummaryTemplate(count);
  }

  /* ------------------------------------------------------------------ */
  /*  populateInlineGenreTags                                             */
  /* ------------------------------------------------------------------ */
  function populateInlineGenreTags(allGenres, filters) {
    const tagsContainer = document.getElementById('filter-genre-tags');
    if (!tagsContainer) return;

    const selectedGenres = filters.genres || [];
    tagsContainer.innerHTML = allGenres.map((g) => {
      const active = selectedGenres.includes(g) ? 'active' : '';
      return `<span class="filter-genre-tag ${active}" data-genre="${g}">${g}</span>`;
    }).join('');
  }

  /* ------------------------------------------------------------------ */
  /*  updateDesktopFilterBar                                              */
  /* ------------------------------------------------------------------ */
  function updateDesktopFilterBar(filters, allGenres) {
    const desktopBar = document.getElementById('filter-desktop-bar');
    if (!desktopBar) return;

    const selectedGenres = filters.genres || [];
    const minScore = filters.minScore || 0;
    const watchedBy = filters.watchedBy || '';

    const genreTags = allGenres.map((g) => {
      const active = selectedGenres.includes(g) ? 'active' : '';
      return `<span class="filter-genre-tag ${active}" data-genre="${g}">${g}</span>`;
    }).join('');

    desktopBar.innerHTML = `
      <div class="filter-desktop-inner">
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Genre</span>
          <div class="filter-genre-tags" id="filter-genre-tags-desktop">
            ${genreTags}
          </div>
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Score ≥ ${minScore}</span>
          <input type="range" class="filter-range" id="filter-score-desktop" min="0" max="100" value="${minScore}" step="1" />
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Gesehen von</span>
          <div class="filter-who-toggle">
            <button class="filter-who-btn ${watchedBy === 'both' ? 'active' : ''}" data-who="both">Beide</button>
            <button class="filter-who-btn ${watchedBy === 'chrischi' ? 'active' : ''}" data-who="chrischi">Chrischi</button>
            <button class="filter-who-btn ${watchedBy === 'michelle' ? 'active' : ''}" data-who="michelle">Michelle</button>
          </div>
        </div>
      </div>
    `;

    // Bind desktop filter events
    bindDesktopFilterEvents();
  }

  /* ------------------------------------------------------------------ */
  /*  init                                                                */
  /* ------------------------------------------------------------------ */
  function init() {
    // Initial render
    render();

    // Subscribe to state changes
    state.subscribe(() => { render(); updateTabTitle(); });

    // --- FAB / Add anime button ---
    const addBtn = document.getElementById('btn-add-anime');
    if (addBtn) {
      addBtn.addEventListener('click', showSearchModal);
    }
    const addBtnDesktop = document.getElementById('btn-add-anime-desktop');
    if (addBtnDesktop) {
      addBtnDesktop.addEventListener('click', showSearchModal);
    }

    // --- Export button ---
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => useCases.exportDownload());
    }

    // --- Random button ---
    const randomBtn = document.getElementById('btn-random');
    if (randomBtn) {
      randomBtn.addEventListener('click', showRandomAnime);
    }
    const exportBtnDesktop = document.getElementById('btn-export-desktop');
    if (exportBtnDesktop) {
      exportBtnDesktop.addEventListener('click', () => useCases.exportDownload());
    }

    // --- Filter Summary (opens bottom sheet) ---
    const filterSummary = document.getElementById('filter-summary');
    if (filterSummary) {
      filterSummary.addEventListener('click', (e) => {
        const resetBtn = e.target.closest('#filter-summary-reset');
        if (resetBtn) {
          e.stopPropagation();
          useCases.setFilters({});
          return;
        }
        showFilterSheet();
      });
    }

    // --- Event delegation on grid ---
    const grid = document.getElementById('anime-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) {
          const action = btn.dataset.action;
          const id = Number(btn.dataset.id);
          if (isNaN(id)) return;

          if (action === 'remove') {
            const anime = state.getState().watchlist.find(a => a.anilist_id === id);
            useCases.removeAnimeFromList(id);
            showUndoToast(anime, id);
          } else if (action === 'toggle-chrischi') {
            useCases.toggleViewer(id, 'chrischi');
          } else if (action === 'toggle-michelle') {
            useCases.toggleViewer(id, 'michelle');
          }
          return;
        }

        // Klick auf Karte (nicht auf Button) → Detail-Modal
        const card = e.target.closest('.anime-card');
        if (card) {
          const id = Number(card.dataset.id);
          if (!isNaN(id)) {
            showDetailModal(id);
          }
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  showFilterSheet                                                     */
  /* ------------------------------------------------------------------ */
  function showFilterSheet() {
    const container = document.getElementById('filter-sheet-container');
    if (!container) return;

    const { watchlist, filters } = state.getState();
    const allGenres = extractGenres(watchlist);

    container.innerHTML = filterSheetTemplate(filters, allGenres);
    bindFilterSheetEvents();
  }

  /* ------------------------------------------------------------------ */
  /*  bindFilterSheetEvents                                               */
  /* ------------------------------------------------------------------ */
  function bindFilterSheetEvents() {
    // Close button
    const closeBtn = document.getElementById('filter-panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeFilterSheet);
    }

    // Overlay click to close
    const overlay = document.getElementById('filter-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeFilterSheet);
    }

    // Genre tags toggle
    const tagsContainer = document.getElementById('filter-genre-tags');
    if (tagsContainer) {
      tagsContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-genre-tag');
        if (!tag) return;
        tag.classList.toggle('active');
        // Update visual checkmark
        const check = tag.querySelector('svg');
        if (tag.classList.contains('active')) {
          if (!check) {
            tag.insertAdjacentHTML('afterbegin', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> ');
          }
        } else if (check) {
          check.remove();
        }
      });
    }

    // Score slider
    const scoreSlider = document.getElementById('filter-score');
    const scoreDisplay = document.getElementById('filter-score-display');
    const scoreValue = document.getElementById('filter-score-value');
    if (scoreSlider && scoreDisplay) {
      scoreSlider.addEventListener('input', () => {
        const val = scoreSlider.value;
        scoreDisplay.textContent = val;
        if (scoreValue) scoreValue.textContent = val;
      });
    }

    // Who toggle buttons
    const whoToggle = document.getElementById('filter-who-toggle');
    if (whoToggle) {
      whoToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-who-btn');
        if (!btn) return;
        const isActive = btn.classList.contains('active');
        whoToggle.querySelectorAll('.filter-who-btn').forEach((b) => b.classList.remove('active'));
        if (!isActive) {
          btn.classList.add('active');
        }
      });
    }

    // Apply button
    const applyBtn = document.getElementById('filter-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        // Read genre selections
        const genreTags = document.querySelectorAll('#filter-genre-tags .filter-genre-tag.active');
        const genres = Array.from(genreTags).map((t) => t.dataset.genre);

        // Read score
        const scoreSlider = document.getElementById('filter-score');
        const minScore = scoreSlider ? Number(scoreSlider.value) : 0;

        // Read who
        const activeWho = document.querySelector('#filter-who-toggle .filter-who-btn.active');
        const watchedBy = activeWho ? activeWho.dataset.who : '';

        const newFilters = { ...state.getState().filters };
        if (genres.length > 0) {
          newFilters.genres = genres;
        } else {
          delete newFilters.genres;
        }
        if (minScore > 0) {
          newFilters.minScore = minScore;
        } else {
          delete newFilters.minScore;
        }
        if (watchedBy) {
          newFilters.watchedBy = watchedBy;
        } else {
          delete newFilters.watchedBy;
        }

        useCases.setFilters(newFilters);
        closeFilterSheet();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        useCases.setFilters({});
        closeFilterSheet();
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  bindDesktopFilterEvents                                             */
  /* ------------------------------------------------------------------ */
  function bindDesktopFilterEvents() {
    // Genre tags
    const tagsContainer = document.getElementById('filter-genre-tags-desktop');
    if (tagsContainer) {
      tagsContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-genre-tag');
        if (!tag) return;
        tag.classList.toggle('active');
        applyDesktopFilters();
      });
    }

    // Score slider
    const scoreSlider = document.getElementById('filter-score-desktop');
    if (scoreSlider) {
      scoreSlider.addEventListener('input', () => {
        applyDesktopFilters();
      });
    }

    // Who toggle
    const whoToggle = document.querySelector('#filter-desktop-bar .filter-who-toggle');
    if (whoToggle) {
      whoToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-who-btn');
        if (!btn) return;
        const isActive = btn.classList.contains('active');
        whoToggle.querySelectorAll('.filter-who-btn').forEach((b) => b.classList.remove('active'));
        if (!isActive) {
          btn.classList.add('active');
        }
        applyDesktopFilters();
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  applyDesktopFilters                                                 */
  /* ------------------------------------------------------------------ */
  function applyDesktopFilters() {
    const genreTags = document.querySelectorAll('#filter-genre-tags-desktop .filter-genre-tag.active');
    const genres = Array.from(genreTags).map((t) => t.dataset.genre);

    const scoreSlider = document.getElementById('filter-score-desktop');
    const minScore = scoreSlider ? Number(scoreSlider.value) : 0;

    const activeWho = document.querySelector('#filter-desktop-bar .filter-who-btn.active');
    const watchedBy = activeWho ? activeWho.dataset.who : '';

    const newFilters = { ...state.getState().filters };
    if (genres.length > 0) {
      newFilters.genres = genres;
    } else {
      delete newFilters.genres;
    }
    if (minScore > 0) {
      newFilters.minScore = minScore;
    } else {
      delete newFilters.minScore;
    }
    if (watchedBy) {
      newFilters.watchedBy = watchedBy;
    } else {
      delete newFilters.watchedBy;
    }

    useCases.setFilters(newFilters);
  }

  /* ------------------------------------------------------------------ */
  /*  closeFilterSheet                                                    */
  /* ------------------------------------------------------------------ */
  function closeFilterSheet() {
    const container = document.getElementById('filter-sheet-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  /* ------------------------------------------------------------------ */
  /*  showSearchModal                                                     */
  /* ------------------------------------------------------------------ */
  let savedSearchState = null; // { query, genre, tag, sort }

  function showSearchModal() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    // Reset selection
    searchResults = null;
    selectedAnilistId = null;

    const searchIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>';
    const closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>';

    // Build modal HTML — full-screen on mobile
    container.innerHTML = `
      <div class="search-overlay" id="modal-overlay">
        <div class="search-header">
          <button class="search-close" id="modal-close" aria-label="Schließen">${closeIcon}</button>
          <div class="search-input-wrapper">
            ${searchIcon}
            <input
              type="text"
              id="modal-search-input"
              class="search-input"
              placeholder="Anime suchen…"
              autocomplete="off"
              autofocus
            />
          </div>
        </div>
        <div class="search-genre-wrapper">
          <div class="search-filter-row">
            <select id="modal-search-genre" class="search-genre-select search-filter-half">
              <option value="">🎭 Genre</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Horror">Horror</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Slice of Life">Slice of Life</option>
              <option value="Sports">Sports</option>
              <option value="Thriller">Thriller</option>
              <option value="Ecchi">Ecchi</option>
            </select>
            <select id="modal-search-tag" class="search-genre-select search-filter-half">
              <option value="">🏷️ Tag</option>
              <option value="Isekai">Isekai</option>
              <option value="Mecha">Mecha</option>
              <option value="Harem">Harem</option>
              <option value="Psychological">Psychological</option>
              <option value="Supernatural">Supernatural</option>
              <option value="Shounen">Shounen</option>
              <option value="Seinen">Seinen</option>
              <option value="Shoujo">Shoujo</option>
              <option value="Josei">Josei</option>
              <option value="Music">Music</option>
            </select>
          </div>
          <div class="search-filter-row" style="margin-top:var(--space-2)">
            <select id="modal-search-sort" class="search-genre-select">
              <option value="relevance">📊 Relevanz</option>
              <option value="score_desc">⭐ Bewertung ↓</option>
              <option value="score_asc">⭐ Bewertung ↑</option>
              <option value="title_asc">📝 Titel A–Z</option>
              <option value="title_desc">📝 Titel Z–A</option>
              <option value="popularity">🔥 Beliebteste</option>
            </select>
          </div>
        </div>
        <div class="search-results" id="modal-search-results"></div>
        <div class="search-who" id="modal-who">
          <span class="search-who-label">Gesehen von:</span>
          <label class="search-who-checkbox">
            <input type="checkbox" value="chrischi" checked />
            Chrischi
          </label>
          <label class="search-who-checkbox">
            <input type="checkbox" value="michelle" checked />
            Michelle
          </label>
        </div>
        <div class="search-actions">
          <button class="btn btn-secondary" id="modal-cancel">Abbrechen</button>
          <button class="btn btn-primary" id="modal-add" disabled>Hinzufügen</button>
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
    const genreSelect = document.getElementById('modal-search-genre');
    const tagSelect = document.getElementById('modal-search-tag');
    const sortSelect = document.getElementById('modal-search-sort');

    // --- Close handlers ---
    function closeModal() {
      // Such-Status merken
      const q = searchInput?.value || '';
      const g = genreSelect?.value || '';
      const t = tagSelect?.value || '';
      const s = sortSelect?.value || 'relevance';
      if (q || g || t) {
        savedSearchState = { query: q, genre: g, tag: t, sort: s };
      }
      container.innerHTML = '';
      searchResults = null;
      selectedAnilistId = null;
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // --- Gespeicherte Such-Parameter wiederherstellen ---
    if (savedSearchState) {
      const ss = savedSearchState;
      if (searchInput && ss.query) searchInput.value = ss.query;
      if (genreSelect && ss.genre) genreSelect.value = ss.genre;
      if (tagSelect && ss.tag) tagSelect.value = ss.tag;
      if (sortSelect && ss.sort) sortSelect.value = ss.sort;
      // Automatisch suchen
      setTimeout(() => performSearch(true), 100);
    }

    // --- Such-Funktion (wird bei Input + Genre-Change aufgerufen) ---
    let searchPage = 1;
    let searchHasMore = false;
    let allResults = [];
    let lastQuery = '';
    let lastGenre = '';
    let lastTag = '';
    let lastSort = 'relevance';

    async function performSearch(reset = true) {
      const query = searchInput ? searchInput.value.trim() : '';
      const genreSelect = document.getElementById('modal-search-genre');
      const genre = genreSelect ? genreSelect.value : '';
      const tagSelect = document.getElementById('modal-search-tag');
      const tag = tagSelect ? tagSelect.value : '';
      const sortSelect = document.getElementById('modal-search-sort');
      const sort = sortSelect ? sortSelect.value : 'relevance';

      // Bei neuer Suche (reset=true) Seite zurücksetzen
      if (reset) {
        searchPage = 1;
        allResults = [];
        lastQuery = query;
        lastGenre = genre;
        lastTag = tag;
        lastSort = sort;
      }

      if (!lastQuery && !lastGenre && !lastTag) {
        resultsContainer.innerHTML = '';
        searchResults = null;
        return;
      }

      if (reset) {
        resultsContainer.innerHTML = '<div class="search-loading">Suche…</div>';
      } else {
        // "Mehr laden" — Lade-Indikator am Ende
        const loadMore = resultsContainer.querySelector('.search-load-more');
        if (loadMore) loadMore.innerHTML = '<span class="search-loading" style="padding:12px">Lade…</span>';
      }

      try {
        const result = await anilistAdapter.searchAnimePage(lastQuery, lastGenre || undefined, lastTag || undefined, searchPage, lastSort);
        const newResults = result.results || [];
        allResults = reset ? newResults : [...allResults, ...newResults];
        searchHasMore = result.hasNextPage;
        searchResults = allResults;
        searchPage = result.currentPage + 1;

        // Rendern
        let html = allResults.map(searchResultTemplate).join('');

        // Duplikat-Markierung: Bereits in Sammlung?
        const watchlistIds = new Set(state.getState().watchlist.map(a => a.anilist_id));
        allResults.forEach(r => {
          if (watchlistIds.has(r.anilist_id)) {
            const el = resultsContainer.querySelector(`.search-result[data-id="${r.anilist_id}"]`);
            if (el) {
              el.classList.add('already-added');
              el.querySelector('.search-result-info')?.insertAdjacentHTML('beforeend', '<span class="already-added-badge">✅ Bereits in Sammlung</span>');
            }
          }
        });

        if (searchHasMore) {
          html += '<div class="search-load-more" id="search-load-more"><button class="btn btn-secondary" id="btn-load-more" style="width:100%;justify-content:center">📄 Mehr laden</button></div>';
        }
        resultsContainer.innerHTML = html || '<div class="search-no-results">Keine Ergebnisse gefunden.</div>';

        // "Mehr laden" Button binden
        const loadMoreBtn = document.getElementById('btn-load-more');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', () => performSearch(false));
        }
      } catch (err) {
        resultsContainer.innerHTML = '<div class="search-error">Fehler bei der Suche.</div>';
      }
    }

    // --- Search input with debounce ---
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => performSearch(true), 300);
      });
    }

    // --- Genre/Tag-Dropdown change → sofort suchen ---
    if (genreSelect) {
      genreSelect.addEventListener('change', () => performSearch(true));
    }
    if (tagSelect) {
      tagSelect.addEventListener('change', () => performSearch(true));
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', () => performSearch(true));
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

        // Bereits in Sammlung — nicht auswählbar
        if (resultEl.classList.contains('already-added')) {
          if (addBtn) addBtn.disabled = true;
          return;
        }

        resultEl.classList.add('selected');
        selectedAnilistId = id;

        // Enable add button + show de-title field
        if (addBtn) addBtn.disabled = false;
        const deTitleWrapper = document.getElementById('modal-de-title-wrapper');
        if (deTitleWrapper) deTitleWrapper.style.display = 'block';
        // Pre-fill with english title as suggestion
        const selected = searchResults?.find(r => r.anilist_id === id);
        const deInput = document.getElementById('modal-de-title-input');
        if (deInput && selected) {
          deInput.placeholder = `Optional — ${selected.title_english || selected.title_romaji}`;
        }
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

          // Save German title if entered
          const deInput = document.getElementById('modal-de-title-input');
          const deTitle = deInput ? deInput.value.trim() : '';
          if (deTitle) {
            useCases.updateDeTitles({ [result.anilist_id]: deTitle });
          }

          // If both users checked, toggle second user
          if (checkedUsers.length >= 2) {
            useCases.toggleViewer(result.anilist_id, checkedUsers[1]);
          }
        } catch (err) {
          resultsContainer.innerHTML = `<div class="search-error">Fehler: ${err.message}</div>`;
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

  /* ------------------------------------------------------------------ */
  /*  showUndoToast                                                        */
  /* ------------------------------------------------------------------ */
  function showUndoToast(anime, anilistId) {
    const existing = document.getElementById('undo-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'undo-toast';
    toast.innerHTML = `<span>🗑️ Gelöscht</span><button id="undo-btn" style="color:var(--color-primary);font-weight:700;background:none;border:none;cursor:pointer;padding:4px 8px">Rückgängig</button>`;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--color-card)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)', padding: '12px 20px', zIndex: '300',
      display: 'flex', alignItems: 'center', gap: '16px',
      fontSize: '0.9rem', boxShadow: 'var(--shadow-lg)',
      animation: 'slideUp 0.3s ease',
    });
    document.body.appendChild(toast);

    document.getElementById('undo-btn').addEventListener('click', () => {
      useCases.addAnimeToList(anime, 'chrischi');
      if (anime.watched_by?.includes('michelle')) {
        useCases.toggleViewer(anilistId, 'michelle');
      }
      toast.remove();
    });

    setTimeout(() => toast.remove(), 4000);
  }

  /* ------------------------------------------------------------------ */
  /*  updateTabTitle                                                       */
  /* ------------------------------------------------------------------ */
  function updateTabTitle() {
    const count = state.getState().watchlist.length;
    document.title = count > 0 ? `(${count}) Anime Tracker` : 'Anime Tracker';
  }

  /* ------------------------------------------------------------------ */
  /*  showRandomAnime                                                     */
  /* ------------------------------------------------------------------ */
  function showRandomAnime() {
    const { watchlist } = state.getState();
    if (watchlist.length === 0) {
      // Toast: Keine Animes
      const t = document.createElement('div');
      t.textContent = '📭 Keine Animes in der Sammlung';
      Object.assign(t.style, {
        position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
        background: 'var(--color-card)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)', padding: '12px 20px', zIndex: '300',
        fontSize: '0.9rem', boxShadow: 'var(--shadow-lg)',
      });
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2500);
      return;
    }

    const random = watchlist[Math.floor(Math.random() * watchlist.length)];
    const { deTitles } = state.getState();
    const title = random.title_de || random.title_english || random.title_romaji;

    // Modal anzeigen
    const container = document.getElementById('search-modal-container');
    if (!container) return;
    container.innerHTML = `
      <div class="search-overlay" id="random-overlay" style="justify-content:center;align-items:center">
        <div style="background:var(--color-card);border-radius:var(--radius);padding:24px;max-width:320px;width:90%;text-align:center;border:1px solid var(--color-border)">
          ${random.cover_url ? `<img src="${random.cover_url}" alt="" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:8px;margin-bottom:12px" />` : ''}
          <h3 style="font-size:1.1rem;margin-bottom:4px">${title}</h3>
          <div style="color:var(--color-muted-foreground);font-size:0.85rem;margin-bottom:8px">
            ${random.genres?.slice(0,3).join(' · ') || ''}
          </div>
          <div style="display:flex;justify-content:center;gap:16px;font-size:0.9rem;margin-bottom:16px">
            <span>⭐ ${random.average_score || '–'}%</span>
            <span>📺 ${random.format || '–'}</span>
          </div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
            ${random.watched_by?.includes('chrischi') ? '<span style="background:#a78bfa26;color:var(--color-secondary);padding:2px 10px;border-radius:999px;font-size:0.8rem">🙋 Chrischi</span>' : ''}
            ${random.watched_by?.includes('michelle') ? '<span style="background:#22c55e26;color:var(--color-success);padding:2px 10px;border-radius:999px;font-size:0.8rem">🙋 Michelle</span>' : ''}
          </div>
          <button id="random-close" style="margin-top:16px;width:100%;padding:10px;background:var(--color-primary);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">Schließen</button>
          <button id="random-another" style="margin-top:8px;width:100%;padding:8px;background:none;color:var(--color-muted-foreground);border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:0.85rem">🎲 Noch einen</button>
        </div>
      </div>`;

    document.getElementById('random-close').onclick = () => { container.innerHTML = ''; };
    document.getElementById('random-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) container.innerHTML = '';
    });
    document.getElementById('random-another').onclick = () => {
      container.innerHTML = '';
      setTimeout(showRandomAnime, 50);
    };
  }

  /* ------------------------------------------------------------------ */
  /*  showDetailModal                                                     */
  /* ------------------------------------------------------------------ */
  function showDetailModal(anilistId) {
    const { watchlist } = state.getState();
    const anime = watchlist.find(a => a.anilist_id === anilistId);
    if (!anime) return;

    const title = anime.title_de || anime.title_english || anime.title_romaji;
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="search-overlay" id="detail-overlay" style="overflow-y:auto">
        <div style="background:var(--color-card);border-radius:var(--radius);margin:auto;max-width:480px;width:90%;margin-top:24px;margin-bottom:24px;border:1px solid var(--color-border);overflow:hidden">
          ${anime.cover_url ? `<img src="${anime.cover_url}" alt="" style="width:100%;aspect-ratio:3/4;object-fit:cover;max-height:300px;object-position:top" />` : ''}
          <div style="padding:20px">
            <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">${title}</h2>
            <div style="color:var(--color-muted-foreground);font-size:0.85rem;margin-bottom:12px">${anime.title_romaji}${anime.title_english && anime.title_english !== anime.title_romaji ? ` · ${anime.title_english}` : ''}</div>

            <!-- Genres + Tags -->
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
              ${(anime.genres || []).map(g => `<span class="genre-tag">${g}</span>`).join('')}
            </div>

            <!-- Meta -->
            <div style="display:flex;gap:16px;font-size:0.9rem;margin-bottom:12px;flex-wrap:wrap">
              <span>⭐ ${anime.average_score || '–'}% Community</span>
              <span>📺 ${anime.format || '–'}</span>
              <span>📺 ${anime.episodes || '?'} Ep.</span>
            </div>

            <!-- Gesehen von (editierbar) -->
            <div style="margin-bottom:16px">
              <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:6px;font-weight:600">Gesehen von:</div>
              <div style="display:flex;gap:8px">
                <button class="detail-who-btn ${anime.watched_by?.includes('chrischi') ? 'active' : ''}" data-id="${anime.anilist_id}" data-user="chrischi" style="padding:6px 16px;border-radius:999px;border:1px solid var(--color-border);background:${anime.watched_by?.includes('chrischi') ? 'var(--color-secondary)' : 'var(--color-muted)'};color:${anime.watched_by?.includes('chrischi') ? 'white' : 'var(--color-muted-foreground)'};cursor:pointer;font-size:0.85rem;transition:all 0.2s">🙋 Chrischi</button>
                <button class="detail-who-btn ${anime.watched_by?.includes('michelle') ? 'active' : ''}" data-id="${anime.anilist_id}" data-user="michelle" style="padding:6px 16px;border-radius:999px;border:1px solid var(--color-border);background:${anime.watched_by?.includes('michelle') ? 'var(--color-success)' : 'var(--color-muted)'};color:${anime.watched_by?.includes('michelle') ? 'white' : 'var(--color-muted-foreground)'};cursor:pointer;font-size:0.85rem;transition:all 0.2s">🙋 Michelle</button>
              </div>
            </div>

            <!-- Rating (editierbar) -->
            <div style="margin-bottom:16px">
              <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:6px;font-weight:600">Bewertung:</div>
              <div style="display:flex;gap:16px;flex-wrap:wrap">
                <div style="flex:1;min-width:140px">
                  <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:2px">Chrischi: <span id="detail-rating-chrischi">${anime.ratings?.find(r => r.user === 'chrischi')?.score || '–'}</span>/10</div>
                  <input type="range" min="0" max="10" value="${anime.ratings?.find(r => r.user === 'chrischi')?.score || 0}" class="detail-rating-slider" data-user="chrischi" data-id="${anime.anilist_id}" style="width:100%" />
                </div>
                <div style="flex:1;min-width:140px">
                  <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:2px">Michelle: <span id="detail-rating-michelle">${anime.ratings?.find(r => r.user === 'michelle')?.score || '–'}</span>/10</div>
                  <input type="range" min="0" max="10" value="${anime.ratings?.find(r => r.user === 'michelle')?.score || 0}" class="detail-rating-slider" data-user="michelle" data-id="${anime.anilist_id}" style="width:100%" />
                </div>
              </div>
            </div>

            <!-- Synopsis -->
            ${anime.description ? `<div style="margin-bottom:12px">
              <div style="font-size:0.8rem;color:var(--color-muted-foreground);margin-bottom:4px;font-weight:600">Synopsis</div>
              <div style="font-size:0.85rem;color:var(--color-muted-foreground);line-height:1.5;max-height:150px;overflow-y:auto">${anime.description}</div>
            </div>` : ''}

            <button id="detail-close" style="width:100%;padding:10px;background:var(--color-primary);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;margin-top:8px">Schließen</button>
          </div>
        </div>
      </div>`;

    // Close handler
    document.getElementById('detail-close').onclick = () => { container.innerHTML = ''; };
    document.getElementById('detail-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) container.innerHTML = '';
    });

    // Toggle "Gesehen von"
    document.querySelectorAll('.detail-who-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const user = btn.dataset.user;
        useCases.toggleViewer(id, user);
        // UI sofort updaten ohne Modal zu schließen
        const isActive = btn.classList.toggle('active');
        btn.style.background = isActive
          ? (user === 'chrischi' ? 'var(--color-secondary)' : 'var(--color-success)')
          : 'var(--color-muted)';
        btn.style.color = isActive ? 'white' : 'var(--color-muted-foreground)';
      });
    });

    // Rating Slider
    document.querySelectorAll('.detail-rating-slider').forEach(slider => {
      slider.addEventListener('input', () => {
        const id = Number(slider.dataset.id);
        const user = slider.dataset.user;
        const score = Number(slider.value);
        const display = document.getElementById(`detail-rating-${user}`);
        if (display) display.textContent = score > 0 ? String(score) : '–';
        if (score > 0) {
          useCases.updateRating(id, user, score);
        }
      });
    });
  }

  return { init, render, updateTabTitle };
}
