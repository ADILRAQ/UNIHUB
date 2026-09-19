package com.unihub.mapper;

import com.unihub.dto.CourseDto;
import com.unihub.dto.EventDto;
import com.unihub.dto.ScheduleItemDto;
import com.unihub.dto.ScheduleItemKind;
import com.unihub.dto.ScheduleTemplateDto;
import com.unihub.dto.SessionDto;
import com.unihub.model.Course;
import com.unihub.model.Event;
import com.unihub.model.ScheduleTemplate;
import com.unihub.model.Session;

/**
 * Entity to DTO conversions for the scheduling API (UNIH-30). Pure static helpers (matching
 * {@link AdminMapper}) so no JPA entity leaks past the service boundary. All accessors are
 * invoked inside a transactional service so the lazy {@code course}/{@code teacher}/
 * {@code classGroup} associations resolve.
 */
public final class SchedulingMapper {

    private SchedulingMapper() {
    }

    public static CourseDto toCourseDto(Course course, int moduleCount) {
        return new CourseDto(
                course.getId(),
                course.getName(),
                course.getTeacher().getId(),
                course.getTeacher().getFullName(),
                course.getClassGroup().getId(),
                course.getClassGroup().getName(),
                course.getMeetLink(),
                moduleCount,
                course.getCreatedAt());
    }

    public static ScheduleTemplateDto toTemplateDto(ScheduleTemplate template) {
        return new ScheduleTemplateDto(
                template.getId(),
                template.getCourse().getId(),
                template.getDayOfWeek(),
                template.getStartTime(),
                template.getEndTime(),
                template.getRoom(),
                template.getStartDate(),
                template.getEndDate(),
                template.isActive(),
                template.getCreatedAt());
    }

    /**
     * Resolves the Meet link for the frontend Join button: the per-session override when set,
     * otherwise the course link.
     */
    public static String resolveMeetLink(Session session) {
        return session.getMeetLink() != null ? session.getMeetLink() : session.getCourse().getMeetLink();
    }

    public static SessionDto toSessionDto(Session session) {
        Course course = session.getCourse();
        return new SessionDto(
                session.getId(),
                course.getId(),
                course.getName(),
                session.getSessionDate(),
                session.getStartTime(),
                session.getEndTime(),
                session.getRoom(),
                resolveMeetLink(session),
                session.getStatus().name(),
                session.getOriginalDate(),
                session.getChangeNote());
    }

    public static EventDto toEventDto(Event event) {
        Course course = event.getCourse();
        return new EventDto(
                event.getId(),
                event.getTitle(),
                event.getType().name(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                course != null ? course.getId() : null,
                course != null ? course.getName() : null,
                event.getClassGroup() != null ? event.getClassGroup().getId() : null,
                event.getClassGroup() != null ? event.getClassGroup().getName() : null,
                event.getDescription(),
                event.getCreatedAt());
    }

    public static ScheduleItemDto toScheduleItem(Session session) {
        Course course = session.getCourse();
        return new ScheduleItemDto(
                ScheduleItemKind.SESSION,
                session.getId(),
                session.getSessionDate(),
                session.getStartTime(),
                session.getEndTime(),
                course.getName(),
                course.getId(),
                course.getName(),
                session.getRoom(),
                resolveMeetLink(session),
                session.getStatus().name(),
                session.getOriginalDate(),
                session.getChangeNote(),
                null,
                course.getClassGroup().getId(),
                course.getClassGroup().getName());
    }

    public static ScheduleItemDto toScheduleItem(Event event) {
        Course course = event.getCourse();
        return new ScheduleItemDto(
                ScheduleItemKind.EVENT,
                event.getId(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                event.getTitle(),
                course != null ? course.getId() : null,
                course != null ? course.getName() : null,
                null,
                null,
                null,
                null,
                event.getDescription(),
                event.getType().name(),
                event.getClassGroup() != null ? event.getClassGroup().getId() : null,
                event.getClassGroup() != null ? event.getClassGroup().getName() : null);
    }
}
