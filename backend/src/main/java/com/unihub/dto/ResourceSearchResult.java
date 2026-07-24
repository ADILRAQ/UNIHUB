package com.unihub.dto;

import java.time.Instant;

/**
 * Search result DTO for {@code GET /api/resources/search?q=}.
 * Extends the resource fields with the containing module and course names.
 */
public record ResourceSearchResult(
        Long id,
        Long moduleId,
        String name,
        String contentType,
        long sizeBytes,
        Long uploadedById,
        String uploadedByName,
        Instant createdAt,
        String moduleName,
        String courseName
) {}
