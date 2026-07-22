package com.unihub.exception;

/**
 * Thrown for semantically invalid requests that pass bean validation but violate a
 * business rule — e.g. an admin deactivating their own account, or assigning a
 * non-teacher user as a group teacher. Mapped to HTTP 400 with
 * {@code errorCode = "BAD_REQUEST"} by {@link GlobalExceptionHandler}.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
