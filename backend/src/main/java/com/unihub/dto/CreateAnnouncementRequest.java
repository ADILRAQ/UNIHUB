package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for {@code POST /api/announcements}.
 *
 * <p>{@code classGroupId} may be {@code null} (omitted) to create a department-wide
 * announcement visible to all users. {@code body} is raw HTML — the service layer MUST
 * sanitize it via {@link com.unihub.service.HtmlSanitizer} before persisting.
 */
public record CreateAnnouncementRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank String body,
        Long classGroupId,
        boolean pinned,
        boolean urgent) {
}
