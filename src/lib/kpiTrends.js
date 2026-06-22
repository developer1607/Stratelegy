import { format, subMonths, startOfMonth } from 'date-fns';
import { safeParseDate } from '@/lib/crmHelpers';

/** Last N month keys ending at the current month. */
export function recentMonthKeys(count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, idx) => {
    const d = subMonths(startOfMonth(now), count - 1 - idx);
    return format(d, 'yyyy-MM');
  });
}

export function countInMonth(items, dateField, monthKey) {
  return items.filter((item) => {
    const date = safeParseDate(item[dateField]);
    return date && format(date, 'yyyy-MM') === monthKey;
  }).length;
}

export function monthBucketCounts(items, dateField, months = 6) {
  const keys = recentMonthKeys(months);
  return keys.map((key) => countInMonth(items, dateField, key));
}

/** Normalize counts to 4–100 for mini bar charts. */
export function sparklineHeights(counts) {
  const max = Math.max(...counts, 1);
  return counts.map((count) => Math.max(count > 0 ? 12 : 4, Math.round((count / max) * 100)));
}

export function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatTrendDelta(value) {
  if (value === 0) return null;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
