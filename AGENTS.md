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
│   ├── domain/           # ❤️ Core — keine Abhängigkeiten nach außen
│   │   ├── anime.js      #   createAnime(data) — Factory mit Validierung
│   │   ├── filters.js    #   filterAnime(list, filters) — reine Filter-Funktion
│   │   └── watchlist.js  #   addAnime / removeAnime / toggleWatchedBy / setRating
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
│       └── uiState.js             # Such-Status
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   └── index.astro       # Hauptseite
└── styles/
    └── global.css        # Mobile-First, Dark Theme, Custom Properties
```

## Wichtige Konventionen

### Architektur
- **Domain** (`src/lib/domain/`) — KEINE Imports aus application/, adapters/ oder DOM
- **Application** (`src/lib/application/`) — importiert nur Domain
- **Adapter** (`src/lib/adapters/`) — importiert Domain + Application
- **UI** — Vollständig clientseitig via `uiAdapter.js` + `global.css`

### UI-Adapter (uiAdapter.js)
Zentraler Vermittler zwischen State/Domain und DOM. Enthält:
- `render()` — rendert Grid, Stats, Filter-Status
- `init()` — bindet alle Event-Handler (FAB, Export, Filter, Grid-Delegation)
- `showSearchModal()` — Such-Modal mit AniList-API, Genre/Tag/Sortierung, Pagination
- `showFilterSheet()` — Bottom-Sheet für Sammlungs-Filter

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

## Tests (148 Tests)

| Datei | Tests | Testet |
|---|---|---|
| `domain/anime.test.js` | 9 | createAnime, Validierung, Defaults |
| `domain/filters.test.js` | 26 | Text/Genre/Score/Person-Filter, Kombinationen |
| `domain/watchlist.test.js` | 19 | add/remove/toggle/setRating, Immutability |
| `application/state.test.js` | 10 | getState/setState/subscribe |
| `adapters/__tests__/templates.test.js` | 37 | cardTemplate, searchResultTemplate, HTML-Struktur |
| `application/useCases.test.js` | 18 | Alle UseCases mit gemocktem State + Storage |
| `adapters/anilistAdapter.test.js` | 15 | API-Requests, Response-Mapping, Fehlerfälle |
| `adapters/localStorageAdapter.test.js` | 11 | save/load/export, localStorage-Mocking |

Alle Tests sind **reine Unit-Tests** — keine DOM/UI-Tests (kein jsdom/Happy-DOM).

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
# Manuelles Deployment:
cd dist && git init && git add -A && git commit -m "deploy"
git push -f git@github-gmail.com:shaunclaw07/anime-tracker.git HEAD:gh-pages
```

**Git:** Remote ist `origin` = `git@github-gmail.com:shaunclaw07/anime-tracker.git` (SSH via github-gmail.com Host).

## User (für Tests/Domain)

Zwei User: `'chrischi'` und `'michelle'`
- `watched_by`: Array aus diesen Strings
- `ratings`: Array von `{user: string, score: number}` (1-10)
