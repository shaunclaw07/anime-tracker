import { getUsers, getUserLabels, getDefaultUser, getUserLabel, saveUsers } from '../config.js';

/**
 * createSettingsModal — User settings (labels, name editing).
 *
 * @param {object} state - Global state
 * @param {object} useCases - Application use cases
 * @returns {{ show: () => void }}
 */
export function createSettingsModal(state, useCases) {
  function show() {
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
        const label0 = /** @type {HTMLInputElement} */ (document.getElementById('settings-label-0')).value.trim() || 'User 1';
        const label1 = /** @type {HTMLInputElement} */ (document.getElementById('settings-label-1')).value.trim() || 'User 2';
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
        const label0 = /** @type {HTMLInputElement} */ (document.getElementById('settings-label-0')).value.trim();
        const label1 = /** @type {HTMLInputElement} */ (document.getElementById('settings-label-1')).value.trim();
        if (!label0 || !label1) { alert('Bitte beide Namen ausfüllen.'); return; }
        const users = getUsers();
        const newLabels = { [users[0]]: label0, [users[1]]: label1 };
        saveUsers(users, newLabels, getDefaultUser());
        close();
      };
    }

    function close() { container.innerHTML = ''; }

    /** Migrates old user IDs to new ones in the watchlist */
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

    renderSettings();
  }

  return { show };
}
