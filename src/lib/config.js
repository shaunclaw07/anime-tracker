/**
 * Anime Tracker — Benutzerkonfiguration
 *
 * Liest Usernamen aus localStorage (Settings).
 * Fallback auf Defaults wenn nichts gespeichert ist.
 */

const STORAGE_KEY = 'anime-tracker-users';

const DEFAULT_USERS = ['chrischi', 'michelle'];
const DEFAULT_LABELS = { chrischi: 'Chrischi', michelle: 'Michelle' };
const DEFAULT_PRIMARY = 'chrischi';

let cached = null;

function load() {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cached = { users: DEFAULT_USERS, labels: DEFAULT_LABELS, defaultUser: DEFAULT_PRIMARY };
      return cached;
    }
    cached = JSON.parse(raw);
    return cached;
  } catch {
    cached = { users: DEFAULT_USERS, labels: DEFAULT_LABELS, defaultUser: DEFAULT_PRIMARY };
    return cached;
  }
}

export function getUsers() {
  return load().users;
}

export function getUserLabels() {
  return load().labels;
}

export function getDefaultUser() {
  return load().defaultUser;
}

export function getUserLabel(user) {
  const labels = load().labels;
  return labels[user] || user;
}

export function saveUsers(users, labels, defaultUser) {
  cached = { users, labels, defaultUser };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
}
