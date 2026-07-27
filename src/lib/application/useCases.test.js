import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createUseCases } from './useCases.js';

// Helper to create a mock state
function createMockState(initial = {}) {
  let state = { watchlist: [], deTitles: {}, filters: {}, ...initial };
  const listeners = new Set();
  return {
    getState: vi.fn(() => state),
    setState: vi.fn((partial) => {
      state = { ...state, ...partial };
      listeners.forEach((fn) => fn(state));
    }),
    subscribe: vi.fn((fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }),
  };
}

describe('createUseCases', () => {
  let state;
  let useCases;
  let mockStorage;

  beforeEach(() => {
    state = createMockState();
    mockStorage = {
      saveWatchlist: vi.fn(),
      saveDeTitles: vi.fn(),
      exportWatchlist: vi.fn(() => '{}'),
      exportDeTitles: vi.fn(() => '{}'),
    };
    useCases = createUseCases(state, mockStorage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('addAnimeToList', () => {
    it('adds an anime to the watchlist via state.setState', () => {
      const data = {
        anilist_id: 1,
        title_romaji: 'Cowboy Bebop',
        genres: ['Action'],
        average_score: 86,
      };
      useCases.addAnimeToList(data, 'chrischi');
      expect(state.setState).toHaveBeenCalledTimes(1);
      const newState = state.setState.mock.calls[0][0];
      expect(newState.watchlist).toHaveLength(1);
      expect(newState.watchlist[0].anilist_id).toBe(1);
      expect(newState.watchlist[0].watched_by).toEqual(['chrischi']);
    });

    it('throws when anime already exists', () => {
      state.getState.mockReturnValue({
        watchlist: [{ anilist_id: 1, title_romaji: 'Existing' }],
        deTitles: {},
        filters: {},
      });
      expect(() =>
        useCases.addAnimeToList({ anilist_id: 1, title_romaji: 'Duplicate' }, 'chrischi'),
      ).toThrow('already exists');
    });
  });

  describe('removeAnimeFromList', () => {
    it('removes an anime by anilist_id and updates state', () => {
      state.getState.mockReturnValue({
        watchlist: [
          { anilist_id: 1, title_romaji: 'A' },
          { anilist_id: 2, title_romaji: 'B' },
        ],
        deTitles: {},
        filters: {},
      });
      useCases.removeAnimeFromList(1);
      expect(state.setState).toHaveBeenCalledTimes(1);
      const newState = state.setState.mock.calls[0][0];
      expect(newState.watchlist).toHaveLength(1);
      expect(newState.watchlist[0].anilist_id).toBe(2);
    });
  });

  describe('toggleViewer', () => {
    it('toggles a user in watched_by and updates state', () => {
      state.getState.mockReturnValue({
        watchlist: [
          { anilist_id: 1, title_romaji: 'A', watched_by: ['chrischi'] },
        ],
        deTitles: {},
        filters: {},
      });
      useCases.toggleViewer(1, 'michelle');
      expect(state.setState).toHaveBeenCalledTimes(1);
      const newState = state.setState.mock.calls[0][0];
      expect(newState.watchlist[0].watched_by).toContain('chrischi');
      expect(newState.watchlist[0].watched_by).toContain('michelle');
    });

    it('removes user from watched_by when already present', () => {
      state.getState.mockReturnValue({
        watchlist: [
          {
            anilist_id: 1,
            title_romaji: 'A',
            watched_by: ['chrischi', 'michelle'],
          },
        ],
        deTitles: {},
        filters: {},
      });
      useCases.toggleViewer(1, 'chrischi');
      const newState = state.setState.mock.calls[0][0];
      expect(newState.watchlist[0].watched_by).not.toContain('chrischi');
      expect(newState.watchlist[0].watched_by).toContain('michelle');
    });
  });

  describe('updateRating', () => {
    it('sets a rating for a user and updates state', () => {
      state.getState.mockReturnValue({
        watchlist: [{ anilist_id: 1, title_romaji: 'A' }],
        deTitles: {},
        filters: {},
      });
      useCases.updateRating(1, 'chrischi', 8);
      expect(state.setState).toHaveBeenCalledTimes(1);
      const newState = state.setState.mock.calls[0][0];
      expect(newState.watchlist[0].ratings).toEqual([
        { user: 'chrischi', score: 8 },
      ]);
    });

    it('updates an existing rating', () => {
      state.getState.mockReturnValue({
        watchlist: [
          {
            anilist_id: 1,
            title_romaji: 'A',
            ratings: [{ user: 'chrischi', score: 9 }],
          },
        ],
        deTitles: {},
        filters: {},
      });
      useCases.updateRating(1, 'chrischi', 7);
      const newState = state.setState.mock.calls[0][0];
      expect(newState.watchlist[0].ratings).toEqual([
        { user: 'chrischi', score: 7 },
      ]);
    });
  });

  describe('setFilters', () => {
    it('sets filters in state', () => {
      useCases.setFilters({ query: 'Naruto', watchedBy: 'both' });
      expect(state.setState).toHaveBeenCalledWith({
        filters: { query: 'Naruto', watchedBy: 'both' },
      });
    });
  });

  describe('updateDeTitles', () => {
    it('merges a mapping into deTitles in state', () => {
      state.getState.mockReturnValue({
        watchlist: [],
        deTitles: { 1: 'Existing DE' },
        filters: {},
      });
      useCases.updateDeTitles({ 2: 'New DE' });
      expect(state.setState).toHaveBeenCalledWith({
        deTitles: { 1: 'Existing DE', 2: 'New DE' },
      });
    });

    it('overwrites existing deTitle entries', () => {
      state.getState.mockReturnValue({
        watchlist: [],
        deTitles: { 1: 'Old DE' },
        filters: {},
      });
      useCases.updateDeTitles({ 1: 'Updated DE' });
      expect(state.setState).toHaveBeenCalledWith({
        deTitles: { 1: 'Updated DE' },
      });
    });
  });

  describe('getFilteredWatchlist', () => {
    it('returns the full watchlist when no filters are set', () => {
      state.getState.mockReturnValue({
        watchlist: [
          { anilist_id: 1, title_romaji: 'A' },
          { anilist_id: 2, title_romaji: 'B' },
        ],
        deTitles: {},
        filters: {},
      });
      const result = useCases.getFilteredWatchlist();
      expect(result).toHaveLength(2);
    });

    it('filters by query text', () => {
      state.getState.mockReturnValue({
        watchlist: [
          { anilist_id: 1, title_romaji: 'Naruto' },
          { anilist_id: 2, title_romaji: 'Bleach' },
        ],
        deTitles: {},
        filters: { query: 'Naruto' },
      });
      const result = useCases.getFilteredWatchlist();
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(1);
    });
  });

  describe('exportDownload', () => {
    beforeEach(() => {
      // Mock browser APIs
      class MockBlob {}
      global.Blob = MockBlob;
      global.URL = {
        createObjectURL: vi.fn(() => 'blob:fake'),
        revokeObjectURL: vi.fn(),
      };
      global.document = {
        createElement: vi.fn(() => ({
          href: '',
          download: '',
          click: vi.fn(),
          remove: vi.fn(),
        })),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };
    });

    afterEach(() => {
      delete global.Blob;
      delete global.URL;
      delete global.document;
    });

    it('creates download links for watchlist and de-titles', () => {
      state.getState.mockReturnValue({
        watchlist: [{ anilist_id: 1, title_romaji: 'A', watched_by: ['chrischi'] }],
        deTitles: { 1: 'A DE' },
        filters: {},
      });
      useCases.exportDownload();
      expect(document.createElement).toHaveBeenCalledWith('a');
      // Should create at least one download link
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('calls click on the download link', () => {
      state.getState.mockReturnValue({
        watchlist: [{ anilist_id: 1, title_romaji: 'A', watched_by: ['chrischi'] }],
        deTitles: { 1: 'A DE' },
        filters: {},
      });
      useCases.exportDownload();
      const link = document.createElement.mock.results[0].value;
      expect(link.click).toHaveBeenCalled();
    });
  });
});
