package com.unihub.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unihub.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

/**
 * Serializes an {@link ErrorResponse} directly to the {@link HttpServletResponse}.
 *
 * <p>Security filter-chain components (the authentication entry point, the access-denied
 * handler, and — in UNIH-20 — the must-change-password filter) run <em>before</em> the
 * {@code DispatcherServlet}, so they never reach {@code @RestControllerAdvice}. This
 * helper centralizes producing the exact same JSON shape those advice methods emit, so
 * clients see one consistent error contract regardless of where the error originated.
 */
@Component
public class ErrorResponseWriter {

    private final ObjectMapper objectMapper;

    public ErrorResponseWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void write(HttpServletRequest request, HttpServletResponse response,
                      HttpStatus status, String message, String errorCode) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ErrorResponse body = new ErrorResponse(
                message, status.value(), request.getRequestURI(), Instant.now(), errorCode);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
