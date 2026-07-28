# Status-Tags (eigene Labels) — Implementation Plan

**Goal:** User kann pro Anime eigene Text-Tags vergeben (z.B. "Pause", "Abgebrochen", "Muss ich sehen"). Tags werden auf der Card angezeigt + in Detail-Modal editierbar + im Filter nutzbar.

## Task 1: Domain + Application

### anime.ts
```typescript
// Anime Interface erweitern:
readonly tags?: string[];
```

### watchlist.ts
```typescript
export function setTags(watchlist, anilistId, tags: string[]): Anime[];
```
Pure function, setzt `tags` auf das neue Array.

### useCases.js
```javascript
setTags(anilistId, tags) {
  const s = state.getState();
  const updated = setTags(s.watchlist, anilistId, tags);
  state.setState({ ...s, watchlist: updated });
  storage.saveWatchlist(updated);
}
```

## Task 2: UI

### templates.js (cardTemplate)
- Tags als kleine Badges unter Genre anzeigen
- `.tag-badge` CSS-Klasse

### detailModal.js
- Input-Feld + "Tag hinzufügen" Button
- Liste der aktuellen Tags mit "×" zum Entfernen
- Oder: Editable Text mit Komma-getrennten Tags

### CSS
- `.tag-badge` — kleiner Chip/Pill, accent color, abgerundet

## Task 3: Tests
- watchlist.test.js: 3 Tests für setTags
- useCases.test.js: setTags Test
- templates.test.js: Tag-Badges im Card-Template

## Pre-Release
```bash
npx vitest run
npm run build
```
