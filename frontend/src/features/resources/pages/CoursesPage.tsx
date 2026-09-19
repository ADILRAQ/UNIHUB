import { useAuth } from '../../auth/AuthContext';
import useCourses from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';
import PageHeader from '../../../components/layout/PageHeader';

const CoursesPage = () => {
  const { user } = useAuth();
  const { courses, isLoading, isError } = useCourses();
  const showTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <>
      <PageHeader title="Courses" />
      <main style={{ flexGrow: 1, padding: '32px', overflowY: 'auto' }}>
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 22 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 148, borderRadius: 16 }} />
            ))}
          </div>
        )}
        {isError && (
          <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>
            Failed to load courses. Please try again.
          </div>
        )}
        {!isLoading && !isError && courses.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '64px 0', color: '#6B6B7B' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C9C7DA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
            </svg>
            <span style={{ fontSize: 14 }}>No courses found.</span>
          </div>
        )}
        {!isLoading && !isError && courses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 22 }}>
            {courses.map((course, i) => (
              <CourseCard key={course.id} course={course} showTeacher={showTeacher} index={i} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default CoursesPage;
