# Favoriten / Angepinnte Animes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** Animes als Favorit markieren (Pin). Gepinnte Animes erscheinen immer oben im Grid, visuell hervorgehoben.

**Architecture:** Clean Architecture: Domain (neues `pinned_by`-Feld + `togglePinned()`-Funktion in watchlist.ts) → Application (UseCase in useCases.js) → Adapter (Pin-Icon auf Card + Render-Sortierung in uiAdapter.js + Templates in templates.js).

**Tech Stack:** Astro 7, Vanilla JS, TypeScript, Vitest, IndexedDB

**Assignee:** backend-dev (Domain + Application), dann frontend-dev (UI)

---

## File Structure

| Datei | Status | Verantwortung |
|-------|--------|--------------|
| `src/lib/domain/anime.ts` | Modify | `pinned_by?: string[]` im Interface |
| `src/lib/domain/watchlist.ts` | Modify | `togglePinned()` pure function |
| `src/lib/domain/watchlist.test.js` | Modify | Tests für `togglePinned()` |
| `src/lib/application/useCases.js` | Modify | `togglePinned(anilistId)` UseCase |
| `src/lib/application/useCases.test.js` | Modify | Test für `togglePinned` UseCase |
| `src/lib/adapters/templates.js` | Modify | Pin-Icon auf Card + Aktion-Button |
| `src/lib/adapters/uiAdapter.js` | Modify | Gepinnte immer oben rendern + Event-Handler |
| `src/styles/global.css` | Modify | .pinned-card, .pinned-badge Styles |
| `src/lib/adapters/__tests__/templates.test.js` | Modify | Tests für Pin-Icon im Template |

---

## Tasks

### Task 1: Domain — `pinned_by` + `togglePinned()`

**Files:**
- Modify: `src/lib/domain/anime.ts` — `pinned_by?: string[]` hinzufügen
- Modify: `src/lib/domain/watchlist.ts` — `togglePinned()` hinzufügen
- Modify: `src/lib/domain/watchlist.test.js` — Tests

#### 🔍 Planung
- `pinned_by` verhält sich analog zu `watched_by`: Array von Usern (`'chrischi'`, `'michelle'`)
- `togglePinned(watchlist, anilistId, user)` — pure function, wie `toggleWatchedBy`
- Keine Exception wenn Anime nicht existiert? Nein, wie toggleWatchedBy → Error

#### 💻 TDD

- [ ] **Anime Interface erweitern**:
  ```typescript
  readonly pinned_by?: string[];
  ```
- [ ] **togglePinned implementieren**:
  ```typescript
  export function togglePinned(watchlist: Anime[], anilistId: number, user: string): Anime[] {
    const index = watchlist.findIndex((a) => a.anilist_id === anilistId);
    if (index === -1) throw new Error(`Anime with anilist_id ${anilistId} not found`);
    
    const anime = watchlist[index];
    const pinnedBy = anime.pinned_by || [];
    const isPinned = pinnedBy.includes(user);
    
    const newAnime: Anime = {
      ...anime,
      pinned_by: isPinned ? pinnedBy.filter((u) => u !== user) : [...pinnedBy, user],
    };
    
    const result = [...watchlist];
    result[index] = newAnime;
    return result;
  }
  ```
- [ ] **Tests**:
  ```javascript
  it('pins an anime for a user', () => { ... });
  it('unpins an anime for a user', () => { ... });
  it('pins for second user independently', () => { ... });
  it('throws if anilist_id not found', () => { ... });
  ```
- [ ] Commit: `"feat: add pinned_by field and togglePinned() [TDD]"`

### Task 2: Application — `togglePinned` UseCase

**Files:**
- Modify: `src/lib/application/useCases.js`
- Modify: `src/lib/application/useCases.test.js`

```javascript
togglePinned(anilistId) {
  const s = state.getState();
  const user = getUsers()[0]; // aktueller User (chrischi per default)
  const updated = togglePinned(s.watchlist, anilistId, user);
  state.setState({ ...s, watchlist: updated });
  storage.saveWatchlist(updated);
}
```

Test: `it('toggles pinned state for an anime', ...)`
Commit: `"feat: add togglePinned useCase [TDD]"`

### Task 3: UI — Pin-Icon + Render-Sortierung

**Files:**
- Modify: `src/lib/adapters/templates.js`
- Modify: `src/lib/adapters/uiAdapter.js`
- Modify: `src/styles/global.css`
- Modify: `src/lib/adapters/__tests__/templates.test.js`

#### 3a: Pin-Icon auf Card (templates.js)
- Neuer Pin-Button in `actionsHtml` (vor remove):
  ```html
  <button class="btn-icon btn-icon-sm ${pinnedClass}" data-action="toggle-pin" data-id="${anime.anilist_id}" title="Anheften">
    <!-- Pin-SVG (Heroicons MapPinIcon oder BookmarkIcon) -->
  </button>
  ```
- Wenn `pinned_by` den aktuellen User enthält → gefülltes Pin-Icon / Klasse `pinned`
- Benutze `BookmarkIcon` (Heroicons filled) — das sieht aus wie ein Lesezeichen

#### 3b: Sortierung im Grid (uiAdapter.js)
- In `sortAnime()` oder in `render()`: Gepinnte Animes IMMER zuerst
- Am einfachsten: Vor der Sortierung die Watchlist splitten in pinned + unpinned, dann einzeln sortieren und concatenaten:
  ```javascript
  const user = getUsers()[0];
  const pinned = watchlist.filter(a => (a.pinned_by || []).includes(user));
  const unpinned = watchlist.filter(a => !(a.pinned_by || []).includes(user));
  const sortedPinned = sortAnime(pinned, sortBy, sortOrder);
  const sortedUnpinned = sortAnime(unpinned, sortBy, sortOrder);
  return [...sortedPinned, ...sortedUnpinned];
  ```

#### 3c: CSS (global.css)
- `.anime-card.pinned` — subtle border-left: 3px solid var(--color-primary) oder ähnlich
- `.btn-icon-pinned` — goldene/gelbe Farbe für aktiven Pin

#### 3d: Event-Handler (uiAdapter.js)
- `data-action="toggle-pin"` → `useCases.togglePinned(anilistId)`

#### 3e: Tests
```javascript
it('renders pin button on card', () => { ... });
it('shows filled pin for pinned anime', () => { ... });
```

Commit: `"feat: add pin UI and pinned-first grid sorting [TDD]"`

---

## Pre-Release Check
```bash
npx vitest run   # Alle Tests
npm run build    # Build sauber
```
