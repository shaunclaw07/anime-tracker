import { cardTemplate, filterSheetTemplate, filterSummaryTemplate } from './templates.js';
import { extractGenres, sortAnime, filterAnime } from '../domain/filters.js';
import { computeStats } from '../domain/stats.js';
import { updateTabTitle } from '../application/tabTitle.js';
import { getUsers, getDefaultUser } from '../config.js';
import { createSearchState } from './uiState.js';
import { user, search as searchIcon, trash_2 } from '../icons.js';
import { iconSvg } from '../icons.js';
import { createSearchModal } from './searchModal.js';
import { createDetailModal } from './detailModal.js';
import { createSettingsModal } from './settingsModal.js';
import { createRandomModal } from './randomModal.js';
import { createFilterSheet } from './filterSheet.js';
import { createDesktopFilterBar } from './desktopFilterBar.js';
import { createFilterEngine } from './filterEngine.js';

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
  const settingsModal = createSettingsModal();
  const randomModal = createRandomModal(state, useCases, anilistAdapter);
  const filterSheet = createFilterSheet(state, useCases);
  const filterEngine = createFilterEngine(useCases);
  const desktopFilterBar = createDesktopFilterBar(state, useCases, filterEngine);

  /* ------------------------------------------------------------------ */
  /*  render                                                              */
  /* ------------------------------------------------------------------ */
  function render() {
    const { watchlist, deTitles, filters, sortBy, sortOrder, viewMode } = state.getState();
    const grid = document.getElementById('anime-grid');
    const filterSummary = document.getElementById('filter-summary');
    if (!grid) return;

    // Apply list-view class based on viewMode
    grid.classList.toggle('list-view', viewMode === 'list');

    // Pinned-first sorting
    const user = getUsers()[0];
    const pinned = watchlist.filter(a => (a.pinned_by || []).includes(user));
    const unpinned = watchlist.filter(a => !(a.pinned_by || []).includes(user));
    const sortedPinned = sortAnime(pinned, sortBy, sortOrder);
    const sortedUnpinned = sortAnime(unpinned, sortBy, sortOrder);
    const allSorted = [...sortedPinned, ...sortedUnpinned];
    const filtered = filterAnime(allSorted, filters || {});

    // Clear grid
    grid.innerHTML = '';

    if (watchlist.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'anime-grid-empty';
      emptyEl.innerHTML = `
        <div class="anime-grid-empty-icon">${iconSvg(user, 32)}</div>
        <p class="anime-grid-empty-text">Noch keine Animes in der Sammlung.</p>
        <p class="anime-grid-empty-sub">Tippe auf +, um zu starten.</p>
      `;
      grid.appendChild(emptyEl);
    } else if (filtered.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'anime-grid-empty';
      emptyEl.innerHTML = `
        <div class="anime-grid-empty-icon">${iconSvg(searchIcon, 32)}</div>
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
    desktopFilterBar.update(filters, allGenres);
  }

  /* ------------------------------------------------------------------ */
  /*  updateStats                                                         */
  /* ------------------------------------------------------------------ */
  function updateStats(watchlist) {
    const statsContainer = document.getElementById('stats');
    if (!statsContainer) return;

    const stats = computeStats(watchlist);

    // Stat-Karten dynamisch rendern (User-Karten clientseitig)
    let html = `
      <div class="stat-card stat-total">
        <span class="stat-card-number" id="total-count">${stats.totalCount}</span>
        <span class="stat-card-label">Gesamt</span>
      </div>
      <div class="stat-card stat-both">
        <span class="stat-card-number" id="both-count">${stats.bothCount}</span>
        <span class="stat-card-label">Gemeinsam</span>
      </div>
      <div class="stat-card stat-chrischi">
        <span class="stat-card-number">${stats.chrischiCount}</span>
        <span class="stat-card-label">Chrischi</span>
        <span class="stat-card-sub">⌀ ${stats.avgScoreChrischi != null ? stats.avgScoreChrischi.toFixed(1) : '-'}</span>
      </div>
      <div class="stat-card stat-michelle">
        <span class="stat-card-number">${stats.michelleCount}</span>
        <span class="stat-card-label">Michelle</span>
        <span class="stat-card-sub">⌀ ${stats.avgScoreMichelle != null ? stats.avgScoreMichelle.toFixed(1) : '-'}</span>
      </div>`;

    // Top Genres (max 3)
    if (stats.topGenres.length > 0) {
      html += `<div class="stat-card stat-genres">
        <span class="stat-card-label">Top Genres</span>
        ${stats.topGenres.map(g => `<span class="stat-genre-item">${g.genre} (${g.count})</span>`).join('')}
      </div>`;
    }

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
    if (filters.unwatchedOnly) count++;
    if (filters.season) count++;
    if (filters.seasonYear) count++;
    if (filters.studio) count++;

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

          if (action === 'toggle-pin') {
            useCases.togglePinned(id);
          } else if (action === 'remove') {
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
    toast.innerHTML = `<span>${iconSvg(trash_2, 14)} Gelöscht</span><button id="undo-btn" style="color:var(--color-primary);font-weight:700;background:none;border:none;cursor:pointer;padding:4px 8px">Rückgängig</button>`;
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
