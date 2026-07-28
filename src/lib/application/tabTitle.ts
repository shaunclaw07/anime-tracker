/**
 * Setzt den Browser-Tab-Titel basierend auf der Anzahl der Animes.
 * @param count - Anzahl der Animes in der Watchlist
 */
export function updateTabTitle(count: number): void {
  document.title = count > 0 ? `(${count}) Anime Tracker` : 'Anime Tracker';
}
