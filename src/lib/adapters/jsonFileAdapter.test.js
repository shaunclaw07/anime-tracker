import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JsonFileAdapter } from './jsonFileAdapter.js';
import { createAnime } from '../domain/anime.js';

/* ------------------------------------------------------------------ */
/*  Helper: mockFetch                                                    */
/* ------------------------------------------------------------------ */
function mockFetch(responseBody, ok = true, status = 200) {
  return async () => ({
    ok,
    status,
    json: async () => responseBody,
  });
}

/* ------------------------------------------------------------------ */
/*  Sample data                                                         */
/* ------------------------------------------------------------------ */
const sampleWatchlistData = {
  version: 1,
  last_updated: '2026-07-27',
  watched: [
    {
      anilist_id: 1,
      title_romaji: 'Cowboy Bebop',
      title_english: 'Cowboy Bebop',
      genres: ['Action', 'Sci-Fi'],
      average_score: 86,
      episodes: 26,
      format: 'TV',
      watched_by: ['chrischi', 'michelle'],
    },
    {
      anilist_id: 5,
      title_romaji: 'Cowboy Bebop: Tengoku no Tobira',
      title_english: 'Cowboy Bebop: The Movie',
      genres: ['Action', 'Sci-Fi'],
      average_score: 82,
      episodes: 1,
      format: 'Movie',
      watched_by: ['chrischi'],
    },
  ],
};

const sampleDeTitles = {
  1: 'Cowboy Bebop',
  5: 'Cowboy Bebop: Der Film',
};

/* ------------------------------------------------------------------ */
/*  Tests                                                                */
/* ------------------------------------------------------------------ */
describe('JsonFileAdapter', () => {
  let adapter;
  const basePath = '/anime-tracker/';

  beforeEach(() => {
    adapter = new JsonFileAdapter(basePath);
  });

  afterEach(() => {
    delete globalThis.fetch;
  });

  /* ----- loadWatchlist ----- */

  describe('loadWatchlist()', () => {
    it('loads the watchlist from anime.json and returns anime entities', async () => {
      globalThis.fetch = mockFetch(sampleWatchlistData);

      const result = await adapter.loadWatchlist();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        anilist_id: 1,
        title_romaji: 'Cowboy Bebop',
        title_english: 'Cowboy Bebop',
      });
      expect(result[1]).toMatchObject({
        anilist_id: 5,
        title_romaji: 'Cowboy Bebop: Tengoku no Tobira',
      });
    });

    it('returns an empty array when the watchlist is empty', async () => {
      globalThis.fetch = mockFetch({ version: 1, last_updated: '2026-07-27', watched: [] });

      const result = await adapter.loadWatchlist();

      expect(result).toEqual([]);
    });

    it('throws an error when the fetch fails', async () => {
      globalThis.fetch = mockFetch(null, false, 404);

      await expect(adapter.loadWatchlist()).rejects.toThrow();
    });

    it('fetches from the correct URL', async () => {
      let calledUrl = '';
      globalThis.fetch = async (url) => {
        calledUrl = url;
        return { ok: true, json: async () => ({ version: 1, last_updated: '2026-07-27', watched: [] }) };
      };

      await adapter.loadWatchlist();

      expect(calledUrl).toBe(`${basePath}data/anime.json`);
    });
  });

  /* ----- loadDeTitles ----- */

  describe('loadDeTitles()', () => {
    it('loads German title mappings from de-titles.json', async () => {
      globalThis.fetch = mockFetch(sampleDeTitles);

      const result = await adapter.loadDeTitles();

      expect(result).toEqual(sampleDeTitles);
      expect(result[1]).toBe('Cowboy Bebop');
      expect(result[5]).toBe('Cowboy Bebop: Der Film');
    });

    it('returns an empty object when the fetch fails (graceful degradation)', async () => {
      globalThis.fetch = mockFetch(null, false, 404);

      const result = await adapter.loadDeTitles();

      expect(result).toEqual({});
    });

    it('fetches from the correct URL', async () => {
      let calledUrl = '';
      globalThis.fetch = async (url) => {
        calledUrl = url;
        return { ok: true, json: async () => ({}) };
      };

      await adapter.loadDeTitles();

      expect(calledUrl).toBe(`${basePath}data/de-titles.json`);
    });
  });

  /* ----- exportWatchlist ----- */

  describe('exportWatchlist()', () => {
    it('returns a valid JSON string', () => {
      const anime1 = createAnime({
        anilist_id: 1,
        title_romaji: 'Cowboy Bebop',
        watched_by: ['chrischi'],
      });

      const output = adapter.exportWatchlist([anime1]);

      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('contains version, last_updated, and watched keys', () => {
      const anime1 = createAnime({
        anilist_id: 1,
        title_romaji: 'Cowboy Bebop',
        watched_by: ['chrischi'],
      });

      const output = adapter.exportWatchlist([anime1]);
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('version', 1);
      expect(parsed).toHaveProperty('last_updated');
      expect(parsed).toHaveProperty('watched');
      expect(parsed.watched).toHaveLength(1);
    });

    it('formats the JSON with indentation', () => {
      const output = adapter.exportWatchlist([]);

      // Pretty-printed JSON has newlines
      expect(output).toContain('\n');
    });

    it('includes watched anime data in the watched array', () => {
      const anime1 = createAnime({
        anilist_id: 1,
        title_romaji: 'Cowboy Bebop',
        title_english: 'Cowboy Bebop',
        genres: ['Action', 'Sci-Fi'],
        watched_by: ['chrischi', 'michelle'],
      });

      const output = adapter.exportWatchlist([anime1]);
      const parsed = JSON.parse(output);

      expect(parsed.watched[0]).toMatchObject({
        anilist_id: 1,
        title_romaji: 'Cowboy Bebop',
        watched_by: ['chrischi', 'michelle'],
      });
    });
  });

  /* ----- saveDeTitles ----- */

  describe('saveDeTitles()', () => {
    it('returns a valid JSON string', () => {
      const output = adapter.saveDeTitles({ 1: 'Cowboy Bebop' });

      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('contains the correct mapping', () => {
      const mapping = { 1: 'Cowboy Bebop', 5: 'Cowboy Bebop: Der Film' };
      const output = adapter.saveDeTitles(mapping);
      const parsed = JSON.parse(output);

      expect(parsed).toEqual(mapping);
    });

    it('handles an empty mapping', () => {
      const output = adapter.saveDeTitles({});
      const parsed = JSON.parse(output);

      expect(parsed).toEqual({});
    });

    it('formats the JSON with indentation', () => {
      const output = adapter.saveDeTitles({ 1: 'Cowboy Bebop' });

      expect(output).toContain('\n');
    });
  });

  /* ----- default basePath ----- */

  describe('default basePath', () => {
    it('defaults to /anime-tracker/ when no basePath is provided', () => {
      const defaultAdapter = new JsonFileAdapter();
      expect(defaultAdapter.basePath).toBe('/anime-tracker/');
    });
  });
});
