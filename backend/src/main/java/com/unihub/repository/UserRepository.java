package com.unihub.repository;

import com.unihub.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository
        extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    boolean existsByEmail(String email);

    /**
     * Case-insensitive lookup used by the login path. Emails are unique case-insensitively
     * at the DB level (the {@code users_email_lower_key} functional unique index on
     * {@code lower(email)}, added in V5), so this returns at most one row and a user can log
     * in regardless of the case they type versus the case their address was stored in.
     *
     * <p>Written as explicit {@code lower(email) = lower(:email)} JPQL rather than a derived
     * {@code findByEmailIgnoreCase} on purpose: Spring Data derives {@code IgnoreCase} as
     * {@code upper(email) = upper(?)}, which Postgres cannot satisfy from the
     * {@code lower(email)} index, forcing a sequential scan on every login. Matching the
     * predicate to the index keeps this hot path index-backed.
     */
    @Query("SELECT u FROM User u WHERE lower(u.email) = lower(:email)")
    Optional<User> findByEmailIgnoreCase(@Param("email") String email);

    /**
     * Case-insensitive existence check. Used by account-creation paths (CSV import, admin
     * seeder) as a fast pre-check so a case variant of an existing address
     * ({@code BOB@x.com} vs {@code bob@x.com}) is rejected with a friendly error rather than
     * surfacing as a DB unique-violation. The {@code users_email_lower_key} index (V5) is the
     * authoritative backstop against concurrent inserts racing past this check.
     */
    boolean existsByEmailIgnoreCase(String email);
}
