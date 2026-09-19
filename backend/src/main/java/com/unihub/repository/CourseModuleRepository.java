package com.unihub.repository;

import com.unihub.model.CourseModule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    List<CourseModule> findByCourseIdOrderByDisplayOrderAsc(Long courseId);

    /** Returns the number of modules belonging to the given course. */
    long countByCourse_Id(Long courseId);

    /**
     * Bulk count of modules per course — returns one {@code [courseId, count]} row per course
     * that has at least one module. Courses with zero modules are absent from the result; callers
     * should use {@code getOrDefault(id, 0)} when building the count map.
     */
    @Query("SELECT m.course.id, COUNT(m) FROM CourseModule m WHERE m.course.id IN :ids GROUP BY m.course.id")
    List<Object[]> countByCourseIds(@Param("ids") List<Long> ids);
}
