/**
 * Architecture Tests — Clean + Hexagonal Architektur-Regeln
 *
 * Prüft automatisch, ob die Import-Richtungen eingehalten werden:
 *
 *   ┌─────────────────────────┐
 *   │   adapters/  (UI/DOM)   │  ← darf alles importieren
 *   ├─────────────────────────┤
 *   │   application/ (UseCases)│  ← darf NUR domain/ importieren
 *   ├─────────────────────────┤
 *   │   domain/ (Entities)    │  ← darf GAR NICHTS importieren (ausser sich selbst)
 *   └─────────────────────────┘
 *
 *   ports/ → reine Interface-Doku, darf importiert werden aber nicht selbst importieren
 *   config.js → darf von überall importiert werden (Framework)
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, relative, dirname } from 'path';

const LIB_DIR = resolve(import.meta.dirname, '..');

// ─── Layer-Definitionen ───────────────────────────────────────────────

const LAYERS = {
  domain: {
    path: 'domain',
    label: 'Domain (Entities)',
    allowedImports: ['domain'],       // darf nur sich selbst importieren
    forbiddenImports: ['application', 'adapters', 'config', 'ports'],
  },
  application: {
    path: 'application',
    label: 'Application (Use Cases)',
    allowedImports: ['domain', 'application', 'config'],  // darf domain + config
    forbiddenImports: ['adapters', 'ports'],
  },
  adapters: {
    path: 'adapters',
    label: 'Adapters (UI/API/Storage)',
    allowedImports: ['domain', 'application', 'adapters', 'config'], // darf alles
    forbiddenImports: [], // keine Verbote
  },
  ports: {
    path: 'ports',
    label: 'Ports (Interface Docs)',
    allowedImports: [],  // sollte nichts importieren
    forbiddenImports: ['domain', 'application', 'adapters', 'config'],
  },
  config: {
    path: 'config.js',
    label: 'Config',
    allowedImports: [],  // sollte nichts importieren
    forbiddenImports: ['domain', 'application', 'adapters'],
  },
};

// ─── Helper ────────────────────────────────────────────────────────────

/**
 * Sammelt alle Source-Dateien in einem Layer.
 * @param {string} layerPath - Relativer Pfad zum Layer (z.B. 'domain')
 * @returns {string[]} Absolute Pfade
 */
function getFilesInLayer(layerPath) {
  // Einzelne Datei (z.B. config.js)
  if (layerPath.endsWith('.js') || layerPath.endsWith('.ts')) {
    const fullPath = resolve(LIB_DIR, layerPath);
    return existsSync(fullPath) ? [fullPath] : [];
  }

  const fullPath = resolve(LIB_DIR, layerPath);
  if (!existsSync(fullPath)) return [];

  function walk(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '__tests__' && entry.name !== 'node_modules') {
          files.push(...walk(full));
        }
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
        files.push(full);
      }
    }
    return files;
  }

  return walk(fullPath);
}

/**
 * Extrahiert alle lokalen Imports aus einer Datei.
 * @param {string} filePath
 * @returns {string[]} Relative Import-Pfade
 */
function extractImports(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const imports = [];
  // Match: import ... from './path' or '../path'
  const regex = /from\s+['"](\.[^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  // Match: import './path' (side-effect imports)
  const sideEffectRegex = /^import\s+['"](\.[^'"]+)['"]/gm;
  while ((match = sideEffectRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Löst einen relativen Import-Pfad gegen die Quelldatei auf und
 * bestimmt, zu welchem Layer das Ziel gehört.
 * @param {string} fromFile - Quelldatei (absolut)
 * @param {string} importPath - Relativer Import-Pfad
 * @returns {string|null} Layer-Name oder null (extern/node_module)
 */
function resolveImportLayer(fromFile, importPath) {
  const fromDir = dirname(fromFile);
  const resolved = resolve(fromDir, importPath);

  // Determine which layer the resolved path belongs to
  const rel = relative(LIB_DIR, resolved);

  if (rel.startsWith('domain')) return 'domain';
  if (rel.startsWith('application')) return 'application';
  if (rel.startsWith('adapters')) return 'adapters';
  if (rel.startsWith('ports')) return 'ports';
  if (rel === 'config.js' || rel.startsWith('config')) return 'config';

  // Could be a file in lib/ root (bootstrap.js, config.js)
  if (rel === 'bootstrap.js' || rel === 'bootstrap.ts') return null;

  return null; // external or not in our layers
}

/**
 * Prüft ob eine Importschicht gegen die Regeln eines Layers verstösst.
 */
function checkImportViolation(sourceLayer, targetLayer) {
  const layer = LAYERS[sourceLayer];
  if (!layer) return null;
  if (layer.forbiddenImports.includes(targetLayer)) {
    return `${sourceLayer} → ${targetLayer}: verboten (${layer.label} darf nicht aus ${targetLayer} importieren)`;
  }
  return null;
}

// ─── Test-Sammlung ────────────────────────────────────────────────────

const violations = [];

// Sammle alle Dateien pro Layer
const allLayers = {};
for (const [name, config] of Object.entries(LAYERS)) {
  allLayers[name] = getFilesInLayer(config.path);
}

// Auch bootstrap.js als eigenständige Datei prüfen
const rootFiles = [];
const bootstrapPath = resolve(LIB_DIR, 'bootstrap.js');
if (existsSync(bootstrapPath)) rootFiles.push(bootstrapPath);
allLayers._root = rootFiles;

// Prüfe alle Dateien auf Import-Verstösse
for (const [sourceLayer, files] of Object.entries(allLayers)) {
  for (const file of files) {
    const imports = extractImports(file);
    const relPath = relative(LIB_DIR, file);

    for (const imp of imports) {
      const targetLayer = resolveImportLayer(file, imp);
      if (targetLayer && sourceLayer !== '_root') {
        const violation = checkImportViolation(sourceLayer, targetLayer);
        if (violation) {
          violations.push({
            file: relPath,
            import: imp,
            targetLayer,
            message: violation,
          });
        }
      }
    }
  }
}

// ─── Tests ─────────────────────────────────────────────────────────────

describe('Clean Architecture — Dependency Rules', () => {
  // Domain Layer
  describe('Domain (domain/)', () => {
    const files = allLayers.domain.map(f => relative(LIB_DIR, f));

    it('darf keine Imports aus application/, adapters/ oder config/ haben', () => {
      const domainViolations = violations.filter(v => v.file.startsWith('domain'));
      if (domainViolations.length > 0) {
        const details = domainViolations.map(v =>
          `  ❌ ${v.file} → ${v.import} (${v.targetLayer})`
        ).join('\n');
        expect.fail(`Domain-Import-Verbote verletzt:\n${details}`);
      }
    });

    it('hat mindestens die Kern-Entitäten (anime, filters, watchlist, stats)', () => {
      const fileNames = files.map(f => f.replace(/^domain[/\\]/, ''));
      expect(fileNames).toContain('anime.ts');
      expect(fileNames).toContain('filters.ts');
      expect(fileNames).toContain('watchlist.ts');
      expect(fileNames).toContain('stats.ts');
    });
  });

  // Application Layer
  describe('Application (application/)', () => {
    it('darf NICHT aus adapters/ importieren', () => {
      const appViolations = violations.filter(v =>
        v.file.startsWith('application') && v.targetLayer === 'adapters'
      );
      if (appViolations.length > 0) {
        const details = appViolations.map(v =>
          `  ❌ ${v.file} → ${v.import}`
        ).join('\n');
        expect.fail(`Application importiert aus Adapters:\n${details}`);
      }
    });

    it('darf aus domain/ importieren', () => {
      const appFiles = allLayers.application.map(f => relative(LIB_DIR, f));
      // useCases.ts sollte domain/ importieren
      const useCasesFile = appFiles.find(f => f.includes('useCases'));
      expect(useCasesFile).toBeTruthy();
    });
  });

  // Ports Layer
  describe('Ports (ports/)', () => {
    it('darf nichts aus domain/application/adapters importieren', () => {
      const portViolations = violations.filter(v => v.file.startsWith('ports'));
      if (portViolations.length > 0) {
        const details = portViolations.map(v =>
          `  ❌ ${v.file} → ${v.import}`
        ).join('\n');
        expect.fail(`Ports importieren aus anderen Layern:\n${details}`);
      }
    });
  });

  // Config
  describe('Config (config.js)', () => {
    it('darf nichts aus domain/application/adapters importieren', () => {
      const configViolations = violations.filter(v =>
        v.file === 'config.js' || v.file.startsWith('config')
      );
      if (configViolations.length > 0) {
        const details = configViolations.map(v =>
          `  ❌ ${v.file} → ${v.import}`
        ).join('\n');
        expect.fail(`Config importiert aus anderen Layern:\n${details}`);
      }
    });
  });

  // Gesamt-Bilanz
  describe('Gesamt', () => {
    it('darf keine Architektur-Verstösse haben', () => {
      if (violations.length > 0) {
        const all = violations.map(v =>
          `  🔴 ${v.file} → importiert aus ${v.targetLayer} (${v.import})`
        ).join('\n');
        expect.fail(`${violations.length} Architektur-Verstösse:\n${all}`);
      }
    });

    it('alle Layer haben Dateien', () => {
      expect(allLayers.domain.length).toBeGreaterThan(0);
      expect(allLayers.application.length).toBeGreaterThan(0);
      expect(allLayers.adapters.length).toBeGreaterThan(0);
    });
  });
});
