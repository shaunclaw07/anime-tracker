import { filterSheetTemplate, filterSummaryTemplate } from './templates.js';
import { extractGenres } from '../domain/filters.js';
import { getUsers, getUserLabel } from '../config.js';

/**
 * createFilterSheet — Mobile bottom-sheet + desktop inline filter bar.
 *
 * @param {object} state - Global state
 * @param {object} useCases - Application use cases
 * @returns {{ show: () => void, close: () => void }}
 */
export function createFilterSheet(state, useCases) {
  function show() {
    const container = document.getElementById('filter-sheet-container');
    if (!container) return;

    const { watchlist, filters } = state.getState();
    const allGenres = extractGenres(watchlist);

    container.innerHTML = filterSheetTemplate(filters, allGenres);
    bindFilterSheetEvents();
  }

  function close() {
    const container = document.getElementById('filter-sheet-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  function bindFilterSheetEvents() {
    const closeBtn = document.getElementById('filter-panel-close');
    if (closeBtn) closeBtn.addEventListener('click', close);

    const overlay = document.getElementById('filter-overlay');
    if (overlay) overlay.addEventListener('click', close);

    // Genre tags toggle
    const tagsContainer = document.getElementById('filter-genre-tags');
    if (tagsContainer) {
      tagsContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-genre-tag');
        if (!tag) return;
        tag.classList.toggle('active');
        const check = tag.querySelector('svg');
        if (tag.classList.contains('active')) {
          if (!check) {
            tag.insertAdjacentHTML('afterbegin', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> ');
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
        whoToggle.querySelectorAll('.filter-who-btn').forEach(b => b.classList.remove('active'));
        if (!isActive) btn.classList.add('active');
      });
    }

    // Apply button
    const applyBtn = document.getElementById('filter-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const genreTags = document.querySelectorAll('#filter-genre-tags .filter-genre-tag.active');
        const genres = Array.from(genreTags).map(t => t.dataset.genre);

        const scoreSlider = document.getElementById('filter-score');
        const minScore = scoreSlider ? Number(scoreSlider.value) : 0;

        const activeWho = document.querySelector('#filter-who-toggle .filter-who-btn.active');
        const watchedBy = activeWho ? activeWho.dataset.who : '';

        const newFilters = { ...state.getState().filters };
        if (genres.length > 0) newFilters.genres = genres;
        else delete newFilters.genres;
        if (minScore > 0) newFilters.minScore = minScore;
        else delete newFilters.minScore;
        if (watchedBy) newFilters.watchedBy = watchedBy;
        else delete newFilters.watchedBy;

        useCases.setFilters(newFilters);
        close();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        useCases.setFilters({});
        close();
      });
    }
  }

  /** Updates the desktop inline filter bar */
  function updateDesktopFilterBar(filters, allGenres) {
    const desktopBar = document.getElementById('filter-desktop-bar');
    if (!desktopBar) return;

    const selectedGenres = filters.genres || [];
    const minScore = filters.minScore || 0;
    const watchedBy = filters.watchedBy || '';

    const genreTags = allGenres.map(g => {
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
          <div class="filter-genre-tags" id="filter-genre-tags-desktop">${genreTags}</div>
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
      </div>`;

    bindDesktopFilterEvents();
  }

  function bindDesktopFilterEvents() {
    const tagsContainer = document.getElementById('filter-genre-tags-desktop');
    if (tagsContainer) {
      tagsContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-genre-tag');
        if (!tag) return;
        tag.classList.toggle('active');
        applyDesktopFilters();
      });
    }

    const scoreSlider = document.getElementById('filter-score-desktop');
    if (scoreSlider) {
      scoreSlider.addEventListener('input', () => applyDesktopFilters());
    }

    const whoToggle = document.querySelector('#filter-desktop-bar .filter-who-toggle');
    if (whoToggle) {
      whoToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-who-btn');
        if (!btn) return;
        const isActive = btn.classList.contains('active');
        whoToggle.querySelectorAll('.filter-who-btn').forEach(b => b.classList.remove('active'));
        if (!isActive) btn.classList.add('active');
        applyDesktopFilters();
      });
    }
  }

  function applyDesktopFilters() {
    const genreTags = document.querySelectorAll('#filter-genre-tags-desktop .filter-genre-tag.active');
    const genres = Array.from(genreTags).map(t => t.dataset.genre);

    const scoreSlider = document.getElementById('filter-score-desktop');
    const minScore = scoreSlider ? Number(scoreSlider.value) : 0;

    const activeWho = document.querySelector('#filter-desktop-bar .filter-who-btn.active');
    const watchedBy = activeWho ? activeWho.dataset.who : '';

    const newFilters = { ...state.getState().filters };
    if (genres.length > 0) newFilters.genres = genres;
    else delete newFilters.genres;
    if (minScore > 0) newFilters.minScore = minScore;
    else delete newFilters.minScore;
    if (watchedBy) newFilters.watchedBy = watchedBy;
    else delete newFilters.watchedBy;

    useCases.setFilters(newFilters);
  }

  return { show, close, updateDesktopFilterBar };
}
