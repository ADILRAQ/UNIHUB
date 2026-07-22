package com.unihub.exception;

/**
 * Thrown when a request conflicts with the current state of a resource — e.g. a duplicate
 * class-group name, or deleting a group that still has members. Mapped to HTTP 409 with
 * {@code errorCode = "CONFLICT"} by {@link GlobalExceptionHandler}.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
