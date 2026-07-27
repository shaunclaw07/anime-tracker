/**
 * Creates an immutable anime entity from raw data.
 *
 * @param {object} data
 * @param {number} data.anilist_id - Required. AniList ID.
 * @param {string} data.title_romaji - Required. Romaji title.
 * @param {string} [data.title_english] - English title.
 * @param {string} [data.title_de] - German title (falls back to english → romaji).
 * @param {string[]} [data.genres] - Genre tags.
 * @param {number} [data.average_score] - Community score (0-100).
 * @param {number} [data.episodes] - Episode count.
 * @param {string} [data.cover_url] - Cover image URL.
 * @param {string} [data.format] - Format (TV, Movie, OVA, etc.).
 * @param {string[]} [data.watched_by] - Users who watched this.
 * @param {Array<{user: string, score: number}>} [data.ratings] - Personal ratings.
 * @param {string} [data.finished_at] - Completion date.
 * @returns {object} Immutable anime entity.
 * @throws {Error} If required fields are missing.
 */
export function createAnime(data) {
  if (data.anilist_id === undefined || data.anilist_id === null) {
    throw new Error('anilist_id is required');
  }
  if (!data.title_romaji) {
    throw new Error('title_romaji is required');
  }

  return {
    anilist_id: data.anilist_id,
    title_romaji: data.title_romaji,
    title_english: data.title_english,
    title_de: data.title_de || data.title_english || data.title_romaji,
    genres: data.genres,
    average_score: data.average_score,
    episodes: data.episodes,
    cover_url: data.cover_url,
    format: data.format,
    watched_by: data.watched_by,
    ratings: data.ratings,
    finished_at: data.finished_at,
  };
}
