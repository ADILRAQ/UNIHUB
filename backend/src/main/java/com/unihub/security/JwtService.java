package com.unihub.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.unihub.model.User;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Issues signed JWTs for authenticated users.
 *
 * <p>Uses Nimbus (already on the classpath via the OAuth2 resource-server starter) to
 * build and HMAC-SHA256-sign a compact token. Validation of incoming tokens is handled
 * separately by Spring's {@code NimbusJwtDecoder} wired in {@code SecurityConfig}.
 *
 * <p>The signing secret comes from the {@code JWT_SECRET} env var with <strong>no
 * default</strong> — a missing secret fails startup, matching the fail-fast handling of
 * {@code DB_USER}/{@code DB_PASSWORD}. HMAC-SHA256 requires a key of at least 256 bits,
 * so the secret must be at least 32 bytes; a shorter one is rejected at construction with
 * a clear message rather than surfacing later as an opaque signing error.
 */
@Service
public class JwtService {

    private static final int MIN_SECRET_BYTES = 32;

    private final byte[] secretBytes;
    private final int expirationHours;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-hours:16}") int expirationHours) {
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (this.secretBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least " + MIN_SECRET_BYTES
                    + " bytes (256 bits) for HMAC-SHA256; got " + this.secretBytes.length);
        }
        this.expirationHours = expirationHours;
    }

    /**
     * Builds a signed token carrying the user's id ({@code sub}), email, role,
     * must-change-password flag, and issued/expiry timestamps.
     */
    public String issueToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(expirationHours, ChronoUnit.HOURS);

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("mustChangePassword", user.isMustChangePassword())
                .issueTime(Date.from(now))
                .expirationTime(Date.from(expiry))
                .build();

        SignedJWT signedJwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
        try {
            signedJwt.sign(new MACSigner(secretBytes));
        } catch (JOSEException e) {
            throw new IllegalStateException("Failed to sign JWT", e);
        }
        return signedJwt.serialize();
    }
}
