import useGetData from '../../../hooks/useGetData';
import { getSchedule } from '../../schedule/services/scheduleService';
import { listCourses } from '../../schedule/services/courseService';
import { SCHEDULE_KEY } from '../../schedule/hooks/useSchedule';
import { today, weekRange } from '../../schedule/calendar';
import { getAssignments } from '../../resources/services/assignmentService';
import { getUnreadCount } from '../../announcements/services/announcementService';
import { getOverdue } from '../../payments/services/paymentService';
import { listUsers } from '../../admin/services/userService';
import type { KpiDef } from '../types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Assignments due within the next 7 days that the student hasn't submitted, across all their courses. */
// ponytail: one request per course; move to a single /api/dashboard endpoint if course counts grow.
const countDueSoon = async (): Promise<number> => {
  const courses = await listCourses();
  // allSettled: one course failing shouldn't hide the whole count.
  const settled = await Promise.allSettled(courses.map((c) => getAssignments(c.id)));
  const perCourse = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
  const now = Date.now();
  return perCourse
    .flat()
    .filter((a) => {
      const due = new Date(a.dueAt).getTime();
      const submitted = a.mySubmissionStatus === 'SUBMITTED' || a.mySubmissionStatus === 'LATE_SUBMITTED';
      return due >= now && due - now <= WEEK_MS && !submitted;
    }).length;
};

/**
 * Role-aware dashboard KPIs, each linking to the page where you act on it.
 * Query keys match the owning features' keys where one exists, so their
 * mutations keep these numbers fresh (e.g. cancelling a class, reading a post).
 */
const useDashboardKpis = (isStudent: boolean): KpiDef[] => {
  const { from, to } = weekRange(today());

  const classes = useGetData({
    queryKey: [...SCHEDULE_KEY, from, to],
    queryFn: () => getSchedule({ from, to }),
    transformFn: (items) => items.filter((i) => i.kind === 'SESSION' && i.status !== 'CANCELLED').length,
  });

  const dueSoon = useGetData({
    queryKey: ['assignments', 'due-soon'],
    queryFn: countDueSoon,
    transformFn: (n) => n,
    enabled: isStudent,
  });

  const unread = useGetData({
    queryKey: ['announcements', 'unread-count'],
    queryFn: getUnreadCount,
    transformFn: (d) => d.count,
    enabled: isStudent,
  });

  const overdue = useGetData<Awaited<ReturnType<typeof getOverdue>>, string | undefined, number>({
    queryKey: ['payments', 'overdue', undefined],
    queryFn: () => getOverdue(),
    transformFn: (list) => list.length,
    enabled: !isStudent,
  });

  const activeStudents = useGetData({
    queryKey: ['users', 'kpi', 'active-students'],
    queryFn: () => listUsers({ role: 'STUDENT', status: 'ACTIVE', classGroupId: null, search: '', page: 0, size: 1 }),
    transformFn: (page) => page.totalElements,
    enabled: !isStudent,
  });

  // Loading → placeholder; error → dash. Never a misleading 0.
  const value = (q: { data?: number; isLoading: boolean; isError: boolean }): KpiDef['value'] =>
    q.isError ? 'error' : q.isLoading ? null : q.data ?? 0;

  const classesTile: KpiDef = {
    key: 'classes', icon: 'calendar', label: 'Classes this week', value: value(classes),
    to: isStudent ? '/schedule?view=week' : '/timetable',
  };

  return isStudent
    ? [
        classesTile,
        { key: 'due', icon: 'assignment', label: 'Due in 7 days', value: value(dueSoon), to: '/courses', alert: (dueSoon.data ?? 0) > 0 },
        { key: 'unread', icon: 'megaphone', label: 'Unread announcements', value: value(unread), to: '/announcements?filter=unread', alert: (unread.data ?? 0) > 0 },
      ]
    : [
        { key: 'overdue', icon: 'alert', label: 'Students overdue', value: value(overdue), to: '/payments?tab=overdue', alert: (overdue.data ?? 0) > 0 },
        classesTile,
        { key: 'students', icon: 'people', label: 'Active students', value: value(activeStudents), to: '/admin' },
      ];
};

export default useDashboardKpis;
