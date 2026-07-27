import { createState } from './application/state.js';
import { createUseCases } from './application/useCases.js';
import { createUiAdapter } from './adapters/uiAdapter.js';
import { JsonFileAdapter } from './adapters/jsonFileAdapter.js';
import { searchAnime, getAnimeById } from './adapters/anilistAdapter.js';

/**
 * bootstrap — Initialises the Anime Tracker application.
 *
 * Loads persisted data, creates state/useCases/ui, and kicks off rendering.
 * Must be called from a browser context (client-side).
 */
export async function bootstrap() {
  const state = createState();
  const useCases = createUseCases(state);
  const jsonAdapter = new JsonFileAdapter();
  const anilist = { searchAnime, getAnimeById };
  const ui = createUiAdapter(state, useCases, anilist);

  try {
    const watchlist = await jsonAdapter.loadWatchlist();
    const deTitles = await jsonAdapter.loadDeTitles();
    state.setState({ watchlist, deTitles });
  } catch (err) {
    console.error('Failed to load data:', err);
    const grid = document.getElementById('anime-grid');
    if (grid) {
      grid.innerHTML = `<div class="anime-grid-empty" style="color:var(--color-destructive);text-align:center;padding:40px">
        <p>❌ Konnte Sammlung nicht laden.</p>
        <p style="font-size:0.8rem;color:var(--color-muted-foreground);margin-top:8px">
          ${err.message || 'Unbekannter Fehler'}
        </p>
      </div>`;
    }
    return;
  }

  ui.init();
}
