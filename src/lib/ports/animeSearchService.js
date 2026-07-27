/**
 * AnimeSearchService — Port definition.
 *
 * Defines the contract for searching anime via an external API.
 *
 * Methods:
 *
 *   searchAnime(query: string): Promise<SearchResult[]>
 *     Searches for anime matching the given query string.
 *     Empty or whitespace-only queries return an empty array (no API call).
 *     Returns an array of SearchResult objects.
 *     Throws on network or API errors.
 *
 *   getAnimeById(id: number): Promise<SearchResult | null>
 *     Fetches a single anime by its AniList ID.
 *     Returns the SearchResult or null if not found.
 *     Throws on network or API errors.
 *
 * SearchResult shape:
 *   { anilist_id, title_romaji, title_english, title_native,
 *     genres, average_score, episodes, format, cover_url,
 *     description, tags }
 *
 * @module animeSearchService
 */

// Port — no implementation. Adapters must satisfy this contract.
