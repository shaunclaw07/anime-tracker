/**
 * Vitest Setup — runs before every test file.
 *
 * Minimal: only global polyfills that all tests need.
 * DOM tests use `// @vitest-environment jsdom` comment individually.
 * IndexedDB tests import `fake-indexeddb/auto` directly.
 */
