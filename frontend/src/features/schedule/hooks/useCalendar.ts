import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import useSchedule from './useSchedule';
import {
  addDays,
  formatDateLong,
  formatMonthYear,
  monthGridDays,
  monthRange,
  startOfMonth,
  startOfWeek,
  toISODate,
  today,
  weekDays,
  weekRange,
} from '../calendar';
import type { CalendarView, ScheduleItem } from '../types';

/** How many days ahead the Today view scans for "coming up" items. */
const TODAY_LOOKAHEAD_DAYS = 13;
/** Max grouped days shown under "Coming up" in the Today view. */
const UPCOMING_DAY_LIMIT = 6;

/** A dated bucket of schedule items (used by Today "coming up" + Week columns). */
export interface DayBucket {
  date: Date;
  iso: string;
  isToday: boolean;
  items: ScheduleItem[];
}

/** A month-grid cell: a day plus whether it belongs to the displayed month. */
export interface MonthCell extends DayBucket {
  inMonth: boolean;
}

export interface UseCalendar {
  view: CalendarView;
  onSelectView: (view: CalendarView) => void;
  /** Header label for the current view + anchor (e.g. "August 2026"). */
  label: string;
  /** Prev/next step the anchor by week or month; hidden in Today view. */
  showNav: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isLoading: boolean;
  isError: boolean;
  /** Today view: today's items + the next few days that have items. */
  todayItems: ScheduleItem[];
  upcoming: DayBucket[];
  /** Week view: the seven Monday-first columns. */
  weekColumns: DayBucket[];
  /** Month view: weeks of seven cells each. */
  monthWeeks: MonthCell[][];
  /** Whether the current user may cancel/reschedule sessions. */
  canManage: boolean;
  /** The session chosen for the cancel/reschedule dialog, if any. */
  dialogSession: ScheduleItem | null;
  onManageSession: (item: ScheduleItem) => void;
  onCloseDialog: () => void;
}

const groupByDate = (items: ScheduleItem[]): Map<string, ScheduleItem[]> => {
  const map = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    const bucket = map.get(item.date);
    if (bucket) {
      bucket.push(item);
    } else {
      map.set(item.date, [item]);
    }
  }
  return map;
};

/**
 * Logic for the calendar page: owns the view (Today/Week/Month) and anchor date,
 * computes the ISO date range each view needs, fetches it once via the reusable
 * `useSchedule` read hook, and derives the per-view buckets (today list + coming
 * up, week columns, month grid). Also owns which session is open in the cancel/
 * reschedule dialog and exposes the caller's management capability. No `useQuery`
 * or business logic leaks into the page component.
 */
const useCalendar = (): UseCalendar => {
  const { user } = useAuth();
  const [view, setView] = useState<CalendarView>('today');
  const [anchor, setAnchor] = useState<Date>(today);
  const [dialogSession, setDialogSession] = useState<ScheduleItem | null>(null);

  const todayDate = today();
  const todayIso = toISODate(todayDate);

  // The fetch range depends on the active view; kept stable per (view, anchor).
  const range = useMemo(() => {
    if (view === 'week') {
      return weekRange(anchor);
    }
    if (view === 'month') {
      return monthRange(anchor);
    }
    return { from: todayIso, to: toISODate(addDays(todayDate, TODAY_LOOKAHEAD_DAYS)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, anchor, todayIso]);

  const { items, isLoading, isError } = useSchedule(range.from, range.to);
  const byDate = useMemo(() => groupByDate(items), [items]);

  const todayItems = useMemo(() => byDate.get(todayIso) ?? [], [byDate, todayIso]);

  const upcoming = useMemo<DayBucket[]>(() => {
    const buckets: DayBucket[] = [];
    for (let i = 1; i <= TODAY_LOOKAHEAD_DAYS && buckets.length < UPCOMING_DAY_LIMIT; i += 1) {
      const date = addDays(todayDate, i);
      const iso = toISODate(date);
      const dayItems = byDate.get(iso);
      if (dayItems && dayItems.length > 0) {
        buckets.push({ date, iso, isToday: false, items: dayItems });
      }
    }
    return buckets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byDate, todayIso]);

  const weekColumns = useMemo<DayBucket[]>(
    () =>
      weekDays(anchor).map((date) => {
        const iso = toISODate(date);
        return { date, iso, isToday: iso === todayIso, items: byDate.get(iso) ?? [] };
      }),
    [anchor, byDate, todayIso],
  );

  const monthWeeks = useMemo<MonthCell[][]>(() => {
    const anchorMonth = anchor.getMonth();
    const cells: MonthCell[] = monthGridDays(anchor).map((date) => {
      const iso = toISODate(date);
      return {
        date,
        iso,
        isToday: iso === todayIso,
        inMonth: date.getMonth() === anchorMonth,
        items: byDate.get(iso) ?? [],
      };
    });
    const weeks: MonthCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [anchor, byDate, todayIso]);

  const label = useMemo(() => {
    if (view === 'week') {
      const days = weekDays(anchor);
      return `${formatDateLong(days[0])} – ${formatDateLong(days[6])}`;
    }
    if (view === 'month') {
      return formatMonthYear(anchor);
    }
    return formatDateLong(todayDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, anchor, todayIso]);

  const step = (direction: 1 | -1) => {
    setAnchor((current) => {
      if (view === 'week') {
        return addDays(startOfWeek(current), direction * 7);
      }
      // month
      return startOfMonth(new Date(current.getFullYear(), current.getMonth() + direction, 1));
    });
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return {
    view,
    onSelectView: setView,
    label,
    showNav: view !== 'today',
    onPrev: () => step(-1),
    onNext: () => step(1),
    onToday: () => setAnchor(today()),
    isLoading,
    isError,
    todayItems,
    upcoming,
    weekColumns,
    monthWeeks,
    canManage: Boolean(canManage),
    dialogSession,
    onManageSession: (item) => setDialogSession(item),
    onCloseDialog: () => setDialogSession(null),
  };
};

export default useCalendar;
