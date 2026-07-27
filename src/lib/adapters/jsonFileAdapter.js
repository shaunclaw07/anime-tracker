import { createAnime } from '../domain/anime.js';

/**
 * JsonFileAdapter — loads/serialises anime data from/to JSON files via fetch.
 *
 * @implements {import('../ports/animeRepository.js').AnimeRepository}
 */
export class JsonFileAdapter {
  /**
   * @param {string} [basePath='/anime-tracker/'] - Base path for data file URLs.
   */
  constructor(basePath = '/anime-tracker/') {
    /** @type {string} */
    this.basePath = basePath;
  }

  /**
   * Load the watchlist from `data/anime.json`.
   *
   * @returns {Promise<Array<import('../domain/anime.js').Anime>>}
   * @throws {Error} If the fetch response is not OK.
   */
  async loadWatchlist() {
    const response = await fetch(`${this.basePath}data/anime.json`);

    if (!response.ok) {
      throw new Error(`Failed to load watchlist: ${response.status}`);
    }

    const data = await response.json();
    return (data.watched || []).map((item) => createAnime(item));
  }

  /**
   * Load German title mappings from `data/de-titles.json`.
   *
   * @returns {Promise<Record<number, string>>}
   */
  async loadDeTitles() {
    try {
      const response = await fetch(`${this.basePath}data/de-titles.json`);

      if (!response.ok) {
        return {};
      }

      return await response.json();
    } catch {
      return {};
    }
  }

  /**
   * Serialise the watchlist to a pretty-printed JSON string.
   *
   * @param {Array<import('../domain/anime.js').Anime>} watchlist
   * @returns {string}
   */
  exportWatchlist(watchlist) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const lastUpdated = `${yyyy}-${mm}-${dd}`;

    return JSON.stringify(
      {
        version: 1,
        last_updated: lastUpdated,
        watched: watchlist,
      },
      null,
      2,
    );
  }

  /**
   * Serialise a German-title mapping to a pretty-printed JSON string.
   *
   * @param {Record<number, string>} mapping
   * @returns {string}
   */
  saveDeTitles(mapping) {
    return JSON.stringify(mapping, null, 2);
  }
}
