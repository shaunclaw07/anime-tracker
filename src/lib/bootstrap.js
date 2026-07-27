import { createState } from './application/state.js';
import { createUseCases } from './application/useCases.js';
import { createUiAdapter } from './adapters/uiAdapter.js';
import { JsonFileAdapter } from './adapters/jsonFileAdapter.js';
import { searchAnime, getAnimeById } from './adapters/anilistAdapter.js';

function debug(msg) {
  const el = document.getElementById('boot-debug');
  if (el) {
    el.style.display = 'block';
    el.innerHTML += `<div style="font-size:12px;padding:2px 4px;border-bottom:1px solid rgba(255,255,255,0.05)">${new Date().toISOString().slice(11,19)} ${msg}</div>`;
  }
}

export async function bootstrap() {
  debug('=== bootstrap() gestartet ===');

  // DOM-Elemente prüfen
  const grid = document.getElementById('anime-grid');
  debug(`grid found: ${!!grid}`);
  debug(`btn-add-anime found: ${!!document.getElementById('btn-add-anime')}`);
  debug(`filter-summary found: ${!!document.getElementById('filter-summary')}`);
  debug(`btn-export found: ${!!document.getElementById('btn-export')}`);

  debug('Erstelle State...');
  const state = createState({
    watchlist: [],
    deTitles: {},
    filters: {}
  });

  debug('Erstelle UseCases...');
  const useCases = createUseCases(state);

  debug('Erstelle JsonFileAdapter...');
  const jsonAdapter = new JsonFileAdapter();

  debug('Erstelle AniList...');
  const anilist = { searchAnime, getAnimeById };

  debug('Erstelle UiAdapter...');
  let ui;
  try {
    ui = createUiAdapter(state, useCases, anilist);
    debug('UiAdapter erstellt ✅');
  } catch (e) {
    debug(`UiAdapter FEHLER: ${e.message}`);
    return;
  }

  debug('Rufe ui.init() auf...');
  try {
    ui.init();
    debug('ui.init() erfolgreich ✅');
    debug('FAB-Event-Handler sollte jetzt aktiv sein!');
  } catch (e) {
    debug(`ui.init() FEHLER: ${e.message}`);
  }

  debug('Daten werden geladen...');
  try {
    const watchlist = await jsonAdapter.loadWatchlist();
    debug(`loadWatchlist: ${watchlist.length} Einträge ✅`);
    const deTitles = await jsonAdapter.loadDeTitles();
    debug(`loadDeTitles: ${Object.keys(deTitles).length} Einträge ✅`);
    state.setState({ watchlist, deTitles });
    debug('State aktualisiert ✅');
  } catch (err) {
    debug(`Daten-Fehler: ${err.message}`);
    console.error('Failed to load data:', err);
  }

  debug('=== bootstrap() fertig ✅ ===');
}
