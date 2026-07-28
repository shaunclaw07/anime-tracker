import { getUsers, getUserLabel } from '../config.js';
import { sortSelectTemplate } from './templates.js';

/**
 * desktopFilterBar — Desktop Inline-Filter-Bar.
 *
 * Extrahiert aus filterSheet.js, rendert und steuert die
 * Desktop-Filter-Leiste (sichtbar ab 640px+).
 *
 * @param {object} state - Global state (getState)
 * @param {object} useCases - Application use cases
 * @param {{ applyFilters: (values: object, currentFilters?: object) => void }} filterEngine
 * @returns {{ update: (filters: object, allGenres: string[]) => void }}
 */
export function createDesktopFilterBar(state, useCases, filterEngine) {
  /**
   * Rendert/aktualisiert die Desktop-Inline-Filter-Bar.
   * @param {object} filters - Aktuelle Filter
   * @param {string[]} allGenres - Alle verfügbaren Genres
   */
  function update(filters, allGenres) {
    const desktopBar = document.getElementById('filter-desktop-bar');
    if (!desktopBar) return;

    const { viewMode, sortBy, sortOrder } = state.getState();

    const selectedGenres = filters.genres || [];
    const minScore = filters.minScore || 0;
    const watchedBy = filters.watchedBy || '';
    const unwatchedChecked = filters.unwatchedOnly ? 'checked' : '';

    const genreTags = allGenres.map(g => {
      const active = selectedGenres.includes(g) ? 'active' : '';
      return `<span class="filter-genre-tag ${active}" data-genre="${g}">${g}</span>`;
    }).join('');

    const whoButtons = getUsers().map(user => {
      const active = watchedBy === user ? 'active' : '';
      return `<button class="filter-who-btn ${active}" data-who="${user}">${getUserLabel(user)}</button>`;
    }).join('');

    const currentSeason = filters.season || '';
    const currentYear = filters.seasonYear || '';
    const currentStudio = filters.studio || '';

    const seasons = ['', 'WINTER', 'SPRING', 'SUMMER', 'FALL'];
    const seasonLabels = { '': 'Alle', 'WINTER': 'Winter', 'SPRING': 'Frühling', 'SUMMER': 'Sommer', 'FALL': 'Herbst' };
    const seasonOptions = seasons.map(s =>
      `<option value="${s}" ${currentSeason === s ? 'selected' : ''}>${seasonLabels[s]}</option>`
    ).join('');

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
        <div class="filter-desktop-section">
          <label class="filter-toggle-label">
            <input type="checkbox" id="filter-unwatched-desktop" ${unwatchedChecked} />
            <span>Nur Ungesehene</span>
          </label>
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Season</span>
          <select class="filter-select" id="filter-season-desktop">
            ${seasonOptions}
          </select>
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Jahr</span>
          <input type="number" class="filter-input" id="filter-year-desktop" placeholder="Jahr z.B. 2024" value="${currentYear}" min="1900" max="2100" />
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Studio</span>
          <input type="text" class="filter-input" id="filter-studio-desktop" placeholder="Studio z.B. Madhouse" value="${currentStudio}" />
        </div>
        <div class="filter-desktop-section filter-desktop-section-sort">
          ${sortSelectTemplate(sortBy, sortOrder)}
        </div>
        <div class="filter-desktop-section filter-desktop-section-view">
          <div class="view-toggle">
            <button class="view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}" data-view="grid">Grid</button>
            <button class="view-toggle-btn ${viewMode === 'list' ? 'active' : ''}" data-view="list">Liste</button>
          </div>
        </div>
      </div>`;

    bindEvents();
  }

  function bindEvents() {
    const tagsContainer = document.getElementById('filter-genre-tags-desktop');
    if (tagsContainer) {
      tagsContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-genre-tag');
        if (!tag) return;
        tag.classList.toggle('active');
        apply();
      });
    }

    const scoreSlider = document.getElementById('filter-score-desktop');
    if (scoreSlider) {
      scoreSlider.addEventListener('input', () => apply());
    }

    const whoToggle = document.querySelector('#filter-desktop-bar .filter-who-toggle');
    if (whoToggle) {
      whoToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-who-btn');
        if (!btn) return;
        const isActive = btn.classList.contains('active');
        whoToggle.querySelectorAll('.filter-who-btn').forEach(b => b.classList.remove('active'));
        if (!isActive) btn.classList.add('active');
        apply();
      });
    }

    const unwatchedToggle = document.getElementById('filter-unwatched-desktop');
    if (unwatchedToggle) {
      unwatchedToggle.addEventListener('change', () => apply());
    }

    const seasonSelect = document.getElementById('filter-season-desktop');
    if (seasonSelect) {
      seasonSelect.addEventListener('change', () => apply());
    }

    const yearInput = document.getElementById('filter-year-desktop');
    if (yearInput) {
      yearInput.addEventListener('input', () => apply());
    }

    const studioInput = document.getElementById('filter-studio-desktop');
    if (studioInput) {
      studioInput.addEventListener('input', () => apply());
    }

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const [sortBy, sortOrder] = sortSelect.value.split('-');
        useCases.setSorting(sortBy, sortOrder);
      });
    }

    // View toggle
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newViewMode = btn.dataset.view;
        state.setState({ viewMode: newViewMode });
        localStorage.setItem('anime-tracker-view-mode', newViewMode);
      });
    });
  }

  function apply() {
    const genreTags = document.querySelectorAll('#filter-genre-tags-desktop .filter-genre-tag.active');
    const genres = Array.from(genreTags).map(t => t.dataset.genre);

    const scoreSlider = document.getElementById('filter-score-desktop');
    const minScore = scoreSlider ? Number(scoreSlider.value) : 0;

    const activeWho = document.querySelector('#filter-desktop-bar .filter-who-btn.active');
    const watchedBy = activeWho ? activeWho.dataset.who : '';

    const unwatchedToggle = document.getElementById('filter-unwatched-desktop');

    const seasonSelect = document.getElementById('filter-season-desktop');
    const season = seasonSelect ? seasonSelect.value : '';

    const yearInput = document.getElementById('filter-year-desktop');
    const yearVal = yearInput ? parseInt(yearInput.value, 10) : NaN;
    const seasonYear = !isNaN(yearVal) && yearVal > 0 ? yearVal : null;

    const studioInput = document.getElementById('filter-studio-desktop');
    const studio = studioInput ? studioInput.value.trim() : '';

    filterEngine.applyFilters({
      genres: genres.length > 0 ? genres : undefined,
      minScore: minScore > 0 ? minScore : undefined,
      watchedBy: watchedBy || undefined,
      season: season || undefined,
      seasonYear: seasonYear || undefined,
      studio: studio || undefined,
      unwatchedOnly: unwatchedToggle ? unwatchedToggle.checked : undefined,
    }, state.getState().filters);
  }

  return { update };
}
