ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(60) NOT NULL,
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN temp_password_expires_at TIMESTAMPTZ;

CREATE INDEX idx_users_status ON users(status);
