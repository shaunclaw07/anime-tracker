# Anime Tracker — Refactoring-Plan

## Status Quo (Analyse)

### ✅ Stärken
- **Saubere Hexagonal Architektur**: Domain → Application → Adapters, Dependency Rule wird eingehalten
- **Domain Layer**: Reine Funktionen ohne Seiteneffekte, gut getestet (54 Tests)
- **Application Layer**: UseCases kapseln Geschäftslogik, State als Mini-Redux
- **Ports**: Interface-Dokumentation per JSDoc vorhanden
- **164 Tests passen alle** ✅
- **Mobile-First Design**: Responsive Grid, FAB, Bottom-Sheets
- **Dark Theme mit CSS Custom Properties**

### 🔴 Kritische Probleme

| # | Problem | Ort | Impact |
|---|---------|-----|--------|
| P1 | **uiAdapter.js = 1160 Zeilen Monster** | `adapters/uiAdapter.js` | Wartbarkeit, Testbarkeit |
| P2 | **CSS-Duplizierung ~700 Zeilen** | 4 Astro-Component + global.css | Wartbarkeit, Bundle-Size |
| P3 | **Tote Astro-Komponenten** | 4 Components nur CSS-Placeholder | Verwirrung, toter Code |
| P4 | **Inline-Stile in Modalen** | showRandomAnime, showDetailModal, showSettings | Kein theming, unwartbar |
| P5 | **Keine DOM-Tests für uiAdapter** | — | Regression-Risiko |
| P6 | **templates.test.js im falschen Ordner** | `application/templates.test.js` | Struktur-Verstoß |

### 🟡 Verbesserungspotential

| # | Thema | Details |
|---|-------|---------|
| M1 | **JsonFileAdapter** | Legacy, wird nicht mehr genutzt |
| M2 | **Config-System** | Generierte IDs sind Overkill für 2 User |
| M3 | **Filter-Duplizierung** | Desktop & Mobile Filter fast identische Logik |
| M4 | **Kein CI/CD** | Manuelles Deployment |
| M5 | **Kein TypeScript** | Keine Compile-Time Safety |
| M6 | **Fehlende Error-Boundaries** | Loading/Error nur rudimentär |

---

## Refactoring-Phasen (Kanban)

### Phase 1: Quick Wins (CSS + Tote Komponenten)
**Aufwand:** ~2h | **Risiko:** Niedrig

1. **1.1 CSS-Deduplizierung**
   - 4 Astro-Komponenten enthalten identisches CSS wie `global.css`
   - **Lösung:** Astro-Komponenten löschen, CSS nur in `global.css` pflegen
   - Tests: keine Änderung nötig (CSS-only)

2. **1.2 templates.test.js verschieben**
   - `application/templates.test.js` → `adapters/templates.test.js`
   - Tests laufen weiter, nur Datei verschieben

3. **1.3 Inline-Stile → CSS-Klassen**
   - `showRandomAnime()`, `showDetailModal()`, `showSettings()`: Inline-Styles durch CSS-Klassen ersetzen
   - Neue CSS-Klassen in `global.css`

### Phase 2: uiAdapter.js Aufteilung (Hauptarbeit)
**Aufwand:** ~6h | **Risiko:** Mittel

4. **2.1 UiState-Klasse extrahieren**
   - Such-Status (searchPage, searchResults, searchHasMore, savedSearchState) in eigene Klasse
   - `src/lib/adapters/uiState.js`

5. **2.2 Search-Modal extrahieren**
   - `showSearchModal()` → `src/lib/adapters/searchModal.js`
   - Inklusive performSearch, closeModal, Event-Bindings
   - `searchResultTemplate()` rein

6. **2.3 Detail-Modal extrahieren**
   - `showDetailModal()` → `src/lib/adapters/detailModal.js`

7. **2.4 Settings-Modal extrahieren**
   - `showSettings()` → `src/lib/adapters/settingsModal.js`

8. **2.5 Filter-Sheet extrahieren**
   - `showFilterSheet()`, `bindFilterSheetEvents()` → `src/lib/adapters/filterSheet.js`
   - Desktop-Filter + Mobile Sheet vereinheitlichen (DRY)

9. **2.6 Random-Anime extrahieren**
   - `showRandomAnime()` → `src/lib/adapters/randomModal.js`

10. **2.7 uiAdapter.js wird zum Orchestrator**
    - Nur noch `init()`, `render()`, `updateStats()` bleiben
    - Importiert und delegiert an die aufgeteilten Module

### Phase 3: Testing
**Aufwand:** ~4h | **Risiko:** Mittel

11. **3.1 jsdom Setup**
    - vitest + jsdom für DOM-Tests
    - `src/lib/adapters/__tests__/` Verzeichnis

12. **3.2 uiAdapter Tests**
    - Test für `render()` (Grid-Befüllung, Empty-State)
    - Test für `init()` (Event-Binding)
    - Test für Filter-Sheet open/close

13. **3.3 Modal-Tests**
    - Such-Modal: Öffnen/Schließen/Suche
    - Detail-Modal: Anzeigen/Interaktion
    - Random-Modal: Öffnen/Ergebnis

### Phase 4: Aufräumen & Optimieren
**Aufwand:** ~3h | **Risiko:** Niedrig

14. **4.1 JsonFileAdapter entfernen**
    - Datei löschen, Tests entfernen (16 Tests weniger)
    - `bootstrap.js` bereinigen

15. **4.2 Config-System vereinfachen**
    - Feste User-Strings statt generierte IDs
    - Migration von alten zu neuen IDs entfernen
    - `config.js` radikal vereinfachen

16. **4.3 Desktop/Mobile Filter vereinheitlichen**
    - Gemeinsame Filter-Logik in eine Funktion
    - Nur Render unterscheidet sich (Sheet vs. Inline-Bar)

17. **4.4 AGENTS.md aktualisieren**
    - Test-Zahlen, Struktur, neue Module dokumentieren

### Phase 5: TypeScript + CI (Optional)
**Aufwand:** ~8h | **Risiko:** Hoch

18. **5.1 TypeScript Migration**
    - Domain-Layer zuerst (höchster Wert)
    - Anwendung + Ports
    - Adapters zuletzt

19. **5.2 CI/CD Pipeline**
    - GitHub Actions: `npm ci && npm test` bei PR
    - Auto-Deploy bei main → gh-pages

---

## Zusammenfassung nach Dateien

```
src/
├── lib/
│   ├── domain/           # ❤️ Unverändert — alles gut
│   ├── application/      # ⚙️ Leichte Anpassung
│   │   ├── state.js      #   Unverändert
│   │   └── useCases.js   #   Unverändert
│   ├── ports/            # 🔌 Unverändert
│   ├── adapters/         # 🔧 MAJOR REWORK
│   │   ├── uiAdapter.js  #   → Orchestrator (~200 Zeilen)
│   │   ├── uiState.js    #   NEU: Such-Status
│   │   ├── searchModal.js    #   NEU: Such-Modal
│   │   ├── detailModal.js    #   NEU: Detail-Modal
│   │   ├── settingsModal.js  #   NEU: Settings-Modal
│   │   ├── randomModal.js    #   NEU: Random-Anime
│   │   ├── filterSheet.js    #   NEU: Filter (DSktop+Mobile)
│   │   ├── templates.js      #   Unverändert
│   │   ├── localStorageAdapter.js  # Unverändert
│   │   ├── anilistAdapter.js       # Unverändert
│   │   └── jsonFileAdapter.js      # → ENTFERNEN
│   └── config.js         # → VEREINFACHEN
├── components/           # → ALLE ENTFERNEN (CSS-only tot)
├── styles/
│   └── global.css        # → CSS aus Components hier rein
```

## Test-Strategie

| Phase | Neue Tests | Änderung |
|-------|-----------|----------|
| 1 | 0 | Nur CSS/Struktur, keine Logik |
| 2 | 0 | Module aufteilen, kein neuer Code |
| 3 | ~40 | jsdom + DOM-Tests für uiAdapter |
| 4 | 0 | Löschen/Vereinfachen, Tests anpassen |

**Gesamtziel:** 164 → ~180 Tests, 0 rote Tests, ~400 Zeilen weniger
