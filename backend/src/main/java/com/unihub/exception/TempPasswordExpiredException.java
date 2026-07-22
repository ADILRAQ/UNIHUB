package com.unihub.exception;

/**
 * Thrown at login when a still-forced temporary password ({@code mustChangePassword == true})
 * has passed its {@code tempPasswordExpiresAt} deadline. Surfaced only to a caller who has
 * already proven possession of the password (checked after the password match, alongside the
 * deactivation check), so it is safe to be specific and direct the user to an administrator.
 * Mapped to HTTP 401 with {@code errorCode = "TEMP_PASSWORD_EXPIRED"} by
 * {@link GlobalExceptionHandler}.
 */
public class TempPasswordExpiredException extends RuntimeException {

    public TempPasswordExpiredException() {
        super("Your temporary password has expired. Contact an administrator for a new one.");
    }
}
