package com.unihub.dto;

import java.util.List;

/**
 * Request body for {@code PUT /api/sessions/{sessionId}/recap}.
 * All fields are optional — a teacher can update just the recording URL, just the notes,
 * just the linked items, or any combination. Passing an empty list for
 * {@code linkedResourceIds} or {@code linkedAssignmentIds} clears the existing links.
 */
public record SessionRecapUpdateRequest(

        /** Public URL of the session recording (e.g. Google Meet export). Nullable. */
        String recordingUrl,

        /**
         * Rich-text notes for the recap. Sanitized server-side before persisting.
         * Null or blank clears any previously stored notes.
         */
        String notesHtml,

        /**
         * IDs of existing {@link com.unihub.model.Resource} objects to pin to this recap.
         * Must belong to a module of the session's course. Replaces the current list.
         * Null is treated as an empty list (no change to the previous selection is NOT
         * supported by design — every PUT is a full replace).
         */
        List<Long> linkedResourceIds,

        /**
         * IDs of existing {@link com.unihub.model.Assignment} objects to pin to this recap.
         * Must belong to the session's course. Replaces the current list.
         */
        List<Long> linkedAssignmentIds
) {
}
