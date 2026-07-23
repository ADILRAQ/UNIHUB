package com.unihub.dto;

import jakarta.validation.constraints.Size;

/**
 * Request body for {@code PATCH /api/announcements/{id}}.
 *
 * <p>Both fields are optional — omitting (null) means "leave unchanged".
 * {@code body} is raw HTML when present; the service layer MUST sanitize it via
 * {@link com.unihub.service.HtmlSanitizer} before persisting.
 */
public record UpdateAnnouncementRequest(
        @Size(max = 255) String title,
        String body) {
}
