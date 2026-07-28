import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { IndexedDBAdapter } from './indexedDBAdapter.js';

describe('IndexedDBAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new IndexedDBAdapter();
  });

  describe('loadWatchlist()', () => {
    it('returns an empty array when the database is empty', async () => {
      const result = await adapter.loadWatchlist();
      expect(result).toEqual([]);
    });

    it('returns data previously saved', async () => {
      const watchlist = [
        { anilist_id: 1, title_romaji: 'Cowboy Bebop' },
        { anilist_id: 5, title_romaji: 'Trigun' },
      ];
      await adapter.saveWatchlist(watchlist);
      const result = await adapter.loadWatchlist();
      expect(result).toEqual(watchlist);
    });
  });

  describe('saveWatchlist()', () => {
    it('persists data that can be read back', async () => {
      const watchlist = [
        { anilist_id: 1, title_romaji: 'Cowboy Bebop' },
      ];
      await adapter.saveWatchlist(watchlist);
      const result = await adapter.loadWatchlist();
      expect(result).toEqual(watchlist);
    });

    it('overwrites on second save', async () => {
      await adapter.saveWatchlist([{ anilist_id: 1, title_romaji: 'Old' }]);
      await adapter.saveWatchlist([{ anilist_id: 2, title_romaji: 'New' }]);
      const result = await adapter.loadWatchlist();
      expect(result).toEqual([{ anilist_id: 2, title_romaji: 'New' }]);
    });
  });

  describe('exportWatchlist()', () => {
    it('returns valid JSON', () => {
      const output = adapter.exportWatchlist([{ anilist_id: 1, title_romaji: 'Cowboy Bebop' }]);
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('contains version, last_updated, and watched', () => {
      const output = adapter.exportWatchlist([{ anilist_id: 1, title_romaji: 'Cowboy Bebop' }]);
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('version', 1);
      expect(parsed).toHaveProperty('last_updated');
      expect(parsed).toHaveProperty('watched');
    });

    it('handles empty list', () => {
      const output = adapter.exportWatchlist([]);
      const parsed = JSON.parse(output);
      expect(parsed.watched).toEqual([]);
    });
  });
});
