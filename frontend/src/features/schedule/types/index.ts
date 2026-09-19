/** Schedule-feature-local types. Cross-cutting shapes stay in `api/types.ts`. */

/** A weekday, serialized by the backend as its `DayOfWeek` name. */
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

/** Kind of one-off calendar event. */
export type EventType = 'EXAM' | 'DEADLINE' | 'EVENT';

/** Lifecycle status of a generated session. */
export type SessionStatus = 'SCHEDULED' | 'CANCELLED' | 'RESCHEDULED';

/** Discriminator for a merged schedule feed entry. */
export type ScheduleItemKind = 'SESSION' | 'EVENT';

/**
 * One calendar-ready entry from `GET /api/schedule`. Session-only fields
 * (`meetLink`, `status`, `originalDate`) and the event-only `eventType` are null
 * for the other kind. `startTime`/`endTime` are null for all-day events. Dates
 * are ISO strings (`"2026-08-03"`); times are `"09:00:00"`.
 */
export interface ScheduleItem {
  kind: ScheduleItemKind;
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  title: string;
  courseId: number | null;
  courseName: string | null;
  room: string | null;
  meetLink: string | null;
  status: SessionStatus | null;
  originalDate: string | null;
  changeNote: string | null;
  eventType: EventType | null;
  classGroupId: number | null;
  classGroupName: string | null;
  description: string | null;
}

/** Course projection (`GET /api/courses`, `GET /api/courses/{id}`). */
export interface Course {
  id: number;
  name: string;
  teacherId: number;
  teacherName: string;
  classGroupId: number;
  classGroupName: string;
  meetLink: string | null;
  moduleCount: number;
  createdAt: string;
}

/** Request body for `POST /api/courses` (ADMIN only). */
export interface CreateCourseRequest {
  name: string;
  teacherId: number;
  classGroupId: number;
  meetLink?: string;
}

/**
 * Request body for `PATCH /api/courses/{id}` (ADMIN only). All fields optional;
 * `meetLink`: null/undefined = unchanged, `""` = clear.
 */
export interface UpdateCourseRequest {
  name?: string;
  teacherId?: number;
  classGroupId?: number;
  meetLink?: string;
}

/** Weekly schedule template (`GET /api/courses/{courseId}/templates`). */
export interface ScheduleTemplate {
  id: number;
  courseId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string | null;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

/** Request body for `POST /api/courses/{courseId}/templates` (generates sessions). */
export interface CreateTemplateRequest {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  startDate: string;
  endDate: string;
  active?: boolean;
}

/** Request body for `PATCH /api/templates/{id}` (regenerates future sessions). */
export interface UpdateTemplateRequest {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  room?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

/** Single-session projection returned by cancel/reschedule. */
export interface Session {
  id: number;
  courseId: number;
  courseName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  meetLink: string | null;
  status: SessionStatus;
  originalDate: string | null;
  changeNote: string | null;
}

/** Request body for `PATCH /api/sessions/{id}/cancel`. */
export interface CancelSessionRequest {
  note?: string;
}

/** Request body for `PATCH /api/sessions/{id}/reschedule`. */
export interface RescheduleSessionRequest {
  newDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  note?: string;
}

/** One-off event projection (`GET /api/events`). */
export interface EventItem {
  id: number;
  title: string;
  type: EventType;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  courseId: number | null;
  courseName: string | null;
  classGroupId: number | null;
  classGroupName: string | null;
  description: string | null;
  createdAt: string;
}

/** Request body for `POST /api/events`. */
export interface CreateEventRequest {
  title: string;
  type: EventType;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  courseId?: number | null;
  classGroupId?: number | null;
  description?: string;
}

/** Request body for `PATCH /api/events/{id}` (course/group not re-pointable). */
export interface UpdateEventRequest {
  title?: string;
  type?: EventType;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
}

/** The three calendar layouts the calendar page can switch between. */
export type CalendarView = 'today' | 'week' | 'month';
