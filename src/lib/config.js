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

function generateId() {
  return 'u_' + Math.random().toString(36).substring(2, 8);
}

function freshDefaults() {
  const id0 = generateId();
  const id1 = generateId();
  return {
    users: [id0, id1],
    labels: { [id0]: 'User 1', [id1]: 'User 2' },
    defaultUser: id0,
    generated: true,
  };
}

let cached = null;
const isServer = typeof localStorage === 'undefined';

function load() {
  if (cached) return cached;
  if (isServer) {
    cached = {
      users: ['user_1', 'user_2'],
      labels: { user_1: 'User 1', user_2: 'User 2' },
      defaultUser: 'user_1',
      generated: true,
    };
    return cached;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cached = freshDefaults();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
      return cached;
    }
    const parsed = JSON.parse(raw);
    // Migration: alte Defaults durch generierte ersetzen
    if (!parsed.generated &&
        parsed.users[0] === 'chrischi' &&
        parsed.users[1] === 'michelle') {
      const migrated = freshDefaults();
      // Labels aus alten Defaults übernehmen
      migrated.labels[migrated.users[0]] = parsed.labels?.['chrischi'] || 'User 1';
      migrated.labels[migrated.users[1]] = parsed.labels?.['michelle'] || 'User 2';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      cached = migrated;
      return cached;
    }
    cached = parsed;
    return cached;
  } catch {
    cached = freshDefaults();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
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
  if (!isServer) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  }
}
