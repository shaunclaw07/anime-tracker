/**
 * AniListAdapter — Implements the AnimeSearchService port.
 *
 * Communicates with the AniList GraphQL API (https://graphql.anilist.co)
 * to search for anime and fetch anime by ID.
 */

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
  query ($search: String, $genre: String, $tag: String, $page: Int, $sort: [MediaSort]) {
    Page(page: $page, perPage: 20) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(search: $search, genre: $genre, tag: $tag, sort: $sort, type: ANIME) {
        id
        title { romaji english native }
        genres
        averageScore
        episodes
        format
        season
        seasonYear
        studios(isMain: true) { nodes { name } }
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
      season
      seasonYear
      studios(isMain: true) { nodes { name } }
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
    season: media.season,
    seasonYear: media.seasonYear,
    studios: media.studios ? media.studios.nodes.map(s => s.name) : [],
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
 * Searches for anime by query string, optionally filtered by genre and/or tag.
 *
 * @param {string} query - Search query.
 * @param {string} [genre] - Genre filter (e.g. "Action").
 * @param {string} [tag] - Tag filter (e.g. "Isekai").
 * @returns {Promise<Array<object>>} Array of SearchResult objects.
 */
async function searchAnime(query, genre, tag) {
  const pageResult = await searchAnimePage(query, genre, tag, 1);
  return pageResult.results;
}

/** Mapping: unsere Sortiernamen → AniList sort array */
const SORT_MAP = {
  relevance: ['SEARCH_MATCH'],
  score_desc: ['SCORE_DESC'],
  score_asc: ['SCORE_ASC'],
  title_asc: ['TITLE_ROMAJI'],
  title_desc: ['TITLE_ROMAJI_DESC'],
  popularity: ['POPULARITY_DESC'],
};

/**
 * Searches for anime with pagination support.
 *
 * @param {string} query - Search query.
 * @param {string} [genre] - Genre filter.
 * @param {string} [tag] - Tag filter.
 * @param {number} [page=1] - Page number.
 * @param {string} [sort='relevance'] - Sort key.
 * @returns {Promise<{results: Array, hasNextPage: boolean, currentPage: number}>}
 */
async function searchAnimePage(query, genre, tag, page = 1, sort = 'relevance') {
  const trimmed = (query || '').trim();
  if (!trimmed && !genre && !tag) {
    return { results: [], hasNextPage: false, currentPage: 1 };
  }

  const variables = { page, sort: SORT_MAP[sort] || SORT_MAP.relevance };
  if (trimmed) variables.search = trimmed;
  if (genre) variables.genre = genre;
  if (tag) variables.tag = tag;

  const json = await graphqlRequest(SEARCH_QUERY, variables);

  if (!json.data || !json.data.Page || !json.data.Page.media) {
    return { results: [], hasNextPage: false, currentPage: page };
  }

  return {
    results: json.data.Page.media.map(mapMedia),
    hasNextPage: json.data.Page.pageInfo?.hasNextPage || false,
    currentPage: json.data.Page.pageInfo?.currentPage || page,
  };
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

export { searchAnime, searchAnimePage, getAnimeById };
