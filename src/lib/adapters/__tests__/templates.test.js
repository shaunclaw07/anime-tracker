import { describe, it, expect, vi } from 'vitest';
import { cardTemplate } from '../templates.js';

vi.mock('../../config.js', () => ({
  getUsers: () => ['chrischi', 'michelle'],
  getUserLabel: (user) => ({ chrischi: 'Chrischi', michelle: 'Michelle' }[user] || user),
}));

describe('cardTemplate', () => {
  it('renders pin button on card', () => {
    const html = cardTemplate({ anilist_id: 1, title_romaji: 'Test', pinned_by: [] });
    expect(html).toContain('data-action="toggle-pin"');
  });

  it('shows filled pin for pinned anime', () => {
    const html = cardTemplate({ anilist_id: 1, title_romaji: 'Test', pinned_by: ['chrischi'] });
    expect(html).toContain('btn-pinned');
  });

  it('shows empty pin for unpinned anime', () => {
    const html = cardTemplate({ anilist_id: 1, title_romaji: 'Test', pinned_by: [] });
    expect(html).not.toContain('btn-pinned');
  });

  it('adds pinned class to card when anime is pinned', () => {
    const html = cardTemplate({ anilist_id: 1, title_romaji: 'Test', pinned_by: ['chrischi'] });
    expect(html).toContain('class="anime-card pinned"');
  });

  it('does not add pinned class when anime is unpinned', () => {
    const html = cardTemplate({ anilist_id: 1, title_romaji: 'Test', pinned_by: [] });
    expect(html).toContain('class="anime-card "');
  });

  it('handles missing pinned_by gracefully', () => {
    const html = cardTemplate({ anilist_id: 1, title_romaji: 'Test' });
    expect(html).toContain('data-action="toggle-pin"');
    expect(html).not.toContain('btn-pinned');
  });
});
