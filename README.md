# Anime Tracker 🎬

Gemeinsame Anime-Sammlung von **Chrischi & Michelle**.

Suche, filtere und dokumentiere eure geschauten Animes — wer hat was gesehen, wie fandet ihr es, und was kommt als nächstes?

👉 **[Live-Seite](https://shaunclaw07.github.io/anime-tracker/)**

## Features

- 🧭 **3-Tab-Navigation** — Mobile Bottom Nav + Desktop Sidebar: Entdecken, Sammlung, Einstellungen
- 🔍 **Anime-Suche** via AniList GraphQL API — Titel + Genre + Tag kombinierbar
- 🎲 **Zufalls-Anime** mit Genre/Score/Format-Filter im Entdecken-Tab
- 🎭 **Nach Genre filtern** (Action, Comedy, Fantasy, …)
- 🏷️ **Nach Tag filtern** (Isekai, Mecha, Shounen, …)
- 🔽 **Sortierung** im Grid — Neueste/Älteste, Titel A→Z/Z→A, Beste/Niedrigste Bewertung
- 📌 **Favoriten/Pinned** — Animes anheften, erscheinen immer oben im Grid
- 👁️ **Schnellfilter** — "Nur Ungesehene" Toggle in Desktop-Bar + Mobile Sheet
- 📊 **Dashboard-Statistiken** — Gesamt, pro Person, ⌀ Bewertung, Top-Genres
- 👁️ **Watch-Progress** — Aktuelle Episode tracken + Fortschrittsbalken auf Card
- 🏷️ **Status-Tags** — Eigene Labels pro Anime (z.B. "Pause", "Must Watch")
- 📝 **Persönliche Notizen** — Text-Notiz pro Anime in der Detail-Ansicht
- 📋 **Listenansicht** — Grid/List-Umschalter, kompakte horizontale Cards
- 🏢 **Studio/Jahr/Saison Filter** — Grid nach Studio, Jahr und Staffel filtern
- 📱 **PWA** — Installierbar auf Homescreen, Service Worker + Manifest
- 👤 **Pro Person** dokumentieren — frei konfigurierbare Anzeigenamen (⚙️ Settings)
- ⭐ **Persönliche Bewertungen** (1–10) + Community-Rating
- 📄 **Pagination** mit "Mehr laden"-Button (20 pro Seite)
- 👆 **Detail-View** — Klick auf Karte → Synopsis, Rating editieren, "Gesehen von" togglen
- 🎲 **Random-Anime mit Filter** — Genre, Min-Score, Format vor dem Zufalls-Fetch wählbar
- ✅ **Duplikat-Erkennung** — "Bereits in Sammlung"-Badge in der Suche
- 🗑️ **Rückgängig** — Toast nach Löschen (4 Sekunden)
- 🗄️ **IndexedDB** — unbegrenzter Speicher, kein Account nötig
- 💾 **Export** als JSON für Backup
- ⚙️ **Settings** — Anzeigenamen änderbar + Debug-Log Toggle

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Dev-Server starten
npm run dev

# Tests ausführen (309 Tests)
npx vitest run

# Watch-Modus
npx vitest

# Produktions-Build
npm run build
```

## Deployment

Automatisch via **GitHub Actions** bei Push auf `main`:
- **CI:** Tests laufen automatisch
- **CD:** Build + Deploy zu GitHub Pages

👉 **[Live-Seite](https://shaunclaw07.github.io/anime-tracker/)**

## Architektur (Clean + Hexagonal)

```
┌──────────────────────────────────────┐
│    UI (Astro · DOM · CSS)            │  Adapter: uiAdapter, searchModal, …
├──────────────────────────────────────┤
│    Application (Use Cases)           │  state.js · useCases.js
├──────────────────────────────────────┤
│    Domain (TypeScript)               │  anime.ts · filters.ts · watchlist.ts
├──────────────────────────────────────┤
│    Infrastruktur (Adapters)          │  AniList API · localStorage · Config
└──────────────────────────────────────┘
```

| UI-Modul | Aufgabe |
|---|---|
| `navigation.js` | 3-Tab-Navigation (Bottom Nav + Sidebar) |
| `exploreView.js` | Vollbild-Entdecken: Suche + Zufalls-Anime |
| `settingsView.js` | Vollbild-Einstellungen: Labels + Export + Debug |
| `detailModal.js` | Detail-Ansicht + "Gesehen von" + Rating |
| `filterSheet.js` | Filter: Bottom-Sheet (Mobile) + Inline-Bar (Desktop) |
| `uiAdapter.js` | Orchestrator (Grid, Stats, Event-Binding) |

Entwickelt mit **TDD** — Rot-Grün-Refactor. Domain-Logik in TypeScript, unabhängig von UI und API.

## Daten

Alle Daten werden in der **IndexedDB** des Browsers gespeichert (kein 5MB-Limit wie localStorage):
- `anime-tracker-watchlist` — Die komplette Sammlung
- `anime-tracker-user-labels` — Anzeigenamen der User

Mit dem **Export-Button** (💾) kann jederzeit ein JSON-Backup heruntergeladen werden.

## Tests (308)

```bash
npx vitest run               # Alle Tests (Unit + DOM + Architecture)
```

| Art | Tests | Bereich |
|---|---|---|
| **Unit-Tests** | 239 | Domain (TS), Application, Adapter |
| **DOM-Tests** (jsdom) | 61 | Navigation, Explore, Settings, Templates, Filter, Modale |
| **Architecture-Tests** | 8 | Import-Richtungen Clean/Hexagonal |
| **Gesamt** | **308** | ✅ Alle grün |

### Test-Pflicht
Jedes neue Feature benötigt Tests. Architecture-Verstösse lassen CI rot werden (`src/lib/__tests__/architecture.test.js`).

## API & Lizenz

Diese App nutzt die **[AniList GraphQL API](https://docs.anilist.co)** (kein API-Key nötig).  
Die Nutzung erfolgt gemäss den [AniList API Terms of Use](https://docs.anilist.co/guide/terms-of-use):

- **Nicht-kommerziell** — das Projekt ist privat und generiert keine Einnahmen
- **Kein Massen-Hoarding** — nur einzelne Suchanfragen mit Debounce (Rate Limit: 90/min)
- **Kein Backup/Storage via API** — Daten werden lokal in IndexedDB gespeichert
- **Attribution** — *"Daten powered by [AniList](https://anilist.co)"* (im Footer der App)

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Framework | **Astro 7** (Static Site Generator) |
| Sprache | **JavaScript + TypeScript** (Domain-Layer) |
| API | **AniList GraphQL** (kein API-Key nötig) |
| Speicher | **IndexedDB** (Browser) |
| Icons | **Lucide Icons** (Inline SVG, 76 Stück) |
| Font | **Quicksand** (Google Fonts) |
| Tests | **Vitest + jsdom** |
| CI/CD | **GitHub Actions** |
| Hosting | **GitHub Pages** |
