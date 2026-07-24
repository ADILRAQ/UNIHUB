package com.unihub.controller;

import com.unihub.dto.CancelSessionRequest;
import com.unihub.dto.RescheduleSessionRequest;
import com.unihub.dto.SessionDto;
import com.unihub.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Per-occurrence session exceptions: cancel and reschedule. Access is ADMIN or the teacher who
 * owns the session's course ({@code @courseAccess.ownsSession}) — the mandatory ownership gate
 * over the engine, which mutates by raw session id with no check of its own. Logic (and the
 * off-date / unique-slot rules that yield 400/409) lives in {@link SessionService} and the
 * underlying generation engine.
 */
@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public SessionDto cancelSession(@PathVariable Long id,
                                    @RequestBody(required = false) CancelSessionRequest request) {
        String note = request != null ? request.note() : null;
        return sessionService.cancelSession(id, note);
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public SessionDto rescheduleSession(@PathVariable Long id,
                                        @Valid @RequestBody RescheduleSessionRequest request) {
        return sessionService.rescheduleSession(id, request);
    }
}
