import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageAdapter } from './localStorageAdapter.js';

/* ------------------------------------------------------------------ */
/*  Helper: fake localStorage                                          */
/* ------------------------------------------------------------------ */

function createFakeStorage() {
  const store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    get length() {
      return Object.keys(store).length;
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('LocalStorageAdapter', () => {
  let adapter;
  let fakeStorage;

  beforeEach(() => {
    fakeStorage = createFakeStorage();
    vi.stubGlobal('localStorage', fakeStorage);
    adapter = new LocalStorageAdapter();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /* ----- loadWatchlist ----- */

  describe('loadWatchlist()', () => {
    it('returns an empty array when localStorage is empty', async () => {
      const result = await adapter.loadWatchlist();

      expect(result).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith(
        'anime-tracker-watchlist',
      );
    });

    it('returns the watchlist array when valid JSON is stored', async () => {
      const watchlist = [
        { anilist_id: 1, title_romaji: 'Cowboy Bebop' },
        { anilist_id: 5, title_romaji: 'Trigun' },
      ];
      localStorage.setItem(
        'anime-tracker-watchlist',
        JSON.stringify(watchlist),
      );

      const result = await adapter.loadWatchlist();

      expect(result).toEqual(watchlist);
    });

    it('returns an empty array when stored JSON is invalid', async () => {
      localStorage.setItem('anime-tracker-watchlist', 'not-valid-json');

      const result = await adapter.loadWatchlist();

      expect(result).toEqual([]);
    });

    it('returns an empty array when stored value is not an array', async () => {
      localStorage.setItem(
        'anime-tracker-watchlist',
        JSON.stringify({ version: 1, watched: [] }),
      );

      const result = await adapter.loadWatchlist();

      expect(result).toEqual([]);
    });
  });

  /* ----- saveWatchlist ----- */

  describe('saveWatchlist()', () => {
    it('saves the watchlist as JSON in localStorage', () => {
      const watchlist = [
        { anilist_id: 1, title_romaji: 'Cowboy Bebop', watched_by: ['chrischi'] },
      ];

      adapter.saveWatchlist(watchlist);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'anime-tracker-watchlist',
        JSON.stringify(watchlist),
      );
    });

    it('persists data that can be read back with loadWatchlist', async () => {
      const watchlist = [
        { anilist_id: 1, title_romaji: 'Cowboy Bebop' },
      ];

      adapter.saveWatchlist(watchlist);
      const result = await adapter.loadWatchlist();

      expect(result).toEqual(watchlist);
    });
  });

  /* ----- exportWatchlist ----- */

  describe('exportWatchlist()', () => {
    it('returns a valid JSON string', () => {
      const watchlist = [
        { anilist_id: 1, title_romaji: 'Cowboy Bebop' },
      ];

      const output = adapter.exportWatchlist(watchlist);

      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('contains version, last_updated, and watched keys', () => {
      const watchlist = [
        { anilist_id: 1, title_romaji: 'Cowboy Bebop', watched_by: ['chrischi'] },
      ];

      const output = adapter.exportWatchlist(watchlist);
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('version', 1);
      expect(parsed).toHaveProperty('last_updated');
      expect(parsed).toHaveProperty('watched');
      expect(parsed.watched).toHaveLength(1);
    });

    it('includes the correct anime data in watched array', () => {
      const watchlist = [
        {
          anilist_id: 1,
          title_romaji: 'Cowboy Bebop',
          title_english: 'Cowboy Bebop',
          genres: ['Action', 'Sci-Fi'],
          watched_by: ['chrischi', 'michelle'],
        },
      ];

      const output = adapter.exportWatchlist(watchlist);
      const parsed = JSON.parse(output);

      expect(parsed.watched[0]).toMatchObject({
        anilist_id: 1,
        title_romaji: 'Cowboy Bebop',
        title_english: 'Cowboy Bebop',
        genres: ['Action', 'Sci-Fi'],
        watched_by: ['chrischi', 'michelle'],
      });
    });

    it('handles an empty watchlist', () => {
      const output = adapter.exportWatchlist([]);
      const parsed = JSON.parse(output);

      expect(parsed.watched).toEqual([]);
    });

    it('formats JSON with indentation', () => {
      const output = adapter.exportWatchlist([]);

      expect(output).toContain('\n');
    });
  });
});
