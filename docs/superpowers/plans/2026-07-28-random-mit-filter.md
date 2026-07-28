# Random-Anime mit Filter — Implementation Plan

**Goal:** User kann vor dem Zufalls-Anime Genre, Min-Score und Format wählen.

**Architecture:** Nur UI-Änderungen in randomModal.js + anilistAdapter.js. Keine Domain-Änderungen.

## Task

### randomModal.js
1. Vor dem Fetch-Zufall: Filter-UI anzeigen (Genre-Dropdown, Min-Score Range, Format-Select)
2. `fetchRandom(filters)` statt `fetchRandom()` — bestehende Genres + Formate aus AniList
3. Nutze `searchAnimePage` statt random IDs — mit random page + sort
4. "Nochmal" Button behält die Filter-Einstellungen

### anilistAdapter.js
- Keine Änderung nötig — `searchAnimePage` unterstützt bereits genre + sort Parameter

### UI
- Genre-Select (wie in der Suche)
- Min-Score Range (0-100)
- Format-Select: TV, Movie, OVA, ONA, Special, ALL
- "Zufälligen Anime finden" Button

**Commit:** `"feat: add filter options to random anime modal [TDD]"`