# Watch-Progress (Episode tracken) — Implementation Plan

**Goal:** Pro Anime die aktuelle Episode speichern. Fortschrittsbalken auf Card + Steuerung in Detail-Modal.

## Task 1: Domain

### anime.ts
```typescript
// Anime Interface erweitern:
readonly episodes_total?: number;
readonly watched_episodes?: number;
```

### watchlist.ts
```typescript
export function setEpisodeProgress(watchlist, anilistId, episode: number): Anime[] {
  // Pure function, setzt watched_episodes = episode
}
```

Tests: 3 Tests für setEpisodeProgress

## Task 2: Application

### useCases.js
```javascript
setEpisodeProgress(anilistId, episode) {
  const s = state.getState();
  const updated = setEpisodeProgress(s.watchlist, anilistId, episode);
  state.setState({ ...s, watchlist: updated });
  storage.saveWatchlist(updated);
}
```

## Task 3: UI

### templates.js (cardTemplate)
- Progress-Bar unter Score wenn `episodes_total` existiert
- `watched_episodes / episodes_total` als Text + schmaler Balken

### detailModal.js
- Input-Feld für aktuelle Episode + "von {total}" Label
- +/- Buttons zum Erhöhen/Verringern

### CSS
- `.progress-bar` — height: 4px, rounded, primary color
- `.progress-text` — kleine Schrift

## Pre-Release
```bash
npx vitest run
npm run build
```
