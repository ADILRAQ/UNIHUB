-- UNIH-37: Session recap model.
-- Adds recap columns directly to the sessions table (recording URL, sanitized notes, and
-- a timestamp that acts as the "has recap" indicator) plus two join tables for the linked
-- resources and assignments that contextualise a recap.

-- Recap columns on the sessions table.
-- recap_updated_at is the lightweight "has recap" flag used by the summary list endpoint:
-- it is set to NOW() on every PUT and stays NULL until the teacher first saves a recap.
ALTER TABLE sessions
    ADD COLUMN recording_url    VARCHAR(1000),
    ADD COLUMN notes_html       TEXT,
    ADD COLUMN recap_updated_at TIMESTAMPTZ;

-- Linked resources: existing course resources pinned to a session recap.
CREATE TABLE session_recap_resources (
    session_id  BIGINT NOT NULL REFERENCES sessions(id)   ON DELETE CASCADE,
    resource_id BIGINT NOT NULL REFERENCES resources(id)  ON DELETE CASCADE,
    PRIMARY KEY (session_id, resource_id)
);
CREATE INDEX idx_srr_session_id ON session_recap_resources(session_id);

-- Linked assignments: existing course assignments pinned to a session recap.
CREATE TABLE session_recap_assignments (
    session_id    BIGINT NOT NULL REFERENCES sessions(id)    ON DELETE CASCADE,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, assignment_id)
);
CREATE INDEX idx_sra_session_id ON session_recap_assignments(session_id);
