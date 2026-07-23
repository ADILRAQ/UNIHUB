-- Epic 5 (Announcements & Communication), UNIH-23: data model for announcements,
-- comments, and per-user read-tracking.
--
-- class_group_id NULL means the announcement is department-wide (visible to all).
-- body_html stores server-sanitized HTML produced by the service layer before every write.

-- ---------------------------------------------------------------------------
-- announcements: the core post.
-- ---------------------------------------------------------------------------
CREATE TABLE announcements (
    id             BIGSERIAL PRIMARY KEY,
    author_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    class_group_id BIGINT REFERENCES class_groups(id) ON DELETE CASCADE,
    title          VARCHAR(255) NOT NULL,
    body_html      TEXT NOT NULL,
    pinned         BOOLEAN NOT NULL DEFAULT FALSE,
    urgent         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at      TIMESTAMPTZ
);

CREATE INDEX idx_announcements_class_group_id ON announcements(class_group_id);
CREATE INDEX idx_announcements_author_id      ON announcements(author_id);
CREATE INDEX idx_announcements_created_at     ON announcements(created_at DESC);

-- ---------------------------------------------------------------------------
-- announcement_comments: plain-text replies on an announcement.
-- ---------------------------------------------------------------------------
CREATE TABLE announcement_comments (
    id              BIGSERIAL PRIMARY KEY,
    announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    author_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcement_comments_announcement_id ON announcement_comments(announcement_id);

-- ---------------------------------------------------------------------------
-- announcement_reads: per-user read receipt; composite PK prevents duplicates.
-- ---------------------------------------------------------------------------
CREATE TABLE announcement_reads (
    announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (announcement_id, user_id)
);

CREATE INDEX idx_announcement_reads_user_id ON announcement_reads(user_id);
