# Studio / Jahr / Saison Filter — Implementation Plan

**Goal:** Grid nach Studio, Erscheinungsjahr und Saison filtern. Daten kommen von AniList beim Hinzufügen.

## Task 1: Data capture

### anilistAdapter.js
Beim Suchen/Hinzufügen: `season`, `seasonYear`, `studios` aus AniList-Response mappen. Die Query bereits vorhanden, nur Felder ergänzen.

### anime.ts
```typescript
readonly season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
readonly seasonYear?: number;
readonly studios?: string[];
```

## Task 2: Filter

### filters.ts
Interface + filterAnime um `season`, `seasonYear`, `studio` erweitern.

### filterSheet.js / uiAdapter.js
Filter-Controls: Season-Dropdown, Year-Input/Range, Studio-Input.

## Pre-Release
```bash
npx vitest run
npm run build
```
