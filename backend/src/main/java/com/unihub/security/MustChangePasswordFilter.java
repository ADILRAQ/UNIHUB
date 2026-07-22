package com.unihub.security;

import com.unihub.exception.ErrorResponseWriter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Enforces the forced-first-login password change entirely from the JWT claim, with zero
 * database hits per request. If the authenticated principal's {@code mustChangePassword}
 * claim is {@code true}, every request except a small allow-list is short-circuited with a
 * 403 {@code MUST_CHANGE_PASSWORD} error so the client is steered to the change-password
 * flow before it can touch any real resource.
 *
 * <p>Runs immediately after Spring's {@code BearerTokenAuthenticationFilter} (wired in
 * {@code SecurityConfig}) so the principal is already populated when this filter reads it.
 *
 * <p>Requests with <em>no</em> authenticated must-change principal pass straight through
 * untouched: unauthenticated callers are left for the normal 401 path, and a caller whose
 * flag is already cleared is never gated. {@code OPTIONS} preflight is always let through.
 *
 * <p>The allow-list is what a flagged user still legitimately needs:
 * {@code POST /api/auth/change-password} (the only way to clear the flag),
 * {@code POST /api/auth/login} and {@code GET /api/health} (public anyway, but a flagged
 * token could still be attached to them).
 */
@Component
public class MustChangePasswordFilter extends OncePerRequestFilter {

    private final ErrorResponseWriter errorResponseWriter;

    public MustChangePasswordFilter(ErrorResponseWriter errorResponseWriter) {
        this.errorResponseWriter = errorResponseWriter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Preflight is never a real API call — let CORS handle it.
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean flagged = authentication != null
                && authentication.getPrincipal() instanceof AuthenticatedUser user
                && user.mustChangePassword();

        // Only gate when there IS an authenticated must-change principal; otherwise the
        // request flows through and the normal auth pipeline (401 for anonymous, role checks,
        // etc.) applies unchanged.
        if (flagged && !isAllowedWhileFlagged(request)) {
            errorResponseWriter.write(request, response, HttpStatus.FORBIDDEN,
                    "You must change your temporary password before using the application.",
                    "MUST_CHANGE_PASSWORD");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowedWhileFlagged(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        if (HttpMethod.POST.matches(method) && "/api/auth/change-password".equals(path)) {
            return true;
        }
        if (HttpMethod.POST.matches(method) && "/api/auth/login".equals(path)) {
            return true;
        }
        return HttpMethod.GET.matches(method) && "/api/health".equals(path);
    }
}
