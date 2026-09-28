import { Link } from 'react-router-dom';
import type { Course } from '../../schedule/types';
import { courseColorVars } from '../../../utils/courseColor';

interface CourseCardProps {
  course: Course;
  showTeacher?: boolean;
}

/** Design-system CourseCard: cream panel, white icon tile, overline category, link row. */
const CourseCard = ({ course, showTeacher = false }: CourseCardProps) => (
  <Link
    to={`/courses/${course.id}`}
    className="course-card"
    style={{ ...courseColorVars(course.id), textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--cream-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 'var(--radius-md)', background: 'var(--course-bg)', color: 'var(--course-fg)', display: 'grid', placeItems: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 5.5c3-1.3 6-1.3 9 .5 3-1.8 6-1.8 9-.5v13c-3-1.3-6-1.3-9 .5-3-1.8-6-1.8-9-.5z" /><path d="M12 6v13" />
        </svg>
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontSize: 16, lineHeight: '24px', fontWeight: 600, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.name}</span>
        <span className="overline">{course.classGroupName}</span>
      </span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, color: 'var(--ink-500)' }}>
      <span>{course.moduleCount === 1 ? '1 module' : `${course.moduleCount ?? 0} modules`}</span>
      {showTeacher && <span>{course.teacherName}</span>}
    </div>
    <span className="btn btn--link" style={{ alignSelf: 'flex-start' }}>
      Open course
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M9 12h6M12.5 9l3 3-3 3" />
      </svg>
    </span>
  </Link>
);

export default CourseCard;
