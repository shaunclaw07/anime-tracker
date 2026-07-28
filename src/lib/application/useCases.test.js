import { describe, it, expect, vi } from 'vitest';
import { createUseCases } from './useCases.js';

function createMockState(initial = {}) {
  let state = initial;
  return {
    getState: vi.fn(() => state),
    setState: vi.fn((s) => { state = { ...state, ...s }; }),
    subscribe: vi.fn(),
  };
}

function createMockStorage() {
  return {
    saveWatchlist: vi.fn(),
    loadWatchlist: vi.fn(() => []),
    exportWatchlist: vi.fn(() => '[]'),
  };
}

describe('useCases.setTags', () => {
  it('updates state and persists when tags are set', () => {
    const anime = {
      anilist_id: 1,
      title_romaji: 'Test',
      title_de: 'Test',
      tags: [],
    };
    const state = createMockState({ watchlist: [anime] });
    const storage = createMockStorage();
    const useCases = createUseCases(state, storage);

    useCases.setTags(1, ['action', 'fantasy']);

    expect(state.getState().watchlist[0].tags).toEqual(['action', 'fantasy']);
    expect(storage.saveWatchlist).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ anilist_id: 1, tags: ['action', 'fantasy'] }),
      ]),
    );
  });
});
