// Relative timestamps in Indonesian, like Instagram: "baru saja", "5 mnt", "3 j", "2 hr", then a date.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  if (diff < MINUTE) return 'baru saja';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} mnt`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} j`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} hr`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
