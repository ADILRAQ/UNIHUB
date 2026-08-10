package com.unihub.service;

import com.unihub.dto.SessionRecapDto;
import com.unihub.dto.SessionRecapUpdateRequest;
import com.unihub.dto.SessionSummaryDto;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.Assignment;
import com.unihub.model.Resource;
import com.unihub.model.Session;
import com.unihub.repository.AssignmentRepository;
import com.unihub.repository.ResourceRepository;
import com.unihub.repository.SessionRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for session recaps (UNIH-37).
 *
 * <p>Access rules enforced here (after the coarse {@code @PreAuthorize} gate):
 * <ul>
 *   <li>Write ({@link #updateRecap}): teacher must own the session's course — already
 *       enforced by {@code @courseAccess.ownsSession} at the controller; no re-check
 *       needed here.</li>
 *   <li>Read ({@link #getRecap}): ADMIN always allowed; TEACHER must own the session's
 *       course; STUDENT must belong to the session's course's class group. The controller
 *       uses {@code @PreAuthorize} SpEL for this, so this method can trust the caller is
 *       already authorized.</li>
 * </ul>
 *
 * <p>Linked resources are validated to belong to the session's course (any module).
 * Linked assignments are validated to belong to the session's course.
 */
@Service
public class SessionRecapService {

    private final SessionRepository sessionRepository;
    private final ResourceRepository resourceRepository;
    private final AssignmentRepository assignmentRepository;
    private final HtmlSanitizer htmlSanitizer;

    public SessionRecapService(SessionRepository sessionRepository,
                               ResourceRepository resourceRepository,
                               AssignmentRepository assignmentRepository,
                               HtmlSanitizer htmlSanitizer) {
        this.sessionRepository = sessionRepository;
        this.resourceRepository = resourceRepository;
        this.assignmentRepository = assignmentRepository;
        this.htmlSanitizer = htmlSanitizer;
    }

    /**
     * Persists a full-replace recap update. Sanitizes notes server-side, then replaces
     * the linked resources and assignments collections. {@code recap_updated_at} is stamped
     * to NOW() so the summary list endpoint can surface the {@code hasRecap} indicator.
     *
     * @param sessionId the session to update
     * @param req       the new recap content (any field may be null)
     * @return the saved recap as a DTO
     */
    @Transactional
    public SessionRecapDto updateRecap(Long sessionId, SessionRecapUpdateRequest req) {
        Session session = requireSession(sessionId);
        Long courseId = session.getCourse().getId();

        // Sanitize notes (null → null, non-blank → sanitized HTML).
        String sanitizedNotes = htmlSanitizer.sanitizeOptional(req.notesHtml());

        // Resolve and validate linked resources — they must belong to the session's course.
        List<Resource> resources = resolveResources(req.linkedResourceIds(), courseId);

        // Resolve and validate linked assignments — they must belong to the session's course.
        List<Assignment> assignments = resolveAssignments(req.linkedAssignmentIds(), courseId);

        session.setRecordingUrl(req.recordingUrl());
        session.setNotesHtml(sanitizedNotes);
        session.setRecapUpdatedAt(Instant.now());
        session.setRecapResources(resources);
        session.setRecapAssignments(assignments);

        Session saved = sessionRepository.save(session);
        return toRecapDto(saved);
    }

    /**
     * Returns the full recap for a session. The caller's authorization is already
     * guaranteed by the controller's {@code @PreAuthorize} — this method performs no
     * further access checks.
     *
     * @param sessionId the session whose recap to read
     * @return recap DTO (all fields may be null/empty if no recap has been saved yet)
     */
    @Transactional(readOnly = true)
    public SessionRecapDto getRecap(Long sessionId) {
        Session session = requireSession(sessionId);
        return toRecapDto(session);
    }

    /**
     * Returns all past sessions for a course with a {@code hasRecap} flag on each.
     * "Past" means {@code session_date < today}. The caller's authorization is already
     * guaranteed by the controller's {@code @PreAuthorize}.
     *
     * @param courseId the course to list
     * @return list ordered newest-first, may be empty
     */
    @Transactional(readOnly = true)
    public List<SessionSummaryDto> getPastSessions(Long courseId) {
        List<Session> sessions = sessionRepository.findPastSessionsByCourseId(courseId, LocalDate.now());
        return sessions.stream()
                .map(SessionRecapService::toSummaryDto)
                .toList();
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private Session requireSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session " + sessionId + " not found"));
    }

    /**
     * Resolves resource ids to entities. Validates that every resource belongs to a module
     * of the given course — a teacher must not be able to pin resources from another course.
     */
    private List<Resource> resolveResources(List<Long> ids, Long courseId) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        List<Resource> found = resourceRepository.findAllById(ids);
        if (found.size() != ids.size()) {
            throw new ResourceNotFoundException("One or more linked resources were not found");
        }
        for (Resource r : found) {
            if (!r.getModule().getCourse().getId().equals(courseId)) {
                throw new BadRequestException(
                        "Resource " + r.getId() + " does not belong to this session's course");
            }
        }
        return found;
    }

    /**
     * Resolves assignment ids to entities. Validates that every assignment belongs to the
     * given course.
     */
    private List<Assignment> resolveAssignments(List<Long> ids, Long courseId) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        List<Assignment> found = assignmentRepository.findAllById(ids);
        if (found.size() != ids.size()) {
            throw new ResourceNotFoundException("One or more linked assignments were not found");
        }
        for (Assignment a : found) {
            if (!a.getCourse().getId().equals(courseId)) {
                throw new BadRequestException(
                        "Assignment " + a.getId() + " does not belong to this session's course");
            }
        }
        return found;
    }

    private static SessionRecapDto toRecapDto(Session session) {
        List<Long> resourceIds = session.getRecapResources().stream()
                .map(Resource::getId)
                .toList();
        List<Long> assignmentIds = session.getRecapAssignments().stream()
                .map(Assignment::getId)
                .toList();
        return new SessionRecapDto(
                session.getId(),
                session.getRecordingUrl(),
                session.getNotesHtml(),
                resourceIds,
                assignmentIds,
                session.getRecapUpdatedAt());
    }

    private static SessionSummaryDto toSummaryDto(Session session) {
        return new SessionSummaryDto(
                session.getId(),
                session.getCourse().getId(),
                session.getCourse().getName(),
                session.getSessionDate(),
                session.getStartTime(),
                session.getEndTime(),
                session.getRoom(),
                session.getStatus().name(),
                session.getRecapUpdatedAt() != null);
    }
}
