package com.unihub.service;

import com.unihub.dto.AuthResponse;
import com.unihub.exception.AccountDeactivatedException;
import com.unihub.exception.InvalidCredentialsException;
import com.unihub.model.User;
import com.unihub.model.UserStatus;
import com.unihub.repository.UserRepository;
import com.unihub.security.JwtService;
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
        User user = userRepository.findByEmail(email).orElse(null);
        String hashToCheck = user != null ? user.getPasswordHash() : dummyHash;
        boolean passwordMatches = passwordEncoder.matches(rawPassword, hashToCheck);
        if (user == null || !passwordMatches) {
            throw new InvalidCredentialsException();
        }

        // Only now — the caller has proven the password — is it safe to reveal state.
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountDeactivatedException();
        }

        // UNIH-20 will add the temp-password-expiry check here (only relevant when
        // mustChangePassword == true), throwing TempPasswordExpiredException on expiry.

        String token = jwtService.issueToken(user);
        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.isMustChangePassword());
    }
}
