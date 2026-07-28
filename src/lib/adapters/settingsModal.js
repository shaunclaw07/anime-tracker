import { getUsers, getUserLabel, saveLabels } from '../config.js';

/**
 * createSettingsModal — User settings (label editing).
 *
 * @returns {{ show: () => void }}
 */
export function createSettingsModal() {
  function show() {
    const container = document.getElementById('search-modal-container');
    if (!container) return;

    function renderSettings() {
      const u = getUsers();
      container.innerHTML = `
      <div class="search-overlay" id="settings-overlay">
        <div class="settings-card">
          <h2 class="settings-title">⚙️ Einstellungen</h2>
          <label class="settings-field-label">Name ${getUserLabel(u[0])}:</label>
          <input id="settings-label-0" class="filter-input settings-input" value="${getUserLabel(u[0])}" placeholder="Name" />
          <label class="settings-field-label">Name ${getUserLabel(u[1])}:</label>
          <input id="settings-label-1" class="filter-input settings-input" value="${getUserLabel(u[1])}" placeholder="Name" />
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
      document.getElementById('settings-save').onclick = () => {
        const label0 = /** @type {HTMLInputElement} */ (document.getElementById('settings-label-0')).value.trim();
        const label1 = /** @type {HTMLInputElement} */ (document.getElementById('settings-label-1')).value.trim();
        if (!label0 || !label1) { alert('Bitte beide Namen ausfüllen.'); return; }
        const users = getUsers();
        saveLabels({ [users[0]]: label0, [users[1]]: label1 });
        close();
      };
    }

    function close() { container.innerHTML = ''; }
    renderSettings();
  }

  return { show };
}
