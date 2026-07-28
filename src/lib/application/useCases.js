import { addAnime, removeAnime, toggleWatchedBy, togglePinned, setRating, setEpisodeProgress, setTags, setNotes } from '../domain/watchlist.js';
import { filterAnime } from '../domain/filters.js';
import { getUsers } from '../config.js';

export function createUseCases(state, storageAdapter) {
  function persist() {
    storageAdapter.saveWatchlist(state.getState().watchlist);
  }

  return {
    addAnimeToList(data, watchedBy) {
      const { watchlist } = state.getState();
      const newList = addAnime(watchlist, { ...data }, watchedBy);
      state.setState({ watchlist: newList });
      persist();
    },

    removeAnimeFromList(anilistId) {
      const { watchlist } = state.getState();
      const newList = removeAnime(watchlist, anilistId);
      state.setState({ watchlist: newList });
      persist();
    },

    toggleViewer(anilistId, user) {
      const { watchlist } = state.getState();
      const newList = toggleWatchedBy(watchlist, anilistId, user);
      state.setState({ watchlist: newList });
      persist();
    },

    togglePinned(anilistId) {
      const s = state.getState();
      const users = getUsers();
      const user = users[0];
      const updated = togglePinned(s.watchlist, anilistId, user);
      state.setState({ ...s, watchlist: updated });
      persist();
    },

    setEpisodeProgress(anilistId, episode) {
      const s = state.getState();
      const updated = setEpisodeProgress(s.watchlist, anilistId, episode);
      state.setState({ ...s, watchlist: updated });
      storageAdapter.saveWatchlist(updated);
    },

    setTags(anilistId, tags) {
      const s = state.getState();
      const updated = setTags(s.watchlist, anilistId, tags);
      state.setState({ ...s, watchlist: updated });
      storageAdapter.saveWatchlist(updated);
    },

    setNotes(anilistId, notes) {
      const s = state.getState();
      const updated = setNotes(s.watchlist, anilistId, notes);
      state.setState({ ...s, watchlist: updated });
      storageAdapter.saveWatchlist(updated);
    },

    updateRating(anilistId, user, score) {
      const { watchlist } = state.getState();
      const newList = setRating(watchlist, anilistId, user, score);
      state.setState({ watchlist: newList });
      persist();
    },

    setFilters(filters) {
      state.setState({ filters });
    },

    setSorting(sortBy, sortOrder) {
      state.setState({ sortBy, sortOrder });
    },

    getFilteredWatchlist() {
      const { watchlist, filters } = state.getState();
      return filterAnime(watchlist, filters || {});
    },

    exportDownload() {
      const { watchlist } = state.getState();
      triggerDownload(storageAdapter.exportWatchlist(watchlist), 'anime.json');
    },
  };
}

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
