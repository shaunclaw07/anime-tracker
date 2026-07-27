/**
 * Setzt den Browser-Tab-Titel basierend auf der Anzahl der Animes.
 * @param {number} count
 */
export function updateTabTitle(count) {
  document.title = count > 0 ? `(${count}) Anime Tracker` : 'Anime Tracker';
}
