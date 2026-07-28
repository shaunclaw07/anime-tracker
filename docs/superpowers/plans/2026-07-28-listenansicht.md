# Alternative Listenansicht — Implementation Plan

**Goal:** Grid/List-Umschalter. In der Listenansicht werden Cards kompakt nebeneinander statt im Raster dargestellt.

## Task: Pure CSS + Templates (frontend-dev)

### uiAdapter.js
- Toggle-Button in Desktop-Filterbar: "Grid" / "Liste"
- Klasse `.list-view` auf `#anime-grid` togglen
- State: `viewMode: 'grid' | 'list'` in state.js

### templates.js
Keine Änderung — die Card-Templates bleiben gleich, nur CSS ändert Layout.

### global.css
```css
.anime-grid.list-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.anime-grid.list-view .anime-card {
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px;
}

.anime-grid.list-view .anime-card-cover {
  width: 70px;
  height: 100px;
  border-radius: 6px;
  flex-shrink: 0;
}

.anime-grid.list-view .anime-card-body {
  flex: 1;
  min-width: 0;
}
```

### state.js
```javascript
// Default state um viewMode ergänzen
{ watchlist: [], filters: {}, sortBy: 'date_added', sortOrder: 'desc', viewMode: 'grid' }
```

## Pre-Release
```bash
npx vitest run
npm run build
```
