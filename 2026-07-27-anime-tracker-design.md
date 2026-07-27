# Anime Tracker — Design Document

> Eine filterbare Website zur Dokumentation der gemeinsamen Anime-Sammlung von Chrischi & Michelle.

## Ziel

Eine statische Webseite auf GitHub Pages, auf der Chrischi und Michelle:
- Nach beliebten Animes suchen können (via AniList GraphQL API)
- Animes als "geschaut" markieren können (pro Person oder beide)
- Die Sammlung nach Genre, Rating (Community & persönlich), Gesehen-von und Titel filtern können
- Änderungen via JSON-Dateien im Repo verwalten und per Git synchronisieren

## Tech-Stack

| Ebene | Technologie | Begründung |
|---|---|---|
| Framework | **Astro 5** | Statischer Site Generator, `dist/` → gh-pages, Insel-Architektur |
| CSS | **Vanilla CSS / Custom Properties** | Keine Abhängigkeit, voll kontrollierbar |
| API | **AniList GraphQL** | Zuverlässig, kein API-Key, 90 req/min, reichhaltige Daten |
| Datenhaltung | **JSON-Files im Repo** | `data/anime.json` + `data/de-titles.json`, per Git versioniert |
| Hosting | **GitHub Pages** | Kostenlos, aus `gh-pages` Branch |
| CI/CD | **GitHub Action** | Automatischer Build + Deploy bei Push auf `main` |
| Task-Tracking | **Hermes todo (Kanban)** | Projektfortschritt im Chat verfolgbar |

## Datenquellen

### AniList GraphQL API (primär)
- **Endpoint:** `https://graphql.anilist.co`
- **Query pro Anime-Suche:**
  ```graphql
  query ($search: String) {
    Page(page: 1, perPage: 20) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        title { romaji english native }
        genres
        averageScore
        episodes
        format
        status
        startDate { year month day }
        coverImage { large }
        description
        tags { name rank }
      }
    }
  }
  ```
- **Rate Limit:** 90 Requests pro Minute (pro IP) — für clientseitige Suche völlig ausreichend

### Deutsche Titel (lokal)
- **Datei:** `data/de-titles.json`
- **Struktur:** `{ "<anilist_id>": "Deutscher Titel" }`
- Wächst organisch mit jedem Eintrag — beim Speichern wird der deutsche Titel eingegeben
- Fallback: Falls kein Eintrag, wird `title.romaji` oder `title.english` angezeigt
- Optional: Ein GitHub Action, das regelmäßig `jikan` auf deutsche Synonyme abfragt

## Datenstruktur

### `data/anime.json` — Die Sammlung
```json
{
  "version": 1,
  "last_updated": "2026-07-27",
  "watched": [
    {
      "anilist_id": 16498,
      "title_romaji": "Shingeki no Kyojin",
      "title_english": "Attack on Titan",
      "title_de": "Attack on Titan",
      "genres": ["Action", "Drama", "Fantasy", "Mystery"],
      "average_score": 86,
      "episodes": 25,
      "cover_url": "https://s4.anilist.co/file/...large.jpg",
      "format": "TV",
      "watched_by": ["chrischi", "michelle"],
      "ratings": {
        "chrischi": 10,
        "michelle": 9
      },
      "finished_at": "2024-03-15"
    }
  ]
}
```

Felder:
- **`watched_by`**: Array mit Usern (`"chrischi"`, `"michelle"`) — wer hat es gesehen
- **`ratings`**: Optional, persönliche Bewertung 1-10 pro Person
- **`finished_at`**: Optional, Datum des Fertigschauens
- Alle restlichen Felder kommen direkt von AniList und sind Caching der API-Daten

### `data/de-titles.json` — Deutsche Titel
```json
{
  "16498": "Attack on Titan",
  "21": "One Piece",
  "1735": "Naruto Shippuden"
}
```

## UI / Features

### Layout
- Single-Page-App (SPA) mit Astro + clientseitigem JavaScript
- **Header:** Titel, Filter-Anzahl, "Neuen Anime hinzufügen" Button
- **Filter-Bar:** Fixiert unter Header
  - 🔤 Text-Suche (Titel)
  - 🏷️ Genre Multi-Select (aus vorhandenen Genres der Sammlung)
  - ⭐ Community-Rating ≥ Slider
  - 👤 "Gesehen von": Chrischi / Michelle / Beide
  - ❤️ Persönliches Rating ≥ Slider
- **Grid:** Anime-Karten (Poster + Titel + Genres + Ratings)
  - Wenn beide gesehen haben: Herz-Symbol oder Badge "Gemeinsam"
  - Persönliche Ratings als Sterne

### Such-Flow (Anime hinzufügen)
1. Button "➕ Neuen Anime" → Modal öffnet sich
2. Eingabefeld: tippen → debounced API-Call zu AniList
3. Ergebnisliste mit Cover + Titel + Genres + Score
4. Anime auswählen → Vorschau mit allen Daten
5. Wer hat gesehen? (Chrischi ✅ / Michelle ✅)
6. Ratings (optional) + Fertig-Datum
7. ✅ Speichern → fügt Eintrag zur lokalen Session hinzu
8. "💾 Änderungen exportieren" → lädt `anime.json` und `de-titles.json` als Download

### Deployment-Flow
1. JSON-Dateien lokal ablegen und committed
2. `git push` → GitHub Action baut Astro (`npm run build`)
3. Deployt `dist/` auf `gh-pages` Branch
4. Seite live unter `best-blu.github.io/anime-tracker/` (oder Custom Name)

## Filter-Engine (clientseitig)

```javascript
function filterAnime(anime, filters) {
  return anime.filter(a => {
    // Textsuche in allen verfügbaren Titeln
    if (filters.query && !matchesTitle(a, filters.query)) return false;

    // Genre: Anime muss ALLE ausgewählten Genres haben (UND) ODER mindestens eins (ODER)
    if (filters.genres.length && !filters.genres.some(g => a.genres.includes(g))) return false;

    // Community-Rating
    if (filters.minScore && (a.average_score || 0) < filters.minScore) return false;

    // Gesehen von
    if (filters.watchedBy !== 'all') {
      if (filters.watchedBy === 'both' && a.watched_by.length < 2) return false;
      if (filters.watchedBy === 'chrischi' && !a.watched_by.includes('chrischi')) return false;
      if (filters.watchedBy === 'michelle' && !a.watched_by.includes('michelle')) return false;
    }

    return true;
  });
}
```

## Genutzte Ordnerstruktur (geplant)

```
anime-tracker/
├── data/
│   ├── anime.json              # Die Sammlung
│   └── de-titles.json           # Deutsche Titel
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AnimeGrid.astro      # Raster der Karten
│   │   ├── AnimeCard.astro      # Einzelne Karte
│   │   ├── FilterBar.astro      # Filter-UI
│   │   ├── SearchModal.astro    # Anime-Suche-Modal
│   │   └── StatsHeader.astro    # Überschrift mit Statistiken
│   ├── lib/
│   │   ├── anilist.js           # AniList GraphQL Client
│   │   ├── filters.js           # Clientseitige Filter-Engine
│   │   └── data.js              # JSON laden/speichern/exportieren
│   ├── pages/
│   │   └── index.astro          # Hauptseite (SSG)
│   ├── layouts/
│   │   └── BaseLayout.astro     # Grundgerüst (HTML, Meta, CSS)
│   └── styles/
│       └── global.css           # Custom Properties + Styles
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .github/
│   └── workflows/
│       └── deploy.yml           # Build + Deploy zu gh-pages
└── README.md
```

## Architektur: Clean + Hexagonal

Das Projekt folgt einer **Mischung aus Clean Architecture und Hexagonal Architecture (Ports & Adapters)**, angepasst an die Frontend-Domäne.

### Schichten-Modell

```
┌─────────────────────────────────────────┐
│           Präsentation (UI)              │
│  Astro-Komponenten, DOM, Event-Handler   │
├─────────────────────────────────────────┤
│           Application (Use Cases)        │
│  Anime hinzufügen, Filtern, Exportieren  │
├─────────────────────────────────────────┤
│           Domain (Core)                  │
│  Anime-Entität, Filter-Engine,          │
│  Watchlist-Logik, Rating-System          │
├─────────────────────────────────────────┤
│           Infrastructure (Adapters)      │
│  AniList API Client  │  JSON File I/O   │
└─────────────────────────────────────────┘
```

### Ports & Adapters
- **Domain-Port** `AnimeRepository` — Interface für Lese-/Schreibzugriff auf die Sammlung
- **Domain-Port** `AnimeSearchService` — Interface für externe Anime-Suche
- **Adapter** `AniListAdapter` — implementiert `AnimeSearchService` via GraphQL
- **Adapter** `JsonFileAdapter` — implementiert `AnimeRepository` via JSON-Dateien
- **Adapter** `UiAdapter` — DOM-Manipulation, Event-Handler, Rendering

### Prinzipien
- **Dependency Rule:** Abhängigkeiten zeigen NACH INNEN (UI → Application → Domain). Domain kennt weder UI noch API.
- **TDD:** Rot-Grün-Refactor für jede Einheit. Tests schreiben → scheitern sehen → Implementierung → Refactor.
- **Keine Framework-Abhängigkeit in der Domain:** Die Filter-Engine und Watchlist-Logik sind reines JavaScript, unabhängig von Astro oder DOM.

## Entwicklungsprozess

Das Projekt durchläuft für jede Task drei Phasen:

### 1. 🔍 Planung
- Aufgabe verstehen
- Akzeptanzkriterien definieren
- Testfälle skizzieren

### 2. 💻 Implementierung (TDD)
- **ROT:** Test schreiben → erwartungsgemäß fehlschlagen sehen
- **GRÜN:** Minimalen Code schreiben, der Test passen lässt
- **REFACTOR:** Code verbessern, Tests bleiben grün
- Kleine, häufige Commits

### 3. ✅ Review
- Code-Review der Änderungen
- Tests laufen durch?
- Grenzfälle abgedeckt?
- Architektur eingehalten?

## Ausgeschlossene Features (YAGNI)
- User-Authentifizierung / Login — es gibt nur Chrischi + Michelle
- API-basierte Sync zwischen Geräten — Git-Repo ist die Source of Truth
- Backend-Server — reine statische Seite
- Watch-Progress pro Episode — nur "komplett gesehen"
- Community-Features (Kommentare, Listen teilen) — private Sammlung

## Offene Fragen
1. ~~Account & Repo-Name?~~ → `shaunclaw07/anime-tracker` ✅
2. Sollen GIFs/Lottie-Animationen für "Gemeinsam geschaut"-Badge?
