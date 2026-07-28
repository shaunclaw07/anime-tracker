/**
 * createSearchState — Centralized state for the search modal.
 *
 * Extracted from uiAdapter.js to make search state testable
 * and avoid closure-scoped variables scattered across the file.
 *
 * @returns {{
 *   searchDebounceTimer: number|null,
 *   searchResults: Array<object>|null,
 *   selectedAnilistId: number|null,
 *   savedSearchState: {query: string, genre: string, tag: string, sort: string}|null,
 *   searchPage: number,
 *   searchHasMore: boolean,
 *   allResults: Array<object>,
 *   lastQuery: string,
 *   lastGenre: string,
 *   lastTag: string,
 *   lastSort: string,
 *   resetSearch: () => void,
 *   initPagination: () => void,
 * }}
 */
export function createSearchState() {
  return {
    /** @type {number|null} */ searchDebounceTimer: null,
    /** @type {Array<object>|null} */ searchResults: null,
    /** @type {number|null} */ selectedAnilistId: null,
    /** @type {{query: string, genre: string, tag: string, sort: string}|null} */ savedSearchState: null,

    /* Pagination state */
    /** @type {number} */ searchPage: 1,
    /** @type {boolean} */ searchHasMore: false,
    /** @type {Array<object>} */ allResults: [],
    /** @type {string} */ lastQuery: '',
    /** @type {string} */ lastGenre: '',
    /** @type {string} */ lastTag: '',
    /** @type {string} */ lastSort: 'relevance',

    /** Resets all search results & selection (keeps savedSearchState) */
    resetSearch() {
      this.searchResults = null;
      this.selectedAnilistId = null;
      this.searchPage = 1;
      this.searchHasMore = false;
      this.allResults = [];
      this.lastQuery = '';
      this.lastGenre = '';
      this.lastTag = '';
      this.lastSort = 'relevance';
    },

    /** Initializes pagination for a fresh search (keeps lastQuery/Genre/Tag/Sort) */
    initPagination() {
      this.searchPage = 1;
      this.allResults = [];
    },
  };
}
