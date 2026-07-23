-- A session may only carry the RESCHEDULED status together with the original_date it
-- moved from. The generation engine (UNIH-29) always sets original_date when it moves an
-- occurrence, so this invariant is safe to enforce at the database level — it stops a
-- rescheduled row from ever losing the slot key the regeneration logic dedups on.
ALTER TABLE sessions
    ADD CONSTRAINT chk_sessions_reschedule_origin
        CHECK (status <> 'RESCHEDULED' OR original_date IS NOT NULL);
