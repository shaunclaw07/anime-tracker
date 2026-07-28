import { getUsers, getUserLabel } from '../config.js';

/**
 * createRandomModal — Shows a random anime with option to add it.
 *
 * @param {object} state - Global state
 * @param {object} useCases - Application use cases
 * @param {object} anilistAdapter - AniList API adapter
 * @returns {{ show: () => void }}
 */
export function createRandomModal(state, useCases, anilistAdapter) {
  function show() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="search-overlay" id="random-overlay">
        <div class="random-card-loading">
          <div class="loader-spinner" style="margin:0 auto 16px"></div>
          <p class="random-loader-text">🎲 Suche zufälligen Anime…</p>
        </div>
      </div>`;

    async function fetchRandom() {
      for (let attempt = 0; attempt < 10; attempt++) {
        const randomId = Math.floor(Math.random() * 50000) + 1;
        try {
          const anime = await anilistAdapter.getAnimeById(randomId);
          if (anime) {
            showResult(anime);
            return;
          }
        } catch { /* weitermachen */ }
      }
      container.innerHTML = `
        <div class="search-overlay" id="random-overlay">
          <div class="random-card-error">
            <p class="random-error-text">😕 Kein Anime gefunden. Nochmal versuchen?</p>
            <button id="random-retry" class="btn btn-primary random-btn-full">🎲 Erneut versuchen</button>
            <button id="random-close-fail" class="btn btn-secondary random-btn-full" style="margin-top:8px">Schließen</button>
          </div>
        </div>`;
      document.getElementById('random-retry').onclick = () => { container.innerHTML = ''; setTimeout(fetchRandom, 50); };
      document.getElementById('random-close-fail').onclick = () => { container.innerHTML = ''; };
    }

    function showResult(anime) {
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
              <span>⭐ ${anime.average_score || '–'}%</span>
              <span>📺 ${anime.format || '–'}</span>
              <span>📺 ${anime.episodes || '?'} Ep.</span>
            </div>`
            + (anime.description ? `<div class="random-synopsis">${anime.description.slice(0, 300)}${anime.description.length > 300 ? '…' : ''}</div>` : '')
            + (isInList ? `<div class="random-in-list">✅ Bereits in der Sammlung</div>`
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
              <button id="random-add" class="btn btn-primary random-btn-full">➕ Zur Sammlung hinzufügen</button>`)
            + `<button id="random-close" class="btn btn-secondary random-btn-full">Schließen</button>
            <button id="random-another" class="random-another-btn">🎲 Nächster Zufalls-Anime</button>
          </div>
        </div>
      </div>`;

      document.getElementById('random-close').onclick = () => { container.innerHTML = ''; };
      document.getElementById('random-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) container.innerHTML = '';
      });
      document.getElementById('random-another').onclick = () => { container.innerHTML = ''; setTimeout(fetchRandom, 50); };

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

    fetchRandom();
  }

  return { show };
}
