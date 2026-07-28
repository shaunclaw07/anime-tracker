import { getUsers, getUserLabel } from '../config.js';
import { star, heart, user, trash_2, filter, x, check, plus, pin, search } from '../icons.js';

/** Hilfsfunktion: Icon in anderer Grösse */
function iconSvg(svg, size) {
  return svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
}

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
    ? `<span class="anime-score ${scoreClass}">${iconSvg(star, 14)} ${score}</span>`
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
    ? iconSvg(pin, 14)
    : iconSvg(pin, 14);

  // Watched badges
  const watchedBy = anime.watched_by || [];
  const heartIcon = iconSvg(heart, 14);
  const userIcon = iconSvg(user, 14);
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
    : `<div class="anime-cover-placeholder anime-card-cover-placeholder">${iconSvg(user, 32)}</div>`;

  // Action buttons (compact SVG icons)
  const actionsHtml = `<div class="anime-card-actions anime-actions">
    <button class="btn-icon btn-icon-sm" data-action="toggle-${getUsers()[0]}" data-id="${anime.anilist_id}" title="${getUserLabel(getUsers()[0])} gesehen umschalten">${iconSvg(user, 14)}</button>
    <button class="btn-icon btn-icon-sm" data-action="toggle-${getUsers()[1]}" data-id="${anime.anilist_id}" title="${getUserLabel(getUsers()[1])} gesehen umschalten">${iconSvg(user, 14)}</button>
    <button class="btn-icon btn-icon-sm ${isPinned ? 'btn-pinned' : ''}" data-action="toggle-pin" data-id="${anime.anilist_id}" title="Anheffen">${pinIcon}</button>
    <button class="btn-icon btn-icon-sm" data-action="remove" data-id="${anime.anilist_id}" title="Entfernen">${iconSvg(trash_2, 14)}</button>
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
    : `<div class="search-result-placeholder">${iconSvg(user, 32)}</div>`;

  // Score
  const scoreHtml = result.average_score != null
    ? `<span class="search-result-score">${iconSvg(star, 14)} ${result.average_score}</span>`
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
    return `<span class="filter-genre-tag ${active}" data-genre="${esc(g)}">${checked ? `${iconSvg(check, 14)} ` : ''}${esc(g)}</span>`;
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

  const closeIcon = iconSvg(x, 18);

  return `<div class="filter-overlay" id="filter-overlay"></div>
  <div class="filter-panel" id="filter-panel">
    <div class="filter-panel-header">
      <span class="filter-panel-title">${iconSvg(filter, 18)} Filter</span>
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
        <button class="filter-who-btn ${bothActive}" data-who="both">${iconSvg(user, 14)} Beide</button>
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
    return `<span class="filter-summary-icon">${iconSvg(filter, 18)}</span>
      <span class="filter-summary-text">Filter</span>
      <span class="filter-summary-active">${activeFilterCount} aktiv</span>
      <span class="filter-summary-reset" id="filter-summary-reset">Zurücksetzen</span>`;
  }
  return `<span class="filter-summary-icon">${iconSvg(filter, 18)}</span>
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

/** SVG helpers — alle via Lucide Icons */

/** Heroicons: magnifying glass (search) */
const searchSvg = iconSvg(search, 18);

/** Heroicons: x-mark (close) */
const closeSvg = iconSvg(x, 18);

/** Heroicons: check (success/done) */
const checkSvg = iconSvg(check, 12);

/** Heroicons: plus (add/load more) */
const plusSvg = iconSvg(plus, 16);

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
