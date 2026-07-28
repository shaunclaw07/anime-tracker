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
          <h2 class="settings-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="vertical-align:middle;margin-right:4px"><path fill-rule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.498 6.498 0 011.321.764l1.584-.497a1 1 0 011.15.418l1.18 2.018a1 1 0 01-.068 1.219l-1.093 1.312c.044.246.068.497.068.752 0 .255-.024.506-.068.752l1.093 1.312a1 1 0 01.068 1.22l-1.18 2.017a1 1 0 01-1.15.419l-1.584-.497a6.498 6.498 0 01-1.321.764l-.331 1.652A1 1 0 0111.18 19H8.82a1 1 0 01-.98-.804l-.331-1.652a6.498 6.498 0 01-1.321-.764l-1.584.497a1 1 0 01-1.15-.418l-1.18-2.018a1 1 0 01.068-1.219l1.093-1.312A6.495 6.495 0 014 10c0-.255.024-.506.068-.752L2.975 7.936a1 1 0 01-.068-1.22l1.18-2.017a1 1 0 011.15-.419l1.584.497a6.498 6.498 0 011.321-.764l.331-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg> Einstellungen</h2>
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
