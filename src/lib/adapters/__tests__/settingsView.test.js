// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../config.js', () => ({
  getUsers: () => ['chrischi', 'michelle'],
  getUserLabel: (user) =>
    ({ chrischi: 'Chrischi', michelle: 'Michelle' }[user] || user),
  saveLabels: vi.fn(),
}));

vi.mock('../../icons.js', () => ({
  icon: () => '<svg>icon</svg>',
  iconSvg: () => '<svg>icon</svg>',
  settings: '<svg>settings</svg>',
  download: '<svg>download</svg>',
  save: '<svg>save</svg>',
  x: '<svg>x</svg>',
}));

import { createSettingsView } from '../settingsView.js';
import { saveLabels } from '../../config.js';

function setupDOM() {
  document.body.innerHTML = `
    <div id="view-settings" class="view"></div>
    <div id="boot-debug-wrapper" style="display:none"></div>
  `;
}

describe('settingsView', () => {
  let state, useCases;

  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    localStorage.clear();
    state = {
      getState: vi.fn(() => ({ activeTab: 'settings' })),
      setState: vi.fn(),
      subscribe: vi.fn(),
    };
    useCases = {
      exportDownload: vi.fn(),
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns an object with show and hide methods', () => {
    const view = createSettingsView(state, useCases);
    expect(view).toHaveProperty('show');
    expect(view).toHaveProperty('hide');
    expect(typeof view.show).toBe('function');
    expect(typeof view.hide).toBe('function');
  });

  it('renders settings HTML in #view-settings when show() is called', () => {
    const view = createSettingsView(state, useCases);
    view.show();
    const container = document.getElementById('view-settings');
    expect(container.innerHTML).toContain('settings-view');
    expect(container.innerHTML).toContain('Einstellungen');
    expect(container.innerHTML).toContain('settings-save');
    expect(container.innerHTML).toContain('settings-export');
    expect(container.innerHTML).toContain('settings-debug-check');
  });

  it('renders user label inputs with correct values', () => {
    const view = createSettingsView(state, useCases);
    view.show();
    const input0 = document.getElementById('settings-label-0');
    const input1 = document.getElementById('settings-label-1');
    expect(input0).toBeTruthy();
    expect(input1).toBeTruthy();
    expect(input0.value).toBe('Chrischi');
    expect(input1.value).toBe('Michelle');
  });

  it('clears #view-settings when hide() is called', () => {
    const view = createSettingsView(state, useCases);
    view.show();
    expect(document.getElementById('view-settings').innerHTML).not.toBe('');
    view.hide();
    expect(document.getElementById('view-settings').innerHTML).toBe('');
  });

  it('saves labels when save button is clicked', () => {
    const view = createSettingsView(state, useCases);
    view.show();
    const input0 = document.getElementById('settings-label-0');
    const input1 = document.getElementById('settings-label-1');
    input0.value = 'Chris';
    input1.value = 'Mich';
    document.getElementById('settings-save').click();
    expect(saveLabels).toHaveBeenCalledWith({
      chrischi: 'Chris',
      michelle: 'Mich',
    });
  });

  it('shows alert when save is clicked with empty fields', () => {
    window.alert = vi.fn();
    const view = createSettingsView(state, useCases);
    view.show();
    const input0 = document.getElementById('settings-label-0');
    const input1 = document.getElementById('settings-label-1');
    input0.value = '';
    input1.value = 'Mich';
    document.getElementById('settings-save').click();
    expect(window.alert).toHaveBeenCalledWith('Bitte beide Namen ausfüllen.');
  });

  it('toggles debug checkbox and sets localStorage', () => {
    const view = createSettingsView(state, useCases);
    view.show();
    const debugCheck = document.getElementById('settings-debug-check');
    expect(debugCheck).toBeTruthy();
    debugCheck.checked = true;
    debugCheck.dispatchEvent(new Event('change'));
    expect(localStorage.getItem('anime-tracker-debug-visible')).toBe('true');
  });

  it('toggles debug wrapper display when checkbox changes', () => {
    const view = createSettingsView(state, useCases);
    view.show();
    const debugCheck = document.getElementById('settings-debug-check');
    const wrapper = document.getElementById('boot-debug-wrapper');
    debugCheck.checked = true;
    debugCheck.dispatchEvent(new Event('change'));
    expect(wrapper.style.display).toBe('block');
    debugCheck.checked = false;
    debugCheck.dispatchEvent(new Event('change'));
    expect(wrapper.style.display).toBe('none');
  });

  it('calls useCases.exportDownload() when export button is clicked', () => {
    const view = createSettingsView(state, useCases);
    view.show();
    document.getElementById('settings-export').click();
    expect(useCases.exportDownload).toHaveBeenCalledTimes(1);
  });

  it('sets debug checkbox checked when localStorage is true', () => {
    localStorage.setItem('anime-tracker-debug-visible', 'true');
    const view = createSettingsView(state, useCases);
    view.show();
    const debugCheck = document.getElementById('settings-debug-check');
    expect(debugCheck.checked).toBe(true);
  });

  it('does not render anything if #view-settings does not exist', () => {
    document.body.innerHTML = '';
    const view = createSettingsView(state, useCases);
    // Should not throw
    view.show();
    view.hide();
  });
});
