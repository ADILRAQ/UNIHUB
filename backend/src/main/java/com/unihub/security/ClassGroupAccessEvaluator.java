package com.unihub.security;

import com.unihub.repository.UserClassGroupRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * SpEL-callable authorization helper (bean name {@code classGroupAccess}) backing the
 * data-scoped {@code @PreAuthorize} rules that plain role checks can't express. Keeping the
 * DB-lookup logic in one testable component avoids duplicating it across SpEL strings.
 *
 * <p>Used by the regenerate-temp-password endpoint so a {@code TEACHER} may reset only a
 * {@code STUDENT} they actually manage.
 */
@Component("classGroupAccess")
public class ClassGroupAccessEvaluator {

    private final UserClassGroupRepository userClassGroupRepository;

    public ClassGroupAccessEvaluator(UserClassGroupRepository userClassGroupRepository) {
        this.userClassGroupRepository = userClassGroupRepository;
    }

    /**
     * @return {@code true} if the authenticated caller is a teacher who owns at least one
     *         class group that the target user is a {@code STUDENT} member of. False for any
     *         non-{@link AuthenticatedUser} principal, a missing student id, or a target who
     *         is not a student the teacher shares a group with — which the {@code @PreAuthorize}
     *         then turns into a 403. The student-role condition is enforced in the query, so a
     *         co-teacher or admin sharing the same group can never be reset via this path.
     */
    public boolean managesStudent(Authentication authentication, Long studentId) {
        if (authentication == null || studentId == null) {
            return false;
        }
        if (!(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return false;
        }
        return userClassGroupRepository.teacherSharesGroupWithStudent(user.userId(), studentId);
    }
}
