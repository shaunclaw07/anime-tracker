import type { Anime } from './anime.js';

export interface Filters {
  query?: string;
  genres?: string[];
  minScore?: number;
  minPersonalRating?: number;
  personalRatingUser?: string;
  watchedBy?: string;
}

/**
 * Filters an anime list by the given filter criteria.
 * Pure function — no side effects, returns a new array.
 */
export function filterAnime(animeList: Anime[], filters: Filters): Anime[] {
  return animeList.filter((anime) => {
    // Query filter: match against all title fields
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const titles = [anime.title_romaji, anime.title_english, anime.title_de]
        .filter(Boolean)
        .map((t) => t!.toLowerCase());
      if (!titles.some((t) => t.includes(q))) {
        return false;
      }
    }

    // Genres filter: OR logic
    if (filters.genres && filters.genres.length > 0) {
      if (!anime.genres || !anime.genres.some((g) => filters.genres!.includes(g))) {
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
    if (filters.minPersonalRating !== undefined && filters.minPersonalRating !== null && filters.personalRatingUser) {
      if (!anime.ratings) return false;
      const rating = anime.ratings.find((r) => r.user === filters.personalRatingUser);
      if (!rating || rating.score < filters.minPersonalRating) return false;
    }

    // Watched by filter
    if (filters.watchedBy) {
      if (!anime.watched_by || anime.watched_by.length === 0) return false;
      if (filters.watchedBy === 'all' || filters.watchedBy === 'both') {
        if (!anime.watched_by.includes('chrischi') || !anime.watched_by.includes('michelle')) return false;
      } else if (!anime.watched_by.includes(filters.watchedBy)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extracts all unique genres from an anime list, sorted alphabetically.
 */
export function extractGenres(animeList: Anime[]): string[] {
  const genreSet = new Set<string>();
  for (const anime of animeList) {
    if (anime.genres) {
      for (const genre of anime.genres) {
        genreSet.add(genre);
      }
    }
  }
  return [...genreSet].sort();
}
