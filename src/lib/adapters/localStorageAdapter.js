/**
 * LocalStorageAdapter — Speichert die Watchlist im Browser localStorage.
 */

const WATCHLIST_KEY = 'anime-tracker-watchlist';

export class LocalStorageAdapter {
  async loadWatchlist() {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  saveWatchlist(watchlist) {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage:', e);
    }
  }

  exportWatchlist(watchlist) {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return JSON.stringify({ version: 1, last_updated: date, watched: watchlist }, null, 2);
  }
}
