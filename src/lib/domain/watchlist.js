/**
 * Adds an anime to the watchlist.
 * Pure function — returns a new array.
 *
 * @param {Array<object>} watchlist - Current watchlist.
 * @param {object} anime - Anime entity to add.
 * @param {string} watchedBy - User who is adding it.
 * @returns {Array<object>} New watchlist.
 * @throws {Error} If anime with same anilist_id already exists.
 */
export function addAnime(watchlist, anime, watchedBy) {
  if (watchlist.some((a) => a.anilist_id === anime.anilist_id)) {
    throw new Error('Anime with this anilist_id already exists in the watchlist');
  }

  const newAnime = {
    ...anime,
    watched_by: [watchedBy],
  };

  return [...watchlist, newAnime];
}

/**
 * Removes an anime from the watchlist by anilist_id.
 * Pure function — returns a new array.
 *
 * @param {Array<object>} watchlist - Current watchlist.
 * @param {number} anilistId - AniList ID of the anime to remove.
 * @returns {Array<object>} New watchlist (without the removed anime).
 */
export function removeAnime(watchlist, anilistId) {
  return watchlist.filter((a) => a.anilist_id !== anilistId);
}

/**
 * Toggles a user in the watched_by array.
 * Pure function — returns a new array with updated anime.
 *
 * @param {Array<object>} watchlist - Current watchlist.
 * @param {number} anilistId - AniList ID of the anime.
 * @param {string} user - User to toggle.
 * @returns {Array<object>} New watchlist.
 * @throws {Error} If anilist_id not found.
 */
export function toggleWatchedBy(watchlist, anilistId, user) {
  const index = watchlist.findIndex((a) => a.anilist_id === anilistId);
  if (index === -1) {
    throw new Error(`Anime with anilist_id ${anilistId} not found`);
  }

  const anime = watchlist[index];
  const watchedBy = anime.watched_by || [];
  const isPresent = watchedBy.includes(user);

  const newAnime = {
    ...anime,
    watched_by: isPresent
      ? watchedBy.filter((u) => u !== user)
      : [...watchedBy, user],
  };

  const result = [...watchlist];
  result[index] = newAnime;
  return result;
}

/**
 * Sets a rating (1-10) for a user on an anime.
 * Pure function — returns a new array.
 *
 * @param {Array<object>} watchlist - Current watchlist.
 * @param {number} anilistId - AniList ID of the anime.
 * @param {string} user - User who is rating.
 * @param {number} score - Rating score (1-10).
 * @returns {Array<object>} New watchlist.
 * @throws {Error} If anilist_id not found or score out of range.
 */
export function setRating(watchlist, anilistId, user, score) {
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

  let newRatings;
  if (existingIndex !== -1) {
    newRatings = [...existingRatings];
    newRatings[existingIndex] = { user, score };
  } else {
    newRatings = [...existingRatings, { user, score }];
  }

  const newAnime = { ...anime, ratings: newRatings };
  const result = [...watchlist];
  result[index] = newAnime;
  return result;
}
