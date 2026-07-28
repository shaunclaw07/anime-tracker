/**
 * settingsView — Full-screen settings view.
 *
 * Replaces the settingsModal overlay with a dedicated full-screen view
 * rendered inside #view-settings.
 *
 * @param {object} state - Global state (getState, setState, subscribe)
 * @param {object} useCases - Application use cases (exportDownload, etc.)
 * @returns {{ show: () => void, hide: () => void }}
 */

import { getUsers, getUserLabel, saveLabels } from '../config.js';
import { iconSvg, settings, download, save, x } from '../icons.js';

/**
 * createSettingsView — Creates the settings view controller.
 *
 * @param {object} state - Global state store
 * @param {object} useCases - Application use cases
 * @returns {{ show: () => void, hide: () => void }}
 */
export function createSettingsView(state, useCases) {
  /* ── show() ────────────────────────────────────────────────── */

  function show() {
    const container = document.getElementById('view-settings');
    if (!container) return;

    const users = getUsers();
    const label0 = getUserLabel(users[0]);
    const label1 = getUserLabel(users[1]);
    const debugVisible =
      localStorage.getItem('anime-tracker-debug-visible') === 'true';

    const settingsIconHtml = iconSvg(settings, 20);
    const downloadIconHtml = iconSvg(download, 18);
    const saveIconHtml = iconSvg(save, 16);
    const xIconHtml = iconSvg(x, 18);

    container.innerHTML = `
      <div class="settings-view">
        <!-- Header -->
        <div class="settings-view-header">
          <h2 class="settings-view-title">${settingsIconHtml} Einstellungen</h2>
        </div>

        <!-- User label section -->
        <div class="settings-view-section">
          <h3 class="settings-view-section-title">Benutzer-Labels</h3>
          <label class="settings-view-label">Name ${label0}:</label>
          <input
            id="settings-label-0"
            class="settings-view-input"
            value="${label0}"
            placeholder="Name"
            autocomplete="off"
          />
          <label class="settings-view-label">Name ${label1}:</label>
          <input
            id="settings-label-1"
            class="settings-view-input"
            value="${label1}"
            placeholder="Name"
            autocomplete="off"
          />
        </div>

        <!-- Action buttons -->
        <div class="settings-view-actions">
          <button id="settings-cancel" class="btn btn-secondary settings-view-action-btn">
            ${xIconHtml} Abbrechen
          </button>
          <button id="settings-save" class="btn btn-primary settings-view-action-btn">
            ${saveIconHtml} Speichern
          </button>
        </div>

        <!-- Debug toggle -->
        <div class="settings-view-section">
          <h3 class="settings-view-section-title">Debug</h3>
          <label class="settings-view-toggle">
            <input
              type="checkbox"
              id="settings-debug-check"
              ${debugVisible ? 'checked' : ''}
            />
            <span class="settings-toggle-text">🐛 Debug-Log anzeigen</span>
          </label>
        </div>

        <!-- Export -->
        <div class="settings-view-section">
          <h3 class="settings-view-section-title">Daten</h3>
          <button id="settings-export" class="btn btn-primary settings-view-export-btn">
            ${downloadIconHtml} Daten exportieren (JSON)
          </button>
        </div>
      </div>
    `;

    bindEvents();
  }

  /* ── hide() ────────────────────────────────────────────────── */

  function hide() {
    const container = document.getElementById('view-settings');
    if (container) {
      container.innerHTML = '';
    }
  }

  /* ── Event binding ─────────────────────────────────────────── */

  function bindEvents() {
    // Cancel button
    const cancelBtn = document.getElementById('settings-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        // Optional — does nothing special, just closes view
      });
    }

    // Save button
    const saveBtn = document.getElementById('settings-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const input0 = /** @type {HTMLInputElement} */ (
          document.getElementById('settings-label-0')
        );
        const input1 = /** @type {HTMLInputElement} */ (
          document.getElementById('settings-label-1')
        );
        if (!input0 || !input1) return;

        const label0 = input0.value.trim();
        const label1 = input1.value.trim();
        if (!label0 || !label1) {
          alert('Bitte beide Namen ausfüllen.');
          return;
        }

        const users = getUsers();
        saveLabels({ [users[0]]: label0, [users[1]]: label1 });
      });
    }

    // Debug checkbox
    const debugCheck = document.getElementById('settings-debug-check');
    if (debugCheck) {
      debugCheck.addEventListener('change', () => {
        const visible = debugCheck.checked;
        localStorage.setItem(
          'anime-tracker-debug-visible',
          visible ? 'true' : 'false',
        );
        const wrapper = document.getElementById('boot-debug-wrapper');
        if (wrapper) {
          wrapper.style.display = visible ? 'block' : 'none';
        }
      });
    }

    // Export button
    const exportBtn = document.getElementById('settings-export');
    if (exportBtn && useCases && typeof useCases.exportDownload === 'function') {
      exportBtn.addEventListener('click', () => {
        useCases.exportDownload();
      });
    }
  }

  return { show, hide };
}
