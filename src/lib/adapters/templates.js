/**
 * cardTemplate — Generates HTML for an anime card.
 *
 * @param {object} anime - Anime entity.
 * @param {Record<number, string>} [deTitles={}] - German title mappings from state.
 * @returns {string} HTML string.
 */
export function cardTemplate(anime, deTitles = {}) {
  const deTitle = deTitles[anime.anilist_id]
    || anime.title_de
    || anime.title_english
    || anime.title_romaji;

  const displayTitle = anime.title_romaji;
  const showDeTitle = deTitle !== displayTitle;

  // Genres (max 4)
  const genres = (anime.genres || []).slice(0, 4);
  const genreTags = genres.length
    ? `<div class="anime-genres">${genres.map((g) => `<span class="genre-tag">${esc(g)}</span>`).join('')}</div>`
    : '';

  // Score
  const score = anime.average_score;
  const scoreClass = score >= 75 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low';
  const scoreHtml = score != null
    ? `<span class="anime-score ${scoreClass}">${score}</span>`
    : '';

  // Episodes
  const episodesHtml = anime.episodes != null
    ? `<span class="anime-episodes">${anime.episodes} Ep.</span>`
    : '';

  // Format badge
  const formatHtml = anime.format
    ? `<span class="anime-format">${esc(anime.format)}</span>`
    : '';

  // Watched badges
  const watchedBy = anime.watched_by || [];
  let badgesHtml = '';
  if (watchedBy.length === 2) {
    badgesHtml = `<div class="watched-badges"><span class="watched-badge badge-both">👥 Beide</span></div>`;
  } else if (watchedBy.length === 1) {
    const user = watchedBy[0];
    const badgeClass = user === 'chrischi' ? 'badge-chrischi' : 'badge-michelle';
    const label = user === 'chrischi' ? 'Chrischi' : 'Michelle';
    badgesHtml = `<div class="watched-badges"><span class="watched-badge ${badgeClass}">👤 ${label}</span></div>`;
  }

  // Personal ratings (stars)
  const ratings = anime.ratings || [];
  const ratingsHtml = ratings.length
    ? `<div class="personal-ratings">${ratings.map((r) => ratingStars(r.user, r.score)).join('')}</div>`
    : '';

  // Cover
  const coverHtml = anime.cover_url
    ? `<img class="anime-cover" src="${esc(anime.cover_url)}" alt="${esc(displayTitle)}" loading="lazy" />`
    : `<div class="anime-cover-placeholder">🎬</div>`;

  // Action buttons
  const actionsHtml = `<div class="anime-actions">
    <button class="btn-icon" data-action="toggle-chrischi" data-id="${anime.anilist_id}" title="Chrischi gesehen umschalten">👤</button>
    <button class="btn-icon" data-action="toggle-michelle" data-id="${anime.anilist_id}" title="Michelle gesehen umschalten">👩</button>
    <button class="btn-icon" data-action="remove" data-id="${anime.anilist_id}" title="Entfernen">🗑️</button>
  </div>`;

  return `<div class="anime-card" data-id="${anime.anilist_id}">
    ${coverHtml}
    <div class="anime-info">
      <span class="anime-title">${esc(displayTitle)}</span>
      ${showDeTitle ? `<span class="anime-title-de">${esc(deTitle)}</span>` : ''}
      ${genreTags}
    </div>
    <div class="anime-meta">
      ${scoreHtml}
      ${formatHtml}
      ${episodesHtml}
      ${badgesHtml}
    </div>
    ${ratingsHtml}
    ${actionsHtml}
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
    : `<div class="search-result-placeholder">🎬</div>`;

  // Score
  const scoreHtml = result.average_score != null
    ? `<span class="search-result-score">⭐ ${result.average_score}</span>`
    : '';

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
    .replace(/"/g, '&quot;')
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
    <span class="rating-name">${esc(user)}:</span>
    <span class="star">${filled}</span><span class="star-empty">${empty}</span>
  </span>`;
}
