import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// --- Tests for AniListAdapter ---
// TDD: RED phase — write tests first, then implement

const MOCK_MEDIA = {
  id: 1,
  title: { romaji: 'Title Romaji', english: 'Title English', native: 'タイトル' },
  genres: ['Action', 'Adventure'],
  averageScore: 85,
  episodes: 24,
  format: 'TV',
  coverImage: { large: 'https://example.com/cover.jpg' },
  description: 'A great anime',
  tags: [{ name: 'Shounen', rank: 90 }, { name: 'Fighting', rank: 80 }],
};

const MOCK_MEDIA_2 = {
  id: 2,
  title: { romaji: 'Second Anime', english: null, native: 'セカンド' },
  genres: ['Comedy'],
  averageScore: null,
  episodes: null,
  format: 'MOVIE',
  coverImage: { large: null },
  description: null,
  tags: [],
};

const MOCK_RESPONSE = {
  data: {
    Page: {
      media: [MOCK_MEDIA, MOCK_MEDIA_2],
    },
  },
};

const EXPECTED_RESULT_1 = {
  anilist_id: 1,
  title_romaji: 'Title Romaji',
  title_english: 'Title English',
  title_native: 'タイトル',
  genres: ['Action', 'Adventure'],
  average_score: 85,
  episodes: 24,
  format: 'TV',
  cover_url: 'https://example.com/cover.jpg',
  description: 'A great anime',
  tags: [{ name: 'Shounen', rank: 90 }, { name: 'Fighting', rank: 80 }],
};

const EXPECTED_RESULT_2 = {
  anilist_id: 2,
  title_romaji: 'Second Anime',
  title_english: null,
  title_native: 'セカンド',
  genres: ['Comedy'],
  average_score: null,
  episodes: null,
  format: 'MOVIE',
  cover_url: null,
  description: null,
  tags: [],
};

describe('AniListAdapter', () => {
  let adapter;
  let fetchMock;

  beforeEach(async () => {
    // Dynamic import so mocks are in place before module is loaded
    fetchMock = vi.fn();
    global.fetch = fetchMock;

    // Clear any cached module
    vi.resetModules();
    const adapterModule = await import('../adapters/anilistAdapter.js');
    adapter = adapterModule.default || adapterModule;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchAnime', () => {
    it('returns an empty array for an empty query string (no API call)', async () => {
      const result = await adapter.searchAnime('');
      expect(result).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns an empty array for a whitespace-only query (no API call)', async () => {
      const result = await adapter.searchAnime('   ');
      expect(result).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('trims leading and trailing whitespace from the query', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(MOCK_RESPONSE),
      });

      await adapter.searchAnime('  Naruto  ');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, options] = fetchMock.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables.search).toBe('Naruto');
    });

    it('sends a correct GraphQL POST request to the AniList API', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(MOCK_RESPONSE),
      });

      await adapter.searchAnime('Naruto');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://graphql.anilist.co',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }),
      );

      const [, options] = fetchMock.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables).toMatchObject({ search: 'Naruto' });
      expect(body.query).toContain('Page');
      expect(body.query).toContain('media(search:');
    });

    it('maps the API response to the correct SearchResult shape', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(MOCK_RESPONSE),
      });

      const results = await adapter.searchAnime('Naruto');

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(EXPECTED_RESULT_1);
      expect(results[1]).toEqual(EXPECTED_RESULT_2);
    });

    it('handles null/undefined fields gracefully during mapping', async () => {
      const sparseMedia = {
        id: 3,
        title: { romaji: 'Sparse', english: null, native: null },
        genres: null,
        averageScore: null,
        episodes: null,
        format: null,
        coverImage: { large: null },
        description: null,
        tags: null,
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: { Page: { media: [sparseMedia] } },
        }),
      });

      const results = await adapter.searchAnime('Sparse');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        anilist_id: 3,
        title_romaji: 'Sparse',
        title_english: null,
        title_native: null,
        genres: null,
        average_score: null,
        episodes: null,
        format: null,
        cover_url: null,
        description: null,
        tags: null,
      });
    });

    it('returns an empty array when the API returns no results', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: { Page: { media: [] } },
        }),
      });

      const results = await adapter.searchAnime('zzzzz_nonexistent');

      expect(results).toEqual([]);
    });

    it('throws an error when the API responds with a non-ok status (e.g. 429)', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(adapter.searchAnime('Naruto')).rejects.toThrow();
    });

    it('throws an error when the API responds with a 500 status', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(adapter.searchAnime('Naruto')).rejects.toThrow();
    });

    it('throws an error on network failure', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      await expect(adapter.searchAnime('Naruto')).rejects.toThrow('Network error');
    });

    it('handles missing data.Page in the response', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const results = await adapter.searchAnime('Naruto');
      expect(results).toEqual([]);
    });
  });

  describe('getAnimeById', () => {
    it('fetches a single anime by ID and returns the mapped result', async () => {
      const singleResponse = {
        data: {
          Media: MOCK_MEDIA,
        },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(singleResponse),
      });

      const result = await adapter.getAnimeById(1);

      expect(result).toEqual(EXPECTED_RESULT_1);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [, options] = fetchMock.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.variables).toEqual({ id: 1 });
    });

    it('returns null when the anime is not found', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { Media: null } }),
      });

      const result = await adapter.getAnimeById(99999);
      expect(result).toBeNull();
    });

    it('throws on API error', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(adapter.getAnimeById(99999)).rejects.toThrow();
    });

    it('throws on network failure', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      await expect(adapter.getAnimeById(1)).rejects.toThrow('Network error');
    });
  });
});
