import { getUsers, getUserLabel } from '../config.js';

/**
 * createDetailModal — Shows anime details with edit controls.
 *
 * @param {object} state - Global state
 * @param {object} useCases - Application use cases
 * @returns {{ show: (anilistId: number) => void }}
 */
export function createDetailModal(state, useCases) {
  function show(anilistId) {
    const { watchlist } = state.getState();
    const anime = watchlist.find(a => a.anilist_id === anilistId);
    if (!anime) return;

    const title = anime.title_de || anime.title_english || anime.title_romaji;
    const container = document.getElementById('search-modal-container');
    if (!container) return;

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

            <div class="random-genres">
              ${(anime.genres || []).map(g => `<span class="genre-tag">${g}</span>`).join('')}
            </div>

            <div class="detail-meta">
              <span>⭐ ${anime.average_score || '–'}% Community</span>
              <span>📺 ${anime.format || '–'}</span>
              <span>📺 ${anime.episodes || '?'} Ep.</span>
            </div>

            <div class="detail-section">
              <div class="detail-section-label">Gesehen von:</div>
              <div class="detail-who-btns">
                ${detailWhoButtons}
              </div>
            </div>

            <div class="detail-section">
              <div class="detail-section-label">Bewertung:</div>
              <div class="detail-who-btns" style="gap:16px;flex-wrap:wrap">
                ${detailRatingSections}
              </div>
            </div>

            ${anime.description ? `<div class="detail-section">
              <div class="detail-section-label-sm">Synopsis</div>
              <div class="detail-synopsis">${anime.description}</div>
            </div>` : ''}

            <button id="detail-close" class="detail-close-btn">Schließen</button>
          </div>
        </div>
      </div>`;

    document.getElementById('detail-close').onclick = () => { container.innerHTML = ''; };
    document.getElementById('detail-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) container.innerHTML = '';
    });

    document.querySelectorAll('.detail-who-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const user = btn.dataset.user;
        useCases.toggleViewer(id, user);
        const isActive = btn.classList.toggle('active');
        btn.classList.toggle('active-michelle', isActive && user === getUsers()[1]);
        btn.style.background = isActive
          ? (user === getUsers()[0] ? 'var(--color-secondary)' : 'var(--color-success)')
          : 'var(--color-muted)';
        btn.style.color = isActive ? 'white' : 'var(--color-muted-foreground)';
      });
    });

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

  return { show };
}
