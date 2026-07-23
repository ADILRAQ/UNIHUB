package com.unihub.repository;

import com.unihub.model.Course;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByTeacher_Id(Long teacherId);

    List<Course> findByClassGroup_Id(Long classGroupId);

    /** Courses belonging to any of the given class groups — the student's course scope. */
    List<Course> findByClassGroup_IdIn(Collection<Long> classGroupIds);

    /**
     * The owning teacher's id for a course, selected as a projection so the data-scoping
     * {@code @courseAccess} evaluator can run outside an open persistence session (mirrors
     * {@code UserClassGroupRepository.findOwnedGroupIds}). Empty when the course is absent.
     */
    @Query("select c.teacher.id from Course c where c.id = :courseId")
    Optional<Long> findTeacherIdByCourseId(@Param("courseId") Long courseId);
}
