import { Link } from 'react-router-dom';
import type { Course } from '../../schedule/types';

interface CourseCardProps {
  course: Course;
  showTeacher?: boolean;
}

const CourseCard = ({ course, showTeacher = false }: CourseCardProps) => (
  <Link to={`/courses/${course.id}`} className="res-course-card">
    <p className="res-course-card__name">{course.name}</p>
    <p className="res-course-card__meta">{course.classGroupName}</p>
    {showTeacher && (
      <p className="res-course-card__meta">{course.teacherName}</p>
    )}
  </Link>
);

export default CourseCard;
