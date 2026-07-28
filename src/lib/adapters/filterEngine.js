/**
 * filterEngine — Gemeinsame Filter-Logik für Mobile + Desktop.
 *
 * Extrahiert aus filterSheet.js, um Duplikation zwischen
 * mobilem Bottom-Sheet und Desktop-Inline-Bar zu vermeiden.
 *
 * @param {object} useCases - Application use cases
 * @returns {{ applyFilters: (values: FilterValues) => void }}
 *
 * @typedef {{ genres?: string[], minScore?: number, watchedBy?: string,
 *   season?: string, seasonYear?: number, studio?: string,
 *   unwatchedOnly?: boolean }} FilterValues
 */
export function createFilterEngine(useCases) {
  /**
   * Baut aus Rohwerten ein bereinigtes filters-Objekt und
   * übergibt es an useCases.setFilters().
   *
   * @param {FilterValues} values - Aus dem DOM gesammelte Filter-Werte
   * @param {object} [currentFilters={}] - Aktuelle Filter als Basis
   */
  function applyFilters(values, currentFilters = {}) {
    const newFilters = { ...currentFilters };

    if (values.genres && values.genres.length > 0) {
      newFilters.genres = values.genres;
    } else {
      delete newFilters.genres;
    }

    if (values.minScore != null && values.minScore > 0) {
      newFilters.minScore = values.minScore;
    } else {
      delete newFilters.minScore;
    }

    if (values.watchedBy) {
      newFilters.watchedBy = values.watchedBy;
    } else {
      delete newFilters.watchedBy;
    }

    if (values.season) {
      newFilters.season = values.season;
    } else {
      delete newFilters.season;
    }

    if (values.seasonYear != null && values.seasonYear > 0) {
      newFilters.seasonYear = values.seasonYear;
    } else {
      delete newFilters.seasonYear;
    }

    if (values.studio) {
      newFilters.studio = values.studio;
    } else {
      delete newFilters.studio;
    }

    if (values.unwatchedOnly) {
      newFilters.unwatchedOnly = true;
    } else {
      delete newFilters.unwatchedOnly;
    }

    useCases.setFilters(newFilters);
  }

  return { applyFilters };
}
