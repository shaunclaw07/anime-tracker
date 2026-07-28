import { getUsers, getUserLabel } from '../config.js';

/**
 * AniList genres (hardcoded subset matching the search modal).
 */
const ANIME_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Thriller', 'Ecchi',
];

const FORMAT_OPTIONS = [
  { value: '', label: 'Alle' },
  { value: 'TV', label: 'TV' },
  { value: 'MOVIE', label: 'Film' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'SPECIAL', label: 'Special' },
];

/**
 * createRandomModal — Shows a random anime with filter options.
 *
 * @param {object} state - Global state
 * @param {object} useCases - Application use cases
 * @param {object} anilistAdapter - AniList API adapter
 * @returns {{ show: () => void }}
 */
export function createRandomModal(state, useCases, anilistAdapter) {
  /** @type {{ genre: string, minScore: number, format: string } | null} */
  let savedFilters = null;

  function show() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="search-overlay" id="random-overlay">
        <div class="random-card">
          <div class="random-body" style="padding:20px">
            <h3 class="random-filter-heading">Zufalls-Anime finden</h3>
            <div class="random-filter-section">
              <label class="random-filter-label">Genre</label>
              <select id="random-genre" class="search-genre-select">
                <option value="">Alle</option>
                ${ANIME_GENRES.map(g => `<option value="${g}">${g}</option>`).join('')}
              </select>
            </div>
            <div class="random-filter-section">
              <label class="random-filter-label">Min. Bewertung: <span id="random-score-val">0</span></label>
              <input type="range" id="random-score" class="random-score-slider" min="0" max="100" value="0" />
            </div>
            <div class="random-filter-section">
              <label class="random-filter-label">Format</label>
              <select id="random-format" class="search-genre-select">
                ${FORMAT_OPTIONS.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
              </select>
            </div>
            <button id="random-go" class="btn btn-primary random-btn-full">Zufälligen Anime finden</button>
            <button id="random-close-init" class="btn btn-secondary random-btn-full" style="margin-top:8px">Schließen</button>
          </div>
        </div>
      </div>`;

    // Score slider live display
    const scoreSlider = document.getElementById('random-score');
    const scoreVal = document.getElementById('random-score-val');
    scoreSlider.addEventListener('input', () => {
      scoreVal.textContent = scoreSlider.value;
    });

    document.getElementById('random-close-init').onclick = () => { container.innerHTML = ''; };
    document.getElementById('random-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) container.innerHTML = '';
    });

    document.getElementById('random-go').onclick = () => {
      const genre = /** @type {HTMLSelectElement} */ (document.getElementById('random-genre')).value;
      const minScore = Number(/** @type {HTMLInputElement} */ (document.getElementById('random-score')).value);
      const format = /** @type {HTMLSelectElement} */ (document.getElementById('random-format')).value;
      savedFilters = { genre, minScore, format };
      showLoading();
      fetchRandom();
    };
  }

  function showLoading() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;
    container.innerHTML = `
      <div class="search-overlay" id="random-overlay">
        <div class="random-card-loading">
          <div class="loader-spinner" style="margin:0 auto 16px"></div>
          <p class="random-loader-text">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="vertical-align:middle;margin-right:4px">
              <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.2a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.06a.75.75 0 001.5 0v-2.082l.312.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39l-.002.005zM4.688 8.576a5.5 5.5 0 019.2-2.466l.312.31h-2.2a.75.75 0 000 1.5h4.01a.75.75 0 00.75-.75V3.15a.75.75 0 00-1.5 0v2.082l-.312-.31a7 7 0 00-11.712 3.138.75.75 0 001.449.39l.002-.004z" clip-rule="evenodd"/>
            </svg>
            Suche zufälligen Anime…
          </p>
        </div>
      </div>`;
  }

  /**
   * Picks a random anime from AniList using searchAnimePage with filters.
   * Falls back to a random genre when none is selected.
   */
  async function fetchRandom() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    const filters = savedFilters || { genre: '', minScore: 0, format: '' };
    // API braucht mindestens einen Filter (search/genre/tag)
    const genre = filters.genre ||
      ANIME_GENRES[Math.floor(Math.random() * ANIME_GENRES.length)];

    try {
      // Bis zu 5 Versuche, einen passenden Anime zu finden
      for (let attempt = 0; attempt < 5; attempt++) {
        const page = Math.floor(Math.random() * 5) + 1;
        const result = await anilistAdapter.searchAnimePage('', genre, '', page, 'POPULARITY_DESC');
        if (!result || !result.results || result.results.length === 0) {
          continue;
        }

        let candidates = result.results;
        if (filters.minScore > 0) {
          candidates = candidates.filter(a => a.average_score != null && a.average_score >= filters.minScore);
        }
        if (filters.format) {
          candidates = candidates.filter(a => a.format === filters.format);
        }

        if (candidates.length === 0) {
          continue;
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        const anime = await anilistAdapter.getAnimeById(chosen.anilist_id);
        if (anime) {
          showResult(anime);
          return;
        }
      }

      // Nach 5 Versuchen kein passender Anime
      showError();
    } catch {
      showError();
    }
  }

  function showError() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;
    container.innerHTML = `
      <div class="search-overlay" id="random-overlay">
        <div class="random-card-error">
          <p class="random-error-text">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="vertical-align:middle;margin-right:4px">
              <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            Kein Anime gefunden. Nochmal versuchen?
          </p>
          <button id="random-retry" class="btn btn-primary random-btn-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style="vertical-align:middle;margin-right:4px">
              <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.2a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.06a.75.75 0 001.5 0v-2.082l.312.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39l-.002.005zM4.688 8.576a5.5 5.5 0 019.2-2.466l.312.31h-2.2a.75.75 0 000 1.5h4.01a.75.75 0 00.75-.75V3.15a.75.75 0 00-1.5 0v2.082l-.312-.31a7 7 0 00-11.712 3.138.75.75 0 001.449.39l.002-.004z" clip-rule="evenodd"/>
            </svg>
            Erneut versuchen
          </button>
          <button id="random-close-fail" class="btn btn-secondary random-btn-full" style="margin-top:8px">Schließen</button>
        </div>
      </div>`;
    document.getElementById('random-retry').onclick = () => { container.innerHTML = ''; setTimeout(fetchRandom, 50); };
    document.getElementById('random-close-fail').onclick = () => { container.innerHTML = ''; };
  }

  function showResult(anime) {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    const title = anime.title_english || anime.title_romaji;
    const isInList = state.getState().watchlist.some(a => a.anilist_id === anime.anilist_id);
    container.innerHTML = `
      <div class="search-overlay" id="random-overlay" style="overflow-y:auto">
        <div class="random-card">
          ${anime.cover_url ? `<img class="random-cover" src="${anime.cover_url}" alt="" />` : ''}
          <div class="random-body">
            <h3 class="random-title">${title}</h3>
            <div class="random-subtitle">${anime.title_romaji}</div>
            <div class="random-genres">
              ${(anime.genres || []).slice(0,4).map(g => `<span class="genre-tag">${g}</span>`).join('')}
            </div>
            <div class="random-meta">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:2px">
                  <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"/>
                </svg>
                ${anime.average_score || '–'}%
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:2px">
                  <path d="M4 5h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zM3.5 17h13a.75.75 0 010 1.5h-13a.75.75 0 010-1.5z"/>
                </svg>
                ${anime.format || '–'}
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:2px">
                  <path d="M4 5h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zM3.5 17h13a.75.75 0 010 1.5h-13a.75.75 0 010-1.5z"/>
                </svg>
                ${anime.episodes || '?'} Ep.
              </span>
            </div>
            ${anime.description ? `<div class="random-synopsis">${anime.description.slice(0, 300)}${anime.description.length > 300 ? '…' : ''}</div>` : ''}
            ${isInList
              ? `<div class="random-in-list">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:2px">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Bereits in der Sammlung
                </div>`
              : `<div class="random-add-section">
                  <div class="random-add-label">Gesehen von:</div>
                  <div class="random-who-row">
                    ${getUsers().map(user => `
                      <label class="search-who-checkbox random-who-checkbox">
                        <input type="checkbox" class="random-who-cb" value="${user}" checked /> ${getUserLabel(user)}
                      </label>
                    `).join('')}
                  </div>
                </div>
                <button id="random-add" class="btn btn-primary random-btn-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style="vertical-align:middle;margin-right:4px">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
                  </svg>
                  Zur Sammlung hinzufügen
                </button>`
            }
            <button id="random-close" class="btn btn-secondary random-btn-full">Schließen</button>
            <button id="random-another" class="random-another-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style="vertical-align:middle;margin-right:4px">
                <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.2a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.06a.75.75 0 001.5 0v-2.082l.312.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39l-.002.005zM4.688 8.576a5.5 5.5 0 019.2-2.466l.312.31h-2.2a.75.75 0 000 1.5h4.01a.75.75 0 00.75-.75V3.15a.75.75 0 00-1.5 0v2.082l-.312-.31a7 7 0 00-11.712 3.138.75.75 0 001.449.39l.002-.004z" clip-rule="evenodd"/>
              </svg>
              Nächster Zufalls-Anime
            </button>
          </div>
        </div>
      </div>`;

    document.getElementById('random-close').onclick = () => { container.innerHTML = ''; };
    document.getElementById('random-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) container.innerHTML = '';
    });
    document.getElementById('random-another').onclick = () => {
      container.innerHTML = '';
      showLoading();
      setTimeout(fetchRandom, 50);
    };

    if (!isInList) {
      document.getElementById('random-add').addEventListener('click', () => {
        const checkedUsers = [];
        document.querySelectorAll('.random-who-cb:checked').forEach(cb => checkedUsers.push(cb.value));
        if (checkedUsers.length === 0) { alert('Bitte mindestens eine Person auswählen.'); return; }
        const animeData = {
          anilist_id: anime.anilist_id, title_romaji: anime.title_romaji,
          title_english: anime.title_english, genres: anime.genres,
          average_score: anime.average_score, episodes: anime.episodes,
          format: anime.format, cover_url: anime.cover_url,
        };
        try {
          useCases.addAnimeToList(animeData, checkedUsers[0]);
          if (checkedUsers.length >= 2) {
            useCases.toggleViewer(anime.anilist_id, checkedUsers[1]);
          }
          container.innerHTML = '';
        } catch (err) {
          alert('Fehler: ' + err.message);
        }
      });
    }
  }

  return { show };
}
