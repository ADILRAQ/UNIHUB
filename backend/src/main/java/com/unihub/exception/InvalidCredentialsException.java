package com.unihub.exception;

/**
 * Thrown when authentication fails because the email is unknown <em>or</em> the password
 * does not match. Deliberately carries a single generic message and never reveals which
 * of the two was wrong, so an attacker cannot enumerate valid accounts.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}
