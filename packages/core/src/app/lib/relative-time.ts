const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const formatters = new Map<string, Intl.RelativeTimeFormat>();

function formatterFor(locale: string): Intl.RelativeTimeFormat {
  let rtf = formatters.get(locale);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'narrow' });
    formatters.set(locale, rtf);
  }
  return rtf;
}

/** Compact, locale-aware "2h ago" / "yesterday" label for a timestamp. */
export function relativeTime(timestamp: number, locale: string, now = Date.now()): string {
  const elapsed = Math.max(0, now - timestamp);
  const rtf = formatterFor(locale);
  if (elapsed < MINUTE) return rtf.format(0, 'second');
  if (elapsed < HOUR) return rtf.format(-Math.floor(elapsed / MINUTE), 'minute');
  if (elapsed < DAY) return rtf.format(-Math.floor(elapsed / HOUR), 'hour');
  if (elapsed < WEEK) return rtf.format(-Math.floor(elapsed / DAY), 'day');
  if (elapsed < MONTH) return rtf.format(-Math.floor(elapsed / WEEK), 'week');
  if (elapsed < YEAR) return rtf.format(-Math.floor(elapsed / MONTH), 'month');
  return rtf.format(-Math.floor(elapsed / YEAR), 'year');
}
