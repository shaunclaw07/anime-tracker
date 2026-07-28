import { describe, it, expect } from 'vitest';
import { createAnime } from './anime.ts';
import { filterAnime, extractGenres, sortAnime } from './filters.ts';

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
    ratings: overrides.ratings,
    finished_at: overrides.finished_at,
  });
}

describe('filterAnime', () => {
  const sampleList = [
    makeAnime({
      anilist_id: 1,
      title_romaji: 'Shingeki no Kyojin',
      title_english: 'Attack on Titan',
      title_de: 'Angriff auf Titanen',
      genres: ['Action', 'Drama', 'Fantasy'],
      average_score: 85,
    }),
    makeAnime({
      anilist_id: 2,
      title_romaji: 'Steins;Gate',
      genres: ['Sci-Fi', 'Thriller'],
      average_score: 90,
    }),
    makeAnime({
      anilist_id: 3,
      title_romaji: 'Kimi no Na wa.',
      title_english: 'Your Name.',
      title_de: 'Your Name. – Gestern, heute und für immer',
      genres: ['Romance', 'Fantasy', 'Drama'],
      average_score: 86,
    }),
    makeAnime({
      anilist_id: 4,
      title_romaji: 'One Punch Man',
      genres: ['Action', 'Comedy'],
      average_score: 82,
      watched_by: ['chrischi'],
      ratings: [{ user: 'chrischi', score: 9 }],
    }),
    makeAnime({
      anilist_id: 5,
      title_romaji: 'K-On!',
      genres: ['Comedy', 'Music', 'Slice of Life'],
      average_score: 78,
      watched_by: ['chrischi', 'michelle'],
      ratings: [
        { user: 'chrischi', score: 7 },
        { user: 'michelle', score: 9 },
      ],
    }),
  ];

  describe('query filter', () => {
    it('should filter by query matching title_romaji (case-insensitive)', () => {
      const result = filterAnime(sampleList, { query: 'shingeki' });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(1);
    });

    it('should filter by query matching title_english (case-insensitive)', () => {
      const result = filterAnime(sampleList, { query: 'attack on titan' });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(1);
    });

    it('should filter by query matching title_de (case-insensitive)', () => {
      const result = filterAnime(sampleList, { query: 'ANGRIFF' });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(1);
    });

    it('should return empty array when query matches nothing', () => {
      const result = filterAnime(sampleList, { query: 'zzzzz' });
      expect(result).toHaveLength(0);
    });

    it('should return all items when query is empty', () => {
      const result = filterAnime(sampleList, { query: '' });
      expect(result).toHaveLength(sampleList.length);
    });
  });

  describe('genres filter', () => {
    it('should filter by single genre (OR logic)', () => {
      const result = filterAnime(sampleList, { genres: ['Sci-Fi'] });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(2);
    });

    it('should match items with ANY of the given genres (OR)', () => {
      const result = filterAnime(sampleList, { genres: ['Music', 'Thriller'] });
      expect(result).toHaveLength(2);
      const ids = result.map((a) => a.anilist_id).sort();
      expect(ids).toEqual([2, 5]);
    });

    it('should return empty array when no genres match', () => {
      const result = filterAnime(sampleList, { genres: ['Mecha'] });
      expect(result).toHaveLength(0);
    });

    it('should return all items when genres is empty array', () => {
      const result = filterAnime(sampleList, { genres: [] });
      expect(result).toHaveLength(sampleList.length);
    });
  });

  describe('minScore filter', () => {
    it('should filter by minimum average_score', () => {
      const result = filterAnime(sampleList, { minScore: 85 });
      expect(result).toHaveLength(3);
      const ids = result.map((a) => a.anilist_id).sort();
      expect(ids).toEqual([1, 2, 3]);
    });

    it('should include anime with undefined average_score', () => {
      const list = [
        ...sampleList,
        makeAnime({
          anilist_id: 99,
          title_romaji: 'No Score',
          average_score: undefined,
        }),
      ];
      const result = filterAnime(list, { minScore: 90 });
      expect(result.some((a) => a.anilist_id === 99)).toBe(true);
    });
  });

  describe('personal rating filter', () => {
    it('should filter by minPersonalRating for a specific user', () => {
      const result = filterAnime(sampleList, {
        minPersonalRating: 8,
        personalRatingUser: 'michelle',
      });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(5);
    });

    it('should return empty when no anime has a rating by that user', () => {
      const result = filterAnime(sampleList, {
        minPersonalRating: 10,
        personalRatingUser: 'nonexistent',
      });
      expect(result).toHaveLength(0);
    });

    it('should be case-sensitive for personalRatingUser', () => {
      const result = filterAnime(sampleList, {
        minPersonalRating: 9,
        personalRatingUser: 'Chrischi',
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('watchedBy filter', () => {
    it('should filter by watchedBy = "chrischi"', () => {
      const result = filterAnime(sampleList, { watchedBy: 'chrischi' });
      expect(result).toHaveLength(2);
      const ids = result.map((a) => a.anilist_id).sort();
      expect(ids).toEqual([4, 5]);
    });

    it('should filter by watchedBy = "michelle"', () => {
      const result = filterAnime(sampleList, { watchedBy: 'michelle' });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(5);
    });

    it('should filter by watchedBy = "all" (watched by everyone)', () => {
      const result = filterAnime(sampleList, { watchedBy: 'all' });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(5);
    });

    it('should filter by watchedBy = "both" (same as all)', () => {
      const result = filterAnime(sampleList, { watchedBy: 'both' });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(5);
    });

    it('should include anime without watched_by when watchedBy is not set', () => {
      const result = filterAnime(sampleList, {});
      expect(result).toHaveLength(sampleList.length);
    });
  });

  describe('unwatchedOnly filter', () => {
    it('filters out watched anime when unwatchedOnly is true', () => {
      const list = [
        makeAnime({ anilist_id: 1, title_romaji: 'A', watched_by: ['chrischi'] }),
        makeAnime({ anilist_id: 2, title_romaji: 'B', watched_by: [] }),
        makeAnime({ anilist_id: 3, title_romaji: 'C' }),
      ];
      const result = filterAnime(list, { unwatchedOnly: true });
      expect(result).toHaveLength(2);
      expect(result.map(a => a.anilist_id)).toEqual([2, 3]);
    });

    it('should return all anime when unwatchedOnly is false', () => {
      const list = [
        makeAnime({ anilist_id: 1, title_romaji: 'A', watched_by: ['chrischi'] }),
        makeAnime({ anilist_id: 2, title_romaji: 'B' }),
      ];
      const result = filterAnime(list, { unwatchedOnly: false });
      expect(result).toHaveLength(2);
    });

    it('should return all anime when unwatchedOnly is not set', () => {
      const result = filterAnime(sampleList, {});
      expect(result).toHaveLength(sampleList.length);
    });
  });

  describe('combined filters', () => {
    it('should combine query + genres', () => {
      const result = filterAnime(sampleList, {
        query: 'Attack',
        genres: ['Fantasy'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(1);
    });

    it('should combine minScore + watchedBy', () => {
      const result = filterAnime(sampleList, {
        minScore: 80,
        watchedBy: 'chrischi',
      });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(4);
    });

    it('should return empty array when combined filters exclude everything', () => {
      const result = filterAnime(sampleList, {
        query: 'shingeki',
        genres: ['Music'],
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original list', () => {
      const originalLength = sampleList.length;
      const originalFirstId = sampleList[0].anilist_id;
      filterAnime(sampleList, { query: 'zzzzz' });
      expect(sampleList).toHaveLength(originalLength);
      expect(sampleList[0].anilist_id).toBe(originalFirstId);
    });
  });
});

describe('extractGenres', () => {
  it('should extract all unique genres sorted alphabetically', () => {
    const list = [
      makeAnime({
        anilist_id: 1,
        title_romaji: 'A',
        genres: ['Action', 'Drama'],
      }),
      makeAnime({
        anilist_id: 2,
        title_romaji: 'B',
        genres: ['Comedy', 'Drama'],
      }),
      makeAnime({ anilist_id: 3, title_romaji: 'C', genres: ['Action'] }),
    ];
    expect(extractGenres(list)).toEqual(['Action', 'Comedy', 'Drama']);
  });

  it('should return empty array for empty list', () => {
    expect(extractGenres([])).toEqual([]);
  });

  it('should handle anime with no genres', () => {
    const list = [
      makeAnime({ anilist_id: 1, title_romaji: 'A' }),
      makeAnime({ anilist_id: 2, title_romaji: 'B', genres: ['Action'] }),
    ];
    expect(extractGenres(list)).toEqual(['Action']);
  });
});

describe('sortAnime', () => {
  const items = [
    { anilist_id: 3, title_romaji: 'Cowboy Bebop', average_score: 86 },
    { anilist_id: 1, title_romaji: 'Trigun', average_score: 80 },
    { anilist_id: 2, title_romaji: 'Akira', average_score: 90 },
    { anilist_id: 4, title_romaji: 'Zankyou no Terror', average_score: null },
  ];

  it('sorts by title asc (A→Z)', () => {
    const result = sortAnime(items, 'title', 'asc');
    expect(result.map(a => a.anilist_id)).toEqual([2, 3, 1, 4]);
  });

  it('sorts by title desc (Z→A)', () => {
    const result = sortAnime(items, 'title', 'desc');
    expect(result.map(a => a.anilist_id)).toEqual([4, 1, 3, 2]);
  });

  it('sorts by score desc (highest first)', () => {
    const result = sortAnime(items, 'score', 'desc');
    expect(result.map(a => a.anilist_id)).toEqual([2, 3, 1, 4]);
  });

  it('sorts by score asc (lowest first)', () => {
    const result = sortAnime(items, 'score', 'asc');
    expect(result.map(a => a.anilist_id)).toEqual([1, 3, 2, 4]);
  });

  it('returns empty array for empty list', () => {
    expect(sortAnime([], 'title', 'asc')).toEqual([]);
  });

  it('handles items with no title gracefully', () => {
    const list = [{ anilist_id: 1, average_score: 50 }];
    const result = sortAnime(list, 'title', 'asc');
    expect(result).toHaveLength(1);
  });
});
