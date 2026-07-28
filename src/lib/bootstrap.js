import { createState } from './application/state.ts';
import { createUseCases } from './application/useCases.ts';
import { createUiAdapter } from './adapters/uiAdapter.js';
import { IndexedDBAdapter } from './adapters/indexedDBAdapter.js';
import { searchAnime, searchAnimePage, getAnimeById } from './adapters/anilistAdapter.js';
import { createNavigation } from './adapters/navigation.js';
import { createExploreView } from './adapters/exploreView.js';
import { createSettingsView } from './adapters/settingsView.js';

function debug(msg) {
  const wrapper = document.getElementById('boot-debug-wrapper');
  if (wrapper) {
    const el = document.getElementById('boot-debug');
    if (el) {
      el.innerHTML += `<div style="font-size:12px;padding:2px 4px;border-bottom:1px solid rgba(255,255,255,0.05)">${new Date().toISOString().slice(11,19)} ${msg}</div>`;
    }
  }
}

// Beim Start: Panel einblenden wenn Debug in localStorage aktiv war
if (localStorage.getItem('anime-tracker-debug-visible') === 'true') {
  const wrapper = document.getElementById('boot-debug-wrapper');
  if (wrapper) wrapper.style.display = 'block';
}

export async function bootstrap() {
  debug('=== bootstrap() ===');
  debug('IndexedDB-Modus 🗄️');

  // Restore viewMode from localStorage
  const savedViewMode = localStorage.getItem('anime-tracker-view-mode');
  const viewMode = (savedViewMode === 'grid' || savedViewMode === 'list') ? savedViewMode : 'grid';

  const state = createState({
    watchlist: [],
    filters: {},
    sortBy: 'date_added',
    sortOrder: 'desc',
    activeTab: 'collection',
    viewMode
  });

  const storage = new IndexedDBAdapter();
  const useCases = createUseCases(state, storage);
  const anilist = { searchAnime, searchAnimePage, getAnimeById };
  const ui = createUiAdapter(state, useCases, anilist);
  const exploreView = createExploreView(state, useCases, anilist);
  const settingsView = createSettingsView(state, useCases);

  debug('Rufe ui.init() auf...');
  try {
    ui.init();
    debug('ui.init() ✅');
  } catch (e) {
    debug(`ui.init() FEHLER: ${e.message}`);
  }

  debug('Initialisiere Navigation...');
  try {
    createNavigation(state);
    debug('Navigation ✅');
  } catch (e) {
    debug(`Navigation FEHLER: ${e.message}`);
  }

  debug('Initialisiere Views...');
  try {
    // Beim Start: aktiven Tab initialisieren
    if (state.getState().activeTab === 'explore') {
      exploreView.show();
    }
    // Tab-Wechsel-Lifecycle
    state.subscribe((newState) => {
      if (newState.activeTab === 'explore') {
        exploreView.show();
        settingsView.hide();
      } else if (newState.activeTab === 'settings') {
        settingsView.show();
        exploreView.hide();
      } else {
        exploreView.hide();
        settingsView.hide();
      }
    });
    debug('Views ✅');
  } catch (e) {
    debug(`Views FEHLER: ${e.message}`);
  }

  debug('Lade Daten aus IndexedDB...');
  try {
    const watchlist = await storage.loadWatchlist();
    debug(`${watchlist.length} Einträge ✅`);
    state.setState({ watchlist });
  } catch (err) {
    debug(`localStorage-Fehler: ${err.message}`);
  }

  debug('=== fertig ✅ ===');
}
