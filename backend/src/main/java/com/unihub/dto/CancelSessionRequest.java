package com.unihub.dto;

/**
 * Request body for {@code PATCH /api/sessions/{id}/cancel}. The {@code note} is an optional
 * reason shown next to the cancelled occurrence in the calendar.
 */
public record CancelSessionRequest(
        String note) {
}
