CREATE TABLE class_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_class_groups (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_group_id BIGINT NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, class_group_id)
);

CREATE INDEX idx_user_class_groups_class_group_id ON user_class_groups(class_group_id);
