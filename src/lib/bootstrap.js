import { createState } from './application/state.js';
import { createUseCases } from './application/useCases.js';
import { createUiAdapter } from './adapters/uiAdapter.js';
import { LocalStorageAdapter } from './adapters/localStorageAdapter.js';
import { searchAnime, getAnimeById } from './adapters/anilistAdapter.js';

function debug(msg) {
  const wrapper = document.getElementById('boot-debug-wrapper');
  if (wrapper) {
    wrapper.style.display = 'block';
    const el = document.getElementById('boot-debug');
    if (el) {
      el.innerHTML += `<div style="font-size:12px;padding:2px 4px;border-bottom:1px solid rgba(255,255,255,0.05)">${new Date().toISOString().slice(11,19)} ${msg}</div>`;
    }
  }
}

export async function bootstrap() {
  debug('=== bootstrap() gestartet ===');
  debug('localStorage-Modus 📦');

  debug('Erstelle State...');
  const state = createState({
    watchlist: [],
    deTitles: {},
    filters: {}
  });

  debug('Erstelle LocalStorageAdapter...');
  const storage = new LocalStorageAdapter();

  debug('Erstelle UseCases (mit Auto-Save)...');
  const useCases = createUseCases(state, storage);

  debug('Erstelle UiAdapter...');
  const anilist = { searchAnime, getAnimeById };
  const ui = createUiAdapter(state, useCases, anilist);

  debug('Rufe ui.init() auf...');
  try {
    ui.init();
    debug('ui.init() erfolgreich ✅');
  } catch (e) {
    debug(`ui.init() FEHLER: ${e.message}`);
  }

  debug('Lade Daten aus localStorage...');
  try {
    const watchlist = await storage.loadWatchlist();
    debug(`watchlist: ${watchlist.length} Einträge ✅`);
    const deTitles = await storage.loadDeTitles();
    debug(`de-titles: ${Object.keys(deTitles).length} Einträge ✅`);
    state.setState({ watchlist, deTitles });
    debug('State aus localStorage geladen ✅');
  } catch (err) {
    debug(`localStorage-Fehler: ${err.message}`);
    console.error('localStorage error:', err);
  }

  debug('=== bootstrap() fertig ✅ ===');
}
