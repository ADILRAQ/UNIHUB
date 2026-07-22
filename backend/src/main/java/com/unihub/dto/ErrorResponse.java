package com.unihub.dto;

import java.time.Instant;

/**
 * Consistent error response shape returned by the global exception handler.
 */
public record ErrorResponse(String message, int status, String path, Instant timestamp) {
}
