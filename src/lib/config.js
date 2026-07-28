/**
 * Anime Tracker — Benutzerkonfiguration
 *
 * Feste User-Strings 'chrischi'/'michelle'.
 * Labels (Anzeigenamen) werden im localStorage gespeichert.
 */

const DEFAULT_LABELS = { chrischi: 'Chrischi', michelle: 'Michelle' };
const USERS = Object.keys(DEFAULT_LABELS);
const DEFAULT_USER = USERS[0];

let cachedLabels = null;

function loadLabels() {
  if (cachedLabels) return cachedLabels;
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem('anime-tracker-user-labels');
    if (raw) {
      const parsed = JSON.parse(raw);
      cachedLabels = { ...DEFAULT_LABELS, ...parsed };
      return cachedLabels;
    }
  } catch { /* fallthrough */ }
  cachedLabels = { ...DEFAULT_LABELS };
  return cachedLabels;
}

export function getUsers() {
  return USERS;
}

export function getUserLabel(user) {
  return loadLabels()[user] || user;
}

export function getDefaultUser() {
  return DEFAULT_USER;
}

export function saveLabels(labels) {
  cachedLabels = { ...DEFAULT_LABELS, ...labels };
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('anime-tracker-user-labels', JSON.stringify(cachedLabels));
    }
  } catch { /* ignore */ }
}
