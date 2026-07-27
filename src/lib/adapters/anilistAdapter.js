/**
 * AniListAdapter — Implements the AnimeSearchService port.
 *
 * Communicates with the AniList GraphQL API (https://graphql.anilist.co)
 * to search for anime and fetch anime by ID.
 */

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
  query ($search: String, $genre: String) {
    Page(page: 1, perPage: 20) {
      media(search: $search, genre: $genre, type: ANIME, sort: SEARCH_MATCH) {
        id
        title { romaji english native }
        genres
        averageScore
        episodes
        format
        coverImage { large }
        description
        tags { name rank }
      }
    }
  }
`;

const BY_ID_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      genres
      averageScore
      episodes
      format
      coverImage { large }
      description
      tags { name rank }
    }
  }
`;

/**
 * Maps a media object from the AniList API to our SearchResult shape.
 *
 * @param {object} media - A media object from the AniList response.
 * @returns {object} Mapped result.
 */
function mapMedia(media) {
  return {
    anilist_id: media.id,
    title_romaji: media.title.romaji,
    title_english: media.title.english,
    title_native: media.title.native,
    genres: media.genres,
    average_score: media.averageScore,
    episodes: media.episodes,
    format: media.format,
    cover_url: media.coverImage ? media.coverImage.large : null,
    description: media.description,
    tags: media.tags,
  };
}

/**
 * Executes a GraphQL request against the AniList API.
 *
 * @param {string} query - GraphQL query string.
 * @param {object} variables - Query variables.
 * @returns {Promise<object>} Parsed JSON response.
 * @throws {Error} On network or API errors.
 */
async function graphqlRequest(query, variables) {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `AniList API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Searches for anime by query string.
 *
 * @param {string} query - Search query.
 * @returns {Promise<Array<object>>} Array of SearchResult objects.
 */
async function searchAnime(query, genre) {
  const trimmed = (query || '').trim();
  if (!trimmed && !genre) {
    return [];
  }

  const variables = {};
  if (trimmed) variables.search = trimmed;
  if (genre) variables.genre = genre;

  const json = await graphqlRequest(SEARCH_QUERY, variables);

  if (!json.data || !json.data.Page || !json.data.Page.media) {
    return [];
  }

  return json.data.Page.media.map(mapMedia);
}

/**
 * Fetches a single anime by its AniList ID.
 *
 * @param {number} id - AniList ID.
 * @returns {Promise<object|null>} SearchResult object or null if not found.
 */
async function getAnimeById(id) {
  const json = await graphqlRequest(BY_ID_QUERY, { id });

  if (!json.data || !json.data.Media) {
    return null;
  }

  return mapMedia(json.data.Media);
}

export { searchAnime, getAnimeById };
