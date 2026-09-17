package com.unihub.dto;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Full recap payload returned by {@code GET /api/sessions/{sessionId}/recap}.
 * Notes are already server-sanitized before storage; rendering them in the frontend
 * requires no further escaping beyond the normal XSS-safe innerHTML assignment.
 */
public record SessionRecapDto(

        Long sessionId,

        /** Public recording URL, or {@code null} if not set. */
        String recordingUrl,

        /** Sanitized HTML notes, or {@code null} if not set. */
        String notesHtml,

        /** Resources linked to this recap with display metadata. Never null. */
        List<LinkedResource> linkedResources,

        /** Assignments linked to this recap with display metadata. Never null. */
        List<LinkedAssignment> linkedAssignments,

        /** Timestamp of the last recap update; {@code null} if the recap has never been saved. */
        Instant recapUpdatedAt
) {
    public record LinkedResource(Long id, String name, String contentType) {}
    public record LinkedAssignment(Long id, String title, OffsetDateTime dueAt) {}
}
