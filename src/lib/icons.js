/**
 * Lucide Icons — Zentrale Icon-Sammlung (76 Icons)
 *
 * Nutzung: import { search, x, check } from "../icons.js";
 * Dann im Template: element.innerHTML = search
 */

/* Standard-SVG-Attribute */
const BASE = 'xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/**
 * icon — Gibt ein Lucide-Icon in beliebiger Grösse zurück.
 * @param {string} svgContent - Der SVG-Inner-Content des Icons (paths etc.)
 * @param {number} [size=20] - Gewünschte Breite/Höhe in px
 * @returns {string} Vollständiges <svg>-Tag
 */
export function icon(svgContent, size = 20) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svgContent}</svg>`;
}

/**
 * iconSvg — Nimmt ein VOLLSTÄNDIGES Lucide-Icon (SVG-String) und ändert nur die Grösse.
 * Kein Double-Wrapping! Nutze DIESE Funktion für die icon-Exporte aus icons.js.
 * @param {string} svg - Vollständiger SVG-String (z.B. `user`, `star`)
 * @param {number} [size=20] - Gewünschte Breite/Höhe in px
 * @returns {string} Gleicher SVG-String mit neuer Grösse
 */
export function iconSvg(svg, size = 20) {
  return svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
}

export const search = `<svg ${BASE} ${"<path d=\"m21 21-4.34-4.34\" /> <circle cx=\"11\" cy=\"11\" r=\"8\" />"}>`;
export const x = `<svg ${BASE} ${"<path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" />"}>`;
export const check = `<svg ${BASE} ${"<path d=\"M20 6 9 17l-5-5\" />"}>`;
export const plus = `<svg ${BASE} ${"<path d=\"M5 12h14\" /> <path d=\"M12 5v14\" />"}>`;
export const trash_2 = `<svg ${BASE} ${"<path d=\"M10 11v6\" /> <path d=\"M14 11v6\" /> <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\" /> <path d=\"M3 6h18\" /> <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\" />"}>`;
export const heart = `<svg ${BASE} ${"<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" />"}>`;
export const user = `<svg ${BASE} ${"<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /> <circle cx=\"12\" cy=\"7\" r=\"4\" />"}>`;
export const star = `<svg ${BASE} ${"<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" />"}>`;
export const settings = `<svg ${BASE} ${"<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />"}>`;
export const shuffle = `<svg ${BASE} ${"<path d=\"m18 14 4 4-4 4\" /> <path d=\"m18 2 4 4-4 4\" /> <path d=\"M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22\" /> <path d=\"M2 6h1.972a4 4 0 0 1 3.6 2.2\" /> <path d=\"M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45\" />"}>`;
export const download = `<svg ${BASE} ${"<path d=\"M12 15V3\" /> <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /> <path d=\"m7 10 5 5 5-5\" />"}>`;
export const pin = `<svg ${BASE} ${"<path d=\"M12 17v5\" /> <path d=\"M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z\" />"}>`;
export const play = `<svg ${BASE} ${"<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\" />"}>`;
export const chevron_down = `<svg ${BASE} ${"<path d=\"m6 9 6 6 6-6\" />"}>`;
export const chevron_up = `<svg ${BASE} ${"<path d=\"m18 15-6-6-6 6\" />"}>`;
export const chevron_left = `<svg ${BASE} ${"<path d=\"m15 18-6-6 6-6\" />"}>`;
export const chevron_right = `<svg ${BASE} ${"<path d=\"m9 18 6-6-6-6\" />"}>`;
export const menu = `<svg ${BASE} ${"<path d=\"M4 5h16\" /> <path d=\"M4 12h16\" /> <path d=\"M4 19h16\" />"}>`;
export const more_horizontal = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"1\" /> <circle cx=\"19\" cy=\"12\" r=\"1\" /> <circle cx=\"5\" cy=\"12\" r=\"1\" />"}>`;
export const more_vertical = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"1\" /> <circle cx=\"12\" cy=\"5\" r=\"1\" /> <circle cx=\"12\" cy=\"19\" r=\"1\" />"}>`;
export const arrow_left = `<svg ${BASE} ${"<path d=\"m12 19-7-7 7-7\" /> <path d=\"M19 12H5\" />"}>`;
export const arrow_right = `<svg ${BASE} ${"<path d=\"M5 12h14\" /> <path d=\"m12 5 7 7-7 7\" />"}>`;
export const external_link = `<svg ${BASE} ${"<path d=\"M15 3h6v6\" /> <path d=\"M10 14 21 3\" /> <path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\" />"}>`;
export const refresh_cw = `<svg ${BASE} ${"<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /> <path d=\"M21 3v5h-5\" /> <path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /> <path d=\"M8 16H3v5\" />"}>`;
export const undo = `<svg ${BASE} ${"<path d=\"M3 7v6h6\" /> <path d=\"M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13\" />"}>`;
export const rotate_ccw = `<svg ${BASE} ${"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /> <path d=\"M3 3v5h5\" />"}>`;
export const info = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 16v-4\" /> <path d=\"M12 8h.01\" />"}>`;
export const alert_circle = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /> <line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />"}>`;
export const alert_triangle = `<svg ${BASE} ${"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /> <path d=\"M12 9v4\" /> <path d=\"M12 17h.01\" />"}>`;
export const check_circle = `<svg ${BASE} ${"<path d=\"M21.801 10A10 10 0 1 1 17 3.335\" /> <path d=\"m9 11 3 3L22 4\" />"}>`;
export const circle_dot = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <circle cx=\"12\" cy=\"12\" r=\"1\" />"}>`;
export const loader_circle = `<svg ${BASE} ${"<path d=\"M21 12a9 9 0 1 1-6.219-8.56\" />"}>`;
export const image = `<svg ${BASE} ${"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /> <circle cx=\"9\" cy=\"9\" r=\"2\" /> <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" />"}>`;
export const film = `<svg ${BASE} ${"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /> <path d=\"M7 3v18\" /> <path d=\"M3 7.5h4\" /> <path d=\"M3 12h18\" /> <path d=\"M3 16.5h4\" /> <path d=\"M17 3v18\" /> <path d=\"M17 7.5h4\" /> <path d=\"M17 16.5h4\" />"}>`;
export const tv = `<svg ${BASE} ${"<path d=\"m17 2-5 5-5-5\" /> <rect width=\"20\" height=\"15\" x=\"2\" y=\"7\" rx=\"2\" />"}>`;
export const book_open = `<svg ${BASE} ${"<path d=\"M12 5v16\" /> <path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\" />"}>`;
export const monitor = `<svg ${BASE} ${"<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /> <line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /> <line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" />"}>`;
export const smartphone = `<svg ${BASE} ${"<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /> <path d=\"M12 18h.01\" />"}>`;
export const music = `<svg ${BASE} ${"<path d=\"M9 18V5l12-2v13\" /> <circle cx=\"6\" cy=\"18\" r=\"3\" /> <circle cx=\"18\" cy=\"16\" r=\"3\" />"}>`;
export const headphones = `<svg ${BASE} ${"<path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3\" />"}>`;
export const video = `<svg ${BASE} ${"<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\" /> <rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\" />"}>`;
export const copy = `<svg ${BASE} ${"<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /> <path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />"}>`;
export const link = `<svg ${BASE} ${"<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\" /> <path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\" />"}>`;
export const share_2 = `<svg ${BASE} ${"<circle cx=\"18\" cy=\"5\" r=\"3\" /> <circle cx=\"6\" cy=\"12\" r=\"3\" /> <circle cx=\"18\" cy=\"19\" r=\"3\" /> <line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\" /> <line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\" />"}>`;
export const mail = `<svg ${BASE} ${"<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\" /> <rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" />"}>`;
export const upload = `<svg ${BASE} ${"<path d=\"M12 3v12\" /> <path d=\"m17 8-5-5-5 5\" /> <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" />"}>`;
export const save = `<svg ${BASE} ${"<path d=\"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\" /> <path d=\"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7\" /> <path d=\"M7 3v4a1 1 0 0 0 1 1h7\" />"}>`;
export const edit = `<svg ${BASE} ${"<path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\" /> <path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\" />"}>`;
export const eye = `<svg ${BASE} ${"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />"}>`;
export const eye_off = `<svg ${BASE} ${"<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\" /> <path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\" /> <path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\" /> <path d=\"m2 2 20 20\" />"}>`;
export const thumbs_up = `<svg ${BASE} ${"<path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\" /> <path d=\"M7 10v12\" />"}>`;
export const message_circle = `<svg ${BASE} ${"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" />"}>`;
export const message_square = `<svg ${BASE} ${"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" />"}>`;
export const clock = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 6v6l4 2\" />"}>`;
export const calendar = `<svg ${BASE} ${"<path d=\"M8 2v4\" /> <path d=\"M16 2v4\" /> <rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /> <path d=\"M3 10h18\" />"}>`;
export const flag = `<svg ${BASE} ${"<path d=\"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\" />"}>`;
export const bell = `<svg ${BASE} ${"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /> <path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" />"}>`;
export const arrow_up_down = `<svg ${BASE} ${"<path d=\"m21 16-4 4-4-4\" /> <path d=\"M17 20V4\" /> <path d=\"m3 8 4-4 4 4\" /> <path d=\"M7 4v16\" />"}>`;
export const sort_desc = `<svg ${BASE} ${"<path d=\"m3 16 4 4 4-4\" /> <path d=\"M7 20V4\" /> <path d=\"M11 4h10\" /> <path d=\"M11 8h7\" /> <path d=\"M11 12h4\" />"}>`;
export const sort_asc = `<svg ${BASE} ${"<path d=\"m3 8 4-4 4 4\" /> <path d=\"M7 4v16\" /> <path d=\"M11 12h4\" /> <path d=\"M11 16h7\" /> <path d=\"M11 20h10\" />"}>`;
export const filter = `<svg ${BASE} ${"<path d=\"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z\" />"}>`;
export const tag = `<svg ${BASE} ${"<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\" /> <circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />"}>`;
export const hash = `<svg ${BASE} ${"<line x1=\"4\" x2=\"20\" y1=\"9\" y2=\"9\" /> <line x1=\"4\" x2=\"20\" y1=\"15\" y2=\"15\" /> <line x1=\"10\" x2=\"8\" y1=\"3\" y2=\"21\" /> <line x1=\"16\" x2=\"14\" y1=\"3\" y2=\"21\" />"}>`;
export const sparkles = `<svg ${BASE} ${"<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" /> <path d=\"M20 2v4\" /> <path d=\"M22 4h-4\" /> <circle cx=\"4\" cy=\"20\" r=\"2\" />"}>`;
export const flame = `<svg ${BASE} ${"<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\" />"}>`;
export const trophy = `<svg ${BASE} ${"<path d=\"M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2\" /> <path d=\"M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2\" /> <path d=\"M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3\" /> <path d=\"M4 22h16\" /> <path d=\"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z\" /> <path d=\"M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3\" />"}>`;
export const target = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <circle cx=\"12\" cy=\"12\" r=\"6\" /> <circle cx=\"12\" cy=\"12\" r=\"2\" />"}>`;
export const globe = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\" /> <path d=\"M2 12h20\" />"}>`;
export const map_pin = `<svg ${BASE} ${"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /> <circle cx=\"12\" cy=\"10\" r=\"3\" />"}>`;
export const list_filter = `<svg ${BASE} ${"<path d=\"M2 5h20\" /> <path d=\"M6 12h12\" /> <path d=\"M9 19h6\" />"}>`;
export const list = `<svg ${BASE} ${"<path d=\"M3 5h.01\" /> <path d=\"M3 12h.01\" /> <path d=\"M3 19h.01\" /> <path d=\"M8 5h13\" /> <path d=\"M8 12h13\" /> <path d=\"M8 19h13\" />"}>`;
export const grid_3x3 = `<svg ${BASE} ${"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /> <path d=\"M3 9h18\" /> <path d=\"M3 15h18\" /> <path d=\"M9 3v18\" /> <path d=\"M15 3v18\" />"}>`;
export const sliders_horizontal = `<svg ${BASE} ${"<path d=\"M10 5H3\" /> <path d=\"M12 19H3\" /> <path d=\"M14 3v4\" /> <path d=\"M16 17v4\" /> <path d=\"M21 12h-9\" /> <path d=\"M21 19h-5\" /> <path d=\"M21 5h-7\" /> <path d=\"M8 10v4\" /> <path d=\"M8 12H3\" />"}>`;
export const x_circle = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m15 9-6 6\" /> <path d=\"m9 9 6 6\" />"}>`;
export const plus_circle = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M8 12h8\" /> <path d=\"M12 8v8\" />"}>`;
export const minus_circle = `<svg ${BASE} ${"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M8 12h8\" />"}>`;

/** Alle Icons als Map (für dynamischen Zugriff) */
export const ALL_ICONS = {
  'search': search,
  'x': x,
  'check': check,
  'plus': plus,
  'trash-2': trash_2,
  'heart': heart,
  'user': user,
  'star': star,
  'settings': settings,
  'shuffle': shuffle,
  'download': download,
  'pin': pin,
  'play': play,
  'chevron-down': chevron_down,
  'chevron-up': chevron_up,
  'chevron-left': chevron_left,
  'chevron-right': chevron_right,
  'menu': menu,
  'more-horizontal': more_horizontal,
  'more-vertical': more_vertical,
  'arrow-left': arrow_left,
  'arrow-right': arrow_right,
  'external-link': external_link,
  'refresh-cw': refresh_cw,
  'undo': undo,
  'rotate-ccw': rotate_ccw,
  'info': info,
  'alert-circle': alert_circle,
  'alert-triangle': alert_triangle,
  'check-circle': check_circle,
  'circle-dot': circle_dot,
  'loader-circle': loader_circle,
  'image': image,
  'film': film,
  'tv': tv,
  'book-open': book_open,
  'monitor': monitor,
  'smartphone': smartphone,
  'music': music,
  'headphones': headphones,
  'video': video,
  'copy': copy,
  'link': link,
  'share-2': share_2,
  'mail': mail,
  'upload': upload,
  'save': save,
  'edit': edit,
  'eye': eye,
  'eye-off': eye_off,
  'thumbs-up': thumbs_up,
  'message-circle': message_circle,
  'message-square': message_square,
  'clock': clock,
  'calendar': calendar,
  'flag': flag,
  'bell': bell,
  'arrow-up-down': arrow_up_down,
  'sort-desc': sort_desc,
  'sort-asc': sort_asc,
  'filter': filter,
  'tag': tag,
  'hash': hash,
  'sparkles': sparkles,
  'flame': flame,
  'trophy': trophy,
  'target': target,
  'globe': globe,
  'map-pin': map_pin,
  'list-filter': list_filter,
  'list': list,
  'grid-3x3': grid_3x3,
  'sliders-horizontal': sliders_horizontal,
  'x-circle': x_circle,
  'plus-circle': plus_circle,
  'minus-circle': minus_circle,
};
