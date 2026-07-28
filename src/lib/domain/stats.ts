import type { Anime } from './anime.js';

export interface Stats {
  totalCount: number;
  bothCount: number;
  chrischiCount: number;
  michelleCount: number;
  avgScoreChrischi: number | null;
  avgScoreMichelle: number | null;
  topGenres: { genre: string; count: number }[];
}

/**
 * Computes dashboard statistics from a watchlist.
 * Pure function — no side effects.
 */
export function computeStats(watchlist: Anime[]): Stats {
  const totalCount = watchlist.length;

  const bothCount = watchlist.filter(
    (a) => (a.watched_by || []).length === 2,
  ).length;

  const chrischiCount = watchlist.filter(
    (a) => (a.watched_by || []).includes('chrischi'),
  ).length;

  const michelleCount = watchlist.filter(
    (a) => (a.watched_by || []).includes('michelle'),
  ).length;

  const avgScoreChrischi = calculateAverage(watchlist, 'chrischi');
  const avgScoreMichelle = calculateAverage(watchlist, 'michelle');

  const topGenres = getTopGenres(watchlist, 3);

  return {
    totalCount,
    bothCount,
    chrischiCount,
    michelleCount,
    avgScoreChrischi,
    avgScoreMichelle,
    topGenres,
  };
}

function calculateAverage(watchlist: Anime[], user: string): number | null {
  const scores = watchlist
    .flatMap((a) => a.ratings || [])
    .filter((r) => r.user === user)
    .map((r) => r.score);

  if (scores.length === 0) return null;

  const sum = scores.reduce((acc, s) => acc + s, 0);
  return sum / scores.length;
}

function getTopGenres(
  watchlist: Anime[],
  n: number,
): { genre: string; count: number }[] {
  const genreCount: Record<string, number> = {};

  for (const anime of watchlist) {
    if (anime.genres) {
      for (const genre of anime.genres) {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      }
    }
  }

  return Object.entries(genreCount)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}
