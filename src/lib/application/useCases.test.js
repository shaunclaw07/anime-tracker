import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createUseCases } from './useCases.js';

/* ------------------------------------------------------------------ */
/*  Helper: createMockState                                            */
/* ------------------------------------------------------------------ */

function createMockState(initial = {}) {
  let state = { watchlist: [], filters: {}, ...initial };
  return {
    getState: vi.fn(() => state),
    setState: vi.fn((partial) => {
      state = { ...state, ...partial };
    }),
  };
}

/* ------------------------------------------------------------------ */
/*  Sample anime data                                                  */
/* ------------------------------------------------------------------ */

const cowboyBebop = {
  anilist_id: 1,
  title_romaji: 'Cowboy Bebop',
  title_english: 'Cowboy Bebop',
  genres: ['Action', 'Sci-Fi'],
  average_score: 86,
  episodes: 26,
  format: 'TV',
};

const trigun = {
  anilist_id: 2,
  title_romaji: 'Trigun',
  title_english: 'Trigun',
  genres: ['Action', 'Sci-Fi'],
  average_score: 80,
  episodes: 26,
  format: 'TV',
};

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('createUseCases', () => {
  let state;
  let storageAdapter;
  let useCases;

  beforeEach(() => {
    state = createMockState();
    storageAdapter = {
      saveWatchlist: vi.fn(),
      exportWatchlist: vi.fn(() => '{}'),
    };

    // Mock browser APIs used by triggerDownload()
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.stubGlobal('document', {
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      createElement: vi.fn(() => mockAnchor),
    });
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:fake'),
      revokeObjectURL: vi.fn(),
    });

    useCases = createUseCases(state, storageAdapter);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /* ----- addAnimeToList ----- */

  describe('addAnimeToList()', () => {
    it('adds an anime to the watchlist and persists', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      const list = state.getState().watchlist;
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject({
        anilist_id: 1,
        title_romaji: 'Cowboy Bebop',
      });
      expect(list[0].watched_by).toEqual(['chrischi']);
      expect(storageAdapter.saveWatchlist).toHaveBeenCalledWith(list);
    });

    it('adds multiple anime with different watchers', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.addAnimeToList(trigun, 'michelle');

      const list = state.getState().watchlist;
      expect(list).toHaveLength(2);
      expect(storageAdapter.saveWatchlist).toHaveBeenCalledTimes(2);
    });
  });

  /* ----- removeAnimeFromList ----- */

  describe('removeAnimeFromList()', () => {
    it('removes an anime from the watchlist and persists', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.addAnimeToList(trigun, 'chrischi');

      useCases.removeAnimeFromList(1);

      const list = state.getState().watchlist;
      expect(list).toHaveLength(1);
      expect(list[0].anilist_id).toBe(2);
      expect(storageAdapter.saveWatchlist).toHaveBeenCalled();
    });

    it('does nothing when anime is not in the list', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.removeAnimeFromList(999);

      const list = state.getState().watchlist;
      expect(list).toHaveLength(1);
      expect(storageAdapter.saveWatchlist).toHaveBeenCalledTimes(2);
    });
  });

  /* ----- toggleViewer ----- */

  describe('toggleViewer()', () => {
    it('adds a user to watched_by when not present', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.toggleViewer(1, 'michelle');

      const list = state.getState().watchlist;
      expect(list[0].watched_by).toEqual(['chrischi', 'michelle']);
    });

    it('removes a user from watched_by when already present', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.toggleViewer(1, 'chrischi');

      const list = state.getState().watchlist;
      expect(list[0].watched_by).toEqual([]);
    });

    it('persists after toggling', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.toggleViewer(1, 'michelle');

      expect(storageAdapter.saveWatchlist).toHaveBeenCalledTimes(2);
    });
  });

  /* ----- setEpisodeProgress ----- */

  describe('setEpisodeProgress()', () => {
    it('sets watched_episodes on an anime and persists', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.setEpisodeProgress(1, 5);

      const list = state.getState().watchlist;
      expect(list[0].watched_episodes).toBe(5);
      expect(storageAdapter.saveWatchlist).toHaveBeenCalledTimes(2);
    });
  });

  /* ----- updateRating ----- */

  describe('updateRating()', () => {
    it('sets a rating for a user on an anime', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.updateRating(1, 'chrischi', 8);

      const list = state.getState().watchlist;
      expect(list[0].ratings).toEqual([{ user: 'chrischi', score: 8 }]);
    });

    it('updates an existing rating for the same user', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.updateRating(1, 'chrischi', 8);
      useCases.updateRating(1, 'chrischi', 9);

      const list = state.getState().watchlist;
      expect(list[0].ratings).toEqual([{ user: 'chrischi', score: 9 }]);
    });

    it('persists after updating rating', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.updateRating(1, 'chrischi', 7);

      expect(storageAdapter.saveWatchlist).toHaveBeenCalledTimes(2);
    });
  });

  /* ----- setFilters ----- */

  describe('setFilters()', () => {
    it('sets filters in state', () => {
      const filters = { query: 'Cowboy', watchedBy: 'chrischi' };

      useCases.setFilters(filters);

      expect(state.getState().filters).toEqual(filters);
    });

    it('does not persist (filters are local only)', () => {
      useCases.setFilters({ query: 'test' });

      expect(storageAdapter.saveWatchlist).not.toHaveBeenCalled();
    });
  });

  /* ----- setSorting ----- */

  describe('setSorting()', () => {
    it('updates sortBy and sortOrder in state', () => {
      useCases.setSorting('title', 'asc');

      const s = state.getState();
      expect(s.sortBy).toBe('title');
      expect(s.sortOrder).toBe('asc');
    });

    it('does not persist (sorting is local only)', () => {
      useCases.setSorting('score', 'desc');

      expect(storageAdapter.saveWatchlist).not.toHaveBeenCalled();
    });
  });

  /* ----- togglePinned ----- */

  describe('togglePinned()', () => {
    it('toggles pinned state for an anime and persists', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.togglePinned(1);
      expect(state.getState().watchlist[0].pinned_by).toContain('chrischi');
      expect(storageAdapter.saveWatchlist).toHaveBeenCalled();
    });

    it('unpins a previously pinned anime', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.togglePinned(1); // pin
      useCases.togglePinned(1); // unpin
      expect(state.getState().watchlist[0].pinned_by).toEqual([]);
    });
  });

  /* ----- setNotes ----- */

  describe('setNotes()', () => {
    it('sets notes on an anime and persists', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.setNotes(1, 'Meine persönliche Notiz');

      const list = state.getState().watchlist;
      expect(list[0].notes).toBe('Meine persönliche Notiz');
      expect(storageAdapter.saveWatchlist).toHaveBeenCalled();
    });

    it('overwrites existing notes', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.setNotes(1, 'Erste Notiz');
      useCases.setNotes(1, 'Zweite Notiz');

      expect(state.getState().watchlist[0].notes).toBe('Zweite Notiz');
    });
  });

  /* ----- getFilteredWatchlist ----- */

  describe('getFilteredWatchlist()', () => {
    it('returns the full watchlist when no filters are set', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.addAnimeToList(trigun, 'chrischi');

      const result = useCases.getFilteredWatchlist();

      expect(result).toHaveLength(2);
    });

    it('filters by query text', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.addAnimeToList(trigun, 'chrischi');
      useCases.setFilters({ query: 'Trigun' });

      const result = useCases.getFilteredWatchlist();

      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(2);
    });

    it('filters by watchedBy', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.addAnimeToList(trigun, 'michelle');
      useCases.setFilters({ watchedBy: 'chrischi' });

      const result = useCases.getFilteredWatchlist();

      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(1);
    });

    it('filters by genre', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      const romanceAnime = {
        anilist_id: 3,
        title_romaji: 'Your Lie in April',
        genres: ['Romance', 'Drama'],
      };
      useCases.addAnimeToList(romanceAnime, 'chrischi');
      useCases.setFilters({ genres: ['Romance'] });

      const result = useCases.getFilteredWatchlist();

      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(3);
    });

    it('filters by unwatchedOnly', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      const unwatchedAnime = {
        anilist_id: 3,
        title_romaji: 'Your Lie in April',
        genres: ['Romance'],
      };
      useCases.addAnimeToList(unwatchedAnime, 'chrischi');
      useCases.removeAnimeFromList(3);
      useCases.setFilters({ unwatchedOnly: true });

      const result = useCases.getFilteredWatchlist();

      // cowboyBebop (watched_by: ['chrischi']) raus, only unwatched bleibt
      expect(result).toHaveLength(0);
    });
  });

  /* ----- exportDownload ----- */

  describe('exportDownload()', () => {
    it('calls storageAdapter.exportWatchlist with current watchlist', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');
      useCases.addAnimeToList(trigun, 'michelle');

      useCases.exportDownload();

      const list = state.getState().watchlist;
      expect(storageAdapter.exportWatchlist).toHaveBeenCalledWith(list);
    });

    it('creates a download link and clicks it', () => {
      useCases.addAnimeToList(cowboyBebop, 'chrischi');

      useCases.exportDownload();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });
});
