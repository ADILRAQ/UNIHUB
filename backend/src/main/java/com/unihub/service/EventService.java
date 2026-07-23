package com.unihub.service;

import com.unihub.dto.CreateEventRequest;
import com.unihub.dto.EventDto;
import com.unihub.dto.UpdateEventRequest;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.mapper.SchedulingMapper;
import com.unihub.model.ClassGroup;
import com.unihub.model.Course;
import com.unihub.model.Event;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.repository.CourseRepository;
import com.unihub.repository.EventRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.security.AuthenticatedUser;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-off events (exams / deadlines / events). Reads are scoped to the caller (admin: all;
 * teacher: own-course events + department-wide; student: their groups' events + department-wide).
 * A TEACHER may only create an event bound to a course they own — checked here, since the
 * ownership target ({@code courseId}) is inside the request body, not the URL. Edit/delete
 * ownership is gated at the controller via {@code @courseAccess.ownsEvent}.
 */
@Service
public class EventService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private final EventRepository eventRepository;
    private final CourseRepository courseRepository;
    private final ClassGroupRepository classGroupRepository;
    private final UserClassGroupRepository userClassGroupRepository;

    public EventService(EventRepository eventRepository,
                        CourseRepository courseRepository,
                        ClassGroupRepository classGroupRepository,
                        UserClassGroupRepository userClassGroupRepository) {
        this.eventRepository = eventRepository;
        this.courseRepository = courseRepository;
        this.classGroupRepository = classGroupRepository;
        this.userClassGroupRepository = userClassGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<EventDto> listEvents(LocalDate from, LocalDate to, AuthenticatedUser caller) {
        ScheduleRange.validate(from, to);
        List<Event> events = switch (caller.role()) {
            case ROLE_ADMIN -> eventRepository.findByEventDateBetween(from, to);
            case ROLE_TEACHER -> eventRepository.findTeacherEventsInRange(from, to, caller.userId());
            default -> {
                List<Long> groupIds = userClassGroupRepository.findGroupIdsByUserId(caller.userId());
                yield eventRepository.findStudentEventsInRange(from, to, groupIds);
            }
        };
        return events.stream()
                .sorted(Comparator.comparing(Event::getEventDate)
                        .thenComparing(Event::getStartTime, Comparator.nullsFirst(Comparator.naturalOrder())))
                .map(SchedulingMapper::toEventDto)
                .toList();
    }

    @Transactional
    public EventDto createEvent(CreateEventRequest request, AuthenticatedUser caller) {
        validateTimes(request.startTime(), request.endTime());

        Course course = null;
        if (request.courseId() != null) {
            course = courseRepository.findById(request.courseId())
                    .orElseThrow(() -> new BadRequestException("Course " + request.courseId() + " not found."));
        }

        // A teacher may only attach an event to a course they own, and may not create a
        // course-less (department-wide) event — that is an admin action.
        if (ROLE_TEACHER.equals(caller.role())) {
            if (course == null) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Teachers may only create events for their own courses.");
            }
            if (!course.getTeacher().getId().equals(caller.userId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You do not own course " + course.getId() + ".");
            }
        }

        ClassGroup group = null;
        if (request.classGroupId() != null) {
            group = classGroupRepository.findById(request.classGroupId())
                    .orElseThrow(() -> new BadRequestException(
                            "Class group " + request.classGroupId() + " not found."));
        }

        // A teacher may not aim an event at a class group they don't teach: when they supply a
        // classGroupId it must be the owned course's own group. Without this a teacher could make
        // an event visible to an arbitrary group's schedule. Admins are unrestricted.
        if (ROLE_TEACHER.equals(caller.role()) && group != null
                && !group.getId().equals(course.getClassGroup().getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You may only target class group " + course.getClassGroup().getId()
                            + " for this course.");
        }

        Event event = new Event();
        event.setTitle(request.title().trim());
        event.setType(request.type());
        event.setEventDate(request.eventDate());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setCourse(course);
        event.setClassGroup(group);
        event.setDescription(trimToNull(request.description()));
        return SchedulingMapper.toEventDto(eventRepository.save(event));
    }

    @Transactional
    public EventDto updateEvent(Long id, UpdateEventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event " + id + " not found"));

        if (request.title() != null) {
            String trimmed = request.title().trim();
            if (trimmed.isEmpty()) {
                throw new BadRequestException("Event title must not be blank.");
            }
            event.setTitle(trimmed);
        }
        if (request.type() != null) {
            event.setType(request.type());
        }
        if (request.eventDate() != null) {
            event.setEventDate(request.eventDate());
        }
        if (request.startTime() != null) {
            event.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            event.setEndTime(request.endTime());
        }
        if (request.description() != null) {
            event.setDescription(trimToNull(request.description()));
        }
        validateTimes(event.getStartTime(), event.getEndTime());
        return SchedulingMapper.toEventDto(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event " + id + " not found"));
        eventRepository.delete(event);
    }

    /** When both are present, end must be after start; either may be null (all-day / open-ended). */
    private void validateTimes(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time.");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
