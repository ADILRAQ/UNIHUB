/**
 * Pure calendar/date helpers for the schedule feature. Kept feature-local (not in
 * shared `utils/`) because only the calendar needs this weekly/monthly grid math;
 * promote to `src/utils/` if a second feature ever needs it.
 *
 * All construction uses local date parts (never `new Date("YYYY-MM-DD")`, which
 * parses as UTC and can shift the day) so a `"2026-08-03"` renders on Aug 3.
 */

import type { DayOfWeek } from './types';

/** Weekday column headers, Monday-first (matches the grid + `startOfWeek`). */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** `<select>` options for a template's day-of-week. */
export const DAY_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

/** Format a `Date` as a local `"YYYY-MM-DD"` string. */
export const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Parse a `"YYYY-MM-DD"` string into a local `Date` at midnight. */
export const parseISODate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** A new `Date` `days` after `date` (may be negative). */
export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Monday of the week containing `date` (local, at midnight). */
export const startOfWeek = (date: Date): Date => {
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // days since Monday
  return addDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), -diff);
};

/** First day of `date`'s month. */
export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/** Last day of `date`'s month. */
export const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

/** Today at local midnight (time-of-day stripped). */
export const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** The 7 dates of the Monday-first week containing `anchor`. */
export const weekDays = (anchor: Date): Date[] => {
  const monday = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

/**
 * The full grid of dates for a month view: whole weeks (Monday-first) from the
 * week containing the 1st to the week containing the last day — always a multiple
 * of 7, so the grid has no ragged first/last row.
 */
export const monthGridDays = (anchor: Date): Date[] => {
  const gridStart = startOfWeek(startOfMonth(anchor));
  const gridEndAnchor = startOfWeek(endOfMonth(anchor));
  const gridEnd = addDays(gridEndAnchor, 6);
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    days.push(d);
  }
  return days;
};

/** ISO `{ from, to }` range covering the Monday-first week of `anchor`. */
export const weekRange = (anchor: Date): { from: string; to: string } => {
  const days = weekDays(anchor);
  return { from: toISODate(days[0]), to: toISODate(days[6]) };
};

/** ISO `{ from, to }` range covering the month grid of `anchor`. */
export const monthRange = (anchor: Date): { from: string; to: string } => {
  const days = monthGridDays(anchor);
  return { from: toISODate(days[0]), to: toISODate(days[days.length - 1]) };
};

/** Whether two dates fall on the same calendar day. */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** `"09:00:00"` → `"09:00"`. Passes through already-short or null values. */
export const formatTime = (time: string | null): string => {
  if (!time) {
    return '';
  }
  return time.slice(0, 5);
};

/** A human time range, e.g. `"09:00 – 10:30"`, or `"All day"` when timeless. */
export const formatTimeRange = (start: string | null, end: string | null): string => {
  if (!start) {
    return 'All day';
  }
  const from = formatTime(start);
  const to = formatTime(end);
  return to ? `${from} – ${to}` : from;
};

/** Normalize an `<input type="time">` value (`"HH:mm"`) to `"HH:mm:ss"`. */
export const toApiTime = (value: string): string =>
  value.length === 5 ? `${value}:00` : value;

const LONG_DATE = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const MONTH_YEAR = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

const WEEKDAY_DAY = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric' });

/** e.g. `"Monday, 3 August 2026"`. */
export const formatDateLong = (date: Date): string => LONG_DATE.format(date);

/** e.g. `"August 2026"`. */
export const formatMonthYear = (date: Date): string => MONTH_YEAR.format(date);

/** e.g. `"Mon 3"` — a compact week-column / day heading. */
export const formatWeekdayDay = (date: Date): string => WEEKDAY_DAY.format(date);
