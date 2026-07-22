package com.unihub.security;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/**
 * Generates temporary passwords for accounts created without a self-chosen password:
 * CSV bulk import (UNIH-19) and the admin/teacher password-reset endpoint (UNIH-20) both
 * reuse this single component so the random-string logic lives in exactly one place.
 *
 * <p>Backed by {@link SecureRandom} (never {@code java.util.Random}). The alphabet
 * excludes visually ambiguous characters ({@code 0}/{@code O}/{@code o},
 * {@code 1}/{@code l}/{@code I}) because these passwords are printed on a sheet and typed
 * by hand, where those characters are routinely misread.
 */
@Component
public class TempPasswordGenerator {

    /** Uppercase without {@code I}/{@code O}, lowercase without {@code l}/{@code o}, digits without {@code 0}/{@code 1}. */
    private static final char[] ALPHABET =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789".toCharArray();

    private static final int LENGTH = 12;

    private final SecureRandom random = new SecureRandom();

    /**
     * @return a fresh {@value #LENGTH}-character temporary password drawn from the
     *         unambiguous alphabet.
     */
    public String generate() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET[random.nextInt(ALPHABET.length)]);
        }
        return sb.toString();
    }
}
