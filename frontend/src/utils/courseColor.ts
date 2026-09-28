import type { CSSProperties } from 'react';

const COURSE_COLOR_COUNT = 8;

/**
 * Stable per-course color: the same course always gets the same tint pair
 * (tokens `--course-N-bg` / `--course-N-fg`). Returns CSS variables to spread
 * into `style`; components read `--course-bg` / `--course-fg`.
 * ponytail: id modulo 8, so courses 1 and 9 share a color; assign colors server-side if that ever matters.
 */
export const courseColorVars = (courseId: number | null | undefined): CSSProperties => {
  if (courseId == null) return {};
  const n = (Math.abs(courseId) % COURSE_COLOR_COUNT) + 1;
  return {
    '--course-bg': `var(--course-${n}-bg)`,
    '--course-fg': `var(--course-${n}-fg)`,
  } as CSSProperties;
};
