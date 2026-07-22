package com.unihub.exception;

import com.unihub.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.stream.Collectors;

/**
 * Translates exceptions into a consistent {@link ErrorResponse} JSON shape across
 * every controller in the application.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse errorResponse = new ErrorResponse(
                message.isBlank() ? "Validation failed" : message,
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI(),
                Instant.now(),
                "VALIDATION_ERROR");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Unknown email or wrong password — a single generic 401 for both so account
     * existence cannot be probed.
     */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI(),
                Instant.now(),
                "INVALID_CREDENTIALS");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(AccountDeactivatedException.class)
    public ResponseEntity<ErrorResponse> handleAccountDeactivated(
            AccountDeactivatedException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI(),
                Instant.now(),
                "ACCOUNT_DEACTIVATED");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * A forced temporary password whose expiry has lapsed — a hard login block. Only reached
     * after a successful password match, so it is safe to be specific and point the caller to
     * an administrator.
     */
    @ExceptionHandler(TempPasswordExpiredException.class)
    public ResponseEntity<ErrorResponse> handleTempPasswordExpired(
            TempPasswordExpiredException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI(),
                Instant.now(),
                "TEMP_PASSWORD_EXPIRED");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI(),
                Instant.now(),
                "NOT_FOUND");

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            ConflictException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.CONFLICT.value(),
                request.getRequestURI(),
                Instant.now(),
                "CONFLICT");

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI(),
                Instant.now(),
                "BAD_REQUEST");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * A {@code @PreAuthorize} denial throws {@link AccessDeniedException} from <em>inside</em>
     * the controller invocation, so it reaches this advice before Spring Security's
     * filter-level {@code RestAccessDeniedHandler} can act. Handle it here explicitly (a
     * more specific handler than the catch-all below) so method-security denials return the
     * same 403 shape as the filter-chain path instead of a misleading 500.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                "You do not have permission to access this resource",
                HttpStatus.FORBIDDEN.value(),
                request.getRequestURI(),
                Instant.now(),
                "ACCESS_DENIED");

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Malformed request bodies (unparseable JSON, or an unknown enum value that fails
     * deserialization) and query/path params that can't be coerced to their target type
     * (e.g. {@code ?role=WIZARD}) are <em>client</em> errors — return 400, not the 500 the
     * catch-all below would otherwise produce. The message stays generic so internal parser
     * details and type names aren't leaked to the caller.
     *
     * <p>Also covers a missing required query param or a missing multipart part (e.g. the
     * CSV {@code file} in a bulk import request) — both are caller mistakes, so 400 rather
     * than the catch-all 500.
     */
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class, MissingServletRequestPartException.class})
    public ResponseEntity<ErrorResponse> handleMalformedRequest(
            Exception ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Malformed or invalid request",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI(),
                Instant.now(),
                "BAD_REQUEST");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * An upload larger than the configured {@code spring.servlet.multipart} limits (e.g. a
     * bulk-import CSV that is too big). Return a clean 413 rather than the catch-all 500 —
     * the caller can act on it by splitting the file.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSize(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Uploaded file is too large",
                HttpStatus.PAYLOAD_TOO_LARGE.value(),
                request.getRequestURI(),
                Instant.now(),
                "PAYLOAD_TOO_LARGE");

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(errorResponse);
    }

    /**
     * Spring's own web exceptions already carry the correct HTTP status through the
     * {@link org.springframework.web.ErrorResponse} contract. The most common one here is
     * {@link NoResourceFoundException}, thrown when a request hits an unmapped path (e.g.
     * {@code GET /api/users} before that controller exists) — the catch-all below would otherwise
     * flatten it to a misleading 500 instead of the real 404. The real status is preserved and the
     * message stays a generic status phrase, so no internal detail leaks to the caller.
     *
     * <p>The parameter is typed to the shared {@code ErrorResponse} interface rather than a
     * common superclass on purpose: {@code NoResourceFoundException} <em>implements</em>
     * {@code ErrorResponse} but does <em>not</em> extend {@code ErrorResponseException}, so a
     * handler typed to {@code ErrorResponseException} would fail to bind the no-resource case at
     * runtime. Both concrete types are listed explicitly so the intent is clear.
     */
    @ExceptionHandler({NoResourceFoundException.class, ErrorResponseException.class})
    public ResponseEntity<ErrorResponse> handleSpringWebException(
            org.springframework.web.ErrorResponse ex, HttpServletRequest request) {
        HttpStatusCode statusCode = ex.getStatusCode();
        HttpStatus resolved = HttpStatus.resolve(statusCode.value());
        String errorCode = resolved != null ? resolved.name() : "ERROR";
        String message = resolved != null ? resolved.getReasonPhrase() : "Request could not be processed";

        ErrorResponse errorResponse = new ErrorResponse(
                message,
                statusCode.value(),
                request.getRequestURI(),
                Instant.now(),
                errorCode);

        return ResponseEntity.status(statusCode).body(errorResponse);
    }

    /**
     * Last-resort catch-all for genuinely unexpected failures. The full stack trace is logged at
     * ERROR level here — this is the only place a 500 originates, so without this log real server
     * errors inside secured endpoints would be undiagnosable in production. The client still
     * receives only the generic message: the exception detail is never placed in the response body.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception processing {} {}", request.getMethod(), request.getRequestURI(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                "An unexpected error occurred",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI(),
                Instant.now(),
                "INTERNAL_ERROR");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
