package com.unihub.service;

import com.unihub.dto.AuthResponse;
import com.unihub.exception.AccountDeactivatedException;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.InvalidCredentialsException;
import com.unihub.exception.TempPasswordExpiredException;
import com.unihub.model.User;
import com.unihub.model.UserStatus;
import com.unihub.repository.UserRepository;
import com.unihub.security.JwtService;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication use cases. Login deliberately checks credentials <em>before</em> account
 * state so account status is never leaked to a caller who hasn't proven possession of the
 * password.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * A throwaway BCrypt hash used to run a comparison even when the email is unknown, so
     * both the unknown-email and wrong-password paths perform the same expensive hash work.
     * Without this, skipping BCrypt for unknown emails leaks account existence via response
     * timing (a ~16x gap), enabling user enumeration despite identical response bodies.
     * Encoded once with the same encoder so the cost factor always matches stored hashes.
     */
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String email, String rawPassword) {
        // Unknown email and wrong password collapse into the SAME generic failure so an
        // attacker cannot tell whether an account exists. When the email is unknown we still
        // run a BCrypt comparison against a dummy hash so both paths take equal time — a
        // byte-identical response body isn't enough on its own; response timing would leak
        // account existence otherwise.
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        String hashToCheck = user != null ? user.getPasswordHash() : dummyHash;
        boolean passwordMatches = passwordEncoder.matches(rawPassword, hashToCheck);
        if (user == null || !passwordMatches) {
            throw new InvalidCredentialsException();
        }

        // Only now — the caller has proven the password — is it safe to reveal state.
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountDeactivatedException();
        }

        // Temp-password expiry is evaluated only AFTER the password match (same
        // anti-enumeration reasoning as the ordering above) and only when the account is
        // still on a forced temp password. An expired temp password can never be changed by
        // the user themselves — they must ask an administrator to regenerate one — so this is
        // a hard login block, not a nudge to the change-password flow.
        if (user.isMustChangePassword()
                && user.getTempPasswordExpiresAt() != null
                && Instant.now().isAfter(user.getTempPasswordExpiresAt())) {
            throw new TempPasswordExpiredException();
        }

        String token = jwtService.issueToken(user);
        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.isMustChangePassword());
    }

    /**
     * Changes the authenticated caller's password and clears the forced-change gate. The
     * caller is already logged in (with their temp password), so authorization is that they
     * possess a valid token; here we additionally re-verify the current password.
     *
     * <p>On success the {@code mustChangePassword} flag and any temp-password expiry are
     * cleared and a <strong>fresh JWT</strong> is issued carrying
     * {@code mustChangePassword=false}. Since there is no refresh-token mechanism, reissuing
     * is the only way to un-gate the client without forcing a re-login — the old token keeps
     * its now-stale {@code true} claim until natural expiry, which is why the client must
     * swap to the returned token.
     */
    @Transactional
    public AuthResponse changePassword(Long userId, String currentPassword, String newPassword) {
        // An authenticated principal whose backing row is gone (e.g. deleted account with a
        // still-valid token) collapses into the same generic 401 as a wrong current password.
        User user = userRepository.findById(userId)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        // Defense in depth: @Size(min=8) on the DTO already guards this, but the service must
        // not rely on the controller having validated for it.
        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters long.");
        }
        if (newPassword.equals(currentPassword)) {
            throw new BadRequestException("New password must differ from your current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        user.setTempPasswordExpiresAt(null);
        User saved = userRepository.save(user);

        String token = jwtService.issueToken(saved);
        return new AuthResponse(
                token,
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole().name(),
                saved.isMustChangePassword());
    }
}
