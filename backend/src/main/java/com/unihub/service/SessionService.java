package com.unihub.service;

import com.unihub.config.DepartmentZone;
import com.unihub.dto.NextSessionDto;
import com.unihub.dto.RescheduleSessionRequest;
import com.unihub.dto.SessionDto;
import com.unihub.mapper.SchedulingMapper;
import com.unihub.model.Session;
import com.unihub.repository.SessionRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.security.AuthenticatedUser;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Per-occurrence session exceptions (cancel / reschedule) and dashboard next-session query.
 *
 * <p>Cancel/reschedule: delegates to the UNIH-29 {@link SessionGenerationService} engine which
 * owns the off-date and unique-slot rules; this service maps the result to a DTO.
 *
 * <p>Ownership (ADMIN or the teacher who owns the session's course) is enforced at the
 * controller via {@code @courseAccess.ownsSession} — the engine itself takes a raw session id
 * with no ownership check, so that gate is mandatory.
 *
 * <p>Next session: returns the earliest non-cancelled upcoming session scoped to the caller
 * (student → their class groups; teacher → their courses; admin → any).
 */
@Service
public class SessionService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private final SessionGenerationService sessionGenerationService;
    private final SessionRepository sessionRepository;
    private final UserClassGroupRepository userClassGroupRepository;

    public SessionService(SessionGenerationService sessionGenerationService,
                          SessionRepository sessionRepository,
                          UserClassGroupRepository userClassGroupRepository) {
        this.sessionGenerationService = sessionGenerationService;
        this.sessionRepository = sessionRepository;
        this.userClassGroupRepository = userClassGroupRepository;
    }

    @Transactional
    public SessionDto cancelSession(Long sessionId, String note) {
        Session cancelled = sessionGenerationService.cancelSession(sessionId, note);
        return SchedulingMapper.toSessionDto(cancelled);
    }

    @Transactional
    public SessionDto rescheduleSession(Long sessionId, RescheduleSessionRequest request) {
        Session moved = sessionGenerationService.rescheduleSession(
                sessionId,
                request.newDate(),
                request.startTime(),
                request.endTime(),
                request.room(),
                request.note());
        return SchedulingMapper.toSessionDto(moved);
    }

    /**
     * Returns the next non-cancelled upcoming session for the authenticated caller, or
     * {@link Optional#empty()} when none exists.
     *
     * <ul>
     *   <li>STUDENT — earliest upcoming session for any of their class groups' courses.</li>
     *   <li>TEACHER — earliest upcoming session for any of their own courses.</li>
     *   <li>ADMIN  — earliest upcoming session across all courses.</li>
     * </ul>
     */
    @Transactional(readOnly = true)
    public Optional<NextSessionDto> getNextSession(AuthenticatedUser caller) {
        LocalDate today = LocalDate.now(DepartmentZone.ZONE);
        LocalTime now = LocalTime.now(DepartmentZone.ZONE);
        PageRequest one = PageRequest.of(0, 1);

        List<Session> results = switch (caller.role()) {
            case ROLE_ADMIN -> sessionRepository.findNextForAdmin(today, now, one);
            case ROLE_TEACHER -> sessionRepository.findNextForTeacher(caller.userId(), today, now, one);
            default -> {
                List<Long> groupIds = userClassGroupRepository.findGroupIdsByUserId(caller.userId());
                yield groupIds.isEmpty()
                        ? List.of()
                        : sessionRepository.findNextForGroups(groupIds, today, now, one);
            }
        };

        return results.isEmpty() ? Optional.empty() : Optional.of(toNextSessionDto(results.get(0)));
    }

    private static NextSessionDto toNextSessionDto(Session s) {
        return new NextSessionDto(
                s.getId(),
                s.getCourse().getName(),
                s.getSessionDate(),
                s.getStartTime(),
                s.getEndTime(),
                s.getRoom(),
                SchedulingMapper.resolveMeetLink(s),
                s.getCourse().getId());
    }
}
