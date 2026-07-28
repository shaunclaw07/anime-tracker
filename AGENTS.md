# Anime Tracker — Agent Guide

## Überblick

Statische Web-App zur Dokumentation einer Anime-Sammlung für 2 Personen (Chrischi & Michelle).  
Clean Architecture + Hexagonal Architecture im Frontend. Vollständig clientseitig (kein Backend).

**Live:** https://shaunclaw07.github.io/anime-tracker/  
**Repo:** https://github.com/shaunclaw07/anime-tracker (öffentlich)

---

## Projektstruktur

```
src/
├── lib/
│   ├── domain/           # ❤️ Core — keine Abhängigkeiten nach außen (TypeScript)
│   │   ├── anime.ts      #   createAnime(data) — Factory mit Validierung
│   │   ├── filters.ts    #   filterAnime(list, filters) — reine Filter-Funktion
│   │   └── watchlist.ts  #   addAnime / removeAnime / toggleWatchedBy / setRating
│   ├── application/      # ⚙️ Use Cases — verbindet Domain + Adapter
│   │   ├── state.js      #   createState() — Mini-Redux Store
│   │   └── useCases.js   #   createUseCases(state, storageAdapter)
│   ├── ports/            # 🔌 Port-Definitionen (Interface-Konvention)
│   │   ├── animeRepository.js
│   │   └── animeSearchService.js
│   └── adapters/         # 🔧 Adapter-Implementierungen
│       ├── anilistAdapter.js      # AniList GraphQL API
│       ├── detailModal.js         # Detail-Ansicht + Bearbeitung
│       ├── filterSheet.js         # Filter (Mobile + Desktop)
│       ├── localStorageAdapter.js # localStorage (aktiv!)
│       ├── randomModal.js         # Zufalls-Anime
│       ├── searchModal.js         # Such-Modal (AniList API)
│       ├── settingsModal.js       # Einstellungen
│       ├── templates.js           # HTML-String-Templates
│       ├── uiAdapter.js           # DOM-Orchestrator
│       ├── uiState.js             # Such-Status
│       └── __tests__/             # DOM-Tests (jsdom)
│           ├── modals.test.js     #   Search/Detail/Settings-Modal
│           ├── templates.test.js  #   cardTemplate, searchResultTemplate
│           └── uiAdapter.test.js  #   render, init, Event-Binding
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   └── index.astro       # Hauptseite
└── styles/
    └── global.css        # Mobile-First, Dark Theme, Custom Properties
```

## Wichtige Konventionen

### Architektur (Clean + Hexagonal)
- **Domain** (`src/lib/domain/`) — KEINE Imports aus application/, adapters/, config/ oder DOM
- **Application** (`src/lib/application/`) — importiert nur Domain + config (KEINE Adapters!)
- **Adapter** (`src/lib/adapters/`) — importiert Domain + Application (Ende der Kette)
- **Ports** (`src/lib/ports/`) — importiert nichts (reine Interface-Dokumentation)
- **UI** — Vollständig clientseitig via `uiAdapter.js` + `global.css`

### Architecture Enforcement
Die Datei `src/lib/__tests__/architecture.test.js` prüft automatisch alle Import-Richtungen:

| Layer → darf importieren | domain | application | adapters | config | ports |
|---|---|---|---|---|---|
| **domain/** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **application/** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **adapters/** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **ports/** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **config.js** | ❌ | ❌ | ❌ | ❌ | ❌ |

Jeder Verstoss lässt CI rot werden. Vor dem Commit laufen lassen: `npx vitest run src/lib/__tests__/architecture.test.js`

### UI-Adapter (uiAdapter.js)
Zentraler Orchestrator zwischen State/Domain und DOM. Delegiert an spezialisierte Module:
- `render()` — rendert Grid, Stats, Filter-Status
- `init()` — bindet alle Event-Handler (FAB, Export, Filter, Grid-Delegation)
- `searchModal.js` — Such-Modal mit AniList-API, Genre/Tag/Sortierung, Pagination
- `detailModal.js` — Detail-Ansicht mit Editier-Controls
- `settingsModal.js` — User-Label-Verwaltung
- `randomModal.js` — Zufalls-Anime-Suche
- `filterSheet.js` — Bottom-Sheet (Mobile) + Inline-Bar (Desktop)

### Datenhaltung
- **Primär:** `localStorage` (Key: `anime-tracker-watchlist`)
- Automatischer Persist nach jeder Mutation (add/remove/toggle/rating)
- Export-Button lädt JSON als Download für Backup

### API (AniList)
- Endpoint: `https://graphql.anilist.co`
- Kein API-Key nötig (Rate-Limit: ~90 req/min)
- `searchAnime(query, genre, tag)` — einfache Suche (erste Seite als Array)
- `searchAnimePage(query, genre, tag, page, sort)` — mit Pagination + Sortierung
- Pagination nutzt `hasNextPage` aus `pageInfo`

### Such-Modal (showSearchModal)
1. 🔤 Titel eingeben ODER 🎭 Genre / 🏷️ Tag auswählen
2. Ergebnisse erscheinen nach 300ms Debounce
3. 📄 "Mehr laden" für nächste Seite
4. Klick auf Ergebnis → "Hinzufügen" aktiv
5. "Gesehen von" Checkboxen → addAnimeToList + ggf. toggleViewer für zweiten User

## Tests (258 Tests)

| Datei | Tests | Testet |
|---|---|---|
| `domain/anime.test.js` | 9 | createAnime (TypeScript), Validierung, Defaults |
| `domain/filters.test.js` | 38 | Text/Genre/Score/Person-Filter, Kombinationen |
| `domain/watchlist.test.js` | 32 | add/remove/toggle/setRating, Immutability |
| `domain/stats.test.js` | 10 | computeStats — Zählung, ⌀, Top-Genres |
| `application/state.test.js` | 10 | getState/setState/subscribe |
| `application/useCases.test.js` | 24 | Alle UseCases mit gemocktem State + Storage |
| `application/tabTitle.test.js` | 3 | Browser-Tab-Titel |
| `adapters/anilistAdapter.test.js` | 15 | API-Requests, Response-Mapping, Fehlerfälle |
| `adapters/indexedDBAdapter.test.js` | 6 | save/load/export, IndexedDB-Mocking |
| `adapters/__tests__/templates.test.js` | 54 | cardTemplate, searchResultTemplate (DOM) |
| `adapters/__tests__/uiAdapter.test.js` | 9 | render, init, Event-Binding (DOM/jsdom) |
| `adapters/__tests__/modals.test.js` | 27 | Search/Detail/Settings/Random-Modal (DOM/jsdom) |
| `adapters/__tests__/filterSheets.test.js` | 13 | filterSheet (Mobile) + desktopFilterBar (DOM/jsdom) |
| `__tests__/architecture.test.js` | 8 | Import-Richtungen Clean/Hexagonal-Architektur |

**210 Unit-Tests + 40 DOM-Tests (jsdom) + 8 Architecture-Tests = 258 Tests**

### Test-Pflicht
Jedes neue Feature oder jede Änderung muss mit Tests abgesichert werden:

- **Domain-Logik** → Pure-Unit-Tests (kein jsdom nötig)
- **Use Cases / Application** → Tests mit gemocktem State + Storage
- **UI-Modale / DOM** → jsdom-Tests mit `// @vitest-environment jsdom`
- **Architektur** → Neuer Layer? Import-Regel in `architecture.test.js` ergänzen

**Richtlinien:**
- `describe('ModulName', ...)` für logische Gruppen
- Jede öffentliche Funktion mindestens 1 Test (happy path + error case)
- Kein `test.only` oder `describe.only` im Commit
- Vor jedem Commit: `npx vitest run` — muss grün sein

## Farbpalette (CSS Custom Properties)

```css
--color-primary: #7C3AED;       /* Purple */
--color-accent: #F43F5E;        /* Rose/Pink */
--color-background: #0F0F23;    /* Deep dark blue */
--color-card: #1E1C35;          /* Card background */
--color-border: #4C1D95;        /* Borders */
--font-body: 'Quicksand', sans-serif;
```

## Mobile-First Breakpoints

```css
/* Mobile:   0-639px  → 2 Spalten Grid, FAB, Bottom-Sheets */
@media (min-width: 640px) {  /* Tablet:   640-1023px → 3 Spalten, Filter inline */ }
@media (min-width: 1024px) { /* Desktop: 1024px+    → 4 Spalten */ }
```

- FAB (Floating Action Button) nur auf Mobile sichtbar
- Filter: Bottom-Sheet auf Mobile, Inline-Leiste auf Desktop
- Stats: horizontal scrollbar auf Mobile

## Build & Deploy

```bash
npm run build           # → dist/
```

**CI/CD (GitHub Actions):** Automatisch bei Push auf `main`:
- **CI:** `.github/workflows/ci.yml` — `npm ci` + `npx vitest run`
- **CD:** `.github/workflows/deploy.yml` — Build + Deploy zu GitHub Pages

Manuelles Deployment (Fallback):
```bash
npm run build
cd dist && git init && git add -A && git commit -m "deploy"
git push -f git@github-gmail.com:shaunclaw07/anime-tracker.git HEAD:gh-pages
```

**Git:** Remote ist `origin` = `git@github-gmail.com:shaunclaw07/anime-tracker.git` (SSH via github-gmail.com Host).

## User (für Tests/Domain)

Zwei User: `'chrischi'` und `'michelle'`
- `watched_by`: Array aus diesen Strings
- `ratings`: Array von `{user: string, score: number}` (1-10)
- Labels (Anzeigenamen) über `getUserLabel(user)` aus `config.js`
