import { addAnime, removeAnime, toggleWatchedBy, setRating } from '../domain/watchlist.js';
import { filterAnime } from '../domain/filters.js';
import { JsonFileAdapter } from '../adapters/jsonFileAdapter.js';

/**
 * createUseCases — Creates application use cases connected to a state store.
 *
 * @param {{ getState: () => object, setState: (partial: object) => void }} state
 * @returns {object} Use case functions.
 */
export function createUseCases(state) {
  const adapter = new JsonFileAdapter();

  return {
    /**
     * Adds an anime to the watchlist.
     *
     * @param {object} data - Anime data (anilist_id, title_romaji, etc.).
     * @param {string} watchedBy - User who watched it.
     */
    addAnimeToList(data, watchedBy) {
      const { watchlist } = state.getState();
      const anime = { ...data };
      const newList = addAnime(watchlist, anime, watchedBy);
      state.setState({ watchlist: newList });
    },

    /**
     * Removes an anime from the watchlist by anilist_id.
     *
     * @param {number} anilistId - AniList ID to remove.
     */
    removeAnimeFromList(anilistId) {
      const { watchlist } = state.getState();
      const newList = removeAnime(watchlist, anilistId);
      state.setState({ watchlist: newList });
    },

    /**
     * Toggles a viewer for an anime.
     *
     * @param {number} anilistId - AniList ID.
     * @param {string} user - Username (chrischi/michelle).
     */
    toggleViewer(anilistId, user) {
      const { watchlist } = state.getState();
      const newList = toggleWatchedBy(watchlist, anilistId, user);
      state.setState({ watchlist: newList });
    },

    /**
     * Updates the rating for a user on an anime.
     *
     * @param {number} anilistId - AniList ID.
     * @param {string} user - Username.
     * @param {number} score - Rating (1-10).
     */
    updateRating(anilistId, user, score) {
      const { watchlist } = state.getState();
      const newList = setRating(watchlist, anilistId, user, score);
      state.setState({ watchlist: newList });
    },

    /**
     * Sets filter criteria.
     *
     * @param {object} filters - Filter object.
     */
    setFilters(filters) {
      state.setState({ filters });
    },

    /**
     * Updates German title mappings (merge).
     *
     * @param {Record<number, string>} mapping - New mappings to merge.
     */
    updateDeTitles(mapping) {
      const { deTitles } = state.getState();
      state.setState({ deTitles: { ...deTitles, ...mapping } });
    },

    /**
     * Returns the filtered version of the current watchlist.
     *
     * @returns {Array<object>} Filtered anime list.
     */
    getFilteredWatchlist() {
      const { watchlist, filters } = state.getState();
      return filterAnime(watchlist, filters || {});
    },

    /**
     * Triggers download of watchlist and German-titles as JSON files.
     * Uses browser Blob + download link APIs.
     */
    exportDownload() {
      const { watchlist, deTitles } = state.getState();
      const watchlistJson = adapter.exportWatchlist(watchlist);
      const deTitlesJson = adapter.saveDeTitles(deTitles);

      triggerDownload(watchlistJson, 'anime.json');
      triggerDownload(deTitlesJson, 'de-titles.json');
    },
  };
}

/**
 * Triggers a browser download of a JSON string as a file.
 *
 * @param {string} jsonString - JSON content.
 * @param {string} filename - Output filename.
 */
function triggerDownload(jsonString, filename) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
