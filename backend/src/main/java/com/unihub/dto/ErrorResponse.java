package com.unihub.dto;

import java.time.Instant;

/**
 * Consistent error response shape returned by the global exception handler and by
 * the security filter-chain handlers (which fire upstream of the DispatcherServlet).
 *
 * <p>{@code errorCode} is a stable, machine-readable discriminator (e.g.
 * {@code "INVALID_CREDENTIALS"}, {@code "ACCOUNT_DEACTIVATED"}) that lets the frontend
 * branch on the failure without parsing the human-facing {@code message}. It is the
 * last component so it is purely additive over the original shape.
 */
public record ErrorResponse(String message, int status, String path, Instant timestamp,
                            String errorCode) {
}
