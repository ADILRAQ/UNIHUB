package com.unihub.service;

import com.unihub.dto.ScheduleItemDto;
import com.unihub.mapper.SchedulingMapper;
import com.unihub.model.Event;
import com.unihub.model.Session;
import com.unihub.repository.EventRepository;
import com.unihub.repository.SessionRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.security.AuthenticatedUser;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The personalized "my schedule" feed: sessions and one-off events for the caller's scope in a
 * date range, merged into one flat list sorted chronologically. Returned as a unified
 * {@link ScheduleItemDto} list (a single sorted list, preferred for a calendar) rather than
 * two separate arrays.
 *
 * <h2>Scoping per role</h2>
 * <ul>
 *   <li><b>ADMIN</b> — every session and event in range.</li>
 *   <li><b>TEACHER</b> — sessions of their own courses; events attached to their own courses
 *       plus department-wide events (no class group).</li>
 *   <li><b>STUDENT</b> — sessions of courses whose class group they belong to; events targeted
 *       at their groups plus department-wide events.</li>
 * </ul>
 *
 * <h2>Semantics</h2>
 * Cancelled sessions still appear, flagged {@code CANCELLED} with their change note (AC).
 * Each session carries a resolved Meet link (per-session override, else course link) so the
 * Join button always has a URL. Sort order: {@code date} ascending, then {@code startTime}
 * ascending with all-day / no-time entries first within a day.
 */
@Service
public class ScheduleService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private static final Comparator<ScheduleItemDto> CHRONOLOGICAL =
            Comparator.comparing(ScheduleItemDto::date)
                    .thenComparing(ScheduleItemDto::startTime,
                            Comparator.nullsFirst(Comparator.naturalOrder()));

    private final SessionRepository sessionRepository;
    private final EventRepository eventRepository;
    private final UserClassGroupRepository userClassGroupRepository;

    public ScheduleService(SessionRepository sessionRepository,
                           EventRepository eventRepository,
                           UserClassGroupRepository userClassGroupRepository) {
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
        this.userClassGroupRepository = userClassGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<ScheduleItemDto> getSchedule(LocalDate from, LocalDate to, AuthenticatedUser caller) {
        ScheduleRange.validate(from, to);

        List<Session> sessions;
        List<Event> events;
        switch (caller.role()) {
            case ROLE_ADMIN -> {
                sessions = sessionRepository.findBySessionDateBetween(from, to);
                events = eventRepository.findByEventDateBetween(from, to);
            }
            case ROLE_TEACHER -> {
                sessions = sessionRepository.findByCourse_Teacher_IdAndSessionDateBetween(
                        caller.userId(), from, to);
                events = eventRepository.findTeacherEventsInRange(from, to, caller.userId());
            }
            default -> {
                List<Long> groupIds = userClassGroupRepository.findGroupIdsByUserId(caller.userId());
                sessions = groupIds.isEmpty()
                        ? List.of()
                        : sessionRepository.findByCourse_ClassGroup_IdInAndSessionDateBetween(
                                groupIds, from, to);
                events = eventRepository.findStudentEventsInRange(from, to, groupIds);
            }
        }

        List<ScheduleItemDto> items = new ArrayList<>(sessions.size() + events.size());
        for (Session session : sessions) {
            items.add(SchedulingMapper.toScheduleItem(session));
        }
        for (Event event : events) {
            items.add(SchedulingMapper.toScheduleItem(event));
        }
        items.sort(CHRONOLOGICAL);
        return items;
    }
}
