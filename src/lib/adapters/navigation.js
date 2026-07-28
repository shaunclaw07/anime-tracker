/**
 * Navigation Adapter — Tab-Controller für Mobile Bottom Nav + Desktop Sidebar
 *
 * Erzeugt eine Bottom Navigation (Mobile) und Sidebar (Desktop) mit 3 Tabs:
 * Explore, Sammlung, Settings.
 *
 * State-Key: activeTab ('explore' | 'collection' | 'settings')
 * Views werden über CSS-Klasse .active ein-/ausgeblendet.
 */

import { search, book_open, settings, user } from '../icons.js';

const TABS = [
  { id: 'explore',     label: 'Entdecken',     icon: search },
  { id: 'collection',  label: 'Sammlung',       icon: book_open },
  { id: 'settings',    label: 'Einstellungen',  icon: settings },
];

/**
 * createNavigation — Erzeugt Navigation-Controller
 *
 * @param {object} state - Store mit getState(), setState(), subscribe()
 * @param {object} [containers] - Optionale Container-Überschreibung
 * @param {string} [containers.bottomNav='#bottom-nav'] - Bottom Nav Container
 * @param {string} [containers.sidebar='#sidebar'] - Sidebar Container
 * @returns {{ switchTab: (tab: string) => void }}
 */
export function createNavigation(state, containers = {}) {
  const bottomNavEl = document.querySelector(containers.bottomNav || '#bottom-nav');
  const sidebarEl = document.querySelector(containers.sidebar || '#sidebar');
  const views = {
    explore: document.getElementById('view-explore'),
    collection: document.getElementById('view-collection'),
    settings: document.getElementById('view-settings'),
  };

  if (!bottomNavEl || !sidebarEl) {
    console.warn('[Navigation] Container nicht gefunden (bottom-nav oder sidebar)');
    return { switchTab: () => {} };
  }

  /**
   * Rendert die Bottom Navigation (Mobile)
   */
  function renderBottomNav() {
    bottomNavEl.innerHTML = TABS.map((tab) => {
      const activeClass = tab.id === state.getState().activeTab ? ' active' : '';
      return `
        <button class="nav-item${activeClass}" data-tab="${tab.id}" data-nav="bottom" aria-label="${tab.label}">
          <span class="nav-icon">${tab.icon}</span>
          <span class="nav-label">${tab.label}</span>
        </button>
      `;
    }).join('');
  }

  /**
   * Rendert die Sidebar (Desktop)
   */
  function renderSidebar() {
    sidebarEl.innerHTML = `
      <div class="sidebar-header">
        <span class="sidebar-title">Anime Tracker</span>
      </div>
      <div class="sidebar-nav">
        ${TABS.map((tab) => {
          const activeClass = tab.id === state.getState().activeTab ? ' active' : '';
          return `
            <button class="nav-item${activeClass}" data-tab="${tab.id}" data-nav="sidebar" aria-label="${tab.label}">
              <span class="nav-icon">${tab.icon}</span>
              <span class="nav-label">${tab.label}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Aktualisiert die aktive Tab-Hervorhebung in beiden Navigationsleisten
   */
  function updateActiveTab(tabId) {
    // Views umschalten
    Object.keys(views).forEach((key) => {
      const el = views[key];
      if (el) {
        el.classList.toggle('active', key === tabId);
      }
    });

    // Bottom Nav aktive Klasse
    bottomNavEl.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    // Sidebar aktive Klasse
    sidebarEl.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });
  }

  /**
   * switchTab — Wechselt zu einem Tab + dispatched State
   *
   * @param {'explore'|'collection'|'settings'} tabId
   */
  function switchTab(tabId) {
    const current = state.getState().activeTab;
    if (tabId === current) return;

    state.setState({ activeTab: tabId });
    updateActiveTab(tabId);
  }

  /**
   * Bindet Click-Events an alle Nav-Items
   */
  function bindEvents() {
    const handler = (e) => {
      const item = e.currentTarget;
      const tabId = item.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    };

    bottomNavEl.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', handler);
    });

    sidebarEl.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', handler);
    });
  }

  // Initial rendern
  renderBottomNav();
  renderSidebar();
  updateActiveTab(state.getState().activeTab);
  bindEvents();

  // Auf externe State-Änderungen subscriben
  state.subscribe((newState) => {
    if (newState.activeTab) {
      updateActiveTab(newState.activeTab);
    }
  });

  return { switchTab };
}
