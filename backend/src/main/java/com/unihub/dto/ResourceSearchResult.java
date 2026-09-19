package com.unihub.dto;

import java.time.Instant;

/**
 * Search result DTO for {@code GET /api/resources/search?q=}.
 * Extends the resource fields with the containing module and course names.
 * {@code type} is "FILE" or "LINK"; for LINK resources {@code url} is populated and
 * {@code contentType} is null.
 */
public record ResourceSearchResult(
        Long id,
        Long moduleId,
        String name,
        String type,
        String contentType,
        String url,
        long sizeBytes,
        Long uploadedById,
        String uploadedByName,
        Instant createdAt,
        String moduleName,
        String courseName
) {}
