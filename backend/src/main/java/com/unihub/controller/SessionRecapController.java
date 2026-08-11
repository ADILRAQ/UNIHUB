package com.unihub.controller;

import com.unihub.dto.SessionRecapDto;
import com.unihub.dto.SessionRecapUpdateRequest;
import com.unihub.dto.SessionSummaryDto;
import com.unihub.service.SessionRecapService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Session recap endpoints (UNIH-37).
 *
 * <p>Access control summary:
 * <ul>
 *   <li>{@code PUT /api/sessions/{sessionId}/recap} — ADMIN or the teacher who owns
 *       the session's course ({@code @courseAccess.ownsSession}).</li>
 *   <li>{@code GET /api/sessions/{sessionId}/recap} — ADMIN, the owning teacher, or a
 *       student enrolled in the session's course's class group ({@code @courseAccess.canViewSession}).</li>
 *   <li>{@code GET /api/courses/{courseId}/sessions?past=true} — same rule, resolved at
 *       the course level ({@code @courseAccess.canViewCourse}).</li>
 * </ul>
 *
 * <p>Business logic lives in {@link SessionRecapService}; this controller handles only
 * routing, access gating, and HTTP semantics.
 */
@RestController
public class SessionRecapController {

    private final SessionRecapService sessionRecapService;

    public SessionRecapController(SessionRecapService sessionRecapService) {
        this.sessionRecapService = sessionRecapService;
    }

    /**
     * Full-replace update of a session recap (recording URL, sanitized notes, and linked
     * resources/assignments). Any field may be null; the service treats null as "clear".
     */
    @PutMapping("/api/sessions/{sessionId}/recap")
    @PreAuthorize("hasRole('ADMIN') or @courseAccess.ownsSession(authentication, #sessionId)")
    public SessionRecapDto updateRecap(@PathVariable Long sessionId,
                                       @RequestBody SessionRecapUpdateRequest request) {
        return sessionRecapService.updateRecap(sessionId, request);
    }

    /**
     * Returns the full recap for a session. Accessible to the owning teacher, any enrolled
     * student, and admins. Returns 200 with null fields when no recap has been saved yet.
     */
    @GetMapping("/api/sessions/{sessionId}/recap")
    @PreAuthorize("hasRole('ADMIN') "
            + "or @courseAccess.ownsSession(authentication, #sessionId) "
            + "or @courseAccess.canViewSession(authentication, #sessionId)")
    public SessionRecapDto getRecap(@PathVariable Long sessionId) {
        return sessionRecapService.getRecap(sessionId);
    }

    /**
     * Lists sessions for a course filtered by the {@code past} flag.
     * When {@code past=true} returns sessions whose date is before today, ordered
     * newest-first, each with a {@code hasRecap} indicator.
     *
     * <p>The {@code past} parameter is required; callers that omit it get a 400 from
     * Spring's {@code @RequestParam} binding.
     */
    @GetMapping("/api/courses/{courseId}/sessions")
    @PreAuthorize("hasRole('ADMIN') "
            + "or @courseAccess.ownsCourse(authentication, #courseId) "
            + "or @courseAccess.canViewCourse(authentication, #courseId)")
    public ResponseEntity<List<SessionSummaryDto>> getCourseSessions(
            @PathVariable Long courseId,
            @RequestParam boolean past) {

        if (!past) {
            // Future/current session listing is out of scope for UNIH-37.
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(sessionRecapService.getPastSessions(courseId));
    }
}
