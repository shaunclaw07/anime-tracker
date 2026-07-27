/**
 * Filters an anime list by the given filter criteria.
 * Pure function — no side effects, returns a new array.
 *
 * @param {Array<object>} animeList - List of anime entities.
 * @param {object} filters - Filter criteria.
 * @param {string} [filters.query] - Text match (case-insensitive) against all title fields.
 * @param {string[]} [filters.genres] - Genres to match (OR logic).
 * @param {number} [filters.minScore] - Minimum community score (0-100).
 * @param {number} [filters.minPersonalRating] - Minimum personal rating.
 * @param {string} [filters.personalRatingUser] - User for personal rating filter.
 * @param {string} [filters.watchedBy] - Filter by watched status: "all", "both", "chrischi", "michelle".
 * @returns {Array<object>} Filtered list (new array).
 */
export function filterAnime(animeList, filters) {
  return animeList.filter((anime) => {
    // Query filter: match against all title fields
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const titles = [anime.title_romaji, anime.title_english, anime.title_de]
        .filter(Boolean)
        .map((t) => t.toLowerCase());
      if (!titles.some((t) => t.includes(q))) {
        return false;
      }
    }

    // Genres filter: OR logic — at least one genre must match
    if (filters.genres && filters.genres.length > 0) {
      if (!anime.genres || !anime.genres.some((g) => filters.genres.includes(g))) {
        return false;
      }
    }

    // Minimum community score
    if (filters.minScore !== undefined && filters.minScore !== null) {
      if (anime.average_score !== undefined && anime.average_score !== null) {
        if (anime.average_score < filters.minScore) {
          return false;
        }
      }
    }

    // Personal rating filter
    if (
      filters.minPersonalRating !== undefined &&
      filters.minPersonalRating !== null &&
      filters.personalRatingUser
    ) {
      if (anime.ratings) {
        const rating = anime.ratings.find(
          (r) => r.user === filters.personalRatingUser,
        );
        if (!rating) {
          // User has rated other anime but not this one → exclude
          return false;
        }
        if (rating.score < filters.minPersonalRating) {
          return false;
        }
      }
    }

    // Watched by filter
    if (filters.watchedBy) {
      if (!anime.watched_by || anime.watched_by.length === 0) {
        return false;
      }
      if (filters.watchedBy === 'all' || filters.watchedBy === 'both') {
        // Must be watched by both chrischi and michelle
        if (
          !anime.watched_by.includes('chrischi') ||
          !anime.watched_by.includes('michelle')
        ) {
          return false;
        }
      } else if (!anime.watched_by.includes(filters.watchedBy)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extracts all unique genres from an anime list, sorted alphabetically.
 * Pure function.
 *
 * @param {Array<object>} animeList - List of anime entities.
 * @returns {string[]} Sorted unique genres.
 */
export function extractGenres(animeList) {
  const genreSet = new Set();
  for (const anime of animeList) {
    if (anime.genres) {
      for (const genre of anime.genres) {
        genreSet.add(genre);
      }
    }
  }
  return [...genreSet].sort();
}
