/**
 * LocalStorageAdapter — Speichert die Watchlist im Browser localStorage.
 * Gleiche API wie JsonFileAdapter (loadWatchlist, loadDeTitles, saveWatchlist, saveDeTitles)
 */

const WATCHLIST_KEY = 'anime-tracker-watchlist';
const DE_TITLES_KEY = 'anime-tracker-de-titles';

export class LocalStorageAdapter {
  /**
   * Lädt die Watchlist aus localStorage.
   * @returns {Promise<Array>}
   */
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

  /**
   * Lädt die deutschen Titel aus localStorage.
   * @returns {Promise<Record<string, string>>}
   */
  async loadDeTitles() {
    try {
      const raw = localStorage.getItem(DE_TITLES_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }

  /**
   * Speichert die Watchlist in localStorage.
   * @param {Array} watchlist
   */
  saveWatchlist(watchlist) {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage:', e);
    }
  }

  /**
   * Speichert die deutschen Titel in localStorage.
   * @param {Record<string, string>} mapping
   */
  saveDeTitles(mapping) {
    try {
      localStorage.setItem(DE_TITLES_KEY, JSON.stringify(mapping));
    } catch (e) {
      console.error('Failed to save de-titles to localStorage:', e);
    }
  }

  /**
   * Exportiert die Watchlist als JSON-String (für Download-Backup).
   * @param {Array} watchlist
   * @returns {string}
   */
  exportWatchlist(watchlist) {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return JSON.stringify({ version: 1, last_updated: date, watched: watchlist }, null, 2);
  }

  /**
   * Exportiert die deutschen Titel als JSON-String (für Download-Backup).
   * @param {Record<string, string>} mapping
   * @returns {string}
   */
  exportDeTitles(mapping) {
    return JSON.stringify(mapping, null, 2);
  }
}
