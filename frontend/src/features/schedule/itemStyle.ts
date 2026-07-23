/**
 * Pure presentation helpers that map a schedule item to its visual treatment —
 * the CSS modifier and badge used consistently across the Today, Week and Month
 * views. Kept feature-local; no React, no state.
 */

import type { ScheduleItem } from './types';

export interface ItemVisual {
  /** Modifier applied to `.sched-item` / `.sched-chip` (e.g. `exam`). */
  variant: 'session' | 'cancelled' | 'rescheduled' | 'exam' | 'deadline' | 'event';
  /** Short badge caption, e.g. `"Cancelled"`, `"Exam"`. */
  badge: string;
  /** Cancelled sessions are struck through but still shown. */
  isCancelled: boolean;
  /** A manageable class occurrence (cancel/reschedule targets sessions). */
  isSession: boolean;
}

const EVENT_BADGE: Record<string, string> = {
  EXAM: 'Exam',
  DEADLINE: 'Deadline',
  EVENT: 'Event',
};

/** Classify a schedule item for rendering. */
export const itemVisual = (item: ScheduleItem): ItemVisual => {
  if (item.kind === 'SESSION') {
    if (item.status === 'CANCELLED') {
      return { variant: 'cancelled', badge: 'Cancelled', isCancelled: true, isSession: true };
    }
    if (item.status === 'RESCHEDULED') {
      return { variant: 'rescheduled', badge: 'Moved', isCancelled: false, isSession: true };
    }
    return { variant: 'session', badge: 'Class', isCancelled: false, isSession: true };
  }

  const type = item.eventType ?? 'EVENT';
  const variant = type === 'EXAM' ? 'exam' : type === 'DEADLINE' ? 'deadline' : 'event';
  return {
    variant,
    badge: EVENT_BADGE[type] ?? 'Event',
    isCancelled: false,
    isSession: false,
  };
};
