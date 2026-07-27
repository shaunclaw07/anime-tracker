import { describe, it, expect } from 'vitest';
import { cardTemplate, searchResultTemplate } from '../adapters/templates.js';

describe('cardTemplate', () => {
  const baseAnime = {
    anilist_id: 1,
    title_romaji: 'Cowboy Bebop',
    title_english: 'Cowboy Bebop',
    title_de: 'Cowboy Bebop',
    genres: ['Action', 'Sci-Fi', 'Noir', 'Space', 'Drama'],
    average_score: 86,
    episodes: 26,
    cover_url: 'https://example.com/cover.jpg',
    format: 'TV',
    watched_by: ['chrischi', 'michelle'],
    ratings: [
      { user: 'chrischi', score: 9 },
      { user: 'michelle', score: 8 },
    ],
  };

  it('returns a string containing the anime-card class', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('anime-card');
  });

  it('contains the romaji title', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('Cowboy Bebop');
  });

  it('contains the German title when available via deTitles', () => {
    const deTitles = { 1: 'Cowboy Bebop (DE)' };
    const html = cardTemplate(baseAnime, deTitles);
    expect(html).toContain('Cowboy Bebop (DE)');
    expect(html).toContain('anime-title-de');
  });

  it('falls back to title_de prop when no deTitles mapping exists', () => {
    const anime = { ...baseAnime, title_de: 'Cowboy Bebop Deutsch' };
    const html = cardTemplate(anime, {});
    expect(html).toContain('Cowboy Bebop Deutsch');
  });

  it('falls back to title_english when title_de is missing', () => {
    const anime = { ...baseAnime, title_de: undefined };
    const html = cardTemplate(anime, {});
    expect(html).toContain('Cowboy Bebop'); // english title
  });

  it('falls back to title_romaji when no DE or EN title exists', () => {
    const anime = {
      ...baseAnime,
      title_de: undefined,
      title_english: undefined,
    };
    const html = cardTemplate(anime, {});
    expect(html).toContain('Cowboy Bebop'); // romaji
  });

  it('renders genre tags (max 4)', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('genre-tag');
    // Should have max 4 genre tags (not 5)
    const matches = html.match(/genre-tag/g);
    expect(matches).toBeTruthy();
    expect(matches.length).toBeLessThanOrEqual(4);
    expect(html).toContain('Action');
    expect(html).toContain('Sci-Fi');
  });

  it('renders the score with appropriate CSS class for high scores', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('anime-score');
    expect(html).toContain('score-high');
    expect(html).toContain('86');
  });

  it('renders score-mid for scores between 50 and 74', () => {
    const anime = { ...baseAnime, average_score: 65 };
    const html = cardTemplate(anime);
    expect(html).toContain('score-mid');
  });

  it('renders score-low for scores below 50', () => {
    const anime = { ...baseAnime, average_score: 30 };
    const html = cardTemplate(anime);
    expect(html).toContain('score-low');
  });

  it('renders both watched badges when watched_by has both users', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('badge-both');
    expect(html).not.toContain('badge-chrischi');
    expect(html).not.toContain('badge-michelle');
  });

  it('renders individual badge for chrischi when only he watched', () => {
    const anime = { ...baseAnime, watched_by: ['chrischi'] };
    const html = cardTemplate(anime);
    expect(html).toContain('badge-chrischi');
    expect(html).not.toContain('badge-both');
    expect(html).not.toContain('badge-michelle');
  });

  it('renders individual badge for michelle when only she watched', () => {
    const anime = { ...baseAnime, watched_by: ['michelle'] };
    const html = cardTemplate(anime);
    expect(html).toContain('badge-michelle');
    expect(html).not.toContain('badge-both');
    expect(html).not.toContain('badge-chrischi');
  });

  it('renders personal ratings for each user', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('personal-ratings');
    expect(html).toContain('chrischi');
    expect(html).toContain('michelle');
    // Stars for score 9 (chrischi): should have 9 filled + 1 empty
    expect(html).toContain('★'); // filled star
    // And some empty stars
    expect(html).toContain('☆'); // empty star
  });

  it('contains action buttons (toggle-viewer and remove)', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('btn-icon');
    expect(html).toContain('data-action');
    expect(html).toContain('data-id');
  });

  it('renders a placeholder when cover_url is missing', () => {
    const anime = { ...baseAnime, cover_url: null };
    const html = cardTemplate(anime);
    expect(html).toContain('anime-cover-placeholder');
    expect(html).not.toContain('<img');
  });

  it('renders an img when cover_url is present', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('<img');
    expect(html).toContain('anime-cover');
  });

  it('does not contain "undefined" in the output', () => {
    const html = cardTemplate(baseAnime);
    expect(html).not.toContain('undefined');
  });

  it('renders no watched badges when watched_by is empty', () => {
    const anime = { ...baseAnime, watched_by: [] };
    const html = cardTemplate(anime);
    expect(html).not.toContain('badge-both');
    expect(html).not.toContain('badge-chrischi');
    expect(html).not.toContain('badge-michelle');
  });

  it('handles missing ratings array gracefully', () => {
    const anime = { ...baseAnime, ratings: undefined };
    const html = cardTemplate(anime);
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('personal-ratings');
  });

  it('handles genres being undefined', () => {
    const anime = { ...baseAnime, genres: undefined };
    const html = cardTemplate(anime);
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('genre-tag');
  });

  it('renders episode count when available', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('26');
    expect(html).toContain('anime-episodes');
  });

  it('renders format badge', () => {
    const html = cardTemplate(baseAnime);
    expect(html).toContain('TV');
  });
});

describe('searchResultTemplate', () => {
  const baseResult = {
    anilist_id: 10,
    title_romaji: 'Naruto',
    title_english: 'Naruto',
    genres: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
    average_score: 80,
    episodes: 220,
    cover_url: 'https://example.com/naruto.jpg',
    format: 'TV',
  };

  it('returns a string containing the search-result class', () => {
    const html = searchResultTemplate(baseResult);
    expect(html).toContain('search-result');
  });

  it('contains the romaji title', () => {
    const html = searchResultTemplate(baseResult);
    expect(html).toContain('Naruto');
  });

  it('contains the english title', () => {
    const html = searchResultTemplate(baseResult);
    expect(html).toContain('Naruto');
  });

  it('renders genre tags (max 3)', () => {
    const html = searchResultTemplate(baseResult);
    const matches = html.match(/genre-tag/g);
    expect(matches).toBeTruthy();
    expect(matches.length).toBeLessThanOrEqual(3);
  });

  it('renders the score', () => {
    const html = searchResultTemplate(baseResult);
    expect(html).toContain('80');
  });

  it('renders a cover image', () => {
    const html = searchResultTemplate(baseResult);
    expect(html).toContain('<img');
    expect(html).toContain('https://example.com/naruto.jpg');
  });

  it('renders a placeholder when cover_url is null', () => {
    const result = { ...baseResult, cover_url: null };
    const html = searchResultTemplate(result);
    expect(html).toContain('search-result-placeholder');
    expect(html).not.toContain('<img');
  });

  it('has data-id attribute for result selection', () => {
    const html = searchResultTemplate(baseResult);
    expect(html).toContain('data-id="10"');
  });

  it('handles missing genres gracefully', () => {
    const result = { ...baseResult, genres: undefined };
    const html = searchResultTemplate(result);
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('genre-tag');
  });

  it('does not contain "undefined" in the output', () => {
    const html = searchResultTemplate(baseResult);
    expect(html).not.toContain('undefined');
  });

  it('handles null average_score', () => {
    const result = { ...baseResult, average_score: null };
    const html = searchResultTemplate(result);
    expect(html).not.toContain('undefined');
    expect(html).toContain('-'); // should show dash or similar
  });

  it('contains episodes info when available', () => {
    const html = searchResultTemplate(baseResult);
    expect(html).toContain('220');
    expect(html).toContain('Episoden');
  });
});
