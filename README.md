# Anime Tracker 🎬

Gemeinsame Anime-Sammlung von **Chrischi & Michelle**.

Suche, filtere und dokumentiere eure geschauten Animes — wer hat was gesehen, wie fandet ihr es, und was kommt als nächstes?

👉 **[Live-Seite](https://shaunclaw07.github.io/anime-tracker/)**

## Features

- 🔍 **Anime-Suche** via AniList GraphQL API — Titel + Genre + Tag kombinierbar
- 🎭 **Nach Genre filtern** (Action, Comedy, Fantasy, …)
- 🏷️ **Nach Tag filtern** (Isekai, Mecha, Shounen, …)
- 👤 **Pro Person** dokumentieren — konfigurierbare Usernamen (⚙️ Settings)
- ⭐ **Persönliche Bewertungen** (1–10) + Community-Rating, nur für gesehene User
- 🔽 **Sortierung** nach Relevanz, Bewertung (↑↓), Titel (A–Z / Z–A), Popularität
- 📄 **Pagination** mit "Mehr laden"-Button (20 pro Seite)
- 👆 **Detail-View** — Klick auf Karte → Synopsis, Rating editieren, "Gesehen von" togglen
- 🎲 **Zufalls-Anime** aus der API — entdecken & direkt zur Sammlung hinzufügen
- ✅ **Duplikat-Erkennung** — "Bereits in Sammlung"-Badge in der Suche
- 🗑️ **Rückgängig** — Toast nach Löschen (4 Sekunden)
- 📦 **localStorage** — alle Daten bleiben im Browser, kein Account nötig
- 💾 **Export** als JSON für Backup
- ⚙️ **Settings** — Anzeigenamen änderbar, User-IDs generiert & migrierbar

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Dev-Server starten
npm run dev

# Tests ausführen (164 Tests)
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

## Architektur (Clean + Hexagonal)

```
┌────────────────────────────────┐
│    Präsentation (UI)           │  Astro · DOM · CSS · SVG-Icons
├────────────────────────────────┤
│    Application (Use Cases)     │  addAnime · filter · export · persist
├────────────────────────────────┤
│    Domain (Core)               │  Anime-Entität · Filter Engine · Watchlist
├────────────────────────────────┤
│    Infrastruktur (Adapters)    │  AniList API · localStorage · Config
└────────────────────────────────┘
```

Entwickelt mit **TDD** — Rot-Grün-Refactor. Domänen-Logik unabhängig von UI, API und Speicher.

## Daten

Alle Daten werden im **localStorage** des Browsers gespeichert:
- `anime-tracker-watchlist` — Die komplette Sammlung
- `anime-tracker-users` — Benutzerkonfiguration (IDs + Anzeigenamen)

Mit dem **Export-Button** (💾) kann jederzeit ein JSON-Backup heruntergeladen werden.

## Tests (164)

```bash
npx vitest run src/lib/           # Alle Tests
npx vitest run src/lib/domain/    # Nur Domain-Tests
npx vitest                        # Watch-Modus
```

- **164 Tests**, alle grün (10 Test-Dateien)
- Domain: Anime-Entität, Filter-Engine, Watchlist-Logik
- Application: State, UseCases, Templates, TabTitle
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
