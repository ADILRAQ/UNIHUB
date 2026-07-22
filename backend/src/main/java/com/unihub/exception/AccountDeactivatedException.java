package com.unihub.exception;

/**
 * Thrown after a successful password match when the account's status is not
 * {@code ACTIVE}. Surfaced only to a caller who already proved possession of the
 * password, so it is safe to be specific about the account state.
 */
public class AccountDeactivatedException extends RuntimeException {

    public AccountDeactivatedException() {
        super("This account has been deactivated. Contact an administrator.");
    }
}
