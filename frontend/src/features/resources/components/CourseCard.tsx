import { Link } from 'react-router-dom';
import type { Course } from '../../schedule/types';

interface CourseCardProps {
  course: Course;
  showTeacher?: boolean;
  index?: number;
}

const PALETTE = [
  { bg: '#EEEDFF', color: '#4A41C9' },
  { bg: '#EAFBF3', color: '#0F8F5F' },
  { bg: '#FEF3E2', color: '#B8650A' },
  { bg: '#FFE8E8', color: '#B02F2F' },
  { bg: '#E8F1FF', color: '#1D5FC2' },
  { bg: '#F3E8FF', color: '#7C3AED' },
];

const CourseCard = ({ course, showTeacher = false, index = 0 }: CourseCardProps) => {
  const { bg, color } = PALETTE[index % PALETTE.length];
  return (
    <Link
      to={`/courses/${course.id}`}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 16, background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 16, padding: 22, boxShadow: '0 1px 2px rgba(108,99,255,0.05), 0 8px 22px rgba(108,99,255,0.06)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ width: 46, height: 46, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
          </svg>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 999, background: '#EEEDFF', color: '#4A41C9', fontSize: 11.5, fontWeight: 600 }}>
          {course.classGroupName}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontSize: 16.5, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.01em', lineHeight: 1.35 }}>{course.name}</span>
        {showTeacher && (
          <span style={{ fontSize: 13, color: '#6B6B7B' }}>{course.teacherName}</span>
        )}
      </div>
      {course.meetLink && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid #F0EEFA' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D8B9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="6" width="13" height="12" rx="2.5"/>
            <path d="m15.5 10.5 6-3.2v9.4l-6-3.2"/>
          </svg>
          <span style={{ fontSize: 12.5, color: '#8D8B9C' }}>Meet link available</span>
        </div>
      )}
    </Link>
  );
};

export default CourseCard;
