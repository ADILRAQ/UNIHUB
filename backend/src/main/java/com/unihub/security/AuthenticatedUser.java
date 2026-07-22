package com.unihub.security;

/**
 * The authenticated principal carried by {@link BearerAuthenticationToken}, hydrated
 * entirely from the validated JWT claims — no database lookup per request.
 *
 * <p>Exposed to controllers via {@code @AuthenticationPrincipal AuthenticatedUser} and
 * read by the must-change-password filter (UNIH-20) so downstream code has typed access
 * to the caller's identity without re-parsing claims.
 */
public record AuthenticatedUser(Long userId, String email, String role,
                                boolean mustChangePassword) {
}
