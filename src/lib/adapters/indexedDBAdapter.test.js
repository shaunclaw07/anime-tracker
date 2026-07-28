import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { IndexedDBAdapter } from './indexedDBAdapter.js';

describe('IndexedDBAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new IndexedDBAdapter();
  });

  describe('loadWatchlist()', () => {
    it('returns empty array when DB is empty', async () => {
      expect(await adapter.loadWatchlist()).toEqual([]);
    });

    it('returns data previously saved', async () => {
      const data = [{ anilist_id: 1, title_romaji: 'Cowboy Bebop' }];
      await adapter.saveWatchlist(data);
      expect(await adapter.loadWatchlist()).toEqual(data);
    });
  });

  describe('saveWatchlist()', () => {
    it('persists and can be read back', async () => {
      const data = [{ anilist_id: 1, title_romaji: 'Cowboy Bebop' }];
      await adapter.saveWatchlist(data);
      expect(await adapter.loadWatchlist()).toEqual(data);
    });

    it('overwrites on second save', async () => {
      await adapter.saveWatchlist([{ anilist_id: 1, title_romaji: 'Old' }]);
      await adapter.saveWatchlist([{ anilist_id: 2, title_romaji: 'New' }]);
      expect(await adapter.loadWatchlist()).toEqual([{ anilist_id: 2, title_romaji: 'New' }]);
    });
  });

  describe('exportWatchlist()', () => {
    it('returns valid JSON with expected keys', () => {
      const output = adapter.exportWatchlist([{ anilist_id: 1 }]);
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('version', 1);
      expect(parsed).toHaveProperty('last_updated');
      expect(parsed).toHaveProperty('watched');
    });

    it('handles empty watchlist', () => {
      const parsed = JSON.parse(adapter.exportWatchlist([]));
      expect(parsed.watched).toEqual([]);
    });
  });
});
