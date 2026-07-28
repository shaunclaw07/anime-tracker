export interface Anime {
  readonly anilist_id: number;
  readonly title_romaji: string;
  readonly title_english?: string;
  readonly title_de: string;
  readonly genres?: string[];
  readonly average_score?: number;
  readonly episodes?: number;
  readonly cover_url?: string;
  readonly format?: string;
  readonly season?: string;
  readonly seasonYear?: number;
  readonly studios?: string[];
  readonly tags?: string[];
  readonly watched_by?: string[];
  readonly pinned_by?: string[];
  readonly ratings?: { user: string; score: number }[];
  readonly finished_at?: string;
  readonly episodes_total?: number;
  readonly watched_episodes?: number;
  readonly notes?: string;
}

export interface AnimeInput {
  anilist_id: number;
  title_romaji: string;
  title_english?: string;
  title_de?: string;
  genres?: string[];
  average_score?: number;
  episodes?: number;
  cover_url?: string;
  format?: string;
  season?: string;
  seasonYear?: number;
  studios?: string[];
  tags?: string[];
  watched_by?: string[];
  pinned_by?: string[];
  ratings?: { user: string; score: number }[];
  finished_at?: string;
  episodes_total?: number;
  watched_episodes?: number;
  notes?: string;
}

/**
 * Creates an immutable anime entity from raw data.
 * @throws {Error} If required fields are missing.
 */
export function createAnime(data: AnimeInput): Anime {
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
    season: data.season,
    seasonYear: data.seasonYear,
    studios: data.studios,
    tags: data.tags,
    watched_by: data.watched_by,
    pinned_by: data.pinned_by,
    ratings: data.ratings,
    finished_at: data.finished_at,
    episodes_total: data.episodes_total,
    watched_episodes: data.watched_episodes,
    notes: data.notes,
  };
}
