import { describe, it, expect } from 'vitest';
import { createAnime } from './anime.js';

describe('createAnime', () => {
  const validData = {
    anilist_id: 12345,
    title_romaji: 'Shingeki no Kyojin',
    title_english: 'Attack on Titan',
    title_de: 'Angriff auf Titanen',
    genres: ['Action', 'Drama', 'Fantasy'],
    average_score: 85,
    episodes: 25,
    cover_url: 'https://example.com/cover.jpg',
    format: 'TV',
  };

  describe('required fields', () => {
    it('should create an anime entity with all required fields', () => {
      const anime = createAnime({
        anilist_id: 1,
        title_romaji: 'Test Anime',
      });

      expect(anime).toEqual({
        anilist_id: 1,
        title_romaji: 'Test Anime',
        title_english: undefined,
        title_de: 'Test Anime',
        genres: undefined,
        average_score: undefined,
        episodes: undefined,
        cover_url: undefined,
        format: undefined,
        watched_by: undefined,
        ratings: undefined,
        finished_at: undefined,
      });
    });

    it('should throw if anilist_id is missing', () => {
      expect(() => createAnime({ title_romaji: 'Test' })).toThrow(
        'anilist_id is required',
      );
    });

    it('should throw if title_romaji is missing', () => {
      expect(() => createAnime({ anilist_id: 1 })).toThrow(
        'title_romaji is required',
      );
    });

    it('should throw if both required fields are missing', () => {
      expect(() => createAnime({})).toThrow(/required/);
    });
  });

  describe('title_de fallback', () => {
    it('should use title_de when available', () => {
      const anime = createAnime({
        anilist_id: 1,
        title_romaji: 'Shingeki no Kyojin',
        title_de: 'Angriff auf Titanen',
        title_english: 'Attack on Titan',
      });
      expect(anime.title_de).toBe('Angriff auf Titanen');
    });

    it('should fall back to title_english when title_de is missing', () => {
      const anime = createAnime({
        anilist_id: 1,
        title_romaji: 'Shingeki no Kyojin',
        title_english: 'Attack on Titan',
      });
      expect(anime.title_de).toBe('Attack on Titan');
    });

    it('should fall back to title_romaji when both title_de and title_english are missing', () => {
      const anime = createAnime({
        anilist_id: 1,
        title_romaji: 'Shingeki no Kyojin',
      });
      expect(anime.title_de).toBe('Shingeki no Kyojin');
    });
  });

  describe('optional fields', () => {
    it('should pass through all optional fields when provided', () => {
      const anime = createAnime(validData);
      expect(anime.genres).toEqual(['Action', 'Drama', 'Fantasy']);
      expect(anime.average_score).toBe(85);
      expect(anime.episodes).toBe(25);
      expect(anime.cover_url).toBe('https://example.com/cover.jpg');
      expect(anime.format).toBe('TV');
    });

    it('should preserve watched_by and ratings when provided', () => {
      const anime = createAnime({
        anilist_id: 1,
        title_romaji: 'Test',
        watched_by: ['chrischi'],
        ratings: [{ user: 'chrischi', score: 8 }],
        finished_at: '2024-12-01',
      });
      expect(anime.watched_by).toEqual(['chrischi']);
      expect(anime.ratings).toEqual([{ user: 'chrischi', score: 8 }]);
      expect(anime.finished_at).toBe('2024-12-01');
    });
  });
});
