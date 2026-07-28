import { getUsers, getUserLabel } from '../config.js';

/**
 * Renders a card for a single anime.
 * @param {object} anime - Anime entity.
 * @returns {string} HTML string.
 */
export function cardTemplate(anime) {
  const displayTitle = anime.title_de || anime.title_english || anime.title_romaji;
  const showRomaji = displayTitle !== anime.title_romaji;

  // Genres (max 4)
  const genres = (anime.genres || []).slice(0, 4);
  const genreTags = genres.length
    ? `<div class="anime-card-genres anime-genres">${genres.map((g) => `<span class="genre-tag">${esc(g)}</span>`).join('')}</div>`
    : '';

  // Tags
  const tagsHtml = (anime.tags || []).length
    ? `<div class="anime-card-tags">${anime.tags.map(t => `<span class="tag-badge">${esc(t)}</span>`).join('')}</div>`
    : '';

  // Score
  const score = anime.average_score;
  const scoreClass = score >= 75 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low';
  const scoreHtml = score != null
    ? `<span class="anime-score ${scoreClass}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"/></svg> ${score}</span>`
    : '';

  // Episodes
  const episodesHtml = anime.episodes != null
    ? `<span class="anime-episodes">${anime.episodes} Ep.</span>`
    : '';

  // Format badge
  const formatHtml = anime.format
    ? `<span class="anime-format">${esc(anime.format)}</span>`
    : '';

  // Progress-Bar (nur wenn episodes_total existiert)
  const progressHtml = anime.episodes_total
    ? `<div class="anime-progress">
        <div class="anime-progress-bar">
          <div class="anime-progress-fill" style="width:${Math.round((anime.watched_episodes || 0) / anime.episodes_total * 100)}%"></div>
        </div>
        <span class="anime-progress-text">${anime.watched_episodes || 0}/${anime.episodes_total}</span>
      </div>`
    : '';

  // Pin status
  const pinnedBy = anime.pinned_by || [];
  const isPinned = pinnedBy.includes(getUsers()[0]);
  const pinnedClass = isPinned ? 'pinned' : '';
  const pinIcon = isPinned 
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path fill-rule="evenodd" d="M10 2c-3.3 0-6 2.7-6 6 0 3.5 2.3 6.5 5 8.9l1 1 1-1c2.7-2.4 5-5.4 5-8.9 0-3.3-2.7-6-6-6z" clip-rule="evenodd"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"/></svg>';

  // Watched badges
  const watchedBy = anime.watched_by || [];
  const heartIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"/></svg>';
  const userIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg>';
  let badgesHtml = '';
  if (watchedBy.length === 2) {
    badgesHtml = `<div class="watched-badges"><span class="watched-badge badge-both">${heartIcon} Beide</span></div>`;
  } else if (watchedBy.length === 1) {
    const user = watchedBy[0];
    const badgeClass = user === getUsers()[0] ? 'badge-chrischi' : 'badge-michelle';
    const label = user === getUsers()[0] ? getUserLabel(getUsers()[0]) : getUserLabel(getUsers()[1]);
    badgesHtml = `<div class="watched-badges"><span class="watched-badge ${badgeClass}">${userIcon} ${label}</span></div>`;
  }

  // Personal ratings (stars) – nur für User die diesen Anime gesehen haben
  const ratings = (anime.ratings || []).filter(r => anime.watched_by?.includes(r.user));
  const ratingsHtml = ratings.length
    ? `<div class="personal-ratings">${ratings.map((r) => ratingStars(r.user, r.score)).join('')}</div>`
    : '';

  // Cover
  const coverHtml = anime.cover_url
    ? `<img class="anime-cover anime-card-cover" src="${esc(anime.cover_url)}" alt="${esc(displayTitle)}" loading="lazy" />`
    : `<div class="anime-cover-placeholder anime-card-cover-placeholder">${coverPlaceholderSvg()}</div>`;

  // Action buttons (compact SVG icons)
  const actionsHtml = `<div class="anime-card-actions anime-actions">
    <button class="btn-icon btn-icon-sm" data-action="toggle-${getUsers()[0]}" data-id="${anime.anilist_id}" title="${getUserLabel(getUsers()[0])} gesehen umschalten">${userSvg(14)}</button>
    <button class="btn-icon btn-icon-sm" data-action="toggle-${getUsers()[1]}" data-id="${anime.anilist_id}" title="${getUserLabel(getUsers()[1])} gesehen umschalten">${userSvg(14)}</button>
    <button class="btn-icon btn-icon-sm ${isPinned ? 'btn-pinned' : ''}" data-action="toggle-pin" data-id="${anime.anilist_id}" title="Anheffen">${pinIcon}</button>
    <button class="btn-icon btn-icon-sm" data-action="remove" data-id="${anime.anilist_id}" title="Entfernen">${trashSvg(14)}</button>
  </div>`;

  return `<div class="anime-card ${pinnedClass}" data-id="${anime.anilist_id}">
    ${coverHtml}
    <div class="anime-card-body anime-info">
      <span class="anime-card-title anime-title">${esc(displayTitle)}</span>
      ${showRomaji ? `<span class="anime-card-title-de anime-title-de">${esc(anime.title_romaji)}</span>` : ''}
      ${genreTags}
      ${tagsHtml}
      <div class="anime-card-meta anime-meta">
        ${scoreHtml}
        ${formatHtml}
        ${episodesHtml}
        ${badgesHtml}
      </div>
      ${progressHtml}
      ${ratingsHtml}
      ${actionsHtml}
    </div>
  </div>`;
}

/**
 * searchResultTemplate — Generates HTML for a search result item.
 *
 * @param {object} result - Search result from AniList adapter.
 * @returns {string} HTML string.
 */
export function searchResultTemplate(result) {
  // Genres (max 3)
  const genres = (result.genres || []).slice(0, 3);
  const genreTags = genres.length
    ? `<div class="search-result-genres">${genres.map((g) => `<span class="genre-tag">${esc(g)}</span>`).join('')}</div>`
    : '';

  // Cover
  const coverHtml = result.cover_url
    ? `<img class="search-result-cover" src="${esc(result.cover_url)}" alt="${esc(result.title_romaji)}" loading="lazy" />`
    : `<div class="search-result-placeholder">${coverPlaceholderSvg()}</div>`;

  // Score
  const scoreHtml = result.average_score != null
    ? `<span class="search-result-score"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"/></svg> ${result.average_score}</span>`
    : `<span class="search-result-score">-</span>`;

  // Episodes
  const episodesHtml = result.episodes != null
    ? `<span class="search-result-episodes">${result.episodes} Episoden</span>`
    : '';

  // English title (if different from romaji)
  const enTitle = result.title_english && result.title_english !== result.title_romaji
    ? `<span class="search-result-title-en">${esc(result.title_english)}</span>`
    : '';

  return `<div class="search-result" data-id="${result.anilist_id}">
    ${coverHtml}
    <div class="search-result-info">
      <span class="search-result-title">${esc(result.title_romaji)}</span>
      ${enTitle}
      ${genreTags}
      <div class="search-result-meta">
        ${scoreHtml}
        ${episodesHtml}
      </div>
    </div>
  </div>`;
}

/**
 * filterSheetTemplate — Generates HTML for the filter bottom sheet.
 *
 * @param {object} filters - Current filter state.
 * @param {string[]} allGenres - All available genres.
 * @returns {string} HTML string.
 */
export function filterSheetTemplate(filters, allGenres) {
  const selectedGenres = filters.genres || [];
  const minScore = filters.minScore || 0;
  const watchedBy = filters.watchedBy || '';
  const currentSeason = filters.season || '';
  const currentYear = filters.seasonYear || '';
  const currentStudio = filters.studio || '';

  const genreTags = allGenres.map((g) => {
    const active = selectedGenres.includes(g) ? 'active' : '';
    const checked = active ? '✓' : '';
    return `<span class="filter-genre-tag ${active}" data-genre="${esc(g)}">${checked ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> ' : ''}${esc(g)}</span>`;
  }).join('');

  const bothActive = watchedBy === 'both' ? 'active' : '';
  const whoButtons = getUsers().map(user => {
    const active = watchedBy === user ? 'active' : '';
    return `<button class="filter-who-btn ${active}" data-who="${user}">${getUserLabel(user)}</button>`;
  }).join('');

  const seasons = ['', 'WINTER', 'SPRING', 'SUMMER', 'FALL'];
  const seasonLabels = { '': 'Alle', 'WINTER': 'Winter', 'SPRING': 'Frühling', 'SUMMER': 'Sommer', 'FALL': 'Herbst' };
  const seasonOptions = seasons.map(s =>
    `<option value="${s}" ${currentSeason === s ? 'selected' : ''}>${seasonLabels[s]}</option>`
  ).join('');

  const closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>';

  return `<div class="filter-overlay" id="filter-overlay"></div>
  <div class="filter-panel" id="filter-panel">
    <div class="filter-panel-header">
      <span class="filter-panel-title">${filterIcon} Filter</span>
      <button class="filter-panel-close" id="filter-panel-close" aria-label="Schließen">${closeIcon}</button>
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Genre</span>
      <div class="filter-genre-tags" id="filter-genre-tags">
        ${genreTags}
      </div>
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Bewertung ≥ <span id="filter-score-value">${minScore}</span></span>
      <div class="filter-range-wrapper">
        <input type="range" id="filter-score" class="filter-range" min="0" max="100" value="${minScore}" step="1" />
        <span class="filter-range-value" id="filter-score-display">${minScore}</span>
      </div>
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Gesehen von</span>
      <div class="filter-who-toggle" id="filter-who-toggle">
        <button class="filter-who-btn ${bothActive}" data-who="both"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle" aria-hidden="true"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z"/></svg> Beide</button>
        ${whoButtons}
      </div>
    </div>

    <div class="filter-panel-section">
      <label class="filter-toggle-label">
        <input type="checkbox" id="filter-unwatched" ${filters.unwatchedOnly ? 'checked' : ''} />
        <span>Nur Ungesehene</span>
      </label>
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Season</span>
      <select class="filter-select" id="filter-season">
        ${seasonOptions}
      </select>
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Jahr</span>
      <input type="number" class="filter-input" id="filter-year" placeholder="Jahr z.B. 2024" value="${currentYear}" min="1900" max="2100" />
    </div>

    <div class="filter-panel-section">
      <span class="filter-panel-label">Studio</span>
      <input type="text" class="filter-input" id="filter-studio" placeholder="Studio z.B. Madhouse" value="${esc(currentStudio)}" />
    </div>

    <div class="filter-actions">
      <button class="filter-btn filter-btn-secondary" id="filter-reset">Zurücksetzen</button>
      <button class="filter-btn filter-btn-primary" id="filter-apply">Anwenden</button>
    </div>
  </div>`;
}

/**
 * filterSummaryTemplate — Generates HTML for the compact filter summary bar.
 *
 * @param {number} activeFilterCount - Number of currently active filters.
 * @returns {string} HTML string.
 */
export function filterSummaryTemplate(activeFilterCount) {
  if (activeFilterCount > 0) {
    return `<span class="filter-summary-icon">${filterIcon}</span>
      <span class="filter-summary-text">Filter</span>
      <span class="filter-summary-active">${activeFilterCount} aktiv</span>
      <span class="filter-summary-reset" id="filter-summary-reset">Zurücksetzen</span>`;
  }
  return `<span class="filter-summary-icon">${filterIcon}</span>
    <span class="filter-summary-text">Filter</span>`;
}

/**
 * Escapes HTML special characters.
 *
 * @param {string} str - Input string.
 * @returns {string} Escaped string safe for innerHTML.
 */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates star rating HTML for a user.
 *
 * @param {string} user - Username.
 * @param {number} score - Rating (1-10).
 * @returns {string} HTML string.
 */
function ratingStars(user, score) {
  const filled = '★'.repeat(score);
  const empty = '☆'.repeat(10 - score);
  return `<span class="personal-rating">
    <span class="rating-name">${esc(getUserLabel(user))}:</span>
    <span class="star">${filled}</span><span class="star-empty">${empty}</span>
  </span>`;
}

/**
 * sortSelectTemplate — Generates a <select> for sorting the anime grid.
 *
 * @param {string} currentSortBy - Current sort field ('date_added', 'title', 'score').
 * @param {string} currentSortOrder - Current sort order ('asc', 'desc').
 * @returns {string} HTML string.
 */
export function sortSelectTemplate(currentSortBy, currentSortOrder) {
  const options = [
    { value: 'date_added-desc', label: 'Neueste zuerst' },
    { value: 'date_added-asc', label: 'Älteste zuerst' },
    { value: 'title-asc', label: 'Titel A→Z' },
    { value: 'title-desc', label: 'Titel Z→A' },
    { value: 'score-desc', label: 'Beste Bewertung' },
    { value: 'score-asc', label: 'Niedrigste Bewertung' },
  ];

  const currentValue = `${currentSortBy}-${currentSortOrder}`;

  return `<div class="sort-control">
    <label class="sort-label">Sortieren:</label>
    <select class="sort-select" id="sort-select" aria-label="Sortierung">
      ${options.map(o => `<option value="${o.value}" ${o.value === currentValue ? 'selected' : ''}>${o.label}</option>`).join('')}
    </select>
  </div>`;
}

/** SVG helpers */

/** Shared filter (bars-3) icon — icon-md (18px) */
const filterIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd"/></svg>';

function coverPlaceholderSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="32" height="32" aria-hidden="true"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg>';
}

function userSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${size}" height="${size}" aria-hidden="true"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg>`;
}

function trashSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="${size}" height="${size}" aria-hidden="true"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c-.84 0-1.673.025-2.5.075V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.325C11.673 4.025 10.84 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/></svg>`;
}

/* ---- Search Modal Templates ---- */

/** Heroicons: magnifying glass (search) */
const searchSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>';

/** Heroicons: x-mark (close) */
const closeSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>';

/** Heroicons: check (success/done) */
const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style="vertical-align:middle"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';

/** Heroicons: plus (add/load more) */
const plusSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style="vertical-align:middle"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/></svg>';

/** Search genres list (hardcoded subset) */
const SEARCH_GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Slice of Life','Sports','Thriller','Ecchi'];

/** Search tags list (hardcoded subset) */
const SEARCH_TAGS = ['Isekai','Mecha','Harem','Psychological','Supernatural','Shounen','Seinen','Shoujo','Josei','Music'];

/** Search sort options */
const SEARCH_SORTS = [
  { value: 'relevance', label: 'Relevanz' },
  { value: 'score_desc', label: 'Bewertung ↓' },
  { value: 'score_asc', label: 'Bewertung ↑' },
  { value: 'title_asc', label: 'Titel A–Z' },
  { value: 'title_desc', label: 'Titel Z–A' },
  { value: 'popularity', label: 'Beliebteste' },
];

/**
 * searchModalTemplate — Generates the search modal HTML.
 */
export function searchModalTemplate(whoCheckboxesHtml) {
  const genreOptions = SEARCH_GENRES.map(g =>
    `<option value="${g}">${g}</option>`
  ).join('');
  const tagOptions = SEARCH_TAGS.map(t =>
    `<option value="${t}">${t}</option>`
  ).join('');
  const sortOptions = SEARCH_SORTS.map(s =>
    `<option value="${s.value}">${s.label}</option>`
  ).join('');

  return `<div class="search-overlay" id="modal-overlay">
    <div class="search-header">
      <button class="search-close" id="modal-close" aria-label="Schließen">${closeSvg}</button>
      <div class="search-input-wrapper">
        ${searchSvg}
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
          <option value="">Genre</option>
          ${genreOptions}
        </select>
        <select id="modal-search-tag" class="search-genre-select search-filter-half">
          <option value="">Tag</option>
          ${tagOptions}
        </select>
      </div>
      <div class="search-filter-row" style="margin-top:var(--space-2)">
        <select id="modal-search-sort" class="search-genre-select">
          ${sortOptions}
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
}

/** searchLoadingTemplate — Simple loading indicator */
export function searchLoadingTemplate() {
  return '<div class="search-loading">Suche…</div>';
}

/** searchLoadMoreTemplate — "Mehr laden" button */
export function searchLoadMoreTemplate() {
  return `<div class="search-load-more" id="search-load-more"><button class="btn btn-secondary" id="btn-load-more" style="width:100%;justify-content:center">${plusSvg} Mehr laden</button></div>`;
}

/** searchNoResultsTemplate — Empty state */
export function searchNoResultsTemplate() {
  return '<div class="search-no-results">Keine Ergebnisse gefunden.</div>';
}

/** searchErrorTemplate — API error state */
export function searchErrorTemplate() {
  return '<div class="search-error">Fehler bei der Suche.</div>';
}

/** alreadyAddedBadgeTemplate — "Bereits in Sammlung" badge */
export function alreadyAddedBadgeTemplate() {
  return `<span class="already-added-badge">${checkSvg} Bereits in Sammlung</span>`;
}
