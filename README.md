# Anime Tracker 🎬

Gemeinsame Anime-Sammlung von **Chrischi & Michelle**.

Suche, filtere und dokumentiere eure geschauten Animes — wer hat was gesehen, wie fandet ihr es, und was kommt als nächstes?

👉 **[Live-Seite](https://shaunclaw07.github.io/anime-tracker/)**

## Features

- 🔍 **Anime-Suche** via AniList GraphQL API — tippen & finden
- 🎭 **Nach Genre filtern** (Action, Comedy, Fantasy, …)
- 🏷️ **Nach Tag filtern** (Isekai, Mecha, Shounen, …)
- 👤 **Pro Person** dokumentieren (Chrischi / Michelle / Gemeinsam)
- ⭐ **Persönliche Bewertungen** (1-10) + Community-Rating
- 🔽 **Sortierung** nach Relevanz, Bewertung, Titel, Popularität
- 📄 **Pagination** mit "Mehr laden"-Button
- 📦 **localStorage** — alle Daten bleiben im Browser, kein Account nötig
- 💾 **Export** als JSON für Backup

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Dev-Server starten
npm run dev

# Tests ausführen (158 Tests)
npx vitest run src/lib/

# Produktions-Build
npm run build
```

## Deployment

Das Projekt läuft als statische Seite auf **GitHub Pages**.

```bash
# Manuelles Deployment
npm run build
cd dist
git init && git add -A && git commit -m "deploy"
git push -f git@github-gmail.com:shaunclaw07/anime-tracker.git HEAD:gh-pages

# Oder via GitHub Action (Push auf main löst Build+Deploy aus)
```

## Architektur

```
┌────────────────────────────────┐
│    Präsentation (UI)           │  Astro · DOM · CSS · SVG-Icons
├────────────────────────────────┤
│    Application (Use Cases)     │  addAnime · filter · export · persist
├────────────────────────────────┤
│    Domain (Core)               │  Anime-Entität · Filter Engine · Watchlist
├────────────────────────────────┤
│    Infrastruktur (Adapters)    │  AniList API · localStorage · Export
└────────────────────────────────┘
```

Clean Architecture + Hexagonal Architecture (Ports & Adapters) im Frontend.
Domänen-Logik ist unabhängig von UI, API und Speicher.
Entwickelt mit **TDD** — Rot-Grün-Refactor.

## Daten

Alle Daten werden im **localStorage** des Browsers gespeichert:

- `anime-tracker-watchlist` — Die komplette Sammlung als JSON
- Kein Account, kein Server, kein Git-Repo nötig

Mit dem **Export-Button** (💾) kann jederzeit ein JSON-Backup heruntergeladen werden.

## Tests

```bash
# Alle Tests
npx vitest run src/lib/

# Einzelne Test-Datei
npx vitest run src/lib/domain/filters.test.js

# Watch-Modus
npx vitest
```

- **158 Tests**, alle grün
- Domain: Anime-Entität, Filter-Engine, Watchlist-Logik
- Application: State, UseCases, Templates
- Adapter: AniList API, JsonFileAdapter, LocalStorageAdapter

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Framework | **Astro 7** (Static Site Generator) |
| Sprache | **Vanilla JavaScript** (kein Framework) |
| API | **AniList GraphQL** (kein API-Key nötig) |
| Speicher | **localStorage** (Browser) |
| Icons | **Inline SVG** (Heroicons) |
| Font | **Quicksand** (Google Fonts) |
| Tests | **Vitest** |
| Hosting | **GitHub Pages** |
