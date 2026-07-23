package com.unihub.dto;

/**
 * Request body for {@code PATCH /api/announcements/{id}/urgent}.
 */
public record UrgentRequest(boolean urgent) {
}
