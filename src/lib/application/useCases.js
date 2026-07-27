import { addAnime, removeAnime, toggleWatchedBy, setRating } from '../domain/watchlist.js';
import { filterAnime } from '../domain/filters.js';

/**
 * createUseCases — Creates application use cases connected to a state store.
 * Speichert automatisch in localStorage nach jeder Änderung.
 *
 * @param {{ getState: () => object, setState: (partial: object) => void }} state
 * @param {{ saveWatchlist: (Array) => void, saveDeTitles: (object) => void, exportWatchlist: (Array) => string }} storageAdapter
 * @returns {object} Use case functions.
 */
export function createUseCases(state, storageAdapter) {

  /** Speichert aktuelle Watchlist + Titel in localStorage */
  function persist() {
    const { watchlist, deTitles } = state.getState();
    storageAdapter.saveWatchlist(watchlist);
    storageAdapter.saveDeTitles(deTitles);
  }

  return {
    /**
     * Adds an anime to the watchlist.
     */
    addAnimeToList(data, watchedBy) {
      const { watchlist } = state.getState();
      const newList = addAnime(watchlist, { ...data }, watchedBy);
      state.setState({ watchlist: newList });
      persist();
    },

    /**
     * Removes an anime from the watchlist by anilist_id.
     */
    removeAnimeFromList(anilistId) {
      const { watchlist } = state.getState();
      const newList = removeAnime(watchlist, anilistId);
      state.setState({ watchlist: newList });
      persist();
    },

    /**
     * Toggles a viewer for an anime.
     */
    toggleViewer(anilistId, user) {
      const { watchlist } = state.getState();
      const newList = toggleWatchedBy(watchlist, anilistId, user);
      state.setState({ watchlist: newList });
      persist();
    },

    /**
     * Updates the rating for a user on an anime.
     */
    updateRating(anilistId, user, score) {
      const { watchlist } = state.getState();
      const newList = setRating(watchlist, anilistId, user, score);
      state.setState({ watchlist: newList });
      persist();
    },

    /**
     * Sets filter criteria.
     */
    setFilters(filters) {
      state.setState({ filters });
    },

    /**
     * Updates German title mappings (merge) + speichert.
     */
    updateDeTitles(mapping) {
      const { deTitles } = state.getState();
      state.setState({ deTitles: { ...deTitles, ...mapping } });
      persist();
    },

    /**
     * Returns the filtered version of the current watchlist.
     */
    getFilteredWatchlist() {
      const { watchlist, filters } = state.getState();
      return filterAnime(watchlist, filters || {});
    },

    /**
     * Triggers download of watchlist + de-titles as JSON files (Backup).
     */
    exportDownload() {
      const { watchlist, deTitles } = state.getState();
      triggerDownload(storageAdapter.exportWatchlist(watchlist), 'anime.json');
      triggerDownload(storageAdapter.exportDeTitles(deTitles), 'de-titles.json');
    },
  };
}

/**
 * Triggers a browser download.
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
