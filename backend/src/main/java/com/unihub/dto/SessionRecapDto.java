package com.unihub.dto;

import java.time.Instant;
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

        /** IDs of the resources linked to this recap. Never null — empty list when none. */
        List<Long> linkedResourceIds,

        /** IDs of the assignments linked to this recap. Never null — empty list when none. */
        List<Long> linkedAssignmentIds,

        /** Timestamp of the last recap update; {@code null} if the recap has never been saved. */
        Instant recapUpdatedAt
) {
}
