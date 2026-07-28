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
          <p class="random-loader-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="vertical-align:middle;margin-right:4px"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.2a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.06a.75.75 0 001.5 0v-2.082l.312.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39l-.002.005zM4.688 8.576a5.5 5.5 0 019.2-2.466l.312.31h-2.2a.75.75 0 000 1.5h4.01a.75.75 0 00.75-.75V3.15a.75.75 0 00-1.5 0v2.082l-.312-.31a7 7 0 00-11.712 3.138.75.75 0 001.449.39l.002-.004z" clip-rule="evenodd"/></svg> Suche zufälligen Anime…</p>
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
            <p class="random-error-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="vertical-align:middle;margin-right:4px"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg> Kein Anime gefunden. Nochmal versuchen?</p>
            <button id="random-retry" class="btn btn-primary random-btn-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style="vertical-align:middle;margin-right:4px"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.2a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.06a.75.75 0 001.5 0v-2.082l.312.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39l-.002.005zM4.688 8.576a5.5 5.5 0 019.2-2.466l.312.31h-2.2a.75.75 0 000 1.5h4.01a.75.75 0 00.75-.75V3.15a.75.75 0 00-1.5 0v2.082l-.312-.31a7 7 0 00-11.712 3.138.75.75 0 001.449.39l.002-.004z" clip-rule="evenodd"/></svg> Erneut versuchen</button>
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
              <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:2px"><path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"/></svg> ${anime.average_score || '–'}%</span>
              <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:2px"><path d="M4 5h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zM3.5 17h13a.75.75 0 010 1.5h-13a.75.75 0 010-1.5z"/></svg> ${anime.format || '–'}</span>
              <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:2px"><path d="M4 5h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zM3.5 17h13a.75.75 0 010 1.5h-13a.75.75 0 010-1.5z"/></svg> ${anime.episodes || '?'} Ep.</span>
            </div>`
            + (anime.description ? `<div class="random-synopsis">${anime.description.slice(0, 300)}${anime.description.length > 300 ? '…' : ''}</div>` : '')
            + (isInList ? `<div class="random-in-list"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:2px"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Bereits in der Sammlung</div>`
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
              <button id="random-add" class="btn btn-primary random-btn-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style="vertical-align:middle;margin-right:4px"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/></svg> Zur Sammlung hinzufügen</button>`)
            + `<button id="random-close" class="btn btn-secondary random-btn-full">Schließen</button>
            <button id="random-another" class="random-another-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style="vertical-align:middle;margin-right:4px"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.2a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.06a.75.75 0 001.5 0v-2.082l.312.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39l-.002.005zM4.688 8.576a5.5 5.5 0 019.2-2.466l.312.31h-2.2a.75.75 0 000 1.5h4.01a.75.75 0 00.75-.75V3.15a.75.75 0 00-1.5 0v2.082l-.312-.31a7 7 0 00-11.712 3.138.75.75 0 001.449.39l.002-.004z" clip-rule="evenodd"/></svg> Nächster Zufalls-Anime</button>
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
