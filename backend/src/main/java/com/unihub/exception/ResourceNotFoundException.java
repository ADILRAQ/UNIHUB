package com.unihub.exception;

/**
 * Thrown when a requested resource (user, class group, ...) does not exist.
 * Mapped to HTTP 404 with {@code errorCode = "NOT_FOUND"} by {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
