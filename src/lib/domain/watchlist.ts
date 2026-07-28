import type { Anime } from './anime.js';

/**
 * Adds an anime to the watchlist.
 * Pure function — returns a new array.
 * @throws {Error} If anime with same anilist_id already exists.
 */
export function addAnime(watchlist: Anime[], anime: Anime, watchedBy: string): Anime[] {
  if (watchlist.some((a) => a.anilist_id === anime.anilist_id)) {
    throw new Error('Anime with this anilist_id already exists in the watchlist');
  }

  return [...watchlist, { ...anime, watched_by: [watchedBy] }];
}

/**
 * Removes an anime from the watchlist by anilist_id.
 */
export function removeAnime(watchlist: Anime[], anilistId: number): Anime[] {
  return watchlist.filter((a) => a.anilist_id !== anilistId);
}

/**
 * Toggles a user in the watched_by array.
 * @throws {Error} If anilist_id not found.
 */
export function toggleWatchedBy(watchlist: Anime[], anilistId: number, user: string): Anime[] {
  const index = watchlist.findIndex((a) => a.anilist_id === anilistId);
  if (index === -1) {
    throw new Error(`Anime with anilist_id ${anilistId} not found`);
  }

  const anime = watchlist[index];
  const watchedBy = anime.watched_by || [];
  const isPresent = watchedBy.includes(user);

  const newAnime: Anime = {
    ...anime,
    watched_by: isPresent ? watchedBy.filter((u) => u !== user) : [...watchedBy, user],
  };

  const result = [...watchlist];
  result[index] = newAnime;
  return result;
}

/**
 * Toggles a user in the pinned_by array.
 * @throws {Error} If anilist_id not found.
 */
export function togglePinned(watchlist: Anime[], anilistId: number, user: string): Anime[] {
  const index = watchlist.findIndex((a) => a.anilist_id === anilistId);
  if (index === -1) {
    throw new Error(`Anime with anilist_id ${anilistId} not found`);
  }

  const anime = watchlist[index];
  const pinnedBy = anime.pinned_by || [];
  const isPinned = pinnedBy.includes(user);

  const newAnime: Anime = {
    ...anime,
    pinned_by: isPinned ? pinnedBy.filter((u) => u !== user) : [...pinnedBy, user],
  };

  const result = [...watchlist];
  result[index] = newAnime;
  return result;
}

/**
 * Sets a rating (1-10) for a user on an anime.
 * @throws {Error} If anilist_id not found or score out of range.
 */
export function setRating(watchlist: Anime[], anilistId: number, user: string, score: number): Anime[] {
  if (score < 1 || score > 10) {
    throw new Error('Rating must be between 1 and 10');
  }

  const index = watchlist.findIndex((a) => a.anilist_id === anilistId);
  if (index === -1) {
    throw new Error(`Anime with anilist_id ${anilistId} not found`);
  }

  const anime = watchlist[index];
  const existingRatings = anime.ratings || [];
  const existingIndex = existingRatings.findIndex((r) => r.user === user);

  const newRatings = existingIndex !== -1
    ? existingRatings.map((r, i) => i === existingIndex ? { user, score } : r)
    : [...existingRatings, { user, score }];

  const newAnime: Anime = { ...anime, ratings: newRatings };
  const result = [...watchlist];
  result[index] = newAnime;
  return result;
}

/**
 * Sets the watched_episodes progress for an anime.
 * Pure function — returns a new array.
 * @throws {Error} If anilist_id not found.
 * @throws {Error} If episode is negative.
 */
export function setEpisodeProgress(watchlist: Anime[], anilistId: number, episode: number): Anime[] {
  const index = watchlist.findIndex((a) => a.anilist_id === anilistId);
  if (index === -1) {
    throw new Error(`Anime ${anilistId} not found`);
  }
  if (episode < 0) {
    throw new Error('Episode cannot be negative');
  }

  const anime = watchlist[index];
  const newAnime: Anime = { ...anime, watched_episodes: episode };
  const result = [...watchlist];
  result[index] = newAnime;
  return result;
}

/**
 * Sets tags on an anime by anilist_id.
 * Pure function — returns a new array.
 * @throws {Error} If anilist_id not found.
 */
export function setTags(watchlist: Anime[], anilistId: number, tags: string[]): Anime[] {
  const index = watchlist.findIndex((a) => a.anilist_id === anilistId);
  if (index === -1) {
    throw new Error(`Anime ${anilistId} not found`);
  }

  const anime = watchlist[index];
  const newAnime: Anime = { ...anime, tags };
  const result = [...watchlist];
  result[index] = newAnime;
  return result;
}

/**
 * Sets personal notes on an anime by anilist_id.
 * Pure function — returns a new array.
 * @throws {Error} If anilist_id not found.
 */
export function setNotes(watchlist: Anime[], anilistId: number, notes: string): Anime[] {
  const index = watchlist.findIndex((a) => a.anilist_id === anilistId);
  if (index === -1) {
    throw new Error(`Anime ${anilistId} not found`);
  }

  const anime = watchlist[index];
  const newAnime: Anime = { ...anime, notes };
  const result = [...watchlist];
  result[index] = newAnime;
  return result;
}
