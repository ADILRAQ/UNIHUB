import { useAuth } from '../../auth/AuthContext';
import useCourses from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';
import PageHeader from '../../../components/layout/PageHeader';

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 };

const CoursesPage = () => {
  const { user } = useAuth();
  const { courses, isLoading, isError } = useCourses();
  const showTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <>
      <PageHeader title="Courses" subtitle="Modules, resources, assignments and past-session recaps" />
      <div className="page-body">
        {isLoading && (
          <div style={grid}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        )}
        {isError && <div role="alert" className="alert">Failed to load courses. Please try again.</div>}
        {!isLoading && !isError && courses.length === 0 && (
          <div className="empty-state">
            <h2 className="empty-state__title">No courses yet</h2>
            <p className="empty-state__body">
              {showTeacher ? 'Create a course from the Timetable page, then add its modules here.' : 'Your courses will appear here once your class group is enrolled.'}
            </p>
          </div>
        )}
        {!isLoading && !isError && courses.length > 0 && (
          <div style={grid}>
            {courses.map((course) => <CourseCard key={course.id} course={course} showTeacher={showTeacher} />)}
          </div>
        )}
      </div>
    </>
  );
};

export default CoursesPage;
