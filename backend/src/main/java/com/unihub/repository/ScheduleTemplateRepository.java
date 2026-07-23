package com.unihub.repository;

import com.unihub.model.ScheduleTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScheduleTemplateRepository extends JpaRepository<ScheduleTemplate, Long> {

    List<ScheduleTemplate> findByCourse_Id(Long courseId);

    List<ScheduleTemplate> findByActiveTrue();

    /**
     * The owning teacher's id for a template's course, as a projection for the
     * {@code @courseAccess.ownsTemplate} evaluator (no lazy nav outside a transaction).
     * Empty when the template is absent.
     */
    @Query("select t.course.teacher.id from ScheduleTemplate t where t.id = :templateId")
    Optional<Long> findCourseTeacherIdByTemplateId(@Param("templateId") Long templateId);
}
