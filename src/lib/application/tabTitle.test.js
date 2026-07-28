import { describe, it, expect, beforeEach } from 'vitest';
import { updateTabTitle } from './tabTitle.ts';

describe('updateTabTitle', () => {
  beforeEach(() => {
    // Minimal document mock for testing tab title updates
    globalThis.document = { title: 'Original' };
  });

  it('setzt Titel mit Counter wenn count > 0', () => {
    updateTabTitle(3);
    expect(document.title).toBe('(3) Anime Tracker');
  });

  it('setzt Titel ohne Counter wenn count = 0', () => {
    updateTabTitle(0);
    expect(document.title).toBe('Anime Tracker');
  });

  it('setzt Titel ohne Counter wenn count negativ', () => {
    updateTabTitle(-1);
    expect(document.title).toBe('Anime Tracker');
  });
});
