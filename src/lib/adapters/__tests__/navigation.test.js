// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../icons.js', () => ({
  search: '<svg>search-icon</svg>',
  user: '<svg>user-icon</svg>',
  settings: '<svg>settings-icon</svg>',
  book_open: '<svg>book-icon</svg>',
  star: '<svg>star-icon</svg>',
}));

import { createNavigation } from '../navigation.js';

function createMockState(overrides = {}) {
  const state = { activeTab: 'collection', ...overrides };
  const listeners = new Set();
  return {
    getState: vi.fn(() => ({ ...state })),
    setState: vi.fn((partial) => {
      Object.assign(state, partial);
      listeners.forEach((fn) => fn(state));
    }),
    subscribe: vi.fn((fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }),
  };
}

function setupDOM() {
  document.body.innerHTML = `
    <div id="view-explore" class="view"></div>
    <div id="view-collection" class="view"></div>
    <div id="view-settings" class="view"></div>
    <nav id="bottom-nav"></nav>
    <aside id="sidebar"></aside>
  `;
}

describe('createNavigation', () => {
  let state;

  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    state = createMockState();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns an object with switchTab', () => {
    const nav = createNavigation(state);
    expect(nav).toHaveProperty('switchTab');
    expect(typeof nav.switchTab).toBe('function');
  });

  it('renders bottom nav with 3 items in #bottom-nav', () => {
    createNavigation(state);
    const bottomNav = document.getElementById('bottom-nav');
    expect(bottomNav).toBeTruthy();
    const items = bottomNav.querySelectorAll('.nav-item');
    expect(items.length).toBe(3);
  });

  it('renders bottom nav items with correct labels', () => {
    createNavigation(state);
    const bottomNav = document.getElementById('bottom-nav');
    expect(bottomNav.textContent).toContain('Entdecken');
    expect(bottomNav.textContent).toContain('Sammlung');
    expect(bottomNav.textContent).toContain('Einstellungen');
  });

  it('renders sidebar with 3 items in #sidebar', () => {
    createNavigation(state);
    const sidebar = document.getElementById('sidebar');
    expect(sidebar).toBeTruthy();
    const items = sidebar.querySelectorAll('.nav-item');
    expect(items.length).toBe(3);
  });

  it('sets the initial active tab as active in bottom nav', () => {
    createNavigation(state);
    const activeItems = document.querySelectorAll('#bottom-nav .nav-item.active');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].getAttribute('data-tab')).toBe('collection');
  });

  it('sets the initial active tab as active in sidebar', () => {
    createNavigation(state);
    const activeItems = document.querySelectorAll('#sidebar .nav-item.active');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].getAttribute('data-tab')).toBe('collection');
  });

  it('shows the active view and hides others on init', () => {
    createNavigation(state);
    expect(document.getElementById('view-collection').classList.contains('active')).toBe(true);
    expect(document.getElementById('view-explore').classList.contains('active')).toBe(false);
    expect(document.getElementById('view-settings').classList.contains('active')).toBe(false);
  });

  it('switchTab updates state with new activeTab', () => {
    const nav = createNavigation(state);
    nav.switchTab('explore');
    expect(state.setState).toHaveBeenCalledWith({ activeTab: 'explore' });
  });

  it('switchTab shows the correct view after switching', () => {
    const nav = createNavigation(state);
    nav.switchTab('explore');
    expect(document.getElementById('view-explore').classList.contains('active')).toBe(true);
    expect(document.getElementById('view-collection').classList.contains('active')).toBe(false);
  });

  it('switchTab highlights correct tab in bottom nav', () => {
    const nav = createNavigation(state);
    nav.switchTab('settings');
    const bottomActive = document.querySelectorAll('#bottom-nav .nav-item.active');
    expect(bottomActive.length).toBe(1);
    expect(bottomActive[0].getAttribute('data-tab')).toBe('settings');
  });

  it('switchTab highlights correct tab in sidebar', () => {
    const nav = createNavigation(state);
    nav.switchTab('explore');
    const sidebarActive = document.querySelectorAll('#sidebar .nav-item.active');
    expect(sidebarActive.length).toBe(1);
    expect(sidebarActive[0].getAttribute('data-tab')).toBe('explore');
  });

  it('clicking a bottom nav item switches tab', () => {
    createNavigation(state);
    const exploreItem = document.querySelector('#bottom-nav [data-tab="explore"]');
    expect(exploreItem).toBeTruthy();
    exploreItem.click();
    expect(state.setState).toHaveBeenCalledWith({ activeTab: 'explore' });
    expect(document.getElementById('view-explore').classList.contains('active')).toBe(true);
  });

  it('clicking a sidebar item switches tab', () => {
    createNavigation(state);
    const settingsItem = document.querySelector('#sidebar [data-tab="settings"]');
    expect(settingsItem).toBeTruthy();
    settingsItem.click();
    expect(state.setState).toHaveBeenCalledWith({ activeTab: 'settings' });
    expect(document.getElementById('view-settings').classList.contains('active')).toBe(true);
  });

  it('subscribes to state changes', () => {
    createNavigation(state);
    expect(state.subscribe).toHaveBeenCalled();
    expect(state.subscribe.mock.calls[0][0]).toBeInstanceOf(Function);
  });

  it('updates active highlighting when state changes externally', () => {
    createNavigation(state);
    // Get the subscribe callback
    const subscribeFn = state.subscribe.mock.calls[0][0];
    // Simulate external state change
    state.getState = vi.fn(() => ({ activeTab: 'settings' }));
    subscribeFn(state.getState());
    const bottomActive = document.querySelectorAll('#bottom-nav .nav-item.active');
    expect(bottomActive.length).toBe(1);
    expect(bottomActive[0].getAttribute('data-tab')).toBe('settings');
    expect(document.getElementById('view-settings').classList.contains('active')).toBe(true);
    expect(document.getElementById('view-collection').classList.contains('active')).toBe(false);
  });

  it('renders icons inside nav items', () => {
    createNavigation(state);
    const bottomNav = document.getElementById('bottom-nav');
    expect(bottomNav.innerHTML).toContain('<svg>search-icon</svg>');
    expect(bottomNav.innerHTML).toContain('<svg>book-icon</svg>');
    expect(bottomNav.innerHTML).toContain('<svg>settings-icon</svg>');
  });

  it('switchTab with same tab does not update state unnecessarily', () => {
    const nav = createNavigation(state);
    vi.clearAllMocks();
    nav.switchTab('collection');
    expect(state.setState).not.toHaveBeenCalled();
  });
});
