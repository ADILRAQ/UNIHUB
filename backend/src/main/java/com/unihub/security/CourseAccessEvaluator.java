package com.unihub.security;

import com.unihub.repository.CourseRepository;
import com.unihub.repository.EventRepository;
import com.unihub.repository.ScheduleTemplateRepository;
import com.unihub.repository.SessionRepository;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * SpEL-callable authorization helper (bean name {@code courseAccess}) backing the data-scoped
 * {@code @PreAuthorize} rules for the scheduling API (UNIH-30) — the teacher-owns-this checks
 * that a plain role test can't express. Mirrors {@link ClassGroupAccessEvaluator}: the single
 * DB-lookup path lives here rather than duplicated across SpEL strings.
 *
 * <p>Ownership is always resolved to the owning course's {@code teacher.id} via a projection
 * query (no lazy navigation, since {@code @PreAuthorize} runs outside an open transaction) and
 * compared to the caller's id. Admins bypass these by the {@code hasRole('ADMIN') or ...} arm
 * of each rule, so this component only ever answers the teacher case.
 *
 * <p>{@code ownsSession} is the reviewer-mandated gate: {@code SessionGenerationService}'s
 * {@code cancelSession}/{@code rescheduleSession} take a raw session id with no ownership check,
 * so the controller must confirm the caller owns the session's course before invoking them.
 */
@Component("courseAccess")
public class CourseAccessEvaluator {

    private final CourseRepository courseRepository;
    private final ScheduleTemplateRepository scheduleTemplateRepository;
    private final SessionRepository sessionRepository;
    private final EventRepository eventRepository;

    public CourseAccessEvaluator(CourseRepository courseRepository,
                                 ScheduleTemplateRepository scheduleTemplateRepository,
                                 SessionRepository sessionRepository,
                                 EventRepository eventRepository) {
        this.courseRepository = courseRepository;
        this.scheduleTemplateRepository = scheduleTemplateRepository;
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
    }

    /** @return true if the caller is the teacher who owns {@code courseId}. */
    public boolean ownsCourse(Authentication authentication, Long courseId) {
        return ownedBy(authentication, courseId, courseRepository::findTeacherIdByCourseId);
    }

    /** @return true if the caller owns the course the template belongs to. */
    public boolean ownsTemplate(Authentication authentication, Long templateId) {
        return ownedBy(authentication, templateId,
                scheduleTemplateRepository::findCourseTeacherIdByTemplateId);
    }

    /** @return true if the caller owns the course the session belongs to. */
    public boolean ownsSession(Authentication authentication, Long sessionId) {
        return ownedBy(authentication, sessionId,
                sessionRepository::findCourseTeacherIdBySessionId);
    }

    /**
     * @return true if the caller owns the course the event is attached to. An event with no
     *         course (department-wide) is never teacher-owned, so this returns false.
     */
    public boolean ownsEvent(Authentication authentication, Long eventId) {
        return ownedBy(authentication, eventId, eventRepository::findCourseTeacherIdByEventId);
    }

    /**
     * Shared shape: resolve the caller, resolve the entity's owning-teacher id via
     * {@code teacherIdResolver}, and compare. False for a non-{@link AuthenticatedUser}
     * principal, a null id, or a missing/course-less target — which the {@code @PreAuthorize}
     * turns into a 403 (or the controller into a 404 once it looks the entity up).
     */
    private boolean ownedBy(Authentication authentication, Long id,
                            java.util.function.Function<Long, Optional<Long>> teacherIdResolver) {
        if (authentication == null || id == null) {
            return false;
        }
        if (!(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return false;
        }
        return teacherIdResolver.apply(id)
                .map(teacherId -> teacherId.equals(user.userId()))
                .orElse(false);
    }
}
