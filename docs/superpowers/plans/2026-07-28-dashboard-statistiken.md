# Dashboard-Statistiken — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans.

**Goal:** Erweiterte Statistik-Karten oberhalb des Grids: Meistgesehenes Genre, Durchschnitts-Score pro Person, Anime pro Monat, Top-Animes.

**Architecture:** Pure Funktionen in Domain (`stats.ts`) → gerendert via uiAdapter.js im bestehenden `#stats`-Container. Keine neuen State/UseCases nötig — Stats werden aus der Watchlist berechnet.

**Assignee:** backend-dev (Domain + Application) → frontend-dev (UI)

---

## Task 1: Domain — `computeStats(watchlist)`

**Files:**
- Create: `src/lib/domain/stats.ts` — Stats-Funktionen
- Create: `src/lib/domain/stats.test.js` — Tests

```typescript
export interface Stats {
  totalCount: number;
  bothCount: number;
  chrischiCount: number;
  michelleCount: number;
  avgScoreChrischi: number | null;
  avgScoreMichelle: number | null;
  topGenres: { genre: string; count: number }[];
  monthlyAdditions: { month: string; count: number }[];
}

export function computeStats(watchlist: Anime[]): Stats { ... }
```

- `totalCount`: watchlist.length
- `bothCount`: watched_by.length === 2
- `avgScoreX`: average rating score per user (null = no ratings)
- `topGenres`: Top 3 Genres sorted by count
- `monthlyAdditions`: aus anime.created_at? — gibt es nicht. Stattdessen: letzte 6 Monate mit Anzahl

Tests: 8+ Tests für alle Felder.

Commit: `"feat: add computeStats pure function [TDD]"`

## Task 2: UI — Statistik-Karten rendern

**Files:**
- Modify: `src/lib/adapters/uiAdapter.js` — `renderStats()` erweitern
- Modify: `src/styles/global.css` — Neue Stat-Karten Styles
- Modify: `src/pages/index.astro` — Neue Stat-Container (optional)

Die bestehenden Stat-Karten in index.astro werden durch JS befüllt. Ich erweitere die Render-Funktion um zusätzliche Karten. Am einfachsten: Container in index.astro vorbereiten und in uiAdapter.js renderStats() erweitern.

Neue Stat-Karten:
- "Chrischi: ⌀ 7.2" / "Michelle: ⌀ 6.8" (Durchschnittsbewertung)
- "Top Genre: Action (12)" / "Sci-Fi (8)" (Top 3 Genres)
- Monats-Chart (optional — kleiner Balken oder Liste)

CSS: Neue stat-card Varianten, kompakt layout.

Tests: Keine UI-Tests (Bestehende DOM-Tests für Stats ergänzen).

Commit: `"feat: add dashboard statistics cards [TDD]"`

## Pre-Release
```bash
npx vitest run
npm run build
```
