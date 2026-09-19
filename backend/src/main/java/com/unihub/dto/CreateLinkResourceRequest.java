package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

/**
 * Request body for {@code POST /api/courses/{courseId}/modules/{moduleId}/resources/link}.
 * Creates a LINK-type resource that points to an external URL instead of a MinIO-stored file.
 */
public record CreateLinkResourceRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @URL @Size(max = 2048) String url
) {}
