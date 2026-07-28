# Persönliche Notizen — Implementation Plan

**Goal:** Pro Anime eine Text-Notiz speichern, in der Detail-Ansicht editierbar.

## Task 1: Domain + Application

### anime.ts
```typescript
// Anime Interface erweitern:
readonly notes?: string;
```

### watchlist.ts
```typescript
export function setNotes(watchlist, anilistId, notes: string): Anime[];
```

### useCases.js
```javascript
setNotes(anilistId, notes) {
  const s = state.getState();
  const updated = setNotes(s.watchlist, anilistId, notes);
  state.setState({ ...s, watchlist: updated });
  storage.saveWatchlist(updated);
}
```

## Task 2: UI

### detailModal.js
- `<textarea>` im Detail-Modal (zwischen Tags und Episode)
- Automatischer Save bei blur/change (oder mit Button)

### CSS
- `.detail-notes-textarea` — styled textarea

## Pre-Release
```bash
npx vitest run
npm run build
```
