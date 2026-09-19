package com.unihub.repository;

import com.unihub.model.Session;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findBySessionDateBetween(LocalDate start, LocalDate end);

    List<Session> findByCourse_IdAndSessionDateBetween(Long courseId, LocalDate start, LocalDate end);

    /** Sessions in range for the courses a teacher owns — the teacher's schedule scope. */
    List<Session> findByCourse_Teacher_IdAndSessionDateBetween(Long teacherId, LocalDate start, LocalDate end);

    /** Sessions in range for the courses of the given class groups — the student's schedule scope. */
    List<Session> findByCourse_ClassGroup_IdInAndSessionDateBetween(
            Collection<Long> classGroupIds, LocalDate start, LocalDate end);

    /** All sessions ever generated from a template — the reconciliation input for regeneration (UNIH-29). */
    List<Session> findByTemplate_Id(Long templateId);

    /** Idempotency check for template regeneration (UNIH-29); backed by uq_sessions_template_date. */
    boolean existsByTemplate_IdAndSessionDate(Long templateId, LocalDate sessionDate);

    /**
     * The owning teacher's id for a session's course, as a projection for the
     * {@code @courseAccess.ownsSession} evaluator — the reviewer-mandated ownership gate over
     * the engine's raw-sessionId cancel/reschedule. Empty when the session is absent.
     */
    @Query("select s.course.teacher.id from Session s where s.id = :sessionId")
    Optional<Long> findCourseTeacherIdBySessionId(@Param("sessionId") Long sessionId);

    /**
     * The class group id of a session's course — used by the {@code canViewSession} evaluator
     * so a student's membership in that group can be verified without navigating lazy
     * associations (which would fail outside an open persistence session).
     */
    @Query("select s.course.classGroup.id from Session s where s.id = :sessionId")
    Optional<Long> findClassGroupIdBySessionId(@Param("sessionId") Long sessionId);

    /**
     * All sessions for a course whose date is strictly before {@code today}, ordered newest
     * first. Used by the {@code GET /api/courses/{courseId}/sessions?past=true} endpoint.
     * The {@code course} association is eagerly joined so session-to-course navigation in the
     * mapping step does not trigger additional queries.
     */
    @Query("select s from Session s join fetch s.course c where c.id = :courseId and s.sessionDate < :today order by s.sessionDate desc")
    List<Session> findPastSessionsByCourseId(@Param("courseId") Long courseId,
                                             @Param("today") LocalDate today);

    // -------------------------------------------------------------------------
    // Dashboard: next upcoming session per caller scope
    // -------------------------------------------------------------------------

    /**
     * The next non-cancelled session for a student — the first upcoming occurrence
     * across all courses of the given class groups. Uses Pageable so the caller
     * passes {@code PageRequest.of(0, 1)} to retrieve only one row.
     */
    @Query("select s from Session s join fetch s.course c "
            + "where c.classGroup.id in :groupIds "
            + "and s.sessionDate >= :today "
            + "and s.status <> com.unihub.model.SessionStatus.CANCELLED "
            + "order by s.sessionDate asc, s.startTime asc")
    List<Session> findNextForGroups(@Param("groupIds") Collection<Long> groupIds,
                                    @Param("today") LocalDate today,
                                    Pageable pageable);

    /**
     * The next non-cancelled session for a teacher — the first upcoming occurrence
     * across all courses they teach. Uses Pageable so the caller passes
     * {@code PageRequest.of(0, 1)} to retrieve only one row.
     */
    @Query("select s from Session s join fetch s.course c "
            + "where c.teacher.id = :teacherId "
            + "and s.sessionDate >= :today "
            + "and s.status <> com.unihub.model.SessionStatus.CANCELLED "
            + "order by s.sessionDate asc, s.startTime asc")
    List<Session> findNextForTeacher(@Param("teacherId") Long teacherId,
                                     @Param("today") LocalDate today,
                                     Pageable pageable);

    /**
     * The next non-cancelled session across all courses (admin view). Uses Pageable so the
     * caller passes {@code PageRequest.of(0, 1)} to retrieve only one row.
     */
    @Query("select s from Session s join fetch s.course c "
            + "where s.sessionDate >= :today "
            + "and s.status <> com.unihub.model.SessionStatus.CANCELLED "
            + "order by s.sessionDate asc, s.startTime asc")
    List<Session> findNextForAdmin(@Param("today") LocalDate today, Pageable pageable);
}
