import { describe, it, expect } from 'vitest';
import { createAnime } from './anime.ts';
import {
  addAnime,
  removeAnime,
  toggleWatchedBy,
  togglePinned,
  setRating,
  setEpisodeProgress,
} from './watchlist.ts';

function makeAnime(overrides = {}) {
  return createAnime({
    anilist_id: overrides.anilist_id ?? Math.floor(Math.random() * 100000),
    title_romaji: overrides.title_romaji ?? 'Default Romaji',
    title_english: overrides.title_english,
    title_de: overrides.title_de,
    genres: overrides.genres,
    average_score: overrides.average_score,
    episodes: overrides.episodes,
    cover_url: overrides.cover_url,
    format: overrides.format,
    watched_by: overrides.watched_by,
    pinned_by: overrides.pinned_by,
    ratings: overrides.ratings,
    finished_at: overrides.finished_at,
  });
}

const aot = () =>
  makeAnime({
    anilist_id: 1,
    title_romaji: 'Shingeki no Kyojin',
    genres: ['Action'],
  });

const steins = () =>
  makeAnime({
    anilist_id: 2,
    title_romaji: 'Steins;Gate',
    genres: ['Sci-Fi'],
  });

describe('addAnime', () => {
  it('should add an anime to the watchlist', () => {
    const watchlist = [];
    const result = addAnime(watchlist, aot(), 'chrischi');
    expect(result).toHaveLength(1);
    expect(result[0].anilist_id).toBe(1);
    expect(result[0].watched_by).toEqual(['chrischi']);
  });

  it('should throw when adding a duplicate anilist_id', () => {
    const watchlist = [aot()];
    expect(() => addAnime(watchlist, aot(), 'chrischi')).toThrow(/already exists|Duplicate/i);
  });

  it('should not mutate the original array', () => {
    const watchlist = [aot()];
    const originalLength = watchlist.length;
    addAnime(watchlist, steins(), 'michelle');
    expect(watchlist).toHaveLength(originalLength);
  });

  it('should add anime with specified watched_by user', () => {
    const watchlist = [];
    const result = addAnime(watchlist, steins(), 'michelle');
    expect(result[0].watched_by).toEqual(['michelle']);
  });
});

describe('removeAnime', () => {
  it('should remove an anime by anilist_id', () => {
    const watchlist = [aot(), steins()];
    const result = removeAnime(watchlist, 1);
    expect(result).toHaveLength(1);
    expect(result[0].anilist_id).toBe(2);
  });

  it('should return the same array if anilist_id not found', () => {
    const watchlist = [aot()];
    const result = removeAnime(watchlist, 999);
    expect(result).toEqual(watchlist);
    expect(result).not.toBe(watchlist);
  });

  it('should return empty array when removing last item', () => {
    const watchlist = [aot()];
    const result = removeAnime(watchlist, 1);
    expect(result).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const watchlist = [aot(), steins()];
    removeAnime(watchlist, 1);
    expect(watchlist).toHaveLength(2);
  });
});

describe('toggleWatchedBy', () => {
  it('should add a user to watched_by if not present', () => {
    const watchlist = [aot()];
    const result = toggleWatchedBy(watchlist, 1, 'chrischi');
    expect(result[0].watched_by).toEqual(['chrischi']);
  });

  it('should remove a user from watched_by if already present', () => {
    const watchlist = [
      makeAnime({
        anilist_id: 1,
        title_romaji: 'AOT',
        watched_by: ['chrischi', 'michelle'],
      }),
    ];
    const result = toggleWatchedBy(watchlist, 1, 'chrischi');
    expect(result[0].watched_by).toEqual(['michelle']);
  });

  it('should throw if anilist_id not found', () => {
    const watchlist = [aot()];
    expect(() => toggleWatchedBy(watchlist, 999, 'chrischi')).toThrow(/not found/i);
  });

  it('should not mutate the original array', () => {
    const watchlist = [aot()];
    toggleWatchedBy(watchlist, 1, 'chrischi');
    expect(watchlist[0].watched_by).toBeUndefined();
  });
});

describe('togglePinned', () => {
  it('pins an anime for a user', () => {
    const watchlist = [aot()];
    const result = togglePinned(watchlist, 1, 'chrischi');
    expect(result[0].pinned_by).toEqual(['chrischi']);
  });

  it('unpins an anime for a user', () => {
    const watchlist = [
      makeAnime({
        anilist_id: 1,
        title_romaji: 'AOT',
        pinned_by: ['chrischi'],
      }),
    ];
    const result = togglePinned(watchlist, 1, 'chrischi');
    expect(result[0].pinned_by).toEqual([]);
  });

  it('pins for second user independently', () => {
    const watchlist = [
      makeAnime({
        anilist_id: 1,
        title_romaji: 'AOT',
        pinned_by: ['chrischi'],
      }),
    ];
    const result = togglePinned(watchlist, 1, 'michelle');
    expect(result[0].pinned_by).toEqual(['chrischi', 'michelle']);
  });

  it('throws if anilist_id not found', () => {
    const watchlist = [aot()];
    expect(() => togglePinned(watchlist, 999, 'chrischi')).toThrow(/not found/i);
  });
});

describe('setRating', () => {
  it('should set a rating for a user (1-10)', () => {
    const watchlist = [aot()];
    const result = setRating(watchlist, 1, 'chrischi', 8);
    expect(result[0].ratings).toEqual([{ user: 'chrischi', score: 8 }]);
  });

  it('should update existing rating for the same user', () => {
    const watchlist = [
      makeAnime({
        anilist_id: 1,
        title_romaji: 'AOT',
        ratings: [{ user: 'chrischi', score: 5 }],
      }),
    ];
    const result = setRating(watchlist, 1, 'chrischi', 9);
    expect(result[0].ratings).toHaveLength(1);
    expect(result[0].ratings[0]).toEqual({ user: 'chrischi', score: 9 });
  });

  it('should keep other users ratings when updating one user', () => {
    const watchlist = [
      makeAnime({
        anilist_id: 1,
        title_romaji: 'AOT',
        ratings: [
          { user: 'chrischi', score: 5 },
          { user: 'michelle', score: 7 },
        ],
      }),
    ];
    const result = setRating(watchlist, 1, 'chrischi', 9);
    expect(result[0].ratings).toHaveLength(2);
    expect(result[0].ratings).toContainEqual({ user: 'chrischi', score: 9 });
    expect(result[0].ratings).toContainEqual({ user: 'michelle', score: 7 });
  });

  it('should throw if score is less than 1', () => {
    const watchlist = [aot()];
    expect(() => setRating(watchlist, 1, 'chrischi', 0)).toThrow(/rating|invalid/i);
  });

  it('should throw if score is greater than 10', () => {
    const watchlist = [aot()];
    expect(() => setRating(watchlist, 1, 'chrischi', 11)).toThrow(/rating|invalid/i);
  });

  it('should throw if anilist_id not found', () => {
    const watchlist = [aot()];
    expect(() => setRating(watchlist, 999, 'chrischi', 5)).toThrow(/not found/i);
  });

  it('should not mutate the original array', () => {
    const watchlist = [aot()];
    setRating(watchlist, 1, 'chrischi', 8);
    expect(watchlist[0].ratings).toBeUndefined();
  });
});

describe('setEpisodeProgress', () => {
  it('should set watched_episodes on an anime', () => {
    const watchlist = [aot()];
    const result = setEpisodeProgress(watchlist, 1, 5);
    expect(result[0].watched_episodes).toBe(5);
  });

  it('should throw if episode is negative', () => {
    const watchlist = [aot()];
    expect(() => setEpisodeProgress(watchlist, 1, -1)).toThrow(/negative/i);
  });

  it('should throw if anilist_id not found', () => {
    const watchlist = [aot()];
    expect(() => setEpisodeProgress(watchlist, 999, 3)).toThrow(/not found/i);
  });

  it('should not mutate the original array', () => {
    const watchlist = [aot()];
    setEpisodeProgress(watchlist, 1, 5);
    expect(watchlist[0].watched_episodes).toBeUndefined();
  });

  it('should allow setting episode to 0 (reset)', () => {
    const watchlist = [aot()];
    const result = setEpisodeProgress(watchlist, 1, 0);
    expect(result[0].watched_episodes).toBe(0);
  });
});
