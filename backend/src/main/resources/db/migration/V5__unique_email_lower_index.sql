-- Enforce email uniqueness case-insensitively at the DB level.
--
-- V1 created a case-SENSITIVE unique constraint inline (`email VARCHAR(255) NOT NULL
-- UNIQUE` -> constraint `users_email_key`). Application code (CSV import in UNIH-19,
-- AdminSeeder) rejects case-variant duplicates via existsByEmailIgnoreCase, but that
-- check is not atomic: two concurrent imports containing `bob@x.com` and `BOB@x.com`
-- could both pass their pre-check and both insert, creating a duplicate account. This
-- migration adds the missing DB-level backstop.
--
-- The new functional unique index on lower(email) is STRICTLY STRONGER than the
-- case-sensitive constraint (it forbids everything the old one forbade, plus case
-- variants), so the old constraint is now fully redundant. We drop it in the same
-- migration to avoid maintaining two overlapping indexes on the same column. The
-- constraint is dropped (not the index directly) because V1 created it as an inline
-- column UNIQUE, which Postgres backs with a constraint named `users_email_key`.
ALTER TABLE users DROP CONSTRAINT users_email_key;

CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));
