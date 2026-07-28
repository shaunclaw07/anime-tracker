# Schnellfilter: Nur Ungesehene — Implementation Plan

**Goal:** Toggle-Button um nur Animes ohne Einträge in `watched_by` anzuzeigen.

**Assignee:** frontend-dev (alles in einer UI-Datei + kleines Domain-Update)

## Task: Domain + UI

### filters.ts
```typescript
// Filters Interface erweitern:
export interface Filters {
  ...
  unwatchedOnly?: boolean;
}

// In filterAnime():
if (filters.unwatchedOnly) {
  if ((anime.watched_by || []).length > 0) return false;
}
```

### filterSheet.js
Toggle-Button "Nur Ungesehene" in der `watched_by` Section oder als separate Section.

### uiAdapter.js
Filter-State update beim Toggle.

### Tests
- filters.test.js: Neuer Test für unwatchedOnly
- templates.test.js: Keine Änderung nötig

## Commit
`git commit -m "feat: add unwatched-only quick filter [TDD]"`