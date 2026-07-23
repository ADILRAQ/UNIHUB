package com.unihub.repository;

import com.unihub.model.Event;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByEventDateBetween(LocalDate start, LocalDate end);

    List<Event> findByClassGroup_Id(Long classGroupId);

    /**
     * Events in range visible to a teacher: department-wide entries (no class group) plus
     * events attached to a course they own. Explicit LEFT JOINs keep the department-wide rows
     * (null course / null group) from being filtered out by the OR predicate.
     */
    @Query("select e from Event e left join e.course c left join c.teacher t "
            + "where e.eventDate between :start and :end "
            + "and (e.classGroup is null or t.id = :teacherId)")
    List<Event> findTeacherEventsInRange(@Param("start") LocalDate start,
                                         @Param("end") LocalDate end,
                                         @Param("teacherId") Long teacherId);

    /**
     * Events in range visible to a student: department-wide entries (no class group) plus
     * events targeted at any of the student's class groups. The LEFT JOIN preserves the
     * department-wide (null group) rows.
     */
    @Query("select e from Event e left join e.classGroup g "
            + "where e.eventDate between :start and :end "
            + "and (g is null or g.id in :groupIds)")
    List<Event> findStudentEventsInRange(@Param("start") LocalDate start,
                                         @Param("end") LocalDate end,
                                         @Param("groupIds") Collection<Long> groupIds);

    /**
     * The owning teacher's id for an event's course, as a projection for the
     * {@code @courseAccess.ownsEvent} evaluator. The path navigation inner-joins the course,
     * so an event with no course (department-wide, admin-owned) yields empty — a teacher can
     * never own a course-less event.
     */
    @Query("select e.course.teacher.id from Event e where e.id = :eventId")
    Optional<Long> findCourseTeacherIdByEventId(@Param("eventId") Long eventId);
}
