package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for {@code POST /api/announcements/{id}/comments} (UNIH-25).
 *
 * <p>Content is stored as plain text — NOT HTML. Validation is enforced by
 * {@code @Valid} at the controller level and additionally in the service.
 */
public record CreateCommentRequest(
        @NotBlank(message = "Comment content must not be blank")
        @Size(max = 2000, message = "Comment content must not exceed 2000 characters")
        String content) {
}
