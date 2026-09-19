package com.unihub.controller;

import com.unihub.dto.CancelSessionRequest;
import com.unihub.dto.NextSessionDto;
import com.unihub.dto.RescheduleSessionRequest;
import com.unihub.dto.SessionDto;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.SessionService;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

/**
 * Per-occurrence session endpoints: cancel, reschedule, and the dashboard "next session" query.
 *
 * <p>Cancel/reschedule: ADMIN or the teacher who owns the session's course
 * ({@code @courseAccess.ownsSession}). Logic lives in {@link SessionService} and the underlying
 * generation engine.
 *
 * <p>Next session: open to any authenticated caller; scoping (student/teacher/admin) is applied
 * in the service layer.
 */
@Tag(name = "Calendar & Scheduling")
@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    /**
     * Returns the next upcoming (non-cancelled) session for the authenticated caller.
     * Student: the next session for any of their class groups.
     * Teacher: the next session of any of their own courses.
     * Admin: the next session across all courses.
     *
     * @return 200 with the session, or 204 No Content when there are no upcoming sessions.
     */
    @GetMapping("/next")
    public ResponseEntity<NextSessionDto> getNextSession(
            @AuthenticationPrincipal AuthenticatedUser caller) {
        Optional<NextSessionDto> next = sessionService.getNextSession(caller);
        return next.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.noContent().build());
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or @courseAccess.ownsSession(authentication, #id)")
    public SessionDto cancelSession(@PathVariable Long id,
                                    @RequestBody(required = false) CancelSessionRequest request) {
        String note = request != null ? request.note() : null;
        return sessionService.cancelSession(id, note);
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('ADMIN') or @courseAccess.ownsSession(authentication, #id)")
    public SessionDto rescheduleSession(@PathVariable Long id,
                                        @Valid @RequestBody RescheduleSessionRequest request) {
        return sessionService.rescheduleSession(id, request);
    }
}
