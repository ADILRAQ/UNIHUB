package com.unihub.exception;

/**
 * Thrown when an uploaded file's content type is not in the allowed set.
 * Handled by {@link GlobalExceptionHandler} as 400 Bad Request.
 */
public class UnsupportedFileTypeException extends RuntimeException {

    public UnsupportedFileTypeException(String message) {
        super(message);
    }
}
