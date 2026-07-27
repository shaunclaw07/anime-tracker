/**
 * AnimeRepository — Port (Interface Documentation)
 *
 * JavaScript has no native interfaces. This file documents the contract
 * that any AnimeRepository adapter must fulfill. Implementations should
 * be named following the pattern: <StorageAdapter>.
 *
 * @interface AnimeRepository
 */

/**
 * Load the full watchlist from persistent storage.
 *
 * Reads `anime.json` (or equivalent) and returns a list of domain anime
 * entities created via `createAnime()`. The raw JSON is expected to have
 * a `watched` array containing raw anime objects.
 *
 * @async
 * @function loadWatchlist
 * @memberof AnimeRepository
 * @returns {Promise<import('../domain/anime.js').Anime[]>} Array of anime entities.
 * @throws {Error} If the fetch fails or the response is not OK.
 */

/**
 * Load German title mappings from persistent storage.
 *
 * Reads `de-titles.json` (or equivalent) which maps AniList IDs → German titles.
 * Returns an empty object `{}` when the file is missing or unreadable
 * (graceful degradation).
 *
 * @async
 * @function loadDeTitles
 * @memberof AnimeRepository
 * @returns {Promise<Record<number, string>>} Mapping of anilist_id → german title.
 */

/**
 * Serialize the watchlist to a JSON string for download/export.
 *
 * @function exportWatchlist
 * @memberof AnimeRepository
 * @param {import('../domain/anime.js').Anime[]} watchlist - Current watchlist.
 * @returns {string} Formatted JSON string with `{version, last_updated, watched}` structure.
 */

/**
 * Serialize the German title mapping to a JSON string for storage/download.
 *
 * @function saveDeTitles
 * @memberof AnimeRepository
 * @param {Record<number, string>} mapping - AniList ID → German title mapping.
 * @returns {string} Formatted JSON string.
 */
