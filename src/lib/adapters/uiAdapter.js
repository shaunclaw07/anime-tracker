import { cardTemplate, filterSheetTemplate, filterSummaryTemplate } from './templates.js';
import { extractGenres } from '../domain/filters.js';
import { updateTabTitle } from '../application/tabTitle.js';
import { getUsers, getDefaultUser, getUserLabel } from '../config.js';
import { createSearchState } from './uiState.js';
import { createSearchModal } from './searchModal.js';
import { createDetailModal } from './detailModal.js';
import { createSettingsModal } from './settingsModal.js';
import { createRandomModal } from './randomModal.js';
import { createFilterSheet } from './filterSheet.js';

/**
 * createUiAdapter — Creates the DOM adapter connecting state, useCases, and AniList.
 *
 * @param {{ getState: () => object, setState: (partial: object) => void, subscribe: (fn) => () => void }} state
 * @param {object} useCases
 * @param {{ searchAnime: (query: string) => Promise<Array<object>> }} anilistAdapter
 * @returns {{ init: () => void, render: () => void }}
 */
export function createUiAdapter(state, useCases, anilistAdapter) {
  const uiState = createSearchState();
  const searchModal = createSearchModal(state, useCases, anilistAdapter, uiState);
  const detailModal = createDetailModal(state, useCases);
  const settingsModal = createSettingsModal(state, useCases);
  const randomModal = createRandomModal(state, useCases, anilistAdapter);
  const filterSheet = createFilterSheet(state, useCases);

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
    const statsContainer = document.getElementById('stats');
    if (!statsContainer) return;

    const both = watchlist.filter(
      (a) => a.watched_by && a.watched_by.includes(getUsers()[0]) && a.watched_by.includes(getUsers()[1]),
    ).length;

    // Stat-Karten dynamisch rendern (User-Karten clientseitig)
    let html = `
      <div class="stat-card stat-total">
        <span class="stat-card-number" id="total-count">${watchlist.length}</span>
        <span class="stat-card-label">Gesamt</span>
      </div>
      <div class="stat-card stat-both">
        <span class="stat-card-number" id="both-count">${both}</span>
        <span class="stat-card-label">Gemeinsam</span>
      </div>`;

    getUsers().forEach(user => {
      const count = watchlist.filter(a => a.watched_by?.includes(user)).length;
      html += `
        <div class="stat-card stat-${user}">
          <span class="stat-card-number">${count}</span>
          <span class="stat-card-label">${getUserLabel(user)}</span>
        </div>`;
    });

    statsContainer.innerHTML = html;
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

    const whoButtons = getUsers().map(user => {
      const active = watchedBy === user ? 'active' : '';
      return `<button class="filter-who-btn ${active}" data-who="${user}">${getUserLabel(user)}</button>`;
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
            ${whoButtons}
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
    state.subscribe(() => { render(); updateTabTitle(state.getState().watchlist.length); });

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

    // --- Settings button ---
    const settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', showSettings);
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
          } else if (action === `toggle-${getUsers()[0]}` || action === `toggle-${getUsers()[1]}`) {
            const user = action.replace('toggle-', '');
            useCases.toggleViewer(id, user);
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
    filterSheet.show();
  }

  /* ------------------------------------------------------------------ */
  /*  bindFilterSheetEvents                                               */
  /* ------------------------------------------------------------------ */
  function bindFilterSheetEvents() {
    filterSheet.show();
  }

  /* ------------------------------------------------------------------ */
  /*  bindDesktopFilterEvents                                             */
  /* ------------------------------------------------------------------ */
  function bindDesktopFilterEvents() {
    // Handled inside filterSheet.js
  }

  /* ------------------------------------------------------------------ */
  /*  applyDesktopFilters                                                 */
  /* ------------------------------------------------------------------ */
  function applyDesktopFilters() {
    // Handled inside filterSheet.js
  }

  /* ------------------------------------------------------------------ */
  /*  closeFilterSheet                                                    */
  /* ------------------------------------------------------------------ */
  function closeFilterSheet() {
    filterSheet.close();
  }

  /* ------------------------------------------------------------------ */
  /*  showSearchModal                                                     */
  /* ------------------------------------------------------------------ */

  function showSearchModal() {
    searchModal.show();
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
      useCases.addAnimeToList(anime, getDefaultUser());
      if (anime.watched_by?.includes(getUsers()[1])) {
        useCases.toggleViewer(anilistId, getUsers()[1]);
      }
      toast.remove();
    });

    setTimeout(() => toast.remove(), 4000);
  }

  /* ------------------------------------------------------------------ */
  /*  showRandomAnime                                                     */
  /* ------------------------------------------------------------------ */
  function showRandomAnime() {
    randomModal.show();
  }

  /* ------------------------------------------------------------------ */
  /*  showDetailModal                                                     */
  /* ------------------------------------------------------------------ */
  function showDetailModal(anilistId) {
    detailModal.show(anilistId);
  }

  /* ------------------------------------------------------------------ */
  /*  showSettings                                                        */
  /* ------------------------------------------------------------------ */
  function showSettings() {
    settingsModal.show();
  }

  return { init, render, updateTabTitle: () => updateTabTitle(state.getState().watchlist.length) };
}
