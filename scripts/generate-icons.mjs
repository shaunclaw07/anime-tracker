#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';

const ICONS_DIR = 'node_modules/lucide-static/icons';
const OUT_FILE = 'src/lib/icons.js';

const ICON_NAMES = [
  'search', 'x', 'check', 'plus', 'trash-2', 'heart', 'user', 'star',
  'settings', 'shuffle', 'download', 'pin', 'play',
  'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
  'menu', 'more-horizontal', 'more-vertical', 'arrow-left', 'arrow-right',
  'external-link', 'refresh-cw', 'undo', 'rotate-ccw',
  'info', 'alert-circle', 'alert-triangle', 'check-circle',
  'circle-dot', 'loader-circle',
  'image', 'film', 'tv', 'book-open', 'monitor', 'smartphone',
  'music', 'headphones', 'video',
  'copy', 'link', 'share-2', 'mail', 'upload', 'save', 'edit',
  'eye', 'eye-off', 'thumbs-up', 'message-circle', 'message-square',
  'clock', 'calendar', 'flag', 'bell',
  'arrow-up-down', 'sort-desc', 'sort-asc', 'filter',
  'tag', 'hash', 'sparkles', 'flame', 'trophy', 'target',
  'github', 'globe', 'map-pin',
  'list-filter', 'list', 'grid-3x3', 'sliders-horizontal',
  'x-circle', 'plus-circle', 'minus-circle',
];

const icons = {};
for (const name of ICON_NAMES) {
  const path = `${ICONS_DIR}/${name}.svg`;
  if (!existsSync(path)) continue;
  let svg = readFileSync(path, 'utf-8').trim();
  // Strip license comment
  if (svg.startsWith('<!--')) {
    svg = svg.slice(svg.indexOf('-->') + 3).trim();
  }
  // Extract only INNER content (remove outer <svg>...</svg> wrapper)
  svg = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').trim();
  svg = svg.replace(/class="lucide lucide-[^"]+"/, '').trim();
  // Compact to one line
  svg = svg.split('\n').map(l => l.trim()).join(' ').replace(/\s+/g, ' ');
  icons[name] = svg;
}

const BASE = `xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;

const lines = [
  '/**',
  ` * Lucide Icons — Zentrale Icon-Sammlung (${Object.keys(icons).length} Icons)`,
  ' *',
  ' * Nutzung: import { search, x, check } from "../icons.js";',
  ' * Dann im Template: element.innerHTML = search',
  ' */',
  '',
  '/* Standard-SVG-Attribute */',
  `const BASE = '${BASE}';`,
  '',
  `/**`,
  ` * icon — Gibt ein Lucide-Icon als vollständiges <svg>-Tag mit beliebiger Grösse zurück.`,
  ` * @param {string} svgContent - Der SVG-Inner-Content (paths, circles etc.)`,
  ` * @param {number} [size=20] - Gewünschte Breite/Höhe`,
  ` * @returns {string} Vollständiges <svg>-Tag`,
  ` */`,
  `export function icon(svgContent, size = 20) {`,
  `  return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\${svgContent}</svg>\`;`,
  `}`,
  '',
  `/**`,
  ` * iconSvg — Nimmt ein komplettes Lucide-Icon (SVG-String) und ändert nur die Grösse.`,
  ` * Kein Double-Wrapping wie bei icon().`,
  ` * @param {string} svg - Vollständiger SVG-String (z.B. user, star)`,
  ` * @param {number} [size=20] - Gewünschte Breite/Höhe`,
  ` * @returns {string} Gleicher SVG-String mit neuer Grösse`,
  ` */`,
  `export function iconSvg(svg, size = 20) {`,
  `  return svg.replace(/width="\\d+"/, \`width="\${size}"\`).replace(/height="\\d+"/, \`height="\${size}"\`);`,
  `}`,
  '',
];

for (const [name, svg] of Object.entries(icons)) {
  const jsName = name.replace(/[.-]/g, '_');
  lines.push(`export const ${jsName} = \`<svg \${BASE}>${JSON.stringify(svg).slice(1, -1)}</svg>\`;`);
}

lines.push('');
lines.push('/** Alle Icons als Map (für dynamischen Zugriff) */');
lines.push('export const ALL_ICONS = {');
for (const name of Object.keys(icons)) {
  const jsName = name.replace(/[.-]/g, '_');
  lines.push(`  '${name}': ${jsName},`);
}
lines.push('};');
lines.push('');

writeFileSync(OUT_FILE, lines.join('\n'));
console.log(`✅ ${Object.keys(icons).length} Icons → ${OUT_FILE}`);
