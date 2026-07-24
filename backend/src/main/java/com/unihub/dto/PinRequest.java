package com.unihub.dto;

/**
 * Request body for {@code PATCH /api/announcements/{id}/pin}.
 */
public record PinRequest(boolean pinned) {
}
