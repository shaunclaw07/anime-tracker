# Sortierung im Grid — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein Dropdown zur Sortierung der Anime-Liste nach Titel (A→Z), Datum hinzugefügt (neuste zuerst) und Score (höchster zuerst) in das Grid einbauen.

**Architecture:** Clean Architecture: Domain (pure Sort-Funktion in `filters.ts`) → Application (State + UseCase in `state.js`/`useCases.js`) → Adapter (UI in `templates.js` + `filterSheet.js` + `uiAdapter.js`). Die UI zeigt ein Select-Element in der Desktop-Filterbar + in der Mobile FilterSheet. Der Sort-Status wird im App-State gehalten.

**Tech Stack:** Astro 7, Vanilla JS, Vitest, Clean Architecture, IndexedDB

**Assignee:** frontend-dev (für UI) — backend-dev (für Domain/Application/State)

---

## File Structure

| Datei | Status | Verantwortung |
|-------|--------|--------------|
| `src/lib/domain/filters.ts` | Modify | Neue `sortAnime()` pure function |
| `src/lib/domain/filters.test.js` | Modify | Tests für `sortAnime()` |
| `src/lib/application/state.js` | Modify | `sortBy` + `sortOrder` im Default-State |
| `src/lib/application/useCases.js` | Modify | `setSorting(sortBy, sortOrder)` UseCase |
| `src/lib/application/useCases.test.js` | Modify | Tests für `setSorting` |
| `src/lib/adapters/templates.js` | Modify | `sortSelectTemplate()` + in Filter-Bar/Sheet einbauen |
| `src/lib/adapters/filterSheet.js` | Modify | Sort-Select Event-Handler |
| `src/lib/adapters/uiAdapter.js` | Modify | Sortierung im Render-Cycle anwenden |
| `src/lib/adapters/__tests__/templates.test.js` | Modify | Tests für Sort-Select im DOM |

---

## Tasks

### Task 1: Domain — `sortAnime()` pure function

**Files:**
- Modify: `src/lib/domain/filters.ts` (neue Funktion)
- Modify: `src/lib/domain/filters.test.js` (Tests)

**Interfaces:**
- Consumes: `Anime` type aus `anime.ts`
- Produces: `sortAnime(list: Anime[], sortBy: string, sortOrder: string): Anime[]`

#### 🔍 Planung
- `sortBy` kann sein: `'title'`, `'date_added'`, `'score'`
- `sortOrder` kann sein: `'asc'`, `'desc'`
- Default-Sortierung: `'date_added'` + `'desc'` (neuste zuerst — entspricht aktuell implizitem Verhalten)
- `date_added` = es gibt kein Datumsfeld → wir nutzen die Position im Array (Reihenfolge = hinzugefügt)
- Titel-Sortierung: nach `displayTitle` (title_de || title_english || title_romaji), `localeCompare()` für A→Z
- Score-Sortierung: `average_score` numerisch, null/undefined Scores ans Ende sortieren
- Reine Funktion — kein Seiteneffekt, neues Array

**Test cases:**
- Sort by title asc → A→Z
- Sort by title desc → Z→A  
- Sort by score desc → höchster zuerst
- Sort by score asc → niedrigster zuerst
- Empty list → leeres Array
- Null scores → ans Ende sortiert
- Title with locale (ä, ö, ü) → korrekt

#### 💻 Implementierung (TDD)

- [ ] **Step 1: Tests schreiben (RED)**

```javascript
import { describe, it, expect } from 'vitest';
import { sortAnime } from './filters';

describe('sortAnime', () => {
  const items = [
    { anilist_id: 3, title_romaji: 'Cowboy Bebop', average_score: 86 },
    { anilist_id: 1, title_romaji: 'Trigun', average_score: 80 },
    { anilist_id: 2, title_romaji: 'Akira', average_score: 90 },
    { anilist_id: 4, title_romaji: 'Zankyou no Terror', average_score: null },
  ];

  it('sorts by title asc (A→Z)', () => {
    const result = sortAnime(items, 'title', 'asc');
    expect(result.map(a => a.anilist_id)).toEqual([2, 3, 1, 4]); // Akira → Cowboy → Trigun → Zankyou
  });

  it('sorts by title desc (Z→A)', () => {
    const result = sortAnime(items, 'title', 'desc');
    expect(result.map(a => a.anilist_id)).toEqual([4, 1, 3, 2]);
  });

  it('sorts by score desc (highest first)', () => {
    const result = sortAnime(items, 'score', 'desc');
    expect(result.map(a => a.anilist_id)).toEqual([2, 3, 1, 4]); // 90 → 86 → 80 → null
  });

  it('sorts by score asc (lowest first)', () => {
    const result = sortAnime(items, 'score', 'asc');
    expect(result.map(a => a.anilist_id)).toEqual([1, 3, 2, 4]); // 80 → 86 → 90 → null
  });

  it('returns empty array for empty list', () => {
    expect(sortAnime([], 'title', 'asc')).toEqual([]);
  });

  it('handles items with no title gracefully', () => {
    const list = [{ anilist_id: 1, average_score: 50 }];
    const result = sortAnime(list, 'title', 'asc');
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Tests laufen lassen — müssen failen**

```bash
npx vitest run src/lib/domain/filters.test.js
```
Expected: Test `sortAnime` not found / fails

- [ ] **Step 3: `sortAnime()` in `filters.ts` implementieren**

```typescript
export function sortAnime(list, sortBy = 'date_added', sortOrder = 'desc') {
  return [...list].sort((a, b) => {
    let cmp = 0;
    
    if (sortBy === 'title') {
      const titleA = (a.title_de || a.title_english || a.title_romaji || '').toLowerCase();
      const titleB = (b.title_de || b.title_english || b.title_romaji || '').toLowerCase();
      cmp = titleA.localeCompare(titleB);
    } else if (sortBy === 'score') {
      // Null-Scores ans Ende sortieren
      if (a.average_score == null && b.average_score == null) cmp = 0;
      else if (a.average_score == null) cmp = 1;
      else if (b.average_score == null) cmp = -1;
      else cmp = a.average_score - b.average_score;
    } else {
      // date_added — Stabilität der Sortierung nutzen (ursprüngliche Reihenfolge)
      return 0;
    }
    
    return sortOrder === 'desc' ? -cmp : cmp;
  });
}
```

- [ ] **Step 4: Tests laufen — grün?**

```bash
npx vitest run src/lib/domain/filters.test.js
```
Expected: PASS

- [ ] **Step 5: Refactor (optional)**
- [ ] **Step 6: Commit**

```bash
git add src/lib/domain/filters.ts src/lib/domain/filters.test.js
git commit -m "feat: add sortAnime() pure function for grid sorting [TDD]"
```

#### ✅ Review
- [ ] Alle Tests pass?
- [ ] Reine Funktion? (kein DOM, kein localStorage, kein fetch)
- [ ] Null/undefined Scores behandelt?
- [ ] Leere Liste behandelt?
- [ ] Edge cases: ein Item, gleiche Scores, Umlaute im Titel

---

### Task 2: Application — State + UseCase

**Files:**
- Modify: `src/lib/application/state.js`
- Modify: `src/lib/application/useCases.js`
- Modify: `src/lib/application/useCases.test.js`

**Interfaces:**
- Consumes: `state` aus `state.js`, `sortAnime` aus `filters.ts`
- Produces: `setSorting(sortBy, sortOrder)` — neuer UseCase

#### 🔍 Planung
- Default-State in `state.js`: `{ watchlist: [], filters: {}, sortBy: 'date_added', sortOrder: 'desc' }`
- `setSorting(sortBy, sortOrder)` aktualisiert State + persistiert
- Der UseCase muss die Watchlist nach dem Laden sortieren

#### 💻 Implementierung (TDD)

- [ ] **Step 1: State-Update**

In `src/lib/application/state.js`, Default-State erweitern:
```javascript
const state = createState({
  watchlist: [],
  filters: {},
  sortBy: 'date_added',
  sortOrder: 'desc'
});
```

- [ ] **Step 2: UseCase definieren + Tests**

In `src/lib/application/useCases.js`:
```javascript
setSorting(sortBy, sortOrder) {
  const s = state.getState();
  state.setState({ ...s, sortBy, sortOrder });
}
```

Test in `useCases.test.js`:
```javascript
it('setSorting updates sortBy and sortOrder in state', () => {
  useCases.setSorting('title', 'asc');
  const s = state.getState();
  expect(s.sortBy).toBe('title');
  expect(s.sortOrder).toBe('asc');
});
```

- [ ] **Step 3: Tests laufen — grün**

```bash
npx vitest run src/lib/application/useCases.test.js
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/application/state.js src/lib/application/useCases.js src/lib/application/useCases.test.js
git commit -m "feat: add sorting state and useCase [TDD]"
```

#### ✅ Review
- [ ] Default-Werte korrekt gesetzt?
- [ ] State-Update ohne Mutation?
- [ ] Tests für alle sortBy/sortOrder Kombinationen?

---

### Task 3: UI — Sort-Select in FilterBar + FilterSheet

**Files:**
- Modify: `src/lib/adapters/templates.js`
- Modify: `src/lib/adapters/filterSheet.js`
- Modify: `src/lib/adapters/uiAdapter.js`
- Modify: `src/lib/adapters/__tests__/templates.test.js`
- Modify: `src/styles/global.css`

#### 🔍 Planung
- Select-Element mit Optionen: "Neueste zuerst" (default), "Titel A→Z", "Titel Z→A", "Beste Bewertung", "Niedrigste Bewertung"
- In Desktop-Filterbar: inline Select-Element
- In Mobile FilterSheet: Select-Element in einer Section
- State wird beim Ändern via `useCases.setSorting()` aktualisiert
- `uiAdapter.js` sortiert die Watchlist vor dem Rendern mit `sortAnime()`

#### 💻 Implementierung (TDD)

- [ ] **Step 1: Sort-Select Template**

In `src/lib/adapters/templates.js`, neuen Select-Block hinzufügen:
```javascript
export function sortSelectTemplate(currentSortBy, currentSortOrder) {
  const options = [
    { value: 'date_added-desc', label: 'Neueste zuerst' },
    { value: 'date_added-asc', label: 'Älteste zuerst' },
    { value: 'title-asc', label: 'Titel A→Z' },
    { value: 'title-desc', label: 'Titel Z→A' },
    { value: 'score-desc', label: 'Beste Bewertung' },
    { value: 'score-asc', label: 'Niedrigste Bewertung' },
  ];
  
  const currentValue = `${currentSortBy}-${currentSortOrder}`;
  
  return `<div class="sort-control">
    <label class="sort-label">Sortieren:</label>
    <select class="sort-select" id="sort-select" aria-label="Sortierung">
      ${options.map(o => `<option value="${o.value}" ${o.value === currentValue ? 'selected' : ''}>${o.label}</option>`).join('')}
    </select>
  </div>`;
}
```

In `templates.js` als Template-String anlegen.

- [ ] **Step 2: Sort-Select in FilterSheet + Desktop-Bar einbauen**

In `filterSheet.js` (mobile):
```javascript
// Nach der Score-Range Section:
`<div class="filter-panel-section">
  <span class="filter-panel-label">Sortierung</span>
  <div class="sort-wrapper" id="filter-sort-wrapper"></div>
</div>`
```

In `uiAdapter.js` Desktop-Bar:
```javascript
// Sort-Select in die Desktop-Filterbar
const sortHtml = sortSelectTemplate(s.sortBy, s.sortOrder);
document.getElementById('filter-desktop-bar').insertAdjacentHTML('beforeend', sortHtml);
```

- [ ] **Step 3: Event-Handler für Sort-Select**

In `filterSheet.js`:
```javascript
// Beim Mount des FilterSheets:
const sortSelect = document.getElementById('filter-sort-select');
if (sortSelect) {
  sortSelect.onchange = () => {
    const [sortBy, sortOrder] = sortSelect.value.split('-');
    useCases.setSorting(sortBy, sortOrder);
  };
}
```

- [ ] **Step 4: Sortierung im Render-Cycle**

In `src/lib/adapters/uiAdapter.js`:

```javascript
import { sortAnime } from '../domain/filters.js';

// In render():
const state = state.getState();
const sorted = sortAnime(state.watchlist, state.sortBy, state.sortOrder);
const filtered = filterAnime(sorted, state.filters);
// → filtered für Grid-Rendering nutzen
```

- [ ] **Step 5: CSS**

In `global.css`:
```css
.sort-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 0.8rem;
  color: var(--color-muted-foreground);
  white-space: nowrap;
}

.sort-select {
  background: var(--color-card);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Mobile: full-width im FilterSheet */
.filter-panel-section .sort-select {
  width: 100%;
}
```

- [ ] **Step 6: Tests für Templates**

In `src/lib/adapters/__tests__/templates.test.js`:
```javascript
import { sortSelectTemplate } from '../../templates.js';

describe('sortSelectTemplate', () => {
  it('selects the currently active sort option', () => {
    const html = sortSelectTemplate('title', 'asc');
    expect(html).toContain('value="title-asc" selected');
  });

  it('renders all 6 sort options', () => {
    const html = sortSelectTemplate('date_added', 'desc');
    expect(html).toContain('Neueste zuerst');
    expect(html).toContain('Älteste zuerst');
    expect(html).toContain('A→Z');
    expect(html).toContain('Z→A');
    expect(html).toContain('Beste Bewertung');
    expect(html).toContain('Niedrigste Bewertung');
  });
});
```

- [ ] **Step 7: Volle Test-Suite laufen + Build**

```bash
npx vitest run
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/adapters/templates.js src/lib/adapters/filterSheet.js src/lib/adapters/uiAdapter.js src/styles/global.css src/lib/adapters/__tests__/templates.test.js
git commit -m "feat: add sort select UI and wire up sorting in grid [TDD]"
```

#### ✅ Review
- [ ] Select initialisiert mit korrektem aktuellen Wert?
- [ ] State-Update bei Änderung?
- [ ] Sortierung + Filterung kombiniert korrekt? (erst sortieren, dann filtern!)
- [ ] Mobile + Desktop funktionieren beide?
- [ ] Persistenz? (sortBy/sortOrder im State, nicht extra persistiert — beim Neuladen Default)
- [ ] Tests + Build grün?

---

## Execution

1. Agent 1 (backend-dev) → Task 1: Domain
2. Agent 1 → Task 2: Application
3. Agent 2 (frontend-dev) → Task 3: UI

**Pre-Release Check:**
```bash
npx vitest run   # Alle 160+ Tests
npm run build    # Build sauber
git push origin main
```
