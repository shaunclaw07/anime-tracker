import { filterSheetTemplate, sortSelectTemplate } from './templates.js';
import { extractGenres } from '../domain/filters.js';
import { createFilterEngine } from './filterEngine.js';
import { check as checkIcon } from '../icons.js';
import { iconSvg } from '../icons.js';

/**
 * createFilterSheet — Mobile filter bottom sheet.
 *
 * @param {object} state - Global state
 * @param {object} useCases - Application use cases
 * @returns {{ show: () => void, close: () => void }}
 */
export function createFilterSheet(state, useCases) {
  const filterEngine = createFilterEngine(useCases);
  function show() {
    const container = document.getElementById('filter-sheet-container');
    if (!container) return;

    const { watchlist, filters, sortBy, sortOrder } = state.getState();
    const allGenres = extractGenres(watchlist);

    container.innerHTML = filterSheetTemplate(filters, allGenres);

    // Inject sort section after the score range section
    const panel = document.getElementById('filter-panel');
    if (panel) {
      const sections = panel.querySelectorAll('.filter-panel-section');
      if (sections.length >= 2) {
        const sortSection = document.createElement('div');
        sortSection.className = 'filter-panel-section';
        sortSection.innerHTML = `<span class="filter-panel-label">Sortierung</span>
          <div class="sort-wrapper">${sortSelectTemplate(sortBy || 'date_added', sortOrder || 'desc')}</div>`;
        sections[1].after(sortSection);
      }
    }

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
            tag.insertAdjacentHTML('afterbegin', `${iconSvg(checkIcon, 14)} `);
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

        const seasonSelect = document.getElementById('filter-season');
        const season = seasonSelect ? seasonSelect.value : '';

        const yearInput = document.getElementById('filter-year');
        const yearVal = yearInput ? parseInt(yearInput.value, 10) : NaN;
        const seasonYear = !isNaN(yearVal) && yearVal > 0 ? yearVal : null;

        const studioInput = document.getElementById('filter-studio');
        const studio = studioInput ? studioInput.value.trim() : '';

        close();

        filterEngine.applyFilters({
          genres: genres.length > 0 ? genres : undefined,
          minScore: minScore > 0 ? minScore : undefined,
          watchedBy: watchedBy || undefined,
          season: season || undefined,
          seasonYear: seasonYear || undefined,
          studio: studio || undefined,
        }, state.getState().filters);
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

    // Sort select (innerhalb des Filter-Panels suchen)
    const sortSelect = document.querySelector('#filter-panel #sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const [sortBy, sortOrder] = sortSelect.value.split('-');
        useCases.setSorting(sortBy, sortOrder);
      });
    }

    // Unwatched only quick filter
    const unwatchedToggle = document.getElementById('filter-unwatched');
    if (unwatchedToggle) {
      unwatchedToggle.addEventListener('change', () => {
        const newFilters = { ...state.getState().filters };
        if (unwatchedToggle.checked) {
          newFilters.unwatchedOnly = true;
        } else {
          delete newFilters.unwatchedOnly;
        }
        useCases.setFilters(newFilters);
      });
    }
  }

  return { show, close };
}
