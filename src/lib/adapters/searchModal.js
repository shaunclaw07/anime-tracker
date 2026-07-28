import { searchResultTemplate } from './templates.js';
import { getUsers, getUserLabels, getDefaultUser, getUserLabel } from '../config.js';

/**
 * createSearchModal — Search modal for finding anime via AniList.
 *
 * @param {object} state - Global state (getState, setState)
 * @param {object} useCases - Application use cases
 * @param {object} anilistAdapter - AniList API adapter
 * @param {object} uiState - Search UI state
 * @returns {{ show: () => void }}
 */
export function createSearchModal(state, useCases, anilistAdapter, uiState) {
  const searchIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>';
  const closeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>';

  function show() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    // Reset selection
    uiState.searchResults = null;
    uiState.selectedAnilistId = null;

    // Build modal HTML — full-screen on mobile
    const whoCheckboxesHtml = getUsers().map(user =>
      `<label class="search-who-checkbox">
        <input type="checkbox" value="${user}" checked />
        ${getUserLabel(user)}
      </label>`
    ).join('');

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
          ${whoCheckboxesHtml}
        </div>
        <div class="search-actions">
          <button class="btn btn-secondary" id="modal-cancel">Abbrechen</button>
          <button class="btn btn-primary" id="modal-add" disabled>Hinzufügen</button>
        </div>
      </div>`;

    const overlay = /** @type {HTMLElement} */ (document.getElementById('modal-overlay'));
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
      const q = searchInput?.value || '';
      const g = genreSelect?.value || '';
      const t = tagSelect?.value || '';
      const s = sortSelect?.value || 'relevance';
      if (q || g || t) {
        uiState.savedSearchState = { query: q, genre: g, tag: t, sort: s };
      }
      container.innerHTML = '';
      uiState.searchResults = null;
      uiState.selectedAnilistId = null;
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // --- Gespeicherte Such-Parameter wiederherstellen ---
    if (uiState.savedSearchState) {
      const ss = uiState.savedSearchState;
      if (searchInput && ss.query) searchInput.value = ss.query;
      if (genreSelect && ss.genre) genreSelect.value = ss.genre;
      if (tagSelect && ss.tag) tagSelect.value = ss.tag;
      if (sortSelect && ss.sort) sortSelect.value = ss.sort;
      setTimeout(() => performSearch(true), 100);
    }

    // --- Such-Funktion ---
    async function performSearch(reset = true) {
      const query = searchInput ? searchInput.value.trim() : '';
      const genre = /** @type {HTMLSelectElement} */ (document.getElementById('modal-search-genre'))?.value || '';
      const tag = /** @type {HTMLSelectElement} */ (document.getElementById('modal-search-tag'))?.value || '';
      const sort = /** @type {HTMLSelectElement} */ (document.getElementById('modal-search-sort'))?.value || 'relevance';

      if (reset) {
        uiState.searchPage = 1;
        uiState.allResults = [];
        uiState.lastQuery = query;
        uiState.lastGenre = genre;
        uiState.lastTag = tag;
        uiState.lastSort = sort;
      }

      if (!uiState.lastQuery && !uiState.lastGenre && !uiState.lastTag) {
        if (resultsContainer) resultsContainer.innerHTML = '';
        uiState.searchResults = null;
        return;
      }

      if (reset && resultsContainer) {
        resultsContainer.innerHTML = '<div class="search-loading">Suche…</div>';
      } else if (resultsContainer) {
        const loadMore = resultsContainer.querySelector('.search-load-more');
        if (loadMore) loadMore.innerHTML = '<span class="search-loading" style="padding:12px">Lade…</span>';
      }

      try {
        const result = await anilistAdapter.searchAnimePage(
          uiState.lastQuery, uiState.lastGenre || undefined,
          uiState.lastTag || undefined, uiState.searchPage, uiState.lastSort
        );
        const newResults = result.results || [];
        uiState.allResults = reset ? newResults : [...uiState.allResults, ...newResults];
        uiState.searchHasMore = result.hasNextPage;
        uiState.searchResults = uiState.allResults;
        uiState.searchPage = result.currentPage + 1;

        let html = uiState.allResults.map(searchResultTemplate).join('');

        // Duplikat-Markierung
        const watchlistIds = new Set(state.getState().watchlist.map(a => a.anilist_id));
        uiState.allResults.forEach(r => {
          if (watchlistIds.has(r.anilist_id) && resultsContainer) {
            const el = resultsContainer.querySelector(`.search-result[data-id="${r.anilist_id}"]`);
            if (el) {
              el.classList.add('already-added');
              el.querySelector('.search-result-info')?.insertAdjacentHTML(
                'beforeend', '<span class="already-added-badge">✅ Bereits in Sammlung</span>'
              );
            }
          }
        });

        if (uiState.searchHasMore) {
          html += '<div class="search-load-more" id="search-load-more"><button class="btn btn-secondary" id="btn-load-more" style="width:100%;justify-content:center">📄 Mehr laden</button></div>';
        }
        if (resultsContainer) {
          resultsContainer.innerHTML = html || '<div class="search-no-results">Keine Ergebnisse gefunden.</div>';
        }

        const loadMoreBtn = document.getElementById('btn-load-more');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', () => performSearch(false));
        }
      } catch (err) {
        if (resultsContainer) {
          resultsContainer.innerHTML = '<div class="search-error">Fehler bei der Suche.</div>';
        }
      }
    }

    // --- Search input with debounce ---
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(uiState.searchDebounceTimer);
        uiState.searchDebounceTimer = setTimeout(() => performSearch(true), 300);
      });
    }

    // --- Genre/Tag/Sort change → sofort suchen ---
    if (genreSelect) genreSelect.addEventListener('change', () => performSearch(true));
    if (tagSelect) tagSelect.addEventListener('change', () => performSearch(true));
    if (sortSelect) sortSelect.addEventListener('change', () => performSearch(true));

    // --- Result selection ---
    if (resultsContainer) {
      resultsContainer.addEventListener('click', (e) => {
        const resultEl = e.target.closest('.search-result');
        if (!resultEl) return;

        const id = Number(resultEl.dataset.id);
        if (isNaN(id)) return;

        resultsContainer.querySelectorAll('.search-result').forEach(el => el.classList.remove('selected'));

        if (resultEl.classList.contains('already-added')) {
          if (addBtn) addBtn.disabled = true;
          return;
        }

        resultEl.classList.add('selected');
        uiState.selectedAnilistId = id;

        if (addBtn) addBtn.disabled = false;
        const selected = uiState.searchResults?.find(r => r.anilist_id === id);
        if (selected) {
          const deInput = document.getElementById('modal-de-title-input');
          if (deInput) {
            deInput.placeholder = `Optional — ${selected.title_english || selected.title_romaji}`;
          }
        }
      });
    }

    // --- Add button ---
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (uiState.selectedAnilistId === null || !uiState.searchResults) return;

        const result = uiState.searchResults.find(r => r.anilist_id === uiState.selectedAnilistId);
        if (!result) return;

        const checkedUsers = [];
        whoCheckboxes.forEach(cb => {
          if (cb.checked) checkedUsers.push(cb.value);
        });
        const watchedBy = checkedUsers.length > 0 ? checkedUsers[0] : getDefaultUser();

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

          const deInput = /** @type {HTMLInputElement} */ (document.getElementById('modal-de-title-input'));
          const deTitle = deInput ? deInput.value.trim() : '';
          if (deTitle) {
            useCases.updateDeTitles({ [result.anilist_id]: deTitle });
          }

          if (checkedUsers.length >= 2) {
            useCases.toggleViewer(result.anilist_id, checkedUsers[1]);
          }
        } catch (err) {
          if (resultsContainer) {
            resultsContainer.innerHTML = `<div class="search-error">Fehler: ${err.message}</div>`;
          }
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

  return { show };
}
