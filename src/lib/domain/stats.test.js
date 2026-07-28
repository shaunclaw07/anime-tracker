import { describe, it, expect } from 'vitest';
import { computeStats } from './stats.ts';
import { createAnime } from './anime.ts';

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

describe('computeStats', () => {
  it('returns zeros for empty watchlist', () => {
    const stats = computeStats([]);
    expect(stats).toEqual({
      totalCount: 0,
      bothCount: 0,
      chrischiCount: 0,
      michelleCount: 0,
      avgScoreChrischi: null,
      avgScoreMichelle: null,
      topGenres: [],
    });
  });

  it('counts total anime', () => {
    const watchlist = [
      makeAnime({ anilist_id: 1, title_romaji: 'A' }),
      makeAnime({ anilist_id: 2, title_romaji: 'B' }),
      makeAnime({ anilist_id: 3, title_romaji: 'C' }),
    ];
    expect(computeStats(watchlist).totalCount).toBe(3);
  });

  it('counts anime watched by both', () => {
    const watchlist = [
      makeAnime({ anilist_id: 1, title_romaji: 'A', watched_by: ['chrischi', 'michelle'] }),
      makeAnime({ anilist_id: 2, title_romaji: 'B', watched_by: ['chrischi'] }),
      makeAnime({ anilist_id: 3, title_romaji: 'C', watched_by: [] }),
    ];
    expect(computeStats(watchlist).bothCount).toBe(1);
  });

  it('counts per-user watched', () => {
    const watchlist = [
      makeAnime({ anilist_id: 1, title_romaji: 'A', watched_by: ['chrischi', 'michelle'] }),
      makeAnime({ anilist_id: 2, title_romaji: 'B', watched_by: ['chrischi'] }),
      makeAnime({ anilist_id: 3, title_romaji: 'C', watched_by: ['michelle'] }),
      makeAnime({ anilist_id: 4, title_romaji: 'D', watched_by: [] }),
    ];
    const stats = computeStats(watchlist);
    expect(stats.chrischiCount).toBe(2);
    expect(stats.michelleCount).toBe(2);
  });

  it('calculates average score per user', () => {
    const watchlist = [
      makeAnime({
        anilist_id: 1,
        title_romaji: 'A',
        ratings: [
          { user: 'chrischi', score: 8 },
          { user: 'michelle', score: 6 },
        ],
      }),
      makeAnime({
        anilist_id: 2,
        title_romaji: 'B',
        ratings: [
          { user: 'chrischi', score: 10 },
          { user: 'michelle', score: 4 },
        ],
      }),
    ];
    const stats = computeStats(watchlist);
    expect(stats.avgScoreChrischi).toBe(9); // (8 + 10) / 2
    expect(stats.avgScoreMichelle).toBe(5); // (6 + 4) / 2
  });

  it('returns null avg if user has no ratings', () => {
    const watchlist = [
      makeAnime({ anilist_id: 1, title_romaji: 'A', ratings: [{ user: 'chrischi', score: 7 }] }),
      makeAnime({ anilist_id: 2, title_romaji: 'B' }),
    ];
    const stats = computeStats(watchlist);
    expect(stats.avgScoreChrischi).toBe(7);
    expect(stats.avgScoreMichelle).toBeNull();
  });

  it('returns top 3 genres', () => {
    const watchlist = [
      makeAnime({ anilist_id: 1, title_romaji: 'A', genres: ['Action', 'Drama'] }),
      makeAnime({ anilist_id: 2, title_romaji: 'B', genres: ['Action', 'Sci-Fi'] }),
      makeAnime({ anilist_id: 3, title_romaji: 'C', genres: ['Drama', 'Romance'] }),
      makeAnime({ anilist_id: 4, title_romaji: 'D', genres: ['Comedy'] }),
    ];
    const stats = computeStats(watchlist);
    expect(stats.topGenres).toHaveLength(3);
    expect(stats.topGenres[0].genre).toBe('Action');
    expect(stats.topGenres[0].count).toBe(2);
    expect(stats.topGenres[1].genre).toBe('Drama');
    expect(stats.topGenres[1].count).toBe(2);
    expect(stats.topGenres[2].genre).toBe('Sci-Fi');
    expect(stats.topGenres[2].count).toBe(1);
  });

  it('handles anime with no genres', () => {
    const watchlist = [
      makeAnime({ anilist_id: 1, title_romaji: 'A', genres: ['Action'] }),
      makeAnime({ anilist_id: 2, title_romaji: 'B' }), // no genres
      makeAnime({ anilist_id: 3, title_romaji: 'C', genres: undefined }),
    ];
    const stats = computeStats(watchlist);
    expect(stats.topGenres).toHaveLength(1);
    expect(stats.topGenres[0]).toEqual({ genre: 'Action', count: 1 });
  });

  it('sorts top genres by count descending', () => {
    const watchlist = [
      makeAnime({ anilist_id: 1, title_romaji: 'A', genres: ['Action', 'Drama'] }),
      makeAnime({ anilist_id: 2, title_romaji: 'B', genres: ['Action', 'Drama'] }),
      makeAnime({ anilist_id: 3, title_romaji: 'C', genres: ['Action'] }),
      makeAnime({ anilist_id: 4, title_romaji: 'D', genres: ['Drama'] }),
      makeAnime({ anilist_id: 5, title_romaji: 'E', genres: ['Sci-Fi'] }),
      makeAnime({ anilist_id: 6, title_romaji: 'F', genres: ['Romance'] }),
    ];
    const stats = computeStats(watchlist);
    expect(stats.topGenres.map((g) => g.genre)).toEqual(['Action', 'Drama', 'Sci-Fi']);
    expect(stats.topGenres[0].count).toBe(3);
    expect(stats.topGenres[1].count).toBe(3);
    expect(stats.topGenres[2].count).toBe(1);
  });

  it('handles movie watched_by with empty array', () => {
    const watchlist = [
      makeAnime({ anilist_id: 1, title_romaji: 'A', watched_by: [] }),
    ];
    const stats = computeStats(watchlist);
    expect(stats.bothCount).toBe(0);
    expect(stats.chrischiCount).toBe(0);
    expect(stats.michelleCount).toBe(0);
  });
});
