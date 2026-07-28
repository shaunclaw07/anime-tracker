import { describe, it, expect } from 'vitest';
import { setTags } from './watchlist.ts';

function makeAnime(overrides = {}) {
  return {
    anilist_id: 1,
    title_romaji: 'Test Anime',
    title_de: 'Test Anime',
    ...overrides,
  };
}

describe('setTags', () => {
  it('sets tags on an anime', () => {
    const anime = makeAnime();
    const watchlist = [anime];

    const result = setTags(watchlist, 1, ['action', 'fantasy']);

    expect(result[0].tags).toEqual(['action', 'fantasy']);
  });

  it('overwrites existing tags', () => {
    const anime = makeAnime({ tags: ['old'] });
    const watchlist = [anime];

    const result = setTags(watchlist, 1, ['action', 'fantasy']);

    expect(result[0].tags).toEqual(['action', 'fantasy']);
  });

  it('throws when anime is not found', () => {
    const watchlist = [makeAnime()];

    expect(() => setTags(watchlist, 999, ['action'])).toThrow(
      'Anime 999 not found',
    );
  });
});
