import { timeAgo } from '@/utils/time';

const NOW = new Date('2026-10-03T12:00:00Z').getTime();
const before = (ms: number) => new Date(NOW - ms).toISOString();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('timeAgo', () => {
  it('says "baru saja" for the last minute', () => {
    expect(timeAgo(before(0), NOW)).toBe('baru saja');
    expect(timeAgo(before(59_000), NOW)).toBe('baru saja');
  });

  it('counts minutes, hours and days like Instagram', () => {
    expect(timeAgo(before(5 * MINUTE), NOW)).toBe('5 mnt');
    expect(timeAgo(before(59 * MINUTE), NOW)).toBe('59 mnt');
    expect(timeAgo(before(3 * HOUR), NOW)).toBe('3 j');
    expect(timeAgo(before(2 * DAY), NOW)).toBe('2 hr');
    expect(timeAgo(before(6 * DAY + 23 * HOUR), NOW)).toBe('6 hr');
  });

  it('shows a date from one week on', () => {
    const iso = before(7 * DAY);
    const expected = new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    expect(timeAgo(iso, NOW)).toBe(expected);
    expect(expected).toMatch(/2026/);
  });
});
