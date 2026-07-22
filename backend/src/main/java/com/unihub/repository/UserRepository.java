package com.unihub.repository;

import com.unihub.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository
        extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Case-insensitive existence check. Used by account-creation paths (CSV import, admin
     * seeder) because the {@code users_email_key} unique index is case-sensitive, so a
     * case variant of an existing address ({@code BOB@x.com} vs {@code bob@x.com}) would
     * otherwise slip past a case-sensitive check and create a second account. The login
     * path deliberately keeps using the exact-match {@link #findByEmail} (unchanged).
     */
    boolean existsByEmailIgnoreCase(String email);
}
