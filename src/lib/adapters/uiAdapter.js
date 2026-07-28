import { cardTemplate, filterSheetTemplate, filterSummaryTemplate } from './templates.js';
import { extractGenres } from '../domain/filters.js';
import { updateTabTitle } from '../application/tabTitle.js';
import { getUsers, getUserLabels, getDefaultUser, getUserLabel, saveUsers } from '../config.js';
import { createSearchState } from './uiState.js';
import { createSearchModal } from './searchModal.js';

/**
 * createUiAdapter — Creates the DOM adapter connecting state, useCases, and AniList.
 *
 * @param {{ getState: () => object, setState: (partial: object) => void, subscribe: (fn) => () => void }} state
 * @param {object} useCases
 * @param {{ searchAnime: (query: string) => Promise<Array<object>> }} anilistAdapter
 * @returns {{ init: () => void, render: () => void }}
 */
export function createUiAdapter(state, useCases, anilistAdapter) {
  const uiState = createSearchState();
  const searchModal = createSearchModal(state, useCases, anilistAdapter, uiState);

  /* ------------------------------------------------------------------ */
  /*  render                                                              */
  /* ------------------------------------------------------------------ */
  function render() {
    const { watchlist, deTitles, filters } = state.getState();
    const grid = document.getElementById('anime-grid');
    const filterSummary = document.getElementById('filter-summary');
    if (!grid) return;

    const filtered = useCases.getFilteredWatchlist();

    // Clear grid
    grid.innerHTML = '';

    if (watchlist.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'anime-grid-empty';
      emptyEl.innerHTML = `
        <div class="anime-grid-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="32" height="32"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg></div>
        <p class="anime-grid-empty-text">Noch keine Animes in der Sammlung.</p>
        <p class="anime-grid-empty-sub">Tippe auf +, um zu starten.</p>
      `;
      grid.appendChild(emptyEl);
    } else if (filtered.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'anime-grid-empty';
      emptyEl.innerHTML = `
        <div class="anime-grid-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="32" height="32"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg></div>
        <p class="anime-grid-empty-text">Keine Treffer</p>
        <p class="anime-grid-empty-sub">Versuche andere Filter.</p>
      `;
      grid.appendChild(emptyEl);
    } else {
      grid.innerHTML = filtered.map((a) => cardTemplate(a, deTitles)).join('');
    }

    // Update stats
    updateStats(watchlist);

    // Update filter summary
    updateFilterSummary(filters);

    // Populate inline genre tags & update filter sheet on next open
    const allGenres = extractGenres(watchlist);
    populateInlineGenreTags(allGenres, filters);

    // If filter sheet is open, update it
    const filterPanel = document.getElementById('filter-panel');
    if (filterPanel) {
      const container = document.getElementById('filter-sheet-container');
      if (container) {
        container.innerHTML = filterSheetTemplate(filters, allGenres);
        bindFilterSheetEvents();
      }
    }

    // Update desktop inline filter bar
    updateDesktopFilterBar(filters, allGenres);
  }

  /* ------------------------------------------------------------------ */
  /*  updateStats                                                         */
  /* ------------------------------------------------------------------ */
  function updateStats(watchlist) {
    const statsContainer = document.getElementById('stats');
    if (!statsContainer) return;

    const both = watchlist.filter(
      (a) => a.watched_by && a.watched_by.includes(getUsers()[0]) && a.watched_by.includes(getUsers()[1]),
    ).length;

    // Stat-Karten dynamisch rendern (User-Karten clientseitig)
    let html = `
      <div class="stat-card stat-total">
        <span class="stat-card-number" id="total-count">${watchlist.length}</span>
        <span class="stat-card-label">Gesamt</span>
      </div>
      <div class="stat-card stat-both">
        <span class="stat-card-number" id="both-count">${both}</span>
        <span class="stat-card-label">Gemeinsam</span>
      </div>`;

    getUsers().forEach(user => {
      const count = watchlist.filter(a => a.watched_by?.includes(user)).length;
      html += `
        <div class="stat-card stat-${user}">
          <span class="stat-card-number">${count}</span>
          <span class="stat-card-label">${getUserLabel(user)}</span>
        </div>`;
    });

    statsContainer.innerHTML = html;
  }

  /* ------------------------------------------------------------------ */
  /*  updateFilterSummary                                                 */
  /* ------------------------------------------------------------------ */
  function updateFilterSummary(filters) {
    const el = document.getElementById('filter-summary');
    if (!el) return;

    let count = 0;
    if (filters.genres && filters.genres.length > 0) count++;
    if (filters.minScore && filters.minScore > 0) count++;
    if (filters.watchedBy) count++;
    if (filters.query) count++;

    el.innerHTML = filterSummaryTemplate(count);
  }

  /* ------------------------------------------------------------------ */
  /*  populateInlineGenreTags                                             */
  /* ------------------------------------------------------------------ */
  function populateInlineGenreTags(allGenres, filters) {
    const tagsContainer = document.getElementById('filter-genre-tags');
    if (!tagsContainer) return;

    const selectedGenres = filters.genres || [];
    tagsContainer.innerHTML = allGenres.map((g) => {
      const active = selectedGenres.includes(g) ? 'active' : '';
      return `<span class="filter-genre-tag ${active}" data-genre="${g}">${g}</span>`;
    }).join('');
  }

  /* ------------------------------------------------------------------ */
  /*  updateDesktopFilterBar                                              */
  /* ------------------------------------------------------------------ */
  function updateDesktopFilterBar(filters, allGenres) {
    const desktopBar = document.getElementById('filter-desktop-bar');
    if (!desktopBar) return;

    const selectedGenres = filters.genres || [];
    const minScore = filters.minScore || 0;
    const watchedBy = filters.watchedBy || '';

    const genreTags = allGenres.map((g) => {
      const active = selectedGenres.includes(g) ? 'active' : '';
      return `<span class="filter-genre-tag ${active}" data-genre="${g}">${g}</span>`;
    }).join('');

    const whoButtons = getUsers().map(user => {
      const active = watchedBy === user ? 'active' : '';
      return `<button class="filter-who-btn ${active}" data-who="${user}">${getUserLabel(user)}</button>`;
    }).join('');

    desktopBar.innerHTML = `
      <div class="filter-desktop-inner">
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Genre</span>
          <div class="filter-genre-tags" id="filter-genre-tags-desktop">
            ${genreTags}
          </div>
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Score ≥ ${minScore}</span>
          <input type="range" class="filter-range" id="filter-score-desktop" min="0" max="100" value="${minScore}" step="1" />
        </div>
        <div class="filter-desktop-section">
          <span class="filter-panel-label">Gesehen von</span>
          <div class="filter-who-toggle">
            <button class="filter-who-btn ${watchedBy === 'both' ? 'active' : ''}" data-who="both">Beide</button>
            ${whoButtons}
          </div>
        </div>
      </div>
    `;

    // Bind desktop filter events
    bindDesktopFilterEvents();
  }

  /* ------------------------------------------------------------------ */
  /*  init                                                                */
  /* ------------------------------------------------------------------ */
  function init() {
    // Initial render
    render();

    // Subscribe to state changes
    state.subscribe(() => { render(); updateTabTitle(state.getState().watchlist.length); });

    // --- FAB / Add anime button ---
    const addBtn = document.getElementById('btn-add-anime');
    if (addBtn) {
      addBtn.addEventListener('click', showSearchModal);
    }
    const addBtnDesktop = document.getElementById('btn-add-anime-desktop');
    if (addBtnDesktop) {
      addBtnDesktop.addEventListener('click', showSearchModal);
    }

    // --- Export button ---
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => useCases.exportDownload());
    }

    // --- Random button ---
    const randomBtn = document.getElementById('btn-random');
    if (randomBtn) {
      randomBtn.addEventListener('click', showRandomAnime);
    }

    // --- Settings button ---
    const settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', showSettings);
    }

    const exportBtnDesktop = document.getElementById('btn-export-desktop');
    if (exportBtnDesktop) {
      exportBtnDesktop.addEventListener('click', () => useCases.exportDownload());
    }

    // --- Filter Summary (opens bottom sheet) ---
    const filterSummary = document.getElementById('filter-summary');
    if (filterSummary) {
      filterSummary.addEventListener('click', (e) => {
        const resetBtn = e.target.closest('#filter-summary-reset');
        if (resetBtn) {
          e.stopPropagation();
          useCases.setFilters({});
          return;
        }
        showFilterSheet();
      });
    }

    // --- Event delegation on grid ---
    const grid = document.getElementById('anime-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) {
          const action = btn.dataset.action;
          const id = Number(btn.dataset.id);
          if (isNaN(id)) return;

          if (action === 'remove') {
            const anime = state.getState().watchlist.find(a => a.anilist_id === id);
            useCases.removeAnimeFromList(id);
            showUndoToast(anime, id);
          } else if (action === `toggle-${getUsers()[0]}` || action === `toggle-${getUsers()[1]}`) {
            const user = action.replace('toggle-', '');
            useCases.toggleViewer(id, user);
          }
          return;
        }

        // Klick auf Karte (nicht auf Button) → Detail-Modal
        const card = e.target.closest('.anime-card');
        if (card) {
          const id = Number(card.dataset.id);
          if (!isNaN(id)) {
            showDetailModal(id);
          }
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  showFilterSheet                                                     */
  /* ------------------------------------------------------------------ */
  function showFilterSheet() {
    const container = document.getElementById('filter-sheet-container');
    if (!container) return;

    const { watchlist, filters } = state.getState();
    const allGenres = extractGenres(watchlist);

    container.innerHTML = filterSheetTemplate(filters, allGenres);
    bindFilterSheetEvents();
  }

  /* ------------------------------------------------------------------ */
  /*  bindFilterSheetEvents                                               */
  /* ------------------------------------------------------------------ */
  function bindFilterSheetEvents() {
    // Close button
    const closeBtn = document.getElementById('filter-panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeFilterSheet);
    }

    // Overlay click to close
    const overlay = document.getElementById('filter-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeFilterSheet);
    }

    // Genre tags toggle
    const tagsContainer = document.getElementById('filter-genre-tags');
    if (tagsContainer) {
      tagsContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-genre-tag');
        if (!tag) return;
        tag.classList.toggle('active');
        // Update visual checkmark
        const check = tag.querySelector('svg');
        if (tag.classList.contains('active')) {
          if (!check) {
            tag.insertAdjacentHTML('afterbegin', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> ');
          }
        } else if (check) {
          check.remove();
        }
      });
    }

    // Score slider
    const scoreSlider = document.getElementById('filter-score');
    const scoreDisplay = document.getElementById('filter-score-display');
    const scoreValue = document.getElementById('filter-score-value');
    if (scoreSlider && scoreDisplay) {
      scoreSlider.addEventListener('input', () => {
        const val = scoreSlider.value;
        scoreDisplay.textContent = val;
        if (scoreValue) scoreValue.textContent = val;
      });
    }

    // Who toggle buttons
    const whoToggle = document.getElementById('filter-who-toggle');
    if (whoToggle) {
      whoToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-who-btn');
        if (!btn) return;
        const isActive = btn.classList.contains('active');
        whoToggle.querySelectorAll('.filter-who-btn').forEach((b) => b.classList.remove('active'));
        if (!isActive) {
          btn.classList.add('active');
        }
      });
    }

    // Apply button
    const applyBtn = document.getElementById('filter-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        // Read genre selections
        const genreTags = document.querySelectorAll('#filter-genre-tags .filter-genre-tag.active');
        const genres = Array.from(genreTags).map((t) => t.dataset.genre);

        // Read score
        const scoreSlider = document.getElementById('filter-score');
        const minScore = scoreSlider ? Number(scoreSlider.value) : 0;

        // Read who
        const activeWho = document.querySelector('#filter-who-toggle .filter-who-btn.active');
        const watchedBy = activeWho ? activeWho.dataset.who : '';

        const newFilters = { ...state.getState().filters };
        if (genres.length > 0) {
          newFilters.genres = genres;
        } else {
          delete newFilters.genres;
        }
        if (minScore > 0) {
          newFilters.minScore = minScore;
        } else {
          delete newFilters.minScore;
        }
        if (watchedBy) {
          newFilters.watchedBy = watchedBy;
        } else {
          delete newFilters.watchedBy;
        }

        useCases.setFilters(newFilters);
        closeFilterSheet();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        useCases.setFilters({});
        closeFilterSheet();
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  bindDesktopFilterEvents                                             */
  /* ------------------------------------------------------------------ */
  function bindDesktopFilterEvents() {
    // Genre tags
    const tagsContainer = document.getElementById('filter-genre-tags-desktop');
    if (tagsContainer) {
      tagsContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-genre-tag');
        if (!tag) return;
        tag.classList.toggle('active');
        applyDesktopFilters();
      });
    }

    // Score slider
    const scoreSlider = document.getElementById('filter-score-desktop');
    if (scoreSlider) {
      scoreSlider.addEventListener('input', () => {
        applyDesktopFilters();
      });
    }

    // Who toggle
    const whoToggle = document.querySelector('#filter-desktop-bar .filter-who-toggle');
    if (whoToggle) {
      whoToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-who-btn');
        if (!btn) return;
        const isActive = btn.classList.contains('active');
        whoToggle.querySelectorAll('.filter-who-btn').forEach((b) => b.classList.remove('active'));
        if (!isActive) {
          btn.classList.add('active');
        }
        applyDesktopFilters();
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  applyDesktopFilters                                                 */
  /* ------------------------------------------------------------------ */
  function applyDesktopFilters() {
    const genreTags = document.querySelectorAll('#filter-genre-tags-desktop .filter-genre-tag.active');
    const genres = Array.from(genreTags).map((t) => t.dataset.genre);

    const scoreSlider = document.getElementById('filter-score-desktop');
    const minScore = scoreSlider ? Number(scoreSlider.value) : 0;

    const activeWho = document.querySelector('#filter-desktop-bar .filter-who-btn.active');
    const watchedBy = activeWho ? activeWho.dataset.who : '';

    const newFilters = { ...state.getState().filters };
    if (genres.length > 0) {
      newFilters.genres = genres;
    } else {
      delete newFilters.genres;
    }
    if (minScore > 0) {
      newFilters.minScore = minScore;
    } else {
      delete newFilters.minScore;
    }
    if (watchedBy) {
      newFilters.watchedBy = watchedBy;
    } else {
      delete newFilters.watchedBy;
    }

    useCases.setFilters(newFilters);
  }

  /* ------------------------------------------------------------------ */
  /*  closeFilterSheet                                                    */
  /* ------------------------------------------------------------------ */
  function closeFilterSheet() {
    const container = document.getElementById('filter-sheet-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  /* ------------------------------------------------------------------ */
  /*  showSearchModal                                                     */
  /* ------------------------------------------------------------------ */

  function showSearchModal() {
    searchModal.show();
  }

  /* ------------------------------------------------------------------ */
  /*  showUndoToast                                                        */
  /* ------------------------------------------------------------------ */
  function showUndoToast(anime, anilistId) {
    const existing = document.getElementById('undo-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'undo-toast';
    toast.innerHTML = `<span>🗑️ Gelöscht</span><button id="undo-btn" style="color:var(--color-primary);font-weight:700;background:none;border:none;cursor:pointer;padding:4px 8px">Rückgängig</button>`;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--color-card)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)', padding: '12px 20px', zIndex: '300',
      display: 'flex', alignItems: 'center', gap: '16px',
      fontSize: '0.9rem', boxShadow: 'var(--shadow-lg)',
      animation: 'slideUp 0.3s ease',
    });
    document.body.appendChild(toast);

    document.getElementById('undo-btn').addEventListener('click', () => {
      useCases.addAnimeToList(anime, getDefaultUser());
      if (anime.watched_by?.includes(getUsers()[1])) {
        useCases.toggleViewer(anilistId, getUsers()[1]);
      }
      toast.remove();
    });

    setTimeout(() => toast.remove(), 4000);
  }

  /* ------------------------------------------------------------------ */
  /*  showRandomAnime                                                     */
  /* ------------------------------------------------------------------ */
  function showRandomAnime() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    let loading = true;
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
        } catch {
          // weitermachen
        }
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
        const addBtn = document.getElementById('random-add');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
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
    }

    fetchRandom();
  }

  /* ------------------------------------------------------------------ */
  /*  showDetailModal                                                     */
  /* ------------------------------------------------------------------ */
  function showDetailModal(anilistId) {
    const { watchlist } = state.getState();
    const anime = watchlist.find(a => a.anilist_id === anilistId);
    if (!anime) return;

    const title = anime.title_de || anime.title_english || anime.title_romaji;
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    // Build dynamic sections for detail modal
    const detailWhoButtons = getUsers().map(user => {
      const isActive = anime.watched_by?.includes(user);
      const bgColor = isActive ? (user === getUsers()[0] ? 'var(--color-secondary)' : 'var(--color-success)') : 'var(--color-muted)';
      const txtColor = isActive ? 'white' : 'var(--color-muted-foreground)';
      const userClass = isActive ? (user === getUsers()[0] ? 'active' : 'active-michelle') : '';
      return `<button class="detail-who-btn ${userClass}" data-id="${anime.anilist_id}" data-user="${user}" style="background:${bgColor};color:${txtColor}">🙋 ${getUserLabel(user)}</button>`;
    }).join('');

    const detailRatingSections = getUsers().map(user => {
      const rating = anime.ratings?.find(r => r.user === user)?.score || 0;
      const displayRating = rating > 0 ? String(rating) : '–';
      return `<div class="detail-rating-col">
                  <div class="detail-rating-label">${getUserLabel(user)}: <span id="detail-rating-${user}">${displayRating}</span>/10</div>
                  <input type="range" min="0" max="10" value="${rating}" class="detail-rating-slider" data-user="${user}" data-id="${anime.anilist_id}" />
                </div>`;
    }).join('');

    container.innerHTML = `
      <div class="search-overlay" id="detail-overlay" style="overflow-y:auto">
        <div class="detail-modal">
          ${anime.cover_url ? `<img class="detail-cover" src="${anime.cover_url}" alt="" />` : ''}
          <div class="detail-body">
            <h2 class="detail-title">${title}</h2>
            <div class="detail-subtitle">${anime.title_romaji}${anime.title_english && anime.title_english !== anime.title_romaji ? ` · ${anime.title_english}` : ''}</div>

            <!-- Genres + Tags -->
            <div class="random-genres">
              ${(anime.genres || []).map(g => `<span class="genre-tag">${g}</span>`).join('')}
            </div>

            <!-- Meta -->
            <div class="detail-meta">
              <span>⭐ ${anime.average_score || '–'}% Community</span>
              <span>📺 ${anime.format || '–'}</span>
              <span>📺 ${anime.episodes || '?'} Ep.</span>
            </div>

            <!-- Gesehen von (editierbar) -->
            <div class="detail-section">
              <div class="detail-section-label">Gesehen von:</div>
              <div class="detail-who-btns">
                ${detailWhoButtons}
              </div>
            </div>

            <!-- Rating (editierbar) -->
            <div class="detail-section">
              <div class="detail-section-label">Bewertung:</div>
              <div class="detail-who-btns" style="gap:16px;flex-wrap:wrap">
                ${detailRatingSections}
              </div>
            </div>

            <!-- Synopsis -->
            ${anime.description ? `<div class="detail-section">
              <div class="detail-section-label-sm">Synopsis</div>
              <div class="detail-synopsis">${anime.description}</div>
            </div>` : ''}

            <button id="detail-close" class="detail-close-btn">Schließen</button>
          </div>
        </div>
      </div>`;

    // Close handler
    document.getElementById('detail-close').onclick = () => { container.innerHTML = ''; };
    document.getElementById('detail-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) container.innerHTML = '';
    });

    // Toggle "Gesehen von"
    document.querySelectorAll('.detail-who-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const user = btn.dataset.user;
        useCases.toggleViewer(id, user);
        // UI sofort updaten ohne Modal zu schließen
        const isActive = btn.classList.toggle('active');
        btn.classList.toggle('active-michelle', isActive && user === getUsers()[1]);
        btn.style.background = isActive
          ? (user === getUsers()[0] ? 'var(--color-secondary)' : 'var(--color-success)')
          : 'var(--color-muted)';
        btn.style.color = isActive ? 'white' : 'var(--color-muted-foreground)';
      });
    });

    // Rating Slider
    document.querySelectorAll('.detail-rating-slider').forEach(slider => {
      slider.addEventListener('input', () => {
        const id = Number(slider.dataset.id);
        const user = slider.dataset.user;
        const score = Number(slider.value);
        const display = document.getElementById(`detail-rating-${user}`);
        if (display) display.textContent = score > 0 ? String(score) : '–';
        if (score > 0) {
          useCases.updateRating(id, user, score);
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  showSettings                                                        */
  /* ------------------------------------------------------------------ */
  function showSettings() {
    const current = { users: getUsers(), labels: getUserLabels(), defaultUser: getDefaultUser() };
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    function renderSettings() {
      const u = getUsers();
      const l = getUserLabels();
      container.innerHTML = `
      <div class="search-overlay" id="settings-overlay">
        <div class="settings-card">
          <h2 class="settings-title">⚙️ Einstellungen</h2>
          <div class="settings-info">
            User-IDs: <code style="color:var(--color-primary)">${u[0]}</code> · <code style="color:var(--color-primary)">${u[1]}</code>
            <button id="settings-generate" class="settings-generate-btn">🔄 neu generieren</button>
          </div>
          <label class="settings-field-label">Name User 1:</label>
          <input id="settings-label-0" class="filter-input settings-input" value="${l[u[0]]}" placeholder="Name" />
          <label class="settings-field-label">Name User 2:</label>
          <input id="settings-label-1" class="filter-input settings-input" value="${l[u[1]]}" placeholder="Name" />
          <div class="settings-actions">
            <button id="settings-cancel" class="btn btn-secondary settings-action-btn">Abbrechen</button>
            <button id="settings-save" class="btn btn-primary settings-action-btn">Speichern</button>
          </div>
        </div>
      </div>`;

      document.getElementById('settings-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) close();
      });
      document.getElementById('settings-cancel').onclick = close;
      document.getElementById('settings-generate').onclick = () => {
        const label0 = document.getElementById('settings-label-0').value.trim() || 'User 1';
        const label1 = document.getElementById('settings-label-1').value.trim() || 'User 2';
        const oldIds = getUsers();
        const newId0 = 'u_' + Math.random().toString(36).substring(2, 8);
        const newId1 = 'u_' + Math.random().toString(36).substring(2, 8);
        const newUsers = [newId0, newId1];
        const newLabels = { [newId0]: label0, [newId1]: label1 };
        migrateUserIds(oldIds, newUsers);
        saveUsers(newUsers, newLabels, newId0);
        renderSettings();
      };
      document.getElementById('settings-save').onclick = () => {
        const label0 = document.getElementById('settings-label-0').value.trim();
        const label1 = document.getElementById('settings-label-1').value.trim();
        if (!label0 || !label1) { alert('Bitte beide Namen ausfüllen.'); return; }
        const users = getUsers();
        const newLabels = { [users[0]]: label0, [users[1]]: label1 };
        saveUsers(users, newLabels, getDefaultUser());
        close();
        render();
        updateTabTitle();
      };
    }

    function close() { container.innerHTML = ''; }
    renderSettings();
  }

  /** Migriert alte User-IDs zu neuen in der Watchlist */
  function migrateUserIds(oldIds, newIds) {
    const { watchlist } = state.getState();
    let changed = false;
    const migrated = watchlist.map(anime => {
      let a = anime;
      for (let i = 0; i < oldIds.length; i++) {
        if (oldIds[i] === newIds[i]) continue;
        if (a.watched_by?.includes(oldIds[i])) {
          a = { ...a, watched_by: a.watched_by.map(id => id === oldIds[i] ? newIds[i] : id) };
          changed = true;
        }
        if (a.ratings?.some(r => r.user === oldIds[i])) {
          a = { ...a, ratings: a.ratings.map(r => r.user === oldIds[i] ? { ...r, user: newIds[i] } : r) };
          changed = true;
        }
      }
      return a;
    });
    if (changed) {
      state.setState({ watchlist: migrated });
    }
  }

  return { init, render, updateTabTitle: () => updateTabTitle(state.getState().watchlist.length) };
}
