import { addAnime, removeAnime, toggleWatchedBy, togglePinned, setRating, setEpisodeProgress, setTags, setNotes } from '../domain/watchlist.js';
import { filterAnime } from '../domain/filters.js';
import { getUsers } from '../config.js';
import type { Store } from './state.js';
import type { Anime } from '../domain/anime.js';

/** Minimal storage adapter interface used by useCases */
interface StorageAdapter {
  saveWatchlist: (watchlist: Anime[]) => void | Promise<void>;
  exportWatchlist: (watchlist: Anime[]) => string;
}

/**
 * createUseCases — All application use cases.
 *
 * @param state - Global state store
 * @param storageAdapter - Persistence adapter (IndexedDB)
 * @returns Object with all use case methods
 */
export function createUseCases(state: Store<Record<string, unknown>>, storageAdapter: StorageAdapter) {
  function persist(): void {
    storageAdapter.saveWatchlist((state.getState() as { watchlist: Anime[] }).watchlist);
  }

  return {
    addAnimeToList(data: Record<string, unknown>, watchedBy: string): void {
      const { watchlist } = state.getState() as { watchlist: Anime[] };
      const newList = addAnime(watchlist, data as unknown as Anime, watchedBy);
      state.setState({ watchlist: newList } as Record<string, unknown>);
      persist();
    },

    removeAnimeFromList(anilistId: number): void {
      const { watchlist } = state.getState() as { watchlist: Anime[] };
      const newList = removeAnime(watchlist, anilistId);
      state.setState({ watchlist: newList } as Record<string, unknown>);
      persist();
    },

    toggleViewer(anilistId: number, user: string): void {
      const { watchlist } = state.getState() as { watchlist: Anime[] };
      const newList = toggleWatchedBy(watchlist, anilistId, user);
      state.setState({ watchlist: newList } as Record<string, unknown>);
      persist();
    },

    togglePinned(anilistId: number): void {
      const s = state.getState() as { watchlist: Anime[] };
      const users = getUsers();
      const user = users[0];
      const updated = togglePinned(s.watchlist, anilistId, user);
      state.setState({ ...s, watchlist: updated } as Record<string, unknown>);
      persist();
    },

    setEpisodeProgress(anilistId: number, episode: number): void {
      const s = state.getState() as { watchlist: Anime[] };
      const updated = setEpisodeProgress(s.watchlist, anilistId, episode);
      state.setState({ ...s, watchlist: updated } as Record<string, unknown>);
      storageAdapter.saveWatchlist(updated);
    },

    setTags(anilistId: number, tags: string[]): void {
      const s = state.getState() as { watchlist: Anime[] };
      const updated = setTags(s.watchlist, anilistId, tags);
      state.setState({ ...s, watchlist: updated } as Record<string, unknown>);
      storageAdapter.saveWatchlist(updated);
    },

    setNotes(anilistId: number, notes: string): void {
      const s = state.getState() as { watchlist: Anime[] };
      const updated = setNotes(s.watchlist, anilistId, notes);
      state.setState({ ...s, watchlist: updated } as Record<string, unknown>);
      storageAdapter.saveWatchlist(updated);
    },

    updateRating(anilistId: number, user: string, score: number): void {
      const { watchlist } = state.getState() as { watchlist: Anime[] };
      const newList = setRating(watchlist, anilistId, user, score);
      state.setState({ watchlist: newList } as Record<string, unknown>);
      persist();
    },

    setFilters(filters: Record<string, unknown>): void {
      state.setState({ filters } as Record<string, unknown>);
    },

    setSorting(sortBy: string, sortOrder: string): void {
      state.setState({ sortBy, sortOrder } as Record<string, unknown>);
    },

    getFilteredWatchlist(): Anime[] {
      const { watchlist, filters } = state.getState() as { watchlist: Anime[]; filters?: Record<string, unknown> };
      return filterAnime(watchlist, (filters || {}) as Parameters<typeof filterAnime>[1]);
    },

    exportDownload(): void {
      const { watchlist } = state.getState() as { watchlist: Anime[] };
      triggerDownload(storageAdapter.exportWatchlist(watchlist), 'anime.json');
    },
  };
}

function triggerDownload(jsonString: string, filename: string): void {
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
