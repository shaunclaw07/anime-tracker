import { createState } from './application/state.js';
import { createUseCases } from './application/useCases.js';
import { createUiAdapter } from './adapters/uiAdapter.js';
import { LocalStorageAdapter } from './adapters/localStorageAdapter.js';
import { searchAnime, searchAnimePage, getAnimeById } from './adapters/anilistAdapter.js';

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
  debug('=== bootstrap() ===');
  debug('localStorage-Modus 📦');

  const state = createState({
    watchlist: [],
    filters: {}
  });

  const storage = new LocalStorageAdapter();
  const useCases = createUseCases(state, storage);
  const anilist = { searchAnime, searchAnimePage, getAnimeById };
  const ui = createUiAdapter(state, useCases, anilist);

  debug('Rufe ui.init() auf...');
  try {
    ui.init();
    debug('ui.init() ✅');
  } catch (e) {
    debug(`ui.init() FEHLER: ${e.message}`);
  }

  debug('Lade Daten aus localStorage...');
  try {
    const watchlist = await storage.loadWatchlist();
    debug(`${watchlist.length} Einträge ✅`);
    state.setState({ watchlist });
  } catch (err) {
    debug(`localStorage-Fehler: ${err.message}`);
  }

  debug('=== fertig ✅ ===');
}
