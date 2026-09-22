package com.unihub.security;

import com.unihub.model.UserRole;
import com.unihub.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * SpEL-callable authorization helper (bean name {@code classGroupAccess}) backing the
 * data-scoped {@code @PreAuthorize} rules that plain role checks can't express. Keeping the
 * DB-lookup logic in one testable component avoids duplicating it across SpEL strings.
 *
 * <p>Used by the regenerate-temp-password endpoint so a {@code TEACHER} may reset any
 * {@code STUDENT} (admin parity) but never a teacher or admin account.
 */
@Component("classGroupAccess")
public class ClassGroupAccessEvaluator {

    private final UserRepository userRepository;

    public ClassGroupAccessEvaluator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * @return {@code true} if the target user exists and is a {@code STUDENT}. False for a
     *         non-{@link AuthenticatedUser} principal, a missing id, or any non-student target,
     *         which the {@code @PreAuthorize} then turns into a 403.
     */
    public boolean managesStudent(Authentication authentication, Long studentId) {
        if (authentication == null || studentId == null) {
            return false;
        }
        if (!(authentication.getPrincipal() instanceof AuthenticatedUser)) {
            return false;
        }
        return userRepository.findById(studentId)
                .map(target -> target.getRole() == UserRole.STUDENT)
                .orElse(false);
    }
}
