package com.unihub.security;

import java.time.Instant;

/**
 * Single source of truth for the temporary-password validity window. Both the CSV bulk
 * import (UNIH-19) and the admin/teacher regenerate-temp-password endpoint (UNIH-20) set an
 * expiry from here, so the 7-day window is defined in exactly one place rather than inlined
 * in each caller.
 */
public final class TempPasswordPolicy {

    /** How long a freshly issued temporary password remains usable before login rejects it. */
    public static final int VALIDITY_DAYS = 7;

    private TempPasswordPolicy() {
    }

    /**
     * @return the expiry instant for a temporary password issued now — {@value #VALIDITY_DAYS}
     *         days into the future.
     */
    public static Instant expiryFromNow() {
        return Instant.now().plusSeconds(VALIDITY_DAYS * 24L * 60L * 60L);
    }
}
