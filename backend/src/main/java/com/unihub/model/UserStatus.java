package com.unihub.model;

/**
 * Account status for a {@link User}. An {@code INACTIVE} user is deactivated
 * (e.g. by an admin) and must not be able to authenticate, regardless of
 * whether their existing JWT has not yet expired.
 */
public enum UserStatus {
    ACTIVE,
    INACTIVE
}
