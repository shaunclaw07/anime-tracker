# Anime Tracker — Implementierungsplan

> **Für agentic workers:** REQUIRED SUB-SKILL: TDD (test-driven-development) für jede Task. Planung → Implementierung (ROT-GRÜN-REFACTOR) → Review. siehe auch `writing-plans` Skill.

**Goal:** Filterbare Webseite für Chrischi & Michelles Anime-Sammlung, deployed auf GitHub Pages.

**Architektur:** Clean Architecture + Hexagonal Architecture (Ports & Adapters) im Frontend. Domain-Logik (Filter, Watchlist) unabhängig von UI & API. TDD für alle Units.

**Tech-Stack:** Astro 5, Vanilla JS (kein Framework), AniList GraphQL API, JSON-Dateien als DB, GitHub Pages + Actions.

**Repo:** `shaunclaw07/anime-tracker`

---

## Task 0: GitHub Repo + Astro-Projekt-Setup

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.github/workflows/deploy.yml`
- Create: `data/anime.json`
- Create: `data/de-titles.json`

**Interfaces:**
- Consumes: —
- Produces: Lauffähiges Astro-Projekt, deploybarer GitHub-Workflow, initiales Daten-Schema

### 🔍 Planung
- Repo unter `shaunclaw07/anime-tracker` erstellen
- Astro 5 mit minimalem Template (kein Framework)
- `data/` Ordner mit JSON-Schemata
- GitHub Action für Build + Deploy auf `gh-pages`
- Spec und Plan als `docs/` committen

### 💻 Implementierung

- [ ] **Step 1: Repo erstellen & klonen**
  ```bash
  cd ~/projects
  mkdir anime-tracker && cd anime-tracker
  git init
  git remote add origin git@github.com:shaunclaw07/anime-tracker.git
  ```

- [ ] **Step 2: Astro-Projekt initialisieren**
  ```bash
  npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict
  npm install
  ```

- [ ] **Step 3: Ordnerstruktur anlegen**
  ```bash
  mkdir -p src/{components,lib,pages,layouts,styles} data .github/workflows
  ```

- [ ] **Step 4: `astro.config.mjs` für gh-pages konfigurieren**
  ```js
  // @ts-check
  import { defineConfig } from 'astro/config';
  
  export default defineConfig({
    site: 'https://shaunclaw07.github.io',
    base: '/anime-tracker',
    output: 'static',
    build: {
      assets: 'assets'
    }
  });
  ```

- [ ] **Step 5: `tsconfig.json`**
  ```json
  {
    "extends": "astro/tsconfigs/strict",
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@lib/*": ["src/lib/*"],
        "@components/*": ["src/components/*"]
      }
    }
  }
  ```

- [ ] **Step 6: `data/anime.json` initialisieren**
  ```json
  {
    "version": 1,
    "last_updated": "2026-07-27",
    "watched": []
  }
  ```

- [ ] **Step 7: `data/de-titles.json` initialisieren**
  ```json
  {}
  ```

- [ ] **Step 8: GitHub Action für Deployment**
  ```yaml
  name: Deploy to GitHub Pages
  
  on:
    push:
      branches: [main]
  
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      permissions:
        contents: read
        pages: write
        id-token: write
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 22
            cache: npm
        - run: npm ci
        - run: npm run build
        - uses: actions/configure-pages@v4
        - uses: actions/upload-pages-artifact@v3
          with:
            path: dist
        - id: deployment
          uses: actions/deploy-pages@v4
  ```

- [ ] **Step 9: `README.md`**
  ```markdown
  # Anime Tracker 🎬
  
  Gemeinsame Anime-Sammlung von Chrischi & Michelle.
  
  Suche, filtere und dokumentiere eure geschauten Animes.
  
  ## Entwicklung
  
  ```bash
  npm install
  npm run dev
  ```
  
  ## Deployment
  
  Push auf `main` → GitHub Action baut + deployt automatisch.
  ```

- [ ] **Step 10: Commit & Push**
  ```bash
  git add .
  git commit -m "chore: init Astro project with gh-pages setup"
  git push -u origin main
  ```

### ✅ Review
- [ ] `npm run build` erzeugt `dist/` ohne Fehler?
- [ ] Astro Dev-Server startet mit `npm run dev`?
- [ ] Repo auf GitHub sichtbar?
- [ ] GitHub Action läuft durch?

---

## Task 1: Domain — Anime-Entität + Filter-Engine (TDD)

**Files:**
- Create: `src/lib/domain/anime.js`
- Create: `src/lib/domain/anime.test.js`
- Create: `src/lib/domain/filters.js`
- Create: `src/lib/domain/filters.test.js`

**Interfaces:**
- Consumes: —
- Produces: `createAnime(data)`, `filterAnime(animeList, filters)` — reine Funktionen, keine Seiteneffekte

### 🔍 Planung
- **Anime-Entität:** Factory-Funktion, die aus Rohdaten (API oder JSON) eine validierte Anime-Struktur erzeugt
- **Filter-Engine:** Reine Funktion `filterAnime(animeList, filters)` ohne DOM/API-Abhängigkeit
- **Filter:**
  - `query` — Text-Match gegen alle Titel-Felder
  - `genres` — Array, mindestens eines muss matchen (OR)
  - `minScore` — Community-Rating ≥ Wert (0-100)
  - `minPersonalRating` — persönliches Rating ≥ Wert (1-10), pro User oder beide
  - `watchedBy` — `"all"` / `"both"` / `"chrischi"` / `"michelle"`

### 💻 Implementierung (TDD)

- [ ] **Step 1: Schreibe Test für `createAnime()` — ROT**
  ```javascript
  // src/lib/domain/anime.test.js
  import { describe, it, expect } from 'vitest';
  import { createAnime } from './anime';

  describe('createAnime', () => {
    it('creates an anime entity with required fields', () => {
      const data = {
        anilist_id: 16498,
        title_romaji: 'Shingeki no Kyojin',
        title_english: 'Attack on Titan',
        genres: ['Action', 'Drama'],
        average_score: 86,
        episodes: 25,
        cover_url: 'https://example.com/cover.jpg',
        format: 'TV'
      };

      const anime = createAnime(data);

      expect(anime.anilist_id).toBe(16498);
      expect(anime.title_romaji).toBe('Shingeki no Kyojin');
      expect(anime.watched_by).toEqual([]);
      expect(anime.ratings).toEqual({});
      expect(anime.finished_at).toBeUndefined();
    });

    it('throws if anilist_id is missing', () => {
      expect(() => createAnime({ title_romaji: 'Test' })).toThrow();
    });

    it('throws if title_romaji is missing', () => {
      expect(() => createAnime({ anilist_id: 1 })).toThrow();
    });

    it('accepts optional watched_by and ratings', () => {
      const anime = createAnime({
        anilist_id: 1,
        title_romaji: 'Test',
        watched_by: ['chrischi'],
        ratings: { chrischi: 10 }
      });
      expect(anime.watched_by).toEqual(['chrischi']);
      expect(anime.ratings.chrischi).toBe(10);
    });
  });
  ```

- [ ] **Step 2: Lauf Test — erwarte Fehler**
  ```bash
  npx vitest run src/lib/domain/anime.test.js
  ```
  Expected: FAIL — `createAnime is not defined`

- [ ] **Step 3: Implementiere `createAnime()` — GRÜN**
  ```javascript
  // src/lib/domain/anime.js
  const REQUIRED = ['anilist_id', 'title_romaji'];

  export function createAnime(data) {
    for (const field of REQUIRED) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      anilist_id: data.anilist_id,
      title_romaji: data.title_romaji,
      title_english: data.title_english || '',
      title_de: data.title_de || data.title_english || data.title_romaji,
      genres: data.genres || [],
      average_score: data.average_score || 0,
      episodes: data.episodes || 0,
      cover_url: data.cover_url || '',
      format: data.format || 'UNKNOWN',
      watched_by: data.watched_by || [],
      ratings: data.ratings || {},
      finished_at: data.finished_at || undefined
    };
  }
  ```

- [ ] **Step 4: Lauf Test — GRÜN bestätigen**
  ```bash
  npx vitest run src/lib/domain/anime.test.js
  ```
  Expected: PASS

- [ ] **Step 5: Schreibe Tests für `filterAnime()` — ROT**
  ```javascript
  // src/lib/domain/filters.test.js
  import { describe, it, expect } from 'vitest';
  import { filterAnime } from './filters';
  import { createAnime } from './anime';

  const sample = [
    createAnime({ anilist_id: 1, title_romaji: 'Naruto', genres: ['Action', 'Adventure'], average_score: 80, watched_by: ['chrischi'], ratings: { chrischi: 8 } }),
    createAnime({ anilist_id: 2, title_romaji: 'One Piece', genres: ['Action', 'Comedy'], average_score: 90, watched_by: ['chrischi', 'michelle'], ratings: { chrischi: 9, michelle: 8 } }),
    createAnime({ anilist_id: 3, title_romaji: 'K-On!', genres: ['Comedy', 'Slice of Life'], average_score: 78, watched_by: ['michelle'], ratings: { michelle: 10 } }),
    createAnime({ anilist_id: 4, title_romaji: 'Berserk', genres: ['Action', 'Horror'], average_score: 85, watched_by: [], ratings: {} }),
  ];

  describe('filterAnime', () => {
    it('returns all anime when filters are empty', () => {
      expect(filterAnime(sample, {})).toHaveLength(4);
    });

    it('filters by text query (romaji match)', () => {
      const result = filterAnime(sample, { query: 'naruto' });
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(1);
    });

    it('filters by text query (english title match)', () => {
      const result = filterAnime(sample, { query: 'piece' });
      expect(result).toHaveLength(1);
    });

    it('filters by genre (OR logic)', () => {
      const result = filterAnime(sample, { genres: ['Comedy'] });
      expect(result).toHaveLength(2); // One Piece + K-On!
    });

    it('filters by genre with multiple (OR logic)', () => {
      const result = filterAnime(sample, { genres: ['Horror'] });
      expect(result).toHaveLength(1); // Berserk
    });

    it('filters by genre: no match returns empty', () => {
      const result = filterAnime(sample, { genres: ['Sports'] });
      expect(result).toHaveLength(0);
    });

    it('filters by minimum community score', () => {
      const result = filterAnime(sample, { minScore: 85 });
      expect(result).toHaveLength(2); // One Piece + Berserk
    });

    it('filters by watched_by: both', () => {
      const result = filterAnime(sample, { watchedBy: 'both' });
      expect(result).toHaveLength(1); // One Piece
    });

    it('filters by watched_by: chrischi', () => {
      const result = filterAnime(sample, { watchedBy: 'chrischi' });
      expect(result).toHaveLength(2); // Naruto + One Piece
    });

    it('filters by watched_by: michelle', () => {
      const result = filterAnime(sample, { watchedBy: 'michelle' });
      expect(result).toHaveLength(2); // One Piece + K-On!
    });

    it('filters by watched_by: all (no filter)', () => {
      const result = filterAnime(sample, { watchedBy: 'all' });
      expect(result).toHaveLength(4);
    });

    it('filters by minimum personal rating for chrischi', () => {
      const result = filterAnime(sample, { minPersonalRating: 9, personalRatingUser: 'chrischi' });
      expect(result).toHaveLength(1); // One Piece
    });

    it('combines multiple filters', () => {
      const result = filterAnime(sample, { genres: ['Action'], minScore: 85, watchedBy: 'both' });
      expect(result).toHaveLength(1); // One Piece
    });
  });
  ```

- [ ] **Step 6: Lauf Test — erwarte Fehler**
  ```bash
  npx vitest run src/lib/domain/filters.test.js
  ```
  Expected: FAIL — `filterAnime is not defined`

- [ ] **Step 7: Implementiere `filterAnime()` — GRÜN**
  ```javascript
  // src/lib/domain/filters.js
  export function filterAnime(animeList, filters = {}) {
    return animeList.filter(anime => {
      // Textsuche
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const haystack = [
          anime.title_romaji,
          anime.title_english,
          anime.title_de
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Genre (OR — mindestens eines muss matchen)
      if (filters.genres && filters.genres.length > 0) {
        if (!filters.genres.some(g => anime.genres.includes(g))) return false;
      }

      // Community-Rating
      if (filters.minScore && (anime.average_score || 0) < filters.minScore) return false;

      // Persönliches Rating
      if (filters.minPersonalRating && filters.personalRatingUser) {
        const rating = anime.ratings[filters.personalRatingUser];
        if (rating === undefined || rating < filters.minPersonalRating) return false;
      }

      // Gesehen von
      if (filters.watchedBy && filters.watchedBy !== 'all') {
        if (filters.watchedBy === 'both' && anime.watched_by.length < 2) return false;
        if (filters.watchedBy === 'chrischi' && !anime.watched_by.includes('chrischi')) return false;
        if (filters.watchedBy === 'michelle' && !anime.watched_by.includes('michelle')) return false;
      }

      return true;
    });
  }

  export function extractGenres(animeList) {
    const set = new Set();
    for (const anime of animeList) {
      for (const genre of anime.genres) {
        set.add(genre);
      }
    }
    return [...set].sort();
  }
  ```

- [ ] **Step 8: Lauf Test — GRÜN bestätigen**
  ```bash
  npx vitest run src/lib/domain/
  ```
  Expected: PASS (alle Tests anime.test.js + filters.test.js)

- [ ] **Step 9: Commit**
  ```bash
  git add src/lib/domain/
  git commit -m "feat: add Anime entity and filter engine (TDD)"
  ```

### ✅ Review
- [ ] Alle Tests grün?
- [ ] `createAnime()` wirft Fehler bei fehlenden Pflichtfeldern?
- [ ] `filterAnime()` ist eine reine Funktion (kein DOM, kein API-Call)?
- [ ] Genre-Filter testet OR-Logik (nicht AND)?
- [ ] `title_de` Fallback-Kette korrekt?
- [ ] Grenzfälle: leeres Array, keine Filter, `watched_by: []`?

---

## Task 2: Domain — Watchlist-Logik (TDD)

**Files:**
- Create: `src/lib/domain/watchlist.js`
- Create: `src/lib/domain/watchlist.test.js`

**Interfaces:**
- Consumes: `createAnime(data)` aus Task 1
- Produces: `addAnime(watchlist, data)`, `removeAnime(watchlist, anilistId)`, `toggleWatchedBy(watchlist, anilistId, user)`, `setRating(watchlist, anilistId, user, score)`

### 🔍 Planung
- Watchlist als Array von Anime-Entitäten
- Reine Funktionen: immer neues Array (immutable), nie Mutation
- `addAnime`: neues Anime zur Liste hinzufügen (mit watched_by = aktuelle User)
- `removeAnime`: per anilist_id entfernen
- `toggleWatchedBy`: User zu watched_by hinzufügen/entfernen
- `setRating`: persönliches Rating setzen (1-10)

### 💻 Implementierung (TDD)

- [ ] **Step 1: Schreibe Tests — ROT**
  ```javascript
  // src/lib/domain/watchlist.test.js
  import { describe, it, expect } from 'vitest';
  import { addAnime, removeAnime, toggleWatchedBy, setRating } from './watchlist';
  import { createAnime } from './anime';

  const empty = [];
  const a1 = createAnime({ anilist_id: 1, title_romaji: 'Naruto' });
  const a2 = createAnime({ anilist_id: 2, title_romaji: 'One Piece', watched_by: ['chrischi'] });

  describe('addAnime', () => {
    it('adds anime to empty watchlist', () => {
      const result = addAnime(empty, { anilist_id: 1, title_romaji: 'Naruto' }, 'chrischi');
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(1);
      expect(result[0].watched_by).toEqual(['chrischi']);
    });

    it('does not add duplicate anilist_id', () => {
      const list = [a1];
      expect(() => addAnime(list, { anilist_id: 1, title_romaji: 'Naruto' }, 'chrischi')).toThrow('already in watchlist');
    });

    it('returns a new array (immutable)', () => {
      const result = addAnime(empty, { anilist_id: 1, title_romaji: 'Naruto' }, 'chrischi');
      expect(result).not.toBe(empty);
      expect(empty).toHaveLength(0);
    });
  });

  describe('removeAnime', () => {
    it('removes anime by anilist_id', () => {
      const result = removeAnime([a1, a2], 1);
      expect(result).toHaveLength(1);
      expect(result[0].anilist_id).toBe(2);
    });

    it('returns same array if id not found', () => {
      const result = removeAnime([a1], 999);
      expect(result).toHaveLength(1);
    });

    it('returns a new array (immutable)', () => {
      const result = removeAnime([a1], 2);
      expect(result).not.toBe([a1]);
    });
  });

  describe('toggleWatchedBy', () => {
    it('adds user if not present', () => {
      const result = toggleWatchedBy([a1], 1, 'michelle');
      expect(result[0].watched_by).toContain('michelle');
    });

    it('removes user if already present', () => {
      const result = toggleWatchedBy([a2], 2, 'chrischi');
      expect(result[0].watched_by).not.toContain('chrischi');
    });

    it('does not touch other anime', () => {
      const result = toggleWatchedBy([a1, a2], 1, 'michelle');
      expect(result[1].watched_by).toEqual(['chrischi']); // unchanged
    });
  });

  describe('setRating', () => {
    it('sets rating for a user', () => {
      const result = setRating([a1], 1, 'chrischi', 8);
      expect(result[0].ratings.chrischi).toBe(8);
    });

    it('throws if score is out of range', () => {
      expect(() => setRating([a1], 1, 'chrischi', 0)).toThrow();
      expect(() => setRating([a1], 1, 'chrischi', 11)).toThrow();
    });

    it('updates existing rating', () => {
      const result = setRating([a2], 2, 'chrischi', 10);
      expect(result[0].ratings.chrischi).toBe(10);
    });
  });
  ```

- [ ] **Step 2: Lauf Test — ROT bestätigen**
  ```bash
  npx vitest run src/lib/domain/watchlist.test.js
  ```

- [ ] **Step 3: Implementiere Watchlist-Logik — GRÜN**
  ```javascript
  // src/lib/domain/watchlist.js
  import { createAnime } from './anime';

  export function addAnime(watchlist, data, watchedBy = 'chrischi') {
    if (watchlist.some(a => a.anilist_id === data.anilist_id)) {
      throw new Error(`Anime ${data.anilist_id} already in watchlist`);
    }

    const anime = createAnime({
      ...data,
      watched_by: [watchedBy]
    });

    return [...watchlist, anime];
  }

  export function removeAnime(watchlist, anilistId) {
    return watchlist.filter(a => a.anilist_id !== anilistId);
  }

  export function toggleWatchedBy(watchlist, anilistId, user) {
    return watchlist.map(a => {
      if (a.anilist_id !== anilistId) return a;
      const has = a.watched_by.includes(user);
      return {
        ...a,
        watched_by: has
          ? a.watched_by.filter(u => u !== user)
          : [...a.watched_by, user]
      };
    });
  }

  const MIN_RATING = 1;
  const MAX_RATING = 10;

  export function setRating(watchlist, anilistId, user, score) {
    if (score < MIN_RATING || score > MAX_RATING) {
      throw new Error(`Rating must be between ${MIN_RATING} and ${MAX_RATING}`);
    }
    return watchlist.map(a => {
      if (a.anilist_id !== anilistId) return a;
      return {
        ...a,
        ratings: { ...a.ratings, [user]: score }
      };
    });
  }
  ```

- [ ] **Step 4: Tests grün bestätigen**
  ```bash
  npx vitest run src/lib/domain/
  ```
  Expected: ALL PASS (anime, filters, watchlist)

- [ ] **Step 5: Commit**
  ```bash
  git add src/lib/domain/
  git commit -m "feat: add watchlist logic (add, remove, toggleWatchedBy, setRating) [TDD]"
  ```

### ✅ Review
- [ ] Alle Watchlist-Operationen immutable (neues Array)?
- [ ] Duplikat-Prüfung beim Hinzufügen?
- [ ] Rating-Grenzen (1-10) enforced?
- [ ] `toggleWatchedBy` funktioniert als toggle (add wenn fehlt, remove wenn da)?

---

## Task 3: Port — AnimeRepository + JsonFileAdapter

**Files:**
- Create: `src/lib/ports/animeRepository.js`
- Create: `src/lib/adapters/jsonFileAdapter.js`
- Create: `src/lib/adapters/jsonFileAdapter.test.js`

**Interfaces:**
- Consumes: `createAnime()` (Task 1), Watchlist-Funktionen (Task 2)
- Produces: `loadWatchlist()`, `exportWatchlist(watchlist)`, `loadDeTitles()`, `saveDeTitles(mapping)`

### 🔍 Planung
- **AnimeRepository-Port:** Interface-Konvention (JS hat keine Interfaces, aber wir definieren die API)
  - `loadWatchlist(): Promise<Anime[]>` — lädt `anime.json`
  - `exportWatchlist(watchlist: Anime[]): string` — generiert JSON-String
  - `loadDeTitles(): Promise<Record<number, string>>` — lädt `de-titles.json`
  - `saveDeTitles(mapping): string` — generiert JSON-String
- **JsonFileAdapter:** Implementiert den Port, arbeitet mit `fetch()` (für Runtime) und String-Generierung (für Export)
- **Export:** Generiert `download`-kompatiblen JSON-String

### 💻 Implementierung (TDD)

- [ ] **Step 1: Schreibe Tests — ROT**
  ```javascript
  // src/lib/adapters/jsonFileAdapter.test.js
  import { describe, it, expect, beforeEach } from 'vitest';
  import { JsonFileAdapter } from './jsonFileAdapter';

  // Mock fetch for testing
  const mockAnimeData = {
    version: 1,
    last_updated: '2026-07-27',
    watched: [
      { anilist_id: 1, title_romaji: 'Naruto', genres: ['Action'], watched_by: ['chrischi'], ratings: {} }
    ]
  };

  const mockDeData = { '1': 'Naruto' };

  let adapter;

  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('anime.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAnimeData) });
      }
      if (url.includes('de-titles.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockDeData) });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    adapter = new JsonFileAdapter('/basepath/');
  });

  describe('loadWatchlist', () => {
    it('loads anime from JSON', async () => {
      const list = await adapter.loadWatchlist();
      expect(list).toHaveLength(1);
      expect(list[0].anilist_id).toBe(1);
      expect(list[0].title_romaji).toBe('Naruto');
    });

    it('handles empty watchlist gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ version: 1, last_updated: '', watched: [] }) })
      );
      const list = await adapter.loadWatchlist();
      expect(list).toEqual([]);
    });
  });

  describe('loadDeTitles', () => {
    it('loads German title mapping', async () => {
      const map = await adapter.loadDeTitles();
      expect(map['1']).toBe('Naruto');
    });
  });

  describe('exportWatchlist', () => {
    it('generates valid JSON string from watchlist', () => {
      const watchlist = [
        { anilist_id: 1, title_romaji: 'Naruto', title_english: '', title_de: 'Naruto', genres: ['Action'], average_score: 0, episodes: 0, cover_url: '', format: 'TV', watched_by: ['chrischi'], ratings: {}, finished_at: undefined }
      ];
      const json = adapter.exportWatchlist(watchlist);
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe(1);
      expect(parsed.watched).toHaveLength(1);
      expect(parsed.watched[0].anilist_id).toBe(1);
    });
  });

  describe('saveDeTitles', () => {
    it('generates valid JSON string from mapping', () => {
      const json = adapter.saveDeTitles({ '1': 'Naruto', '2': 'One Piece' });
      const parsed = JSON.parse(json);
      expect(parsed['1']).toBe('Naruto');
      expect(parsed['2']).toBe('One Piece');
    });
  });
  ```

- [ ] **Step 2: Lauf Test — ROT bestätigen**
  ```bash
  npx vitest run src/lib/adapters/jsonFileAdapter.test.js
  ```

- [ ] **Step 3: Implementiere Port + Adapter — GRÜN**
  ```javascript
  // src/lib/ports/animeRepository.js
  // Port-Definition (JS Konvention — dokumentiert die API)
  // Ein AnimeRepository implementiert:
  //   loadWatchlist(): Promise<Anime[]>
  //   loadDeTitles(): Promise<Record<number, string>>
  //   exportWatchlist(Anime[]): string
  //   saveDeTitles(Record<number, string>): string
  export const ANIME_REPOSITORY_PORT = Symbol('AnimeRepository');
  ```

  ```javascript
  // src/lib/adapters/jsonFileAdapter.js
  import { createAnime } from '../domain/anime';

  export class JsonFileAdapter {
    constructor(basePath = '/anime-tracker/') {
      this.basePath = basePath.endsWith('/') ? basePath : basePath + '/';
    }

    /**
     * @returns {Promise<Array>}
     */
    async loadWatchlist() {
      const response = await fetch(`${this.basePath}data/anime.json`);
      if (!response.ok) {
        throw new Error(`Failed to load anime.json: ${response.status}`);
      }
      const data = await response.json();
      return (data.watched || []).map(item => createAnime(item));
    }

    /**
     * @returns {Promise<Record<number, string>>}
     */
    async loadDeTitles() {
      const response = await fetch(`${this.basePath}data/de-titles.json`);
      if (!response.ok) {
        return {};
      }
      return response.json();
    }

    /**
     * @param {Array} watchlist
     * @returns {string} JSON string ready for download
     */
    exportWatchlist(watchlist) {
      const data = {
        version: 1,
        last_updated: new Date().toISOString().split('T')[0],
        watched: watchlist.map(a => ({
          anilist_id: a.anilist_id,
          title_romaji: a.title_romaji,
          title_english: a.title_english,
          title_de: a.title_de,
          genres: a.genres,
          average_score: a.average_score,
          episodes: a.episodes,
          cover_url: a.cover_url,
          format: a.format,
          watched_by: a.watched_by,
          ratings: a.ratings,
          finished_at: a.finished_at
        }))
      };
      return JSON.stringify(data, null, 2);
    }

    /**
     * @param {Record<number, string>} mapping
     * @returns {string} JSON string ready for download
     */
    saveDeTitles(mapping) {
      return JSON.stringify(mapping, null, 2);
    }
  }
  ```

- [ ] **Step 4: Tests grün bestätigen**
  ```bash
  npx vitest run src/lib/
  ```
  Expected: ALL PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/lib/
  git commit -m "feat: add AnimeRepository port + JsonFileAdapter [TDD]"
  ```

### ✅ Review
- [ ] `fetch` wird gemockt für Tests — keine echten API-Calls in Tests?
- [ ] Export erzeugt gültiges JSON?
- [ ] Fehlerbehandlung bei fehlgeschlagenem fetch?
- [ ] Daten werden via `createAnime()` validiert beim Laden?

---

## Task 4: Port — AnimeSearchService + AniListAdapter

**Files:**
- Create: `src/lib/ports/animeSearchService.js`
- Create: `src/lib/adapters/anilistAdapter.js`
- Create: `src/lib/adapters/anilistAdapter.test.js`

**Interfaces:**
- Consumes: —
- Produces: `searchAnime(query)`, `getAnimeById(id)`

### 🔍 Planung
- **AnimeSearchService-Port:** Interface für externe Anime-Suche
  - `searchAnime(query: string): Promise<SearchResult[]>`
  - `getAnimeById(id: number): Promise<SearchResult | null>`
- **AniListAdapter:** Implementiert Port via GraphQL
  - Mapping von AniList-Response zu `SearchResult`-Objekt
  - Ratelimit: 90 req/min — für Such-UI völlig ausreichend
  - Timeout bei fehlschlagenden Requests

### 💻 Implementierung (TDD)

- [ ] **Step 1: Schreibe Tests — ROT**
  ```javascript
  // src/lib/adapters/anilistAdapter.test.js
  import { describe, it, expect, beforeEach, vi } from 'vitest';
  import { AniListAdapter } from './anilistAdapter';

  const mockResponse = {
    data: {
      Page: {
        media: [
          {
            id: 16498,
            title: { romaji: 'Shingeki no Kyojin', english: 'Attack on Titan', native: '進撃の巨人' },
            genres: ['Action', 'Drama', 'Fantasy', 'Mystery'],
            averageScore: 86,
            episodes: 25,
            format: 'TV',
            coverImage: { large: 'https://s4.anilist.co/file/large.jpg' },
            description: 'Several hundred years ago...',
            tags: [{ name: 'Military', rank: 90 }]
          }
        ]
      }
    }
  };

  let adapter;

  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );
    adapter = new AniListAdapter();
  });

  describe('searchAnime', () => {
    it('returns search results from API', async () => {
      const results = await adapter.searchAnime('Attack on Titan');
      expect(results).toHaveLength(1);
      expect(results[0].anilist_id).toBe(16498);
      expect(results[0].title_romaji).toBe('Shingeki no Kyojin');
      expect(results[0].title_english).toBe('Attack on Titan');
      expect(results[0].genres).toContain('Action');
      expect(results[0].average_score).toBe(86);
      expect(results[0].episodes).toBe(25);
      expect(results[0].format).toBe('TV');
      expect(results[0].cover_url).toBeTruthy();
    });

    it('returns empty array when no results', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { Page: { media: [] } } })
        })
      );
      const results = await adapter.searchAnime('xyznonexistent');
      expect(results).toEqual([]);
    });

    it('throws on API error', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: false, status: 429 })
      );
      await expect(adapter.searchAnime('test')).rejects.toThrow('AniList API error');
    });

    it('trims whitespace from query', async () => {
      await adapter.searchAnime('  Naruto  ');
      const call = global.fetch.mock.calls[0][1];
      const body = JSON.parse(call.body);
      expect(body.variables.search).toBe('Naruto');
    });
  });
  ```

- [ ] **Step 2: Lauf Test — ROT bestätigen**
  ```bash
  npx vitest run src/lib/adapters/anilistAdapter.test.js
  ```

- [ ] **Step 3: Implementiere Port + Adapter — GRÜN**
  ```javascript
  // src/lib/ports/animeSearchService.js
  // Ein AnimeSearchService implementiert:
  //   searchAnime(query: string): Promise<SearchResult[]>
  //   getAnimeById(id: number): Promise<SearchResult | null>
  export const ANIME_SEARCH_PORT = Symbol('AnimeSearchService');
  ```

  ```javascript
  // src/lib/adapters/anilistAdapter.js
  const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

  const SEARCH_QUERY = `
    query ($search: String) {
      Page(page: 1, perPage: 20) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          id
          title { romaji english native }
          genres
          averageScore
          episodes
          format
          coverImage { large }
          description
          tags { name rank }
        }
      }
    }
  `;

  export class AniListAdapter {
    /**
     * @param {string} query
     * @returns {Promise<Array>}
     */
    async searchAnime(query) {
      const trimmed = query.trim();
      if (!trimmed) return [];

      const response = await fetch(ANILIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: { search: trimmed }
        })
      });

      if (!response.ok) {
        throw new Error(`AniList API error: ${response.status}`);
      }

      const json = await response.json();
      const mediaList = json.data?.Page?.media || [];

      return mediaList.map(media => ({
        anilist_id: media.id,
        title_romaji: media.title?.romaji || '',
        title_english: media.title?.english || '',
        title_native: media.title?.native || '',
        genres: media.genres || [],
        average_score: media.averageScore || 0,
        episodes: media.episodes || 0,
        format: media.format || 'UNKNOWN',
        cover_url: media.coverImage?.large || '',
        description: media.description || '',
        tags: (media.tags || []).map(t => ({ name: t.name, rank: t.rank }))
      }));
    }

    /**
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async getAnimeById(id) {
      const results = await this.searchAnime(String(id));
      return results.find(r => r.anilist_id === id) || null;
    }
  }
  ```

- [ ] **Step 4: Tests grün bestätigen**
  ```bash
  npx vitest run src/lib/
  ```
  Expected: ALL PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/lib/
  git commit -m "feat: add AnimeSearchService port + AniListAdapter [TDD]"
  ```

### ✅ Review
- [ ] API-Aufrufe werden in Tests gemockt — keine echten API-Requests
- [ ] Trimmt Whitespace von Queries
- [ ] Leerer Query → leeres Ergebnis (kein API-Call)
- [ ] API-Error wird als Exception weitergereicht
- [ ] Response-Struktur korrekt gemappt (anilist_id, title_*, genres, etc.)

---

## Task 5: UI — Astro-Seite + Komponenten

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/styles/global.css`
- Create: `src/pages/index.astro`
- Create: `src/components/StatsHeader.astro`
- Create: `src/components/FilterBar.astro` (nur HTML-Struktur + CSS, JS folgt in Task 6)
- Create: `src/components/AnimeGrid.astro`
- Create: `src/components/AnimeCard.astro`
- Create: `src/components/SearchModal.astro` (nur HTML-Struktur)

**Interfaces:**
- Consumes: CSS Custom Properties, HTML-Struktur
- Produces: Statische Astro-Seite mit grundlegender UI-Struktur

### 🔍 Planung
- BaseLayout: HTML-Grundgerüst, Meta-Tags, CSS-Import
- global.css: Design-System mit Custom Properties (Dark Theme), Layout-Styles
- index.astro: Orchestriert die Komponenten, lädt initiale Daten via fetch
- StatsHeader: "X Animes geschaut, davon Y gemeinsam"
- FilterBar: Suchfeld, Genre-Dropdown, Score-Slider, Person-Toggle
- AnimeGrid: CSS Grid der Karten
- AnimeCard: Cover + Titel + Genres + Ratings + "Gesehen von"-Badges
- SearchModal: Overlay mit Suchfeld + Ergebnisliste

### 💻 Implementierung

- [ ] **Step 1: BaseLayout.astro**
  ```astro
  ---
  // src/layouts/BaseLayout.astro
  export interface Props {
    title?: string;
  }
  const { title = 'Anime Tracker' } = Astro.props;
  ---
  <!doctype html>
  <html lang="de">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title} — Chrischi & Michelle</title>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="stylesheet" href="/src/styles/global.css" />
    </head>
    <body>
      <slot />
    </body>
  </html>
  ```

- [ ] **Step 2: global.css — Design-System**
  ```css
  /* src/styles/global.css */
  :root {
    --bg-primary: #0f0f1a;
    --bg-secondary: #1a1a2e;
    --bg-card: #16213e;
    --bg-hover: #1f2b4a;
    --text-primary: #e8e8f0;
    --text-secondary: #a0a0b8;
    --text-muted: #6b6b80;
    --accent: #e94560;
    --accent-hover: #ff6b81;
    --accent-blue: #4a90d9;
    --accent-green: #2ecc71;
    --accent-purple: #9b59b6;
    --border: #2a2a4a;
    --radius: 12px;
    --radius-sm: 8px;
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    --max-width: 1200px;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
    line-height: 1.6;
  }

  a { color: var(--accent-blue); text-decoration: none; }
  a:hover { text-decoration: underline; }

  button {
    cursor: pointer;
    border: none;
    font: inherit;
  }

  input, select {
    font: inherit;
  }

  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
  }
  ```

- [ ] **Step 3: index.astro**
  ```astro
  ---
  // src/pages/index.astro
  import BaseLayout from '../layouts/BaseLayout.astro';
  import StatsHeader from '../components/StatsHeader.astro';
  import FilterBar from '../components/FilterBar.astro';
  import AnimeGrid from '../components/AnimeGrid.astro';
  ---
  <BaseLayout title="Anime Tracker">
    <div class="container">
      <header class="app-header">
        <h1 class="app-title">🎬 Anime Tracker</h1>
        <p class="app-subtitle">Unsere gemeinsame Sammlung</p>
      </header>

      <StatsHeader client:load />
      <FilterBar client:load />
      <AnimeGrid client:load />
    </div>

    <div id="search-modal-container"></div>

    <script>
      // Bootstrap: lädt Daten und startet die App
      import('../lib/bootstrap.js').then(m => m.bootstrap());
    </script>
  </BaseLayout>

  <style is:global>
    .app-header {
      text-align: center;
      padding: 48px 0 24px;
    }
    .app-title {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .app-subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin-top: 8px;
    }
  </style>
  ```

- [ ] **Step 4: StatsHeader.astro**
  ```astro
  ---
  // src/components/StatsHeader.astro
  ---
  <div id="stats-header" class="stats-header">
    <div class="stat">
      <span class="stat-number" id="total-count">0</span>
      <span class="stat-label">Gesamt</span>
    </div>
    <div class="stat">
      <span class="stat-number" id="both-count">0</span>
      <span class="stat-label">Gemeinsam</span>
    </div>
    <div class="stat">
      <span class="stat-number" id="chrischi-count">0</span>
      <span class="stat-label">Chrischi</span>
    </div>
    <div class="stat">
      <span class="stat-number" id="michelle-count">0</span>
      <span class="stat-label">Michelle</span>
    </div>
  </div>

  <style>
    .stats-header {
      display: flex;
      justify-content: center;
      gap: 32px;
      padding: 20px 0;
      flex-wrap: wrap;
    }
    .stat {
      text-align: center;
      background: var(--bg-secondary);
      padding: 16px 24px;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      min-width: 120px;
    }
    .stat-number {
      display: block;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--accent);
    }
    .stat-label {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-top: 4px;
    }
  </style>
  ```

- [ ] **Step 5: FilterBar.astro**
  ```astro
  ---
  // src/components/FilterBar.astro
  ---
  <div id="filter-bar" class="filter-bar">
    <div class="filter-row">
      <div class="filter-group search-group">
        <input
          type="text"
          id="filter-search"
          class="filter-input"
          placeholder="🔍 Suche nach Titel..."
          autocomplete="off"
        />
      </div>

      <div class="filter-group">
        <select id="filter-genre" class="filter-select">
          <option value="">🏷️ Alle Genres</option>
        </select>
      </div>

      <div class="filter-group">
        <select id="filter-watched-by" class="filter-select">
          <option value="all">👤 Alle</option>
          <option value="both">💑 Gemeinsam</option>
          <option value="chrischi">🙋 Chrischi</option>
          <option value="michelle">🙋 Michelle</option>
        </select>
      </div>

      <div class="filter-group score-group">
        <label for="filter-score" class="filter-label">
          ⭐ ab <span id="score-value">0</span>
        </label>
        <input
          type="range"
          id="filter-score"
          class="filter-range"
          min="0"
          max="100"
          value="0"
        />
      </div>

      <button id="btn-add-anime" class="btn-primary">
        ➕ Anime hinzufügen
      </button>
    </div>

    <div class="active-filters" id="active-filters"></div>
  </div>

  <style>
    .filter-bar {
      background: var(--bg-secondary);
      border-radius: var(--radius);
      padding: 16px 20px;
      margin: 16px 0;
      border: 1px solid var(--border);
    }
    .filter-row {
      display: flex;
      gap: 12px;
      align-items: end;
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .search-group { flex: 1; min-width: 200px; }
    .filter-input, .filter-select {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--text-primary);
      width: 100%;
    }
    .filter-input:focus, .filter-select:focus {
      outline: none;
      border-color: var(--accent);
    }
    .filter-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .filter-range {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      outline: none;
      width: 140px;
    }
    .filter-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--accent);
      border-radius: 50%;
      cursor: pointer;
    }
    .btn-primary {
      background: var(--accent);
      color: white;
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .btn-primary:hover {
      background: var(--accent-hover);
    }
    .active-filters {
      margin-top: 8px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      min-height: 0;
    }
  </style>
  ```

- [ ] **Step 6: AnimeGrid.astro**
  ```astro
  ---
  // src/components/AnimeGrid.astro
  ---
  <div id="anime-grid" class="anime-grid">
    <div class="grid-message" id="grid-message">
      <span class="loading-text">🔄 Lade Sammlung...</span>
    </div>
  </div>

  <style>
    .anime-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      padding: 20px 0 40px;
    }
    .grid-message {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      color: var(--text-secondary);
    }
    .loading-text {
      font-size: 1.2rem;
    }
  </style>
  ```

- [ ] **Step 7: AnimeCard.astro**
  ```astro
  ---
  // src/components/AnimeCard.astro
  // Wird als Template für clientseitiges Rendering verwendet
  ---
  <!-- Das Template liegt in src/lib/adapters/templates.js -->
  <!-- die Komponente wird clientseitig gerendert -->

  <style>
    .anime-card {
      background: var(--bg-card);
      border-radius: var(--radius);
      overflow: hidden;
      border: 1px solid var(--border);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    .anime-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow);
    }
    .anime-cover {
      width: 100%;
      aspect-ratio: 3/4;
      object-fit: cover;
      background: var(--bg-secondary);
    }
    .anime-info {
      padding: 14px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .anime-title {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.3;
    }
    .anime-title-de {
      font-size: 0.85rem;
      color: var(--accent-blue);
      font-weight: 500;
    }
    .anime-genres {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .genre-tag {
      background: var(--bg-hover);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .anime-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }
    .anime-score {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .score-high { color: var(--accent-green); }
    .score-mid { color: var(--accent-blue); }
    .score-low { color: var(--text-muted); }
    .watched-badges {
      display: flex;
      gap: 4px;
    }
    .watched-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
    }
    .badge-both { background: var(--accent-purple); color: white; }
    .badge-chrischi { background: var(--accent-blue); color: white; }
    .badge-michelle { background: var(--accent-green); color: white; }
    .personal-rating {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .anime-actions {
      display: flex;
      gap: 8px;
      padding: 0 14px 14px;
    }
    .btn-icon {
      background: var(--bg-hover);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .btn-icon:hover {
      background: var(--accent);
      color: white;
    }
  </style>
  ```

- [ ] **Step 8: Commit**
  ```bash
  git add src/layouts/ src/styles/ src/pages/ src/components/
  git commit -m "feat: add Astro UI components (BaseLayout, FilterBar, Grid, Card, SearchModal)"
  ```

### ✅ Review
- [ ] Astro `dev` und `build` laufen ohne Fehler?
- [ ] Custom Properties in CSS definiert und konsistent verwendet?
- [ ] Alle Astro-Komponenten haben `client:load` oder `client:visible` für JS?
- [ ] Responsive Grid (`auto-fill, minmax(280px, 1fr)`)?

---

## Task 6: UI — Application Layer (Use Cases + Client-JS)

**Files:**
- Create: `src/lib/bootstrap.js` — App-Initialisierung
- Create: `src/lib/application/state.js` — Zentraler State (Store)
- Create: `src/lib/application/useCases.js` — Anwendungsfälle
- Create: `src/lib/adapters/uiAdapter.js` — DOM-Manipulation
- Create: `src/lib/adapters/templates.js` — HTML-Templates für Cards
- Modify: `src/components/FilterBar.astro` — JS für Filter-Interaktion
- Modify: `src/components/SearchModal.astro` — Vollständige Implementierung

**Interfaces:**
- Consumes: Alle bisherigen Domain + Adapter
- Produces: Vollständig funktionierende SPA

### 🔍 Planung
- **State:** Zentrale App-State (watchlist, filters, user-Auswahl)
- **Use Cases:** `addAnimeToList`, `removeAnimeFromList`, `toggleViewer`, `updateRating`, `applyFilters`, `exportData`
- **UiAdapter:** Brücke zwischen State und DOM — rendert Karten, aktualisiert Stats, zeigt Filter an
- **Bootstrap:** Lädt JSON, instanziiert Adapter, verbindet Event-Handler

### 💻 Implementierung (TDD)

- [ ] **Step 1: State-Tests — ROT**
  ```javascript
  // src/lib/application/state.test.js
  import { describe, it, expect } from 'vitest';
  import { createState } from './state';

  describe('createState', () => {
    it('initializes with empty state', () => {
      const state = createState();
      expect(state.getState().watchlist).toEqual([]);
      expect(state.getState().deTitles).toEqual({});
      expect(state.getState().filters).toEqual({});
    });

    it('subscribes and notifies on change', () => {
      const state = createState();
      let notified = false;
      state.subscribe(() => { notified = true; });
      state.setState({ watchlist: [], filters: { query: 'test' } });
      expect(notified).toBe(true);
    });

    it('merges state instead of replacing', () => {
      const state = createState();
      state.setState({ filters: { query: 'test' } });
      state.setState({ filters: { minScore: 80 } });
      const s = state.getState();
      expect(s.filters.query).toBeUndefined();
      // It's a replace for the same key, not merge at top level
      // Actually let's test deeper merge:
      state.setState({ watchlist: [1] });
      expect(state.getState().watchlist).toEqual([1]);
      expect(state.getState().deTitles).toEqual({});
    });
  });
  ```

- [ ] **Step 2: Implementiere State — GRÜN**
  ```javascript
  // src/lib/application/state.js
  export function createState(initial = {}) {
    let state = {
      watchlist: [],
      deTitles: {},
      filters: {},
      user: 'chrischi',
      ...initial
    };
    const listeners = new Set();

    return {
      getState: () => state,
      setState: (partial) => {
        state = { ...state, ...partial };
        listeners.forEach(fn => fn(state));
      },
      subscribe: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      }
    };
  }
  ```

- [ ] **Step 3: UseCase-Tests — ROT**
  ```javascript
  // src/lib/application/useCases.test.js
  import { describe, it, expect, vi, beforeEach } from 'vitest';
  import { createState } from './state';
  import { createUseCases } from './useCases';
  import { createAnime } from '../domain/anime';

  describe('createUseCases', () => {
    let state, useCases;

    beforeEach(() => {
      state = createState();
      useCases = createUseCases(state);
    });

    it('addAnimeToList adds to watchlist', () => {
      useCases.addAnimeToList({
        anilist_id: 1,
        title_romaji: 'Naruto',
        genres: ['Action']
      }, 'chrischi');

      const list = state.getState().watchlist;
      expect(list).toHaveLength(1);
      expect(list[0].anilist_id).toBe(1);
    });

    it('removeAnimeFromList removes by id', () => {
      useCases.addAnimeToList({ anilist_id: 1, title_romaji: 'Naruto' }, 'chrischi');
      useCases.addAnimeToList({ anilist_id: 2, title_romaji: 'One Piece' }, 'michelle');
      useCases.removeAnimeFromList(1);

      expect(state.getState().watchlist).toHaveLength(1);
      expect(state.getState().watchlist[0].anilist_id).toBe(2);
    });

    it('toggleViewer toggles watched_by', () => {
      useCases.addAnimeToList({ anilist_id: 1, title_romaji: 'Naruto' }, 'chrischi');
      useCases.toggleViewer(1, 'michelle');
      const anime = state.getState().watchlist[0];
      expect(anime.watched_by).toContain('michelle');
    });

    it('updateRating sets rating', () => {
      useCases.addAnimeToList({ anilist_id: 1, title_romaji: 'Naruto' }, 'chrischi');
      useCases.updateRating(1, 'chrischi', 9);
      expect(state.getState().watchlist[0].ratings.chrischi).toBe(9);
    });

    it('setFilters updates filter state', () => {
      useCases.setFilters({ query: 'naruto', genres: ['Action'] });
      expect(state.getState().filters.query).toBe('naruto');
      expect(state.getState().filters.genres).toEqual(['Action']);
    });

    it('updateDeTitles adds to mapping', () => {
      useCases.updateDeTitles({ '1': 'Naruto' });
      expect(state.getState().deTitles['1']).toBe('Naruto');
    });

    it('exportDownload triggers download', () => {
      useCases.addAnimeToList({ anilist_id: 1, title_romaji: 'Naruto' }, 'chrischi');
      // Should not throw
      expect(() => useCases.exportDownload()).not.toThrow();
    });
  });
  ```

- [ ] **Step 4: Implementiere UseCases — GRÜN**
  ```javascript
  // src/lib/application/useCases.js
  import { addAnime, removeAnime, toggleWatchedBy, setRating } from '../domain/watchlist';
  import { filterAnime } from '../domain/filters';
  import { JsonFileAdapter } from '../adapters/jsonFileAdapter';

  const adapter = new JsonFileAdapter();

  export function createUseCases(state) {
    return {
      addAnimeToList(data, watchedBy) {
        const { watchlist } = state.getState();
        const updated = addAnime(watchlist, data, watchedBy);
        state.setState({ watchlist: updated });
      },

      removeAnimeFromList(anilistId) {
        const { watchlist } = state.getState();
        state.setState({ watchlist: removeAnime(watchlist, anilistId) });
      },

      toggleViewer(anilistId, user) {
        const { watchlist } = state.getState();
        state.setState({ watchlist: toggleWatchedBy(watchlist, anilistId, user) });
      },

      updateRating(anilistId, user, score) {
        const { watchlist } = state.getState();
        state.setState({ watchlist: setRating(watchlist, anilistId, user, score) });
      },

      setFilters(filters) {
        state.setState({ filters });
      },

      updateDeTitles(mapping) {
        const { deTitles } = state.getState();
        state.setState({ deTitles: { ...deTitles, ...mapping } });
      },

      exportDownload() {
        const { watchlist, deTitles } = state.getState();

        const animeBlob = new Blob([adapter.exportWatchlist(watchlist)], { type: 'application/json' });
        const deBlob = new Blob([adapter.saveDeTitles(deTitles)], { type: 'application/json' });

        const download = (blob, filename) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        };

        download(animeBlob, 'anime.json');
        download(deBlob, 'de-titles.json');
      },

      getFilteredWatchlist() {
        const { watchlist, filters } = state.getState();
        return filterAnime(watchlist, filters);
      }
    };
  }
  ```

- [ ] **Step 5: Templates für Karten**
  ```javascript
  // src/lib/adapters/templates.js
  export function cardTemplate(anime, deTitles = {}) {
    const titleDe = deTitles[anime.anilist_id] || anime.title_de;
    const scoreClass = anime.average_score >= 80 ? 'score-high'
      : anime.average_score >= 60 ? 'score-mid'
      : 'score-low';

    const badges = [];
    if (anime.watched_by.length >= 2) {
      badges.push('<span class="watched-badge badge-both">💑 Beide</span>');
    } else if (anime.watched_by.includes('chrischi')) {
      badges.push('<span class="watched-badge badge-chrischi">🙋 Chrischi</span>');
    } else if (anime.watched_by.includes('michelle')) {
      badges.push('<span class="watched-badge badge-michelle">🙋 Michelle</span>');
    }

    const ratingsHtml = Object.entries(anime.ratings).length > 0
      ? `<div class="personal-rating">${Object.entries(anime.ratings).map(([u, s]) =>
          `${u === 'chrischi' ? '🙋' : '🙋'} ${u}: ${s}/10`
        ).join(' · ')}</div>`
      : '';

    return `
      <div class="anime-card" data-id="${anime.anilist_id}">
        <img class="anime-cover" src="${anime.cover_url || ''}"
             alt="${anime.title_romaji}" loading="lazy"
             onerror="this.src='data:image/svg+xml,...'" />
        <div class="anime-info">
          <div class="anime-title">${titleDe}</div>
          ${anime.title_romaji !== titleDe
            ? `<div class="anime-title-de">${anime.title_romaji}</div>`
            : ''}
          <div class="anime-genres">
            ${anime.genres.slice(0, 4).map(g =>
              `<span class="genre-tag">${g}</span>`
            ).join('')}
          </div>
          <div class="anime-meta">
            <span class="anime-score ${scoreClass}">
              ⭐ ${anime.average_score > 0 ? anime.average_score : '–'}%
            </span>
            <span class="personal-rating">${ratingsHtml}</span>
          </div>
        </div>
        <div class="anime-actions">
          <button class="btn-icon" data-action="toggle-viewer" data-user="michelle">
            🙋 Michelle ${anime.watched_by.includes('michelle') ? '✅' : ''}
          </button>
          <button class="btn-icon" data-action="toggle-viewer" data-user="chrischi">
            🙋 Chrischi ${anime.watched_by.includes('chrischi') ? '✅' : ''}
          </button>
          <button class="btn-icon" data-action="remove" title="Entfernen">🗑️</button>
        </div>
      </div>
    `;
  }

  export function searchResultTemplate(result) {
    return `
      <div class="search-result" data-id="${result.anilist_id}">
        <img class="search-result-cover" src="${result.cover_url || ''}" alt="" loading="lazy" />
        <div class="search-result-info">
          <div class="search-result-title">
            ${result.title_english || result.title_romaji}
          </div>
          <div class="search-result-romaji">${result.title_romaji}</div>
          <div class="search-result-genres">
            ${result.genres.slice(0, 3).map(g =>
              `<span class="genre-tag">${g}</span>`
            ).join('')}
          </div>
        </div>
        <div class="search-result-score">
          ${result.average_score > 0 ? `⭐ ${result.average_score}%` : ''}
        </div>
      </div>
    `;
  }
  ```

- [ ] **Step 6: Bootstrap**
  ```javascript
  // src/lib/bootstrap.js
  import { createState } from './application/state';
  import { createUseCases } from './application/useCases';
  import { JsonFileAdapter } from './adapters/jsonFileAdapter';
  import { AniListAdapter } from './adapters/anilistAdapter';
  import { createUiAdapter } from './adapters/uiAdapter';

  export async function bootstrap() {
    const state = createState();
    const useCases = createUseCases(state);
    const jsonAdapter = new JsonFileAdapter();
    const anilist = new AniListAdapter();
    const ui = createUiAdapter(state, useCases, anilist);

    // Daten laden
    try {
      const watchlist = await jsonAdapter.loadWatchlist();
      const deTitles = await jsonAdapter.loadDeTitles();
      state.setState({ watchlist, deTitles });
    } catch (err) {
      console.error('Failed to load data:', err);
      document.getElementById('grid-message').innerHTML =
        '<span>❌ Konnte Sammlung nicht laden. Bitte Seite neu laden.</span>';
      return;
    }

    // UI initialisieren
    ui.init();

    console.log('🎬 Anime Tracker loaded!');
  }
  ```

- [ ] **Step 7: UI-Adapter (DOM-Manipulation)**
  ```javascript
  // src/lib/adapters/uiAdapter.js
  import { cardTemplate, searchResultTemplate } from './templates';
  import { extractGenres } from '../domain/filters';

  export function createUiAdapter(state, useCases, anilistAdapter) {
    let searchTimeout = null;

    function render() {
      const filtered = useCases.getFilteredWatchlist();
      const { watchlist, deTitles } = state.getState();
      const grid = document.getElementById('anime-grid');
      const msg = document.getElementById('grid-message');

      if (filtered.length === 0) {
        grid.innerHTML = watchlist.length === 0
          ? '<div class="grid-message"><span>📭 Noch keine Animes. Klick auf "➕ Anime hinzufügen"!</span></div>'
          : '<div class="grid-message"><span>🔍 Keine Animes gefunden, die den Filtern entsprechen.</span></div>';
        return;
      }

      grid.innerHTML = filtered.map(a => cardTemplate(a, deTitles)).join('');

      // Update stats
      document.getElementById('total-count').textContent = watchlist.length;
      document.getElementById('both-count').textContent = watchlist.filter(a => a.watched_by.length >= 2).length;
      document.getElementById('chrischi-count').textContent = watchlist.filter(a => a.watched_by.includes('chrischi')).length;
      document.getElementById('michelle-count').textContent = watchlist.filter(a => a.watched_by.includes('michelle')).length;
    }

    function init() {
      render();

      // Filter-Event-Handler
      document.getElementById('filter-search').addEventListener('input', (e) => {
        useCases.setFilters({ ...state.getState().filters, query: e.target.value });
        render();
      });

      document.getElementById('filter-watched-by').addEventListener('change', (e) => {
        useCases.setFilters({ ...state.getState().filters, watchedBy: e.target.value });
        render();
      });

      document.getElementById('filter-score').addEventListener('input', (e) => {
        document.getElementById('score-value').textContent = e.target.value;
        useCases.setFilters({ ...state.getState().filters, minScore: Number(e.target.value) });
        render();
      });

      document.getElementById('filter-genre').addEventListener('change', (e) => {
        const genres = e.target.value ? [e.target.value] : [];
        useCases.setFilters({ ...state.getState().filters, genres });
        render();
      });

      // Genre-Dropdown befüllen
      function updateGenreOptions() {
        const { watchlist } = state.getState();
        const allGenres = extractGenres(watchlist);
        const select = document.getElementById('filter-genre');
        const current = select.value;
        select.innerHTML = '<option value="">🏷️ Alle Genres</option>' +
          allGenres.map(g => `<option value="${g}">${g}</option>`).join('');
        if (allGenres.includes(current)) select.value = current;
      }

      // Initial genre population + subscribe
      updateGenreOptions();
      state.subscribe(() => updateGenreOptions());

      // "Anime hinzufügen" Button
      document.getElementById('btn-add-anime').addEventListener('click', () => {
        showSearchModal();
      });

      // Event-Delegation für Karten-Aktionen
      document.getElementById('anime-grid').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const card = btn.closest('.anime-card');
        const id = Number(card.dataset.id);
        const action = btn.dataset.action;

        if (action === 'remove') {
          if (confirm('Anime aus der Sammlung entfernen?')) {
            useCases.removeAnimeFromList(id);
            render();
          }
        } else if (action === 'toggle-viewer') {
          const user = btn.dataset.user;
          useCases.toggleViewer(id, user);
          render();
        }
      });
    }

    function showSearchModal() {
      const container = document.getElementById('search-modal-container');
      container.innerHTML = `
        <div class="modal-overlay" id="search-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>🔍 Anime suchen</h2>
              <button class="modal-close" id="modal-close">✕</button>
            </div>
            <input type="text" id="modal-search-input" class="filter-input"
                   placeholder="Titel eingeben..." autofocus />
            <div class="modal-results" id="modal-results">
              <div class="modal-hint">Tippe mindestens 3 Buchstaben für die Suche</div>
            </div>
            <div class="modal-who" id="modal-who" style="display:none">
              <h3>Wer hat gesehen?</h3>
              <label><input type="checkbox" id="who-chrischi" checked /> 🙋 Chrischi</label>
              <label><input type="checkbox" id="who-michelle" checked /> 🙋 Michelle</label>
              <div class="modal-add-actions">
                <button class="btn-primary" id="modal-add-btn">✅ Zur Sammlung hinzufügen</button>
                <button class="btn-icon" id="modal-cancel-btn">Abbrechen</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const modal = document.getElementById('search-modal');
      const input = document.getElementById('modal-search-input');
      const results = document.getElementById('modal-results');
      const whoSection = document.getElementById('modal-who');

      let selectedAnime = null;

      // Close handlers
      document.getElementById('modal-close').onclick = () => modal.remove();
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

      // Search with debounce
      input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const q = input.value.trim();
        if (q.length < 3) {
          results.innerHTML = '<div class="modal-hint">Tippe mindestens 3 Buchstaben für die Suche</div>';
          whoSection.style.display = 'none';
          selectedAnime = null;
          return;
        }

        results.innerHTML = '<div class="modal-hint">🔄 Suche...</div>';

        searchTimeout = setTimeout(async () => {
          try {
            const searchResults = await anilistAdapter.searchAnime(q);
            if (searchResults.length === 0) {
              results.innerHTML = '<div class="modal-hint">Keine Ergebnisse gefunden</div>';
              return;
            }
            results.innerHTML = searchResults.map(r => searchResultTemplate(r)).join('');

            // Click on result
            results.querySelectorAll('.search-result').forEach(el => {
              el.addEventListener('click', () => {
                const id = Number(el.dataset.id);
                selectedAnime = searchResults.find(r => r.anilist_id === id);
                results.querySelectorAll('.search-result').forEach(r => r.classList.remove('selected'));
                el.classList.add('selected');
                whoSection.style.display = 'block';
              });
            });
          } catch (err) {
            results.innerHTML = '<div class="modal-hint">❌ Fehler bei der Suche. Bitte versuche es erneut.</div>';
          }
        }, 300);
      });

      // Add button
      document.getElementById('modal-add-btn').addEventListener('click', () => {
        if (!selectedAnime) return;

        const watchers = [];
        if (document.getElementById('who-chrischi').checked) watchers.push('chrischi');
        if (document.getElementById('who-michelle').checked) watchers.push('michelle');

        if (watchers.length === 0) {
          alert('Bitte wähle mindestens eine Person aus.');
          return;
        }

        // Für jeden Viewer einzeln hinzufügen
        watchers.forEach(user => {
          useCases.addAnimeToList(selectedAnime, user);
        });

        // Falls beide: zweiten Viewer togglen
        if (watchers.length === 2) {
          const { watchlist } = state.getState();
          const added = watchlist.find(a => a.anilist_id === selectedAnime.anilist_id);
          if (added) {
            useCases.toggleViewer(selectedAnime.anilist_id, 'michelle');
          }
        }

        modal.remove();
        render();
      });

      document.getElementById('modal-cancel-btn').onclick = () => modal.remove();
    }

    return { init, render };
  }
  ```

- [ ] **Step 8: UI-Adapter Tests — ROT/GRÜN**
  ```javascript
  // src/lib/adapters/uiAdapter.test.js
  import { describe, it, expect, vi, beforeEach } from 'vitest';
  // UI-Adapter braucht DOM — wird in Integration getestet
  // Unit-Tests für Template-Funktionen

  import { cardTemplate, searchResultTemplate } from './templates';

  describe('cardTemplate', () => {
    it('renders a card with basic info', () => {
      const anime = {
        anilist_id: 1,
        title_romaji: 'Naruto',
        genres: ['Action', 'Adventure'],
        average_score: 80,
        watched_by: ['chrischi'],
        ratings: {},
        cover_url: 'https://example.com/cover.jpg'
      };
      const html = cardTemplate(anime);
      expect(html).toContain('Naruto');
      expect(html).toContain('Action');
      expect(html).toContain('chrischi');
      expect(html).not.toContain('undefined');
    });

    it('shows both badge when both watched', () => {
      const anime = {
        anilist_id: 1, title_romaji: 'Test',
        genres: [], average_score: 0,
        watched_by: ['chrischi', 'michelle'],
        ratings: {}, cover_url: ''
      };
      const html = cardTemplate(anime);
      expect(html).toContain('Beide');
    });

    it('shows personal ratings', () => {
      const anime = {
        anilist_id: 1, title_romaji: 'Test',
        genres: [], average_score: 0,
        watched_by: ['chrischi'],
        ratings: { chrischi: 9 },
        cover_url: ''
      };
      const html = cardTemplate(anime);
      expect(html).toContain('9/10');
    });
  });

  describe('searchResultTemplate', () => {
    it('renders a search result', () => {
      const result = {
        anilist_id: 16498, title_romaji: 'Shingeki no Kyojin',
        title_english: 'Attack on Titan',
        genres: ['Action'], average_score: 86, cover_url: ''
      };
      const html = searchResultTemplate(result);
      expect(html).toContain('Attack on Titan');
      expect(html).toContain('Shingeki no Kyojin');
      expect(html).toContain('86');
    });
  });
  ```

- [ ] **Step 9: Tests laufen lassen**
  ```bash
  npx vitest run src/lib/
  ```
  Expected: ALL PASS

- [ ] **Step 10: Commit**
  ```bash
  git add src/lib/application/ src/lib/adapters/
  git commit -m "feat: add Application Layer (state, useCases, UI adapter, templates) [TDD]"
  ```

### ✅ Review
- [ ] Alle Tests grün?
- [ ] State ist immutable (keine direkte Mutation)?
- [ ] UseCases delegieren an Domain-Funktionen (keine Duplizierung)?
- [ ] UI-Adapter trennt DOM-Logik von Domain-Logik?
- [ ] Search-Modal schließt bei Klick außerhalb?
- [ ] Export lädt beide JSON-Dateien (anime.json + de-titles.json)?
- [ ] Fehlerbehandlung bei API-Fehlern im Such-Modal?

- [ ] **Step 11: Such-Modal CSS hinzufügen (global oder in Komponente)**
  ```css
  /* Ergänzung in global.css */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  .modal-content {
    background: var(--bg-secondary);
    border-radius: var(--radius);
    width: 90%;
    max-width: 560px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 24px;
    border: 1px solid var(--border);
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .modal-header h2 { font-size: 1.3rem; }
  .modal-close {
    background: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    padding: 4px 8px;
  }
  .modal-close:hover { color: var(--text-primary); }
  .modal-results {
    margin-top: 12px;
    max-height: 300px;
    overflow-y: auto;
  }
  .modal-hint {
    color: var(--text-muted);
    text-align: center;
    padding: 20px;
  }
  .search-result {
    display: flex;
    gap: 12px;
    padding: 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.2s;
    align-items: center;
  }
  .search-result:hover { background: var(--bg-hover); }
  .search-result.selected { background: var(--bg-card); border: 1px solid var(--accent); }
  .search-result-cover {
    width: 50px;
    height: 70px;
    object-fit: cover;
    border-radius: 4px;
  }
  .search-result-info { flex: 1; }
  .search-result-title { font-weight: 600; }
  .search-result-romaji { font-size: 0.8rem; color: var(--text-secondary); }
  .search-result-genres { display: flex; gap: 4px; margin-top: 4px; }
  .search-result-score { font-weight: 600; color: var(--accent); }
  .modal-who {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .modal-who h3 { margin-bottom: 8px; font-size: 1rem; }
  .modal-who label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-right: 16px;
    cursor: pointer;
  }
  .modal-who input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
  }
  .modal-add-actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    align-items: center;
  }
  ```

---

## Task 7: Export + Git-Workflow (UI Integration)

**Files:**
- Modify: `src/components/StatsHeader.astro` — Export-Button hinzufügen
- Modify: `src/lib/adapters/uiAdapter.js` — Export-Handler
- Create: `.github/scripts/update-data.sh` — optionales Script für schnelles Daten-Update

**Interfaces:**
- Consumes: `exportDownload()` aus UseCases
- Produces: Download von `anime.json` + `de-titles.json`

### 🔍 Planung
- Export-Button in der Stats-Leiste
- Lädt beide JSON-Dateien als Download
- User committed die Dateien manuell und pusht
- GH Action deployed automatisch

### 💻 Implementierung

- [ ] **Step 1: Export-Button zu StatsHeader hinzufügen**
  ```diff
  <!-- StatsHeader.astro: nach den Stats -->
  + <button id="btn-export" class="btn-export" title="Änderungen exportieren">
  +   💾 Export JSON
  + </button>
  ```

  ```css
  /* Zusätzliches CSS */
  .btn-export {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border);
    padding: 10px 20px;
    border-radius: var(--radius-sm);
    font-weight: 500;
    transition: all 0.2s;
  }
  .btn-export:hover {
    background: var(--accent-blue);
    color: white;
    border-color: var(--accent-blue);
  }
  ```

- [ ] **Step 2: Export-Handler in uiAdapter.js**
  ```javascript
  // Ergänzung in init():
  document.getElementById('btn-export').addEventListener('click', () => {
    useCases.exportDownload();
  });
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/ src/lib/adapters/
  git commit -m "feat: add JSON export button for data sync"
  ```

### ✅ Review
- [ ] Export lädt beide Dateien? (anime.json + de-titles.json)
- [ ] JSON valide und vollständig?
- [ ] Export-Button sichtbar und funktional?

---

## Task 8: GitHub Pages Deployment + Finaler Review

**Files:**
- Already created: `.github/workflows/deploy.yml` (Task 0)
- Modify: `astro.config.mjs` — final verify
- Create: `.nojekyll` (für gh-pages mit underscores)

**Interfaces:**
- Consumes: Alles
- Produces: Live-Webseite auf GitHub Pages

### 🔍 Planung
- Sicherstellen, dass `base` in astro.config.mjs korrekt ist
- `.nojekyll` für gh-pages (GitHub Pages ignoriert `_`-Ordner ohne)
- GitHub Action läuft bei Push auf `main`
- Deployment auf `gh-pages` Branch

### 💻 Implementierung

- [ ] **Step 1: astro.config.mjs final verifizieren**
  ```js
  import { defineConfig } from 'astro/config';

  export default defineConfig({
    site: 'https://shaunclaw07.github.io',
    base: '/anime-tracker',
    output: 'static',
    build: {
      assets: 'assets'
    }
  });
  ```

- [ ] **Step 2: `.nojekyll` erstellen**
  ```bash
  touch .nojekyll
  ```

- [ ] **Step 3: Gesamten Testlauf**
  ```bash
  npm run build
  # Prüfen ob dist/anime-tracker/ existiert (base path)
  ls dist/
  ```

- [ ] **Step 4: Lokalen Test starten**
  ```bash
  npm run preview
  # Im Browser prüfen: http://localhost:4321/anime-tracker/
  ```

- [ ] **Step 5: Alles committen & pushen**
  ```bash
  git add .
  git commit -m "chore: final setup for GitHub Pages deployment"
  git push origin main
  ```

- [ ] **Step 6: GitHub Action Status prüfen**
  ```bash
  # Nach ~2 Minuten:
  gh run list --repo shaunclaw07/anime-tracker --limit 1
  ```

- [ ] **Step 7: Seite live prüfen**
  ```bash
  curl -s -o /dev/null -w "%{http_code}" "https://shaunclaw07.github.io/anime-tracker/"
  ```
  Expected: 200

### ✅ Review
- [ ] `npm run build` ohne Fehler?
- [ ] `.nojekyll` vorhanden?
- [ ] GitHub Action grün?
- [ ] Seite live unter gh-pages erreichbar (HTTP 200)?
- [ ] `data/` JSON-Dateien in `dist/` enthalten?
- [ ] Filter + Suche + Hinzufügen funktionieren im Live-Deployment?
- [ ] Export lädt JSON-Dateien?
- [ ] README mit Link zur Live-Seite aktualisiert?

---

## Zusammenfassung: Kanban (Hermes Todo)

```
📋 BACKLOG
  Task 0: GitHub Repo + Astro-Setup
  Task 1: Domain — Anime-Entität + Filter-Engine (TDD)
  Task 2: Domain — Watchlist-Logik (TDD)
  Task 3: Ports — AnimeRepository + JsonFileAdapter (TDD)
  Task 4: Ports — AnimeSearchService + AniListAdapter (TDD)
  Task 5: UI — Astro-Komponenten
  Task 6: Application Layer + Client-JS (TDD)
  Task 7: Export + Git-Workflow
  Task 8: GitHub Pages Deployment + Finaler Review

🚧 IN PROGRESS
  (none)

✅ DONE
  (none)
```
