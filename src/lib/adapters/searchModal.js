import { searchModalTemplate, searchLoadingTemplate, searchResultTemplate, searchLoadMoreTemplate, searchNoResultsTemplate, searchErrorTemplate, alreadyAddedBadgeTemplate } from './templates.js';
import { getUsers, getDefaultUser, getUserLabel } from '../config.js';

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
  function show() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    // Reset selection
    uiState.searchResults = null;
    uiState.selectedAnilistId = null;

    // Build modal via template
    const whoCheckboxesHtml = getUsers().map(user =>
      `<label class="search-who-checkbox">
        <input type="checkbox" value="${user}" checked />
        ${getUserLabel(user)}
      </label>`
    ).join('');

    container.innerHTML = searchModalTemplate(whoCheckboxesHtml);

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
        resultsContainer.innerHTML = searchLoadingTemplate();
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
                'beforeend', alreadyAddedBadgeTemplate()
              );
            }
          }
        });

        if (uiState.searchHasMore) {
          html += searchLoadMoreTemplate();
        }
        if (resultsContainer) {
          resultsContainer.innerHTML = html || searchNoResultsTemplate();
        }

        const loadMoreBtn = document.getElementById('btn-load-more');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', () => performSearch(false));
        }
      } catch (err) {
        if (resultsContainer) {
          resultsContainer.innerHTML = searchErrorTemplate();
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
