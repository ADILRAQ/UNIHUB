package com.unihub.exception;

/**
 * Thrown when an uploaded file exceeds the application-defined size limit.
 * Handled by {@link GlobalExceptionHandler} as 400 Bad Request.
 */
public class FileTooLargeException extends RuntimeException {

    public FileTooLargeException(String message) {
        super(message);
    }
}
