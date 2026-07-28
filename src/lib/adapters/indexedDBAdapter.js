/**
 * IndexedDBAdapter — Speichert die Watchlist in IndexedDB.
 * Unbegrenzter Speicher, kein 5MB-Limit wie localStorage.
 */

const DB_NAME = 'anime-tracker';
const STORE_NAME = 'watchlist';
const DB_VERSION = 1;
const WATCHLIST_KEY = 'watchlist';

export class IndexedDBAdapter {
  constructor() {
    this._db = null;
  }

  /** Öffnet (oder gecached) die IndexedDB-Datenbank */
  async _getDb() {
    if (this._db) return this._db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (event) => {
        this._db = event.target.result;
        resolve(this._db);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  /**
   * Lädt die Watchlist aus IndexedDB.
   * @returns {Promise<Array>}
   */
  async loadWatchlist() {
    try {
      const db = await this._getDb();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      return new Promise((resolve) => {
        const request = store.get(WATCHLIST_KEY);
        request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Speichert die komplette Watchlist in IndexedDB.
   * @param {Array} watchlist
   */
  async saveWatchlist(watchlist) {
    try {
      const db = await this._getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(watchlist, WATCHLIST_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target?.error || new Error('save failed'));
      });
    } catch (e) {
      console.error('IndexedDB save failed:', e);
    }
  }

  /**
   * Exportiert die Watchlist als JSON-String (für Download).
   * @param {Array} watchlist
   * @returns {string}
   */
  exportWatchlist(watchlist) {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return JSON.stringify({ version: 1, last_updated: date, watched: watchlist }, null, 2);
  }
}
