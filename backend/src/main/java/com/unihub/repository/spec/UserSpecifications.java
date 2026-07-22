package com.unihub.repository.spec;

import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

/**
 * Composable {@link Specification} fragments for the admin user list. Each factory returns
 * {@code null} when its argument is {@code null}, so the service can chain them
 * unconditionally and only the non-null filters contribute to the WHERE clause.
 */
public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<User> hasRole(UserRole role) {
        if (role == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("role"), role);
    }

    public static Specification<User> hasStatus(UserStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    /**
     * Membership is stored in a separate {@code user_class_groups} table with no
     * collection mapped back onto {@link User}, so this filters via a correlated
     * {@code EXISTS} subquery rather than a join (also avoids duplicate user rows).
     */
    public static Specification<User> inClassGroup(Long classGroupId) {
        if (classGroupId == null) {
            return null;
        }
        return (root, query, cb) -> {
            Subquery<Long> sub = query.subquery(Long.class);
            var membership = sub.from(UserClassGroup.class);
            sub.select(membership.get("id").get("userId"))
                    .where(
                            cb.equal(membership.get("id").get("userId"), root.get("id")),
                            cb.equal(membership.get("id").get("classGroupId"), classGroupId));
            return cb.exists(sub);
        };
    }

    /** Case-insensitive LIKE on full name OR email. */
    public static Specification<User> matchesSearch(String term) {
        if (term == null || term.isBlank()) {
            return null;
        }
        String pattern = "%" + term.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("fullName")), pattern),
                cb.like(cb.lower(root.get("email")), pattern));
    }
}
