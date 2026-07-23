package com.unihub.service;

import com.unihub.model.ClassGroup;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.security.TempPasswordPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persists a single imported account in its <strong>own</strong> transaction.
 *
 * <p>Split out of {@link UserImportService} on purpose. The orchestrating import method is
 * intentionally <em>not</em> transactional, and each row is created here under
 * {@link Propagation#REQUIRES_NEW}. That gives two guarantees at once:
 * <ul>
 *   <li><strong>Per-row atomicity</strong> — the {@code User} row and its
 *       {@code UserClassGroup} membership row commit together or not at all, so a user is
 *       never left without its group link.</li>
 *   <li><strong>No cross-row rollback</strong> — an unexpected failure on a later row can
 *       never roll back the rows already committed for earlier good rows in the same
 *       request, satisfying the "one bad row doesn't fail the whole import" criterion.</li>
 * </ul>
 * A separate bean (not a self-invoked method) is required because Spring's transactional
 * proxy is bypassed on self-invocation, which would silently ignore {@code REQUIRES_NEW}.
 */
@Service
public class UserImportPersistenceService {

    private final UserRepository userRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final PasswordEncoder passwordEncoder;

    public UserImportPersistenceService(UserRepository userRepository,
                                        UserClassGroupRepository userClassGroupRepository,
                                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates an ACTIVE account with a forced first-login password change and a 7-day temp
     * password window, then (when a group is given) links it to that class group. The
     * plaintext temp password is BCrypt-hashed here and never stored in the clear.
     *
     * <p>CSV bulk import always passes a resolved group, so a membership row is always written
     * on that path. The single-user admin create may pass {@code null} — an ADMIN provisioning
     * a user who has no cohort yet — in which case only the {@code User} row is written and no
     * membership is created.
     *
     * @param classGroup the group to enroll the user into, or {@code null} for no membership
     * @param plaintextTempPassword the caller-generated temp password (hashed, not stored raw)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createAccount(String email, String fullName, UserRole role,
                              ClassGroup classGroup, String plaintextTempPassword) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setMustChangePassword(true);
        user.setTempPasswordExpiresAt(TempPasswordPolicy.expiryFromNow());
        user.setPasswordHash(passwordEncoder.encode(plaintextTempPassword));

        User saved = userRepository.save(user);
        if (classGroup != null) {
            userClassGroupRepository.save(new UserClassGroup(saved, classGroup));
        }
    }
}
