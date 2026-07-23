package com.unihub.service;

import com.unihub.dto.RescheduleSessionRequest;
import com.unihub.dto.SessionDto;
import com.unihub.mapper.SchedulingMapper;
import com.unihub.model.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Per-occurrence session exceptions (cancel / reschedule) at the API boundary. The actual
 * mutation is delegated to the UNIH-29 {@link SessionGenerationService} engine (which owns the
 * off-date and unique-slot rules and throws {@code BadRequest}/{@code Conflict} for the global
 * handler to map); this service only maps the result to a {@link SessionDto}.
 *
 * <p>Ownership (ADMIN or the teacher who owns the session's course) is enforced at the
 * controller via {@code @courseAccess.ownsSession} — the engine itself takes a raw session id
 * with no ownership check, so that gate is mandatory.
 */
@Service
public class SessionService {

    private final SessionGenerationService sessionGenerationService;

    public SessionService(SessionGenerationService sessionGenerationService) {
        this.sessionGenerationService = sessionGenerationService;
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
}
