# Anime Tracker 🎬

Gemeinsame Anime-Sammlung von **Chrischi & Michelle**.

Suche, filtere und dokumentiere eure geschauten Animes — wer hat was gesehen, wie fandet ihr es, und was kommt als nächstes?

👉 **[Live-Seite](https://shaunclaw07.github.io/anime-tracker/)**

## Features

- 🔍 **Anime-Suche** via AniList API — tippen & finden
- 🏷️ **Filtern** nach Genre, Rating, Gesehen-von
- 👤 **Pro Person** dokumentieren (Chrischi / Michelle / Gemeinsam)
- ⭐ **Persönliche Bewertungen** (1-10)
- 💾 **Export** als JSON — Daten liegen im Git-Repo

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Dev-Server starten
npm run dev

# Produktions-Build
npm run build
```

## Deployment

Push auf `main` → GitHub Action baut + deployt automatisch auf GitHub Pages.

## Architektur

Clean Architecture + Hexagonal Architecture (Ports & Adapters):

```
┌────────────────────────────────┐
│    Präsentation (UI)           │  Astro · DOM · CSS
├────────────────────────────────┤
│    Application (Use Cases)     │  addAnime · filter · export
├────────────────────────────────┤
│    Domain (Core)               │  Anime-Entität · Filter Engine · Watchlist
├────────────────────────────────┤
│    Infrastructure (Adapter)    │  AniList API · JSON Files
└────────────────────────────────┘
```

Entwickelt mit **TDD** (Test-Driven Development) — Rot-Grün-Refactor.

## Daten

- `data/anime.json` — Die Sammlung
- `data/de-titles.json` — Deutsche Titel-Mapping

Nach Änderungen: `💾 Export JSON` in der UI → Dateien ersetzen → commit & push.
