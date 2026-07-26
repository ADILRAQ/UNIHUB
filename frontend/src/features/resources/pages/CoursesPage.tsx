import { useAuth } from '../../auth/AuthContext';
import useCourses from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';

const CoursesPage = () => {
  const { user } = useAuth();
  const { courses, isLoading, isError } = useCourses();

  if (isLoading) {
    return (
      <div className="res-page">
        <h1 style={{ margin: '0 0 var(--space-4)' }}>Courses</h1>
        <p className="res-resource__meta">Loading…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="res-page">
        <h1 style={{ margin: '0 0 var(--space-4)' }}>Courses</h1>
        <div className="alert alert--danger">Failed to load courses.</div>
      </div>
    );
  }

  const showTeacher = user?.role === 'ADMIN';

  return (
    <div className="res-page">
      <h1 style={{ margin: '0 0 var(--space-5)' }}>Courses</h1>
      {courses.length === 0 ? (
        <p className="res-resource__meta">No courses found.</p>
      ) : (
        <div className="res-course-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} showTeacher={showTeacher} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
